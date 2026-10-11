package com.insurechain.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class EligibilityResultDto {
    private boolean eligible;
    private BigDecimal suggestedPayoutAmount;
    private String primaryExplanation;
    private List<RuleCheckResult> rules = new ArrayList<>();

    public EligibilityResultDto() {}

    public EligibilityResultDto(boolean eligible, BigDecimal suggestedPayoutAmount, String primaryExplanation, List<RuleCheckResult> rules) {
        this.eligible = eligible;
        this.suggestedPayoutAmount = suggestedPayoutAmount;
        this.primaryExplanation = primaryExplanation;
        this.rules = rules;
    }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public BigDecimal getSuggestedPayoutAmount() { return suggestedPayoutAmount; }
    public void setSuggestedPayoutAmount(BigDecimal suggestedPayoutAmount) { this.suggestedPayoutAmount = suggestedPayoutAmount; }

    public String getPrimaryExplanation() { return primaryExplanation; }
    public void setPrimaryExplanation(String primaryExplanation) { this.primaryExplanation = primaryExplanation; }

    public List<RuleCheckResult> getRules() { return rules; }
    public void setRules(List<RuleCheckResult> rules) { this.rules = rules; }
}
