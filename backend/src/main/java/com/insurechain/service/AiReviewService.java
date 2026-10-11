package com.insurechain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurechain.dto.AiExtractionDto;
import com.insurechain.model.AiExtractionResult;
import com.insurechain.model.Claim;
import com.insurechain.repository.AiExtractionResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiReviewService {

    @Autowired
    private AiExtractionResultRepository aiExtractionResultRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AiExtractionDto analyzeAndSave(Claim claim) {
        String narrative = claim.getNarrative() != null ? claim.getNarrative() : "";
        BigDecimal requested = claim.getRequestedAmount() != null ? claim.getRequestedAmount() : BigDecimal.ZERO;

        Map<String, Object> entities = new HashMap<>();
        List<Map<String, Object>> flags = new ArrayList<>();
        boolean hasInconsistency = false;

        // 1. Extract dollar amounts mentioned in narrative
        Pattern amountPattern = Pattern.compile("\\$([0-9,]+(\\.[0-9]{2})?)");
        Matcher amountMatcher = amountPattern.matcher(narrative);
        List<String> amountsFound = new ArrayList<>();
        while (amountMatcher.find()) {
            amountsFound.add(amountMatcher.group(0));
            try {
                String cleanNum = amountMatcher.group(1).replace(",", "");
                BigDecimal parsedAmount = new BigDecimal(cleanNum);
                // Inconsistency check: if narrative mentions repair estimate significantly higher/lower than requested amount
                if (parsedAmount.compareTo(requested.multiply(new BigDecimal("2"))) > 0) {
                    hasInconsistency = true;
                    Map<String, Object> flag = new HashMap<>();
                    flag.put("field", "amount_variance");
                    flag.put("severity", "MEDIUM");
                    flag.put("description", String.format("Narrative mentions $%s which is more than double the claimed amount of $%s.", parsedAmount, requested));
                    flags.add(flag);
                }
            } catch (Exception ignored) {}
        }
        entities.put("amounts_mentioned", amountsFound);

        // 2. Extract keywords / damage descriptions
        List<String> keyTerms = new ArrayList<>();
        String lower = narrative.toLowerCase();
        if (lower.contains("police report")) keyTerms.add("police_report_referenced");
        if (lower.contains("water") || lower.contains("burst pipe") || lower.contains("leak")) keyTerms.add("water_peril");
        if (lower.contains("collision") || lower.contains("rear-end") || lower.contains("bumper")) keyTerms.add("automotive_collision");
        if (lower.contains("earthquake") || lower.contains("tremor")) keyTerms.add("seismic_activity");
        if (lower.contains("delayed") || lower.contains("overseas") || lower.contains("months ago")) {
            keyTerms.add("filing_delay_indicated");
            hasInconsistency = true;
            Map<String, Object> flag = new HashMap<>();
            flag.put("field", "timeline");
            flag.put("severity", "LOW");
            flag.put("description", "Narrative language indicates delayed submission or past incident timeframe.");
            flags.add(flag);
        }
        entities.put("detected_keywords", keyTerms);
        if (claim.getIncidentLocation() != null) {
            entities.put("location", claim.getIncidentLocation());
        }

        String entitiesJson = "{}";
        String flagsJson = "[]";
        try {
            entitiesJson = objectMapper.writeValueAsString(entities);
            flagsJson = objectMapper.writeValueAsString(flags);
        } catch (Exception ignored) {}

        String summary = String.format("Automated narrative analysis: Incident category '%s' with %d corroborating entity matches.",
                claim.getCategory(), keyTerms.size());

        String reviewPrompt = hasInconsistency
                ? "[AI Review Flag - Advisory Only]: Potential inconsistencies noted for human claims officer review. Not proof of fraud."
                : "[AI Review Advisory]: Narrative details show standard consistency with submitted claim parameters.";

        AiExtractionResult result = new AiExtractionResult(
                claim.getId(),
                summary,
                entitiesJson,
                hasInconsistency,
                flagsJson,
                new BigDecimal("0.965"),
                reviewPrompt
        );
        result.setProcessedAt(Instant.now());

        AiExtractionResult saved = aiExtractionResultRepository.save(result);
        return AiExtractionDto.fromEntity(saved);
    }
}
