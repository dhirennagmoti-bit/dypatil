package com.insurechain.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workflow_audit_logs")
public class WorkflowAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sequence_number", insertable = false, updatable = false)
    private Long sequenceNumber;

    @Column(name = "claim_id")
    private UUID claimId;

    @Column(name = "insurer_id")
    private UUID insurerId;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_email", nullable = false, length = 150)
    private String actorEmail;

    @Column(name = "actor_role", nullable = false, length = 50)
    private String actorRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private AuditAction action;

    @Column(name = "previous_state", length = 50)
    private String previousState;

    @Column(name = "new_state", length = 50)
    private String newState;

    @Column(name = "decision_reason", columnDefinition = "TEXT")
    private String decisionReason;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    @Column(name = "previous_hash", nullable = false, length = 64)
    private String previousHash;

    @Column(name = "current_hash", nullable = false, length = 64)
    private String currentHash;

    public WorkflowAuditLog() {}

    public WorkflowAuditLog(UUID claimId, UUID insurerId, UUID actorId, String actorEmail, String actorRole,
                            AuditAction action, String previousState, String newState, String decisionReason,
                            String ipAddress, String previousHash, String currentHash) {
        this.claimId = claimId;
        this.insurerId = insurerId;
        this.actorId = actorId;
        this.actorEmail = actorEmail;
        this.actorRole = actorRole;
        this.action = action;
        this.previousState = previousState;
        this.newState = newState;
        this.decisionReason = decisionReason;
        this.ipAddress = ipAddress;
        this.timestamp = Instant.now();
        this.previousHash = previousHash;
        this.currentHash = currentHash;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Long getSequenceNumber() { return sequenceNumber; }
    public void setSequenceNumber(Long sequenceNumber) { this.sequenceNumber = sequenceNumber; }

    public UUID getClaimId() { return claimId; }
    public void setClaimId(UUID claimId) { this.claimId = claimId; }

    public UUID getInsurerId() { return insurerId; }
    public void setInsurerId(UUID insurerId) { this.insurerId = insurerId; }

    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public AuditAction getAction() { return action; }
    public void setAction(AuditAction action) { this.action = action; }

    public String getPreviousState() { return previousState; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }

    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }

    public String getDecisionReason() { return decisionReason; }
    public void setDecisionReason(String decisionReason) { this.decisionReason = decisionReason; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }

    public String getCurrentHash() { return currentHash; }
    public void setCurrentHash(String currentHash) { this.currentHash = currentHash; }
}
