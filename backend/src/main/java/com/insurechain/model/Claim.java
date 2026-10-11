package com.insurechain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "claim_reference", nullable = false, unique = true, length = 100)
    private String claimReference;

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "policyholder_id", nullable = false)
    private UUID policyholderId;

    @Column(name = "insurer_id", nullable = false)
    private UUID insurerId;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "requested_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal requestedAmount;

    @Column(name = "approved_amount", precision = 14, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;

    @Column(name = "filing_date", nullable = false)
    private LocalDate filingDate = LocalDate.now();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String narrative;

    @Column(name = "incident_location", length = 255)
    private String incidentLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ClaimStatus status = ClaimStatus.SUBMITTED;

    @Column(name = "incident_id", length = 100)
    private String incidentId;

    @Column(name = "incident_fingerprint", nullable = false, length = 64)
    private String incidentFingerprint;

    @Column(name = "is_duplicate_suspected", nullable = false)
    private boolean duplicateSuspected = false;

    @Column(name = "duplicate_reason", columnDefinition = "TEXT")
    private String duplicateReason;

    @Column(name = "officer_recommendation", length = 50)
    private String officerRecommendation;

    @Column(name = "officer_recommendation_justification", columnDefinition = "TEXT")
    private String officerRecommendationJustification;

    @Column(name = "officer_recommended_at")
    private Instant officerRecommendedAt;

    @Column(name = "officer_id")
    private UUID officerId;

    @Column(name = "supervisor_decision", length = 50)
    private String supervisorDecision;

    @Column(name = "supervisor_decision_justification", columnDefinition = "TEXT")
    private String supervisorDecisionJustification;

    @Column(name = "supervisor_decided_at")
    private Instant supervisorDecidedAt;

    @Column(name = "supervisor_id")
    private UUID supervisorId;

    @Column(name = "admin_processing_status", length = 50)
    private String adminProcessingStatus = "PENDING";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "settlement_reference", length = 100)
    private String settlementReference;

    @Column(name = "admin_processed_at")
    private Instant adminProcessedAt;

    @Column(name = "admin_id")
    private UUID adminId;

    @Column(name = "policy_rules_snapshot", columnDefinition = "TEXT")
    private String policyRulesSnapshot;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Claim() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getClaimReference() { return claimReference; }
    public void setClaimReference(String claimReference) { this.claimReference = claimReference; }

    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }

    public UUID getPolicyholderId() { return policyholderId; }
    public void setPolicyholderId(UUID policyholderId) { this.policyholderId = policyholderId; }

    public UUID getInsurerId() { return insurerId; }
    public void setInsurerId(UUID insurerId) { this.insurerId = insurerId; }

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

    public UUID getOfficerId() { return officerId; }
    public void setOfficerId(UUID officerId) { this.officerId = officerId; }

    public String getSupervisorDecision() { return supervisorDecision; }
    public void setSupervisorDecision(String supervisorDecision) { this.supervisorDecision = supervisorDecision; }

    public String getSupervisorDecisionJustification() { return supervisorDecisionJustification; }
    public void setSupervisorDecisionJustification(String supervisorDecisionJustification) { this.supervisorDecisionJustification = supervisorDecisionJustification; }

    public Instant getSupervisorDecidedAt() { return supervisorDecidedAt; }
    public void setSupervisorDecidedAt(Instant supervisorDecidedAt) { this.supervisorDecidedAt = supervisorDecidedAt; }

    public UUID getSupervisorId() { return supervisorId; }
    public void setSupervisorId(UUID supervisorId) { this.supervisorId = supervisorId; }

    public String getAdminProcessingStatus() { return adminProcessingStatus; }
    public void setAdminProcessingStatus(String adminProcessingStatus) { this.adminProcessingStatus = adminProcessingStatus; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getSettlementReference() { return settlementReference; }
    public void setSettlementReference(String settlementReference) { this.settlementReference = settlementReference; }

    public Instant getAdminProcessedAt() { return adminProcessedAt; }
    public void setAdminProcessedAt(Instant adminProcessedAt) { this.adminProcessedAt = adminProcessedAt; }

    public UUID getAdminId() { return adminId; }
    public void setAdminId(UUID adminId) { this.adminId = adminId; }

    public String getPolicyRulesSnapshot() { return policyRulesSnapshot; }
    public void setPolicyRulesSnapshot(String policyRulesSnapshot) { this.policyRulesSnapshot = policyRulesSnapshot; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
