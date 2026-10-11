package com.insurechain.dto;

import com.insurechain.model.AiExtractionResult;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class AiExtractionDto {
    private UUID id;
    private UUID claimId;
    private String extractedSummary;
    private String extractedEntitiesJson;
    private boolean hasInconsistency;
    private String inconsistencyFlagsJson;
    private BigDecimal confidenceScore;
    private String reviewPromptNote;
    private Instant processedAt;

    public AiExtractionDto() {}

    public static AiExtractionDto fromEntity(AiExtractionResult entity) {
        if (entity == null) return null;
        AiExtractionDto dto = new AiExtractionDto();
        dto.setId(entity.getId());
        dto.setClaimId(entity.getClaimId());
        dto.setExtractedSummary(entity.getExtractedSummary());
        dto.setExtractedEntitiesJson(entity.getExtractedEntitiesJson());
        dto.setHasInconsistency(entity.isHasInconsistency());
        dto.setInconsistencyFlagsJson(entity.getInconsistencyFlagsJson());
        dto.setConfidenceScore(entity.getConfidenceScore());
        dto.setReviewPromptNote(entity.getReviewPromptNote());
        dto.setProcessedAt(entity.getProcessedAt());
        return dto;
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
