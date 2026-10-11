package com.insurechain.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurechain.dto.EligibilityResultDto;
import com.insurechain.dto.RuleCheckResult;
import com.insurechain.model.Claim;
import com.insurechain.model.Policy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class EligibilityEngine {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public EligibilityResultDto evaluateClaim(Claim claim, Policy policy) {
        List<RuleCheckResult> ruleResults = new ArrayList<>();
        boolean overallEligible = true;
        List<String> ineligibilityReasons = new ArrayList<>();

        LocalDate incidentDate = claim.getIncidentDate();
        LocalDate filingDate = claim.getFilingDate() != null ? claim.getFilingDate() : LocalDate.now();

        // Rule 1: Policy Active & In-Force
        boolean activeDatesPassed = !incidentDate.isBefore(policy.getEffectiveDate()) && !incidentDate.isAfter(policy.getExpiryDate());
        if (!policy.isActive() || !activeDatesPassed) {
            overallEligible = false;
            String msg = String.format("Incident date %s is outside active policy period (%s to %s) or policy inactive.",
                    incidentDate, policy.getEffectiveDate(), policy.getExpiryDate());
            ruleResults.add(new RuleCheckResult("POLICY_ACTIVE", false, msg));
            ineligibilityReasons.add(msg);
        } else {
            ruleResults.add(new RuleCheckResult("POLICY_ACTIVE", true,
                    String.format("Incident date %s is within active policy term (%s to %s).",
                            incidentDate, policy.getEffectiveDate(), policy.getExpiryDate())));
        }

        // Rule 2: Filing Window Compliance
        long daysElapsed = ChronoUnit.DAYS.between(incidentDate, filingDate);
        if (daysElapsed < 0) {
            daysElapsed = 0;
        }
        if (daysElapsed > policy.getFilingWindowDays()) {
            overallEligible = false;
            String msg = String.format("Late filing violation: Claim filed %d days after incident, exceeding the policy limit of %d days by %d day(s).",
                    daysElapsed, policy.getFilingWindowDays(), (daysElapsed - policy.getFilingWindowDays()));
            ruleResults.add(new RuleCheckResult("FILING_WINDOW", false, msg));
            ineligibilityReasons.add(msg);
        } else {
            ruleResults.add(new RuleCheckResult("FILING_WINDOW", true,
                    String.format("Claim filed within %d day(s) of incident (allowable window: %d days).",
                            daysElapsed, policy.getFilingWindowDays())));
        }

        // Rule 3: Excluded Categories Check
        List<String> excludedCategories = parseExcludedCategories(policy.getExcludedCategories());
        String claimCategory = claim.getCategory() != null ? claim.getCategory().trim().toUpperCase() : "";
        String narrativeLower = claim.getNarrative() != null ? claim.getNarrative().toLowerCase() : "";

        boolean isExcluded = false;
        String matchedExclusion = null;

        for (String excluded : excludedCategories) {
            String normExcluded = excluded.trim().toUpperCase();
            if (claimCategory.contains(normExcluded) || normExcluded.contains(claimCategory)) {
                isExcluded = true;
                matchedExclusion = normExcluded;
                break;
            }
            if (narrativeLower.contains(excluded.toLowerCase())) {
                isExcluded = true;
                matchedExclusion = excluded;
                break;
            }
        }

        if (isExcluded) {
            overallEligible = false;
            String msg = String.format("Excluded peril/category: Incident involves '%s', which is explicitly listed in policy exclusions.",
                    matchedExclusion);
            ruleResults.add(new RuleCheckResult("EXCLUDED_CATEGORY", false, msg));
            ineligibilityReasons.add(msg);
        } else {
            ruleResults.add(new RuleCheckResult("EXCLUDED_CATEGORY", true,
                    String.format("Category '%s' is an eligible covered peril.", claim.getCategory())));
        }

        // Rule 4: Coverage Limit & Deductible Calculation
        BigDecimal requested = claim.getRequestedAmount() != null ? claim.getRequestedAmount() : BigDecimal.ZERO;
        BigDecimal limit = policy.getCoverageLimit() != null ? policy.getCoverageLimit() : BigDecimal.ZERO;
        BigDecimal deductible = policy.getDeductible() != null ? policy.getDeductible() : BigDecimal.ZERO;
        BigDecimal suggestedPayout = BigDecimal.ZERO;

        if (requested.compareTo(limit) > 0) {
            // Documented rule: Payout capped at limit minus deductible. Excess is excluded.
            BigDecimal excess = requested.subtract(limit);
            suggestedPayout = limit.subtract(deductible);
            if (suggestedPayout.compareTo(BigDecimal.ZERO) < 0) suggestedPayout = BigDecimal.ZERO;

            ruleResults.add(new RuleCheckResult("COVERAGE_LIMIT", false,
                    String.format("Requested amount ($%s) exceeds policy coverage limit ($%s). Documented capping rule applied: Excess amount ($%s) excluded. Maximum allowable payout capped at $%s (limit $%s minus deductible $%s).",
                            requested, limit, excess, suggestedPayout, limit, deductible)));
        } else {
            suggestedPayout = requested.subtract(deductible);
            if (suggestedPayout.compareTo(BigDecimal.ZERO) < 0) suggestedPayout = BigDecimal.ZERO;

            ruleResults.add(new RuleCheckResult("COVERAGE_LIMIT", true,
                    String.format("Requested amount ($%s) is within policy limit ($%s). Deductible of $%s applied -> Suggested payout: $%s.",
                            requested, limit, deductible, suggestedPayout)));
        }

        // Rule 5: Duplicate Claim Check summary
        if (claim.isDuplicateSuspected()) {
            overallEligible = false;
            String msg = claim.getDuplicateReason() != null ? claim.getDuplicateReason() : "Duplicate incident collision detected.";
            ruleResults.add(new RuleCheckResult("DUPLICATE_CHECK", false, msg));
            ineligibilityReasons.add(msg);
        } else {
            ruleResults.add(new RuleCheckResult("DUPLICATE_CHECK", true, "No duplicate incident fingerprint matches found."));
        }

        if (!overallEligible) {
            suggestedPayout = BigDecimal.ZERO;
        }

        String primaryExplanation;
        if (overallEligible) {
            if (requested.compareTo(limit) > 0) {
                primaryExplanation = String.format("ELIGIBLE (CAPPED): Claim meets eligibility criteria. Payout capped at policy limit ($%s) minus deductible ($%s) = $%s.",
                        limit, deductible, suggestedPayout);
            } else {
                primaryExplanation = String.format("ELIGIBLE: Claim satisfies all deterministic policy conditions. Suggested payout after $%s deductible is $%s.",
                        deductible, suggestedPayout);
            }
        } else {
            primaryExplanation = "INELIGIBLE: " + String.join(" | ", ineligibilityReasons);
        }

        return new EligibilityResultDto(overallEligible, suggestedPayout, primaryExplanation, ruleResults);
    }

    private List<String> parseExcludedCategories(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
