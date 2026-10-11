package com.insurechain.dto;

import com.insurechain.model.ClaimStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WorkflowTransitionRequest {

    @NotNull(message = "Target status is required")
    private ClaimStatus targetStatus;

    private BigDecimal approvedAmount;

    @NotBlank(message = "Decision reason / justification is required")
    private String decisionReason;

    private String notes;

    public WorkflowTransitionRequest() {}

    public ClaimStatus getTargetStatus() { return targetStatus; }
    public void setTargetStatus(ClaimStatus targetStatus) { this.targetStatus = targetStatus; }

    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }

    public String getDecisionReason() { return decisionReason; }
    public void setDecisionReason(String decisionReason) { this.decisionReason = decisionReason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
