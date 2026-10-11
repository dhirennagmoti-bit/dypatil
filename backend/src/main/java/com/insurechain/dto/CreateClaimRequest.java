package com.insurechain.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CreateClaimRequest {

    @NotNull(message = "Policy ID is required")
    private UUID policyId;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Requested amount is required")
    @DecimalMin(value = "1.00", message = "Requested amount must be at least 1.00")
    private BigDecimal requestedAmount;

    @NotNull(message = "Incident date is required")
    private LocalDate incidentDate;

    @NotBlank(message = "Incident narrative is required")
    private String narrative;

    private String incidentLocation;

    private List<EvidenceItem> evidence = new ArrayList<>();

    public static class EvidenceItem {
        private String fileName;
        private String fileType;
        private String fileUrl;
        private Long fileSizeBytes;
        private String description;

        public EvidenceItem() {}

        public EvidenceItem(String fileName, String fileType, String fileUrl, Long fileSizeBytes, String description) {
            this.fileName = fileName;
            this.fileType = fileType;
            this.fileUrl = fileUrl;
            this.fileSizeBytes = fileSizeBytes;
            this.description = description;
        }

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
    }

    public CreateClaimRequest() {}

    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(BigDecimal requestedAmount) { this.requestedAmount = requestedAmount; }

    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }

    public String getNarrative() { return narrative; }
    public void setNarrative(String narrative) { this.narrative = narrative; }

    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }

    public List<EvidenceItem> getEvidence() { return evidence; }
    public void setEvidence(List<EvidenceItem> evidence) { this.evidence = evidence; }
}
