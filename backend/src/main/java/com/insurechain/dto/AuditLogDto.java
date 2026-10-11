package com.insurechain.dto;

import com.insurechain.model.AuditAction;
import com.insurechain.model.WorkflowAuditLog;
import java.time.Instant;
import java.util.UUID;

public class AuditLogDto {
    private UUID id;
    private Long sequenceNumber;
    private UUID claimId;
    private UUID insurerId;
    private String insurerName;
    private UUID actorId;
    private String actorEmail;
    private String actorRole;
    private AuditAction action;
    private String previousState;
    private String newState;
    private String decisionReason;
    private String ipAddress;
    private Instant timestamp;
    private String previousHash;
    private String currentHash;

    public AuditLogDto() {}

    public static AuditLogDto fromEntity(WorkflowAuditLog log, String insurerName) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setSequenceNumber(log.getSequenceNumber());
        dto.setClaimId(log.getClaimId());
        dto.setInsurerId(log.getInsurerId());
        dto.setInsurerName(insurerName);
        dto.setActorId(log.getActorId());
        dto.setActorEmail(log.getActorEmail());
        dto.setActorRole(log.getActorRole());
        dto.setAction(log.getAction());
        dto.setPreviousState(log.getPreviousState());
        dto.setNewState(log.getNewState());
        dto.setDecisionReason(log.getDecisionReason());
        dto.setIpAddress(log.getIpAddress());
        dto.setTimestamp(log.getTimestamp());
        dto.setPreviousHash(log.getPreviousHash());
        dto.setCurrentHash(log.getCurrentHash());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Long getSequenceNumber() { return sequenceNumber; }
    public void setSequenceNumber(Long sequenceNumber) { this.sequenceNumber = sequenceNumber; }

    public UUID getClaimId() { return claimId; }
    public void setClaimId(UUID claimId) { this.claimId = claimId; }

    public UUID getInsurerId() { return insurerId; }
    public void setInsurerId(UUID insurerId) { this.insurerId = insurerId; }

    public String getInsurerName() { return insurerName; }
    public void setInsurerName(String insurerName) { this.insurerName = insurerName; }

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
