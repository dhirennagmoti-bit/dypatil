package com.insurechain.service;

import com.insurechain.model.Claim;
import com.insurechain.repository.ClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class DuplicateDetectionService {

    @Autowired
    private ClaimRepository claimRepository;

    public String computeFingerprint(UUID policyId, LocalDate incidentDate, String category, BigDecimal amount) {
        String normalized = String.format("%s:%s:%s:%s",
                policyId != null ? policyId.toString() : "",
                incidentDate != null ? incidentDate.toString() : "",
                category != null ? category.trim().toUpperCase() : "",
                amount != null ? amount.stripTrailingZeros().toPlainString() : "0");

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalized.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }

    public static class DuplicateCheckOutcome {
        private final boolean duplicate;
        private final String reason;

        public DuplicateCheckOutcome(boolean duplicate, String reason) {
            this.duplicate = duplicate;
            this.reason = reason;
        }

        public boolean isDuplicate() { return duplicate; }
        public String getReason() { return reason; }
    }

    public DuplicateCheckOutcome checkDuplicate(UUID claimId, UUID policyId, LocalDate incidentDate,
                                                String category, BigDecimal requestedAmount) {
        String fingerprint = computeFingerprint(policyId, incidentDate, category, requestedAmount);

        // 1. Check exact fingerprint collision
        List<Claim> exactMatches = claimRepository.findByIncidentFingerprint(fingerprint);
        for (Claim c : exactMatches) {
            if (claimId == null || !c.getId().equals(claimId)) {
                return new DuplicateCheckOutcome(true,
                        String.format("EXACT DUPLICATE DETECTED: Claim matches incident fingerprint of existing claim '%s' filed on %s for category '%s' and amount $%s.",
                                c.getClaimReference(), c.getFilingDate(), c.getCategory(), c.getRequestedAmount()));
            }
        }

        // 2. Check similar incident within ±3 days for the same policy
        UUID currentId = claimId != null ? claimId : UUID.randomUUID();
        LocalDate windowStart = incidentDate.minusDays(3);
        LocalDate windowEnd = incidentDate.plusDays(3);
        List<Claim> nearMatches = claimRepository.findSimilarClaims(policyId, windowStart, windowEnd, currentId);

        for (Claim c : nearMatches) {
            if (c.getCategory().equalsIgnoreCase(category)) {
                return new DuplicateCheckOutcome(true,
                        String.format("POTENTIAL DUPLICATE WARNING: A claim '%s' was already submitted on %s for the same policy and category within %d days of this incident date.",
                                c.getClaimReference(), c.getFilingDate(), 3));
            }
        }

        return new DuplicateCheckOutcome(false, null);
    }
}
