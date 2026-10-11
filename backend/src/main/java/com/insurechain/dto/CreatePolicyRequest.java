package com.insurechain.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class CreatePolicyRequest {

    private UUID insurerId;

    @NotBlank(message = "Policy number is required")
    private String policyNumber;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Coverage limit is required")
    @DecimalMin(value = "100.00", message = "Coverage limit must be at least 100.00")
    private BigDecimal coverageLimit;

    @NotNull(message = "Deductible is required")
    private BigDecimal deductible = BigDecimal.ZERO;

    private int filingWindowDays = 30;

    private String excludedCategories = "[]";

    private String policyRulesDescription;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    public CreatePolicyRequest() {}

    public UUID getInsurerId() { return insurerId; }
    public void setInsurerId(UUID insurerId) { this.insurerId = insurerId; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getCoverageLimit() { return coverageLimit; }
    public void setCoverageLimit(BigDecimal coverageLimit) { this.coverageLimit = coverageLimit; }

    public BigDecimal getDeductible() { return deductible; }
    public void setDeductible(BigDecimal deductible) { this.deductible = deductible; }

    public int getFilingWindowDays() { return filingWindowDays; }
    public void setFilingWindowDays(int filingWindowDays) { this.filingWindowDays = filingWindowDays; }

    public String getExcludedCategories() { return excludedCategories; }
    public void setExcludedCategories(String excludedCategories) { this.excludedCategories = excludedCategories; }

    public String getPolicyRulesDescription() { return policyRulesDescription; }
    public void setPolicyRulesDescription(String policyRulesDescription) { this.policyRulesDescription = policyRulesDescription; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
