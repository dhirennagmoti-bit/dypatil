package com.insurechain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_extraction_results")
public class AiExtractionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Column(name = "extracted_summary", columnDefinition = "TEXT")
    private String extractedSummary;

    @Column(name = "extracted_entities_json", columnDefinition = "TEXT")
    private String extractedEntitiesJson;

    @Column(name = "has_inconsistency", nullable = false)
    private boolean hasInconsistency = false;

    @Column(name = "inconsistency_flags_json", columnDefinition = "TEXT")
    private String inconsistencyFlagsJson = "[]";

    @Column(name = "confidence_score", precision = 4, scale = 3)
    private BigDecimal confidenceScore = new BigDecimal("0.950");

    @Column(name = "review_prompt_note", columnDefinition = "TEXT")
    private String reviewPromptNote;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt = Instant.now();

    public AiExtractionResult() {}

    public AiExtractionResult(UUID claimId, String extractedSummary, String extractedEntitiesJson, boolean hasInconsistency, String inconsistencyFlagsJson, BigDecimal confidenceScore, String reviewPromptNote) {
        this.claimId = claimId;
        this.extractedSummary = extractedSummary;
        this.extractedEntitiesJson = extractedEntitiesJson;
        this.hasInconsistency = hasInconsistency;
        this.inconsistencyFlagsJson = inconsistencyFlagsJson;
        this.confidenceScore = confidenceScore;
        this.reviewPromptNote = reviewPromptNote;
        this.processedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getClaimId() { return claimId; }
    public void setClaimId(UUID claimId) { this.claimId = claimId; }

    public String getExtractedSummary() { return extractedSummary; }
    public void setExtractedSummary(String extractedSummary) { this.extractedSummary = extractedSummary; }

    public String getExtractedEntitiesJson() { return extractedEntitiesJson; }
    public void setExtractedEntitiesJson(String extractedEntitiesJson) { this.extractedEntitiesJson = extractedEntitiesJson; }

    public boolean isHasInconsistency() { return hasInconsistency; }
    public void setHasInconsistency(boolean hasInconsistency) { this.hasInconsistency = hasInconsistency; }

    public String getInconsistencyFlagsJson() { return inconsistencyFlagsJson; }
    public void setInconsistencyFlagsJson(String inconsistencyFlagsJson) { this.inconsistencyFlagsJson = inconsistencyFlagsJson; }

    public BigDecimal getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(BigDecimal confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getReviewPromptNote() { return reviewPromptNote; }
    public void setReviewPromptNote(String reviewPromptNote) { this.reviewPromptNote = reviewPromptNote; }

    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }
}
