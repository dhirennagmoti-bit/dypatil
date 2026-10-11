package com.insurechain.dto;

import com.insurechain.model.ClaimEvidence;
import java.time.Instant;
import java.util.UUID;

public class ClaimEvidenceDto {
    private UUID id;
    private UUID claimId;
    private String fileName;
    private String fileType;
    private String fileUrl;
    private Long fileSizeBytes;
    private String description;
    private Instant uploadedAt;

    public ClaimEvidenceDto() {}

    public static ClaimEvidenceDto fromEntity(ClaimEvidence entity) {
        ClaimEvidenceDto dto = new ClaimEvidenceDto();
        dto.setId(entity.getId());
        dto.setClaimId(entity.getClaimId());
        dto.setFileName(entity.getFileName());
        dto.setFileType(entity.getFileType());
        dto.setFileUrl(entity.getFileUrl());
        dto.setFileSizeBytes(entity.getFileSizeBytes());
        dto.setDescription(entity.getDescription());
        dto.setUploadedAt(entity.getUploadedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getClaimId() { return claimId; }
    public void setClaimId(UUID claimId) { this.claimId = claimId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
}
