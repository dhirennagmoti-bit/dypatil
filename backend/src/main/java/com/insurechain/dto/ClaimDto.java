package com.insurechain.dto;

import com.insurechain.model.Claim;
import com.insurechain.model.ClaimStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

public class ClaimDto {
    private UUID id;
    private String claimReference;
    private UUID policyId;
    private String policyTitle;
    private String policyNumber;
    private UUID policyholderId;
    private String policyholderName;
    private UUID insurerId;
    private String insurerName;
    private String category;
    private BigDecimal requestedAmount;
    private BigDecimal approvedAmount;
    private LocalDate incidentDate;
    private LocalDate filingDate;
    private String narrative;
    private String incidentLocation;
    private ClaimStatus status;
    private String incidentId;
    private String incidentFingerprint;
    private boolean duplicateSuspected;
    private String duplicateReason;
    private String officerRecommendation;
    private String officerRecommendationJustification;
    private Instant officerRecommendedAt;
    private String supervisorDecision;
    private String supervisorDecisionJustification;
    private Instant supervisorDecidedAt;
    private String adminProcessingStatus;
    private String adminNotes;
    private String settlementReference;
    private Instant adminProcessedAt;
    private boolean highValue;
    private BigDecimal highValueThreshold;
    private BigDecimal coverageLimit;
    private BigDecimal deductible;
    private BigDecimal suggestedPayoutAmount;
    private Boolean eligible;
    private Instant createdAt;
    private Instant updatedAt;

    public ClaimDto() {}

    public static ClaimDto fromEntity(Claim claim, String policyTitle, String policyNumber, String policyholderName, String insurerName) {
        ClaimDto dto = new ClaimDto();
        dto.setId(claim.getId());
        dto.setClaimReference(claim.getClaimReference());
        dto.setPolicyId(claim.getPolicyId());
        dto.setPolicyTitle(policyTitle);
        dto.setPolicyNumber(policyNumber);
        dto.setPolicyholderId(claim.getPolicyholderId());
        dto.setPolicyholderName(policyholderName);
        dto.setInsurerId(claim.getInsurerId());
        dto.setInsurerName(insurerName);
        dto.setCategory(claim.getCategory());
        dto.setRequestedAmount(claim.getRequestedAmount());
        dto.setApprovedAmount(claim.getApprovedAmount());
        dto.setIncidentDate(claim.getIncidentDate());
        dto.setFilingDate(claim.getFilingDate());
        dto.setNarrative(claim.getNarrative());
        dto.setIncidentLocation(claim.getIncidentLocation());
        dto.setStatus(claim.getStatus());
        dto.setIncidentId(claim.getIncidentId());
        dto.setIncidentFingerprint(claim.getIncidentFingerprint());
        dto.setDuplicateSuspected(claim.isDuplicateSuspected());
        dto.setDuplicateReason(claim.getDuplicateReason());
        dto.setOfficerRecommendation(claim.getOfficerRecommendation());
        dto.setOfficerRecommendationJustification(claim.getOfficerRecommendationJustification());
        dto.setOfficerRecommendedAt(claim.getOfficerRecommendedAt());
        dto.setSupervisorDecision(claim.getSupervisorDecision());
        dto.setSupervisorDecisionJustification(claim.getSupervisorDecisionJustification());
        dto.setSupervisorDecidedAt(claim.getSupervisorDecidedAt());
        dto.setAdminProcessingStatus(claim.getAdminProcessingStatus());
        dto.setAdminNotes(claim.getAdminNotes());
        dto.setSettlementReference(claim.getSettlementReference());
        dto.setAdminProcessedAt(claim.getAdminProcessedAt());
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setUpdatedAt(claim.getUpdatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getClaimReference() { return claimReference; }
    public void setClaimReference(String claimReference) { this.claimReference = claimReference; }

    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }

    public String getPolicyTitle() { return policyTitle; }
    public void setPolicyTitle(String policyTitle) { this.policyTitle = policyTitle; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public UUID getPolicyholderId() { return policyholderId; }
    public void setPolicyholderId(UUID policyholderId) { this.policyholderId = policyholderId; }

    public String getPolicyholderName() { return policyholderName; }
    public void setPolicyholderName(String policyholderName) { this.policyholderName = policyholderName; }

    public UUID getInsurerId() { return insurerId; }
    public void setInsurerId(UUID insurerId) { this.insurerId = insurerId; }

    public String getInsurerName() { return insurerName; }
    public void setInsurerName(String insurerName) { this.insurerName = insurerName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(BigDecimal requestedAmount) { this.requestedAmount = requestedAmount; }

    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }

    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }

    public LocalDate getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDate filingDate) { this.filingDate = filingDate; }

    public String getNarrative() { return narrative; }
    public void setNarrative(String narrative) { this.narrative = narrative; }

    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }

    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getIncidentFingerprint() { return incidentFingerprint; }
    public void setIncidentFingerprint(String incidentFingerprint) { this.incidentFingerprint = incidentFingerprint; }

    public boolean isDuplicateSuspected() { return duplicateSuspected; }
    public void setDuplicateSuspected(boolean duplicateSuspected) { this.duplicateSuspected = duplicateSuspected; }

    public String getDuplicateReason() { return duplicateReason; }
    public void setDuplicateReason(String duplicateReason) { this.duplicateReason = duplicateReason; }

    public String getOfficerRecommendation() { return officerRecommendation; }
    public void setOfficerRecommendation(String officerRecommendation) { this.officerRecommendation = officerRecommendation; }

    public String getOfficerRecommendationJustification() { return officerRecommendationJustification; }
    public void setOfficerRecommendationJustification(String officerRecommendationJustification) { this.officerRecommendationJustification = officerRecommendationJustification; }

    public Instant getOfficerRecommendedAt() { return officerRecommendedAt; }
    public void setOfficerRecommendedAt(Instant officerRecommendedAt) { this.officerRecommendedAt = officerRecommendedAt; }

    public String getSupervisorDecision() { return supervisorDecision; }
    public void setSupervisorDecision(String supervisorDecision) { this.supervisorDecision = supervisorDecision; }

    public String getSupervisorDecisionJustification() { return supervisorDecisionJustification; }
    public void setSupervisorDecisionJustification(String supervisorDecisionJustification) { this.supervisorDecisionJustification = supervisorDecisionJustification; }

    public Instant getSupervisorDecidedAt() { return supervisorDecidedAt; }
    public void setSupervisorDecidedAt(Instant supervisorDecidedAt) { this.supervisorDecidedAt = supervisorDecidedAt; }

    public String getAdminProcessingStatus() { return adminProcessingStatus; }
    public void setAdminProcessingStatus(String adminProcessingStatus) { this.adminProcessingStatus = adminProcessingStatus; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getSettlementReference() { return settlementReference; }
    public void setSettlementReference(String settlementReference) { this.settlementReference = settlementReference; }

    public Instant getAdminProcessedAt() { return adminProcessedAt; }
    public void setAdminProcessedAt(Instant adminProcessedAt) { this.adminProcessedAt = adminProcessedAt; }

    public boolean isHighValue() { return highValue; }
    public void setHighValue(boolean highValue) { this.highValue = highValue; }

    public BigDecimal getHighValueThreshold() { return highValueThreshold; }
    public void setHighValueThreshold(BigDecimal highValueThreshold) { this.highValueThreshold = highValueThreshold; }

    public BigDecimal getCoverageLimit() { return coverageLimit; }
    public void setCoverageLimit(BigDecimal coverageLimit) { this.coverageLimit = coverageLimit; }

    public BigDecimal getDeductible() { return deductible; }
    public void setDeductible(BigDecimal deductible) { this.deductible = deductible; }

    public BigDecimal getSuggestedPayoutAmount() { return suggestedPayoutAmount; }
    public void setSuggestedPayoutAmount(BigDecimal suggestedPayoutAmount) { this.suggestedPayoutAmount = suggestedPayoutAmount; }

    public Boolean getEligible() { return eligible; }
    public void setEligible(Boolean eligible) { this.eligible = eligible; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
