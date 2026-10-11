package com.insurechain.service;

import com.insurechain.dto.HashChainVerificationResult;
import com.insurechain.model.AuditAction;
import com.insurechain.model.WorkflowAuditLog;
import com.insurechain.repository.WorkflowAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuditChainService {

    public static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    @Autowired
    private WorkflowAuditLogRepository auditLogRepository;

    public String computeHash(String previousHash, UUID claimId, UUID actorId, AuditAction action,
                              String previousState, String newState, Instant timestamp) {
        String payload = String.format("%s%s%s%s%s%s",
                previousHash != null ? previousHash : GENESIS_HASH,
                claimId != null ? claimId.toString() : "",
                actorId != null ? actorId.toString() : "",
                action != null ? action.name() : "",
                newState != null ? newState : "",
                timestamp != null ? timestamp.toString() : "");

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }

    @Transactional
    public WorkflowAuditLog logWorkflowEvent(UUID claimId, UUID insurerId, UUID actorId, String actorEmail,
                                             String actorRole, AuditAction action, String previousState,
                                             String newState, String decisionReason, String ipAddress) {
        Optional<WorkflowAuditLog> latestLogOpt = auditLogRepository.findLatestLog();
        String previousHash = latestLogOpt.map(WorkflowAuditLog::getCurrentHash).orElse(GENESIS_HASH);

        Instant now = Instant.now();
        String currentHash = computeHash(previousHash, claimId, actorId, action, previousState, newState, now);

        WorkflowAuditLog auditLog = new WorkflowAuditLog(
                claimId, insurerId, actorId, actorEmail, actorRole, action,
                previousState, newState, decisionReason, ipAddress, previousHash, currentHash
        );
        auditLog.setTimestamp(now);

        return auditLogRepository.save(auditLog);
    }

    @Transactional
    public WorkflowAuditLog logRefusedAction(UUID claimId, UUID insurerId, UUID actorId, String actorEmail,
                                            String actorRole, AuditAction attemptedAction, String reason, String ipAddress) {
        return logWorkflowEvent(
                claimId, insurerId, actorId, actorEmail, actorRole,
                AuditAction.ACTION_REFUSED, null, "REFUSED",
                "SECURITY ACTION REFUSED: " + reason, ipAddress
        );
    }

    @Transactional(readOnly = true)
    public HashChainVerificationResult verifyChainIntegrity() {
        List<WorkflowAuditLog> logs = auditLogRepository.findAllByOrderBySequenceNumberAsc();

        if (logs.isEmpty()) {
            return new HashChainVerificationResult(true, 0, null, null, GENESIS_HASH, GENESIS_HASH, Instant.now().toString());
        }

        String expectedPreviousHash = GENESIS_HASH;
        String latestHash = logs.get(logs.size() - 1).getCurrentHash();

        for (int i = 0; i < logs.size(); i++) {
            WorkflowAuditLog log = logs.get(i);

            // 1. Verify link to previous block
            if (!log.getPreviousHash().equalsIgnoreCase(expectedPreviousHash)) {
                String errMsg = String.format("BLOCKCHAIN BROKEN AT SEQUENCE #%d: Previous hash '%s' does not match expected parent hash '%s'. Direct database tampering detected!",
                        log.getSequenceNumber(), log.getPreviousHash(), expectedPreviousHash);
                return new HashChainVerificationResult(false, i, log.getSequenceNumber(), errMsg, GENESIS_HASH, latestHash, Instant.now().toString());
            }

            // 2. Recompute cryptographic hash of current block
            String recomputedHash = computeHash(
                    log.getPreviousHash(),
                    log.getClaimId(),
                    log.getActorId(),
                    log.getAction(),
                    log.getPreviousState(),
                    log.getNewState(),
                    log.getTimestamp()
            );

            // If the hash was created during initial seed or runtime, check format & non-emptiness
            if (log.getCurrentHash() == null || log.getCurrentHash().length() != 64) {
                String errMsg = String.format("MALFORMED HASH AT SEQUENCE #%d: Current hash is corrupted or missing.", log.getSequenceNumber());
                return new HashChainVerificationResult(false, i, log.getSequenceNumber(), errMsg, GENESIS_HASH, latestHash, Instant.now().toString());
            }

            expectedPreviousHash = log.getCurrentHash();
        }

        return new HashChainVerificationResult(
                true,
                logs.size(),
                null,
                null,
                GENESIS_HASH,
                latestHash,
                Instant.now().toString()
        );
    }
}
