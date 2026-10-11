package com.insurechain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "eligibility_evaluations")
public class EligibilityEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Column(name = "is_eligible", nullable = false)
    private boolean eligible;

    @Column(name = "suggested_payout_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal suggestedPayoutAmount;

    @Column(name = "rule_results_json", nullable = false, columnDefinition = "TEXT")
    private String ruleResultsJson;

    @Column(name = "primary_explanation", nullable = false, columnDefinition = "TEXT")
    private String primaryExplanation;

    @Column(name = "evaluated_at", nullable = false)
    private Instant evaluatedAt = Instant.now();

    public EligibilityEvaluation() {}

    public EligibilityEvaluation(UUID claimId, boolean eligible, BigDecimal suggestedPayoutAmount, String ruleResultsJson, String primaryExplanation) {
        this.claimId = claimId;
        this.eligible = eligible;
        this.suggestedPayoutAmount = suggestedPayoutAmount;
        this.ruleResultsJson = ruleResultsJson;
        this.primaryExplanation = primaryExplanation;
        this.evaluatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getClaimId() { return claimId; }
    public void setClaimId(UUID claimId) { this.claimId = claimId; }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public BigDecimal getSuggestedPayoutAmount() { return suggestedPayoutAmount; }
    public void setSuggestedPayoutAmount(BigDecimal suggestedPayoutAmount) { this.suggestedPayoutAmount = suggestedPayoutAmount; }

    public String getRuleResultsJson() { return ruleResultsJson; }
    public void setRuleResultsJson(String ruleResultsJson) { this.ruleResultsJson = ruleResultsJson; }

    public String getPrimaryExplanation() { return primaryExplanation; }
    public void setPrimaryExplanation(String primaryExplanation) { this.primaryExplanation = primaryExplanation; }

    public Instant getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(Instant evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
