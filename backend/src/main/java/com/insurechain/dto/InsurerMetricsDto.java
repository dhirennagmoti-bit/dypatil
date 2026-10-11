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

    public BigDecimal getTotalRequestedAmount() { return totalRequestedAmount; }
    public void setTotalRequestedAmount(BigDecimal totalRequestedAmount) { this.totalRequestedAmount = totalRequestedAmount; }

    public BigDecimal getTotalApprovedAmount() { return totalApprovedAmount; }
    public void setTotalApprovedAmount(BigDecimal totalApprovedAmount) { this.totalApprovedAmount = totalApprovedAmount; }
}
