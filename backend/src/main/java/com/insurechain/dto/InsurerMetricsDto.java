package com.insurechain.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class InsurerMetricsDto {
    private UUID insurerId;
    private String insurerName;
    private long totalPolicies;
    private long totalClaims;
    private long submittedClaims;
    private long underReviewClaims;
    private long approvedClaims;
    private long rejectedClaims;
    private long paidClaims;
    private long pendingOfficerReviews;
    private long pendingSupervisorDecisions;
    private long highValuePendingClaims;
    private long approvedAwaitingAdmin;
    private long refusedViolationsCount;
    private BigDecimal highValueThreshold = new BigDecimal("500000.00");
    private BigDecimal totalRequestedAmount = BigDecimal.ZERO;
    private BigDecimal totalApprovedAmount = BigDecimal.ZERO;

    public InsurerMetricsDto() {}

    public UUID getInsurerId() { return insurerId; }
    public void setInsurerId(UUID insurerId) { this.insurerId = insurerId; }

    public String getInsurerName() { return insurerName; }
    public void setInsurerName(String insurerName) { this.insurerName = insurerName; }

    public long getTotalPolicies() { return totalPolicies; }
    public void setTotalPolicies(long totalPolicies) { this.totalPolicies = totalPolicies; }

    public long getTotalClaims() { return totalClaims; }
    public void setTotalClaims(long totalClaims) { this.totalClaims = totalClaims; }

    public long getSubmittedClaims() { return submittedClaims; }
    public void setSubmittedClaims(long submittedClaims) { this.submittedClaims = submittedClaims; }

    public long getUnderReviewClaims() { return underReviewClaims; }
    public void setUnderReviewClaims(long underReviewClaims) { this.underReviewClaims = underReviewClaims; }

    public long getApprovedClaims() { return approvedClaims; }
    public void setApprovedClaims(long approvedClaims) { this.approvedClaims = approvedClaims; }

    public long getRejectedClaims() { return rejectedClaims; }
    public void setRejectedClaims(long rejectedClaims) { this.rejectedClaims = rejectedClaims; }

    public long getPaidClaims() { return paidClaims; }
    public void setPaidClaims(long paidClaims) { this.paidClaims = paidClaims; }

    public long getPendingOfficerReviews() { return pendingOfficerReviews; }
    public void setPendingOfficerReviews(long pendingOfficerReviews) { this.pendingOfficerReviews = pendingOfficerReviews; }

    public long getPendingSupervisorDecisions() { return pendingSupervisorDecisions; }
    public void setPendingSupervisorDecisions(long pendingSupervisorDecisions) { this.pendingSupervisorDecisions = pendingSupervisorDecisions; }

    public long getHighValuePendingClaims() { return highValuePendingClaims; }
    public void setHighValuePendingClaims(long highValuePendingClaims) { this.highValuePendingClaims = highValuePendingClaims; }

    public long getApprovedAwaitingAdmin() { return approvedAwaitingAdmin; }
    public void setApprovedAwaitingAdmin(long approvedAwaitingAdmin) { this.approvedAwaitingAdmin = approvedAwaitingAdmin; }

    public long getRefusedViolationsCount() { return refusedViolationsCount; }
    public void setRefusedViolationsCount(long refusedViolationsCount) { this.refusedViolationsCount = refusedViolationsCount; }

    public BigDecimal getHighValueThreshold() { return highValueThreshold; }
    public void setHighValueThreshold(BigDecimal highValueThreshold) { this.highValueThreshold = highValueThreshold; }

    public BigDecimal getTotalRequestedAmount() { return totalRequestedAmount; }
    public void setTotalRequestedAmount(BigDecimal totalRequestedAmount) { this.totalRequestedAmount = totalRequestedAmount; }

    public BigDecimal getTotalApprovedAmount() { return totalApprovedAmount; }
    public void setTotalApprovedAmount(BigDecimal totalApprovedAmount) { this.totalApprovedAmount = totalApprovedAmount; }
}
