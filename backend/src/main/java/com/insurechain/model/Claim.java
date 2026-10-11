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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
