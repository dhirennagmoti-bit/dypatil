package com.insurechain.dto;

import com.insurechain.model.Policy;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

public class PolicyDto {
    private UUID id;
    private UUID insurerId;
    private String insurerName;
    private String policyNumber;
    private String title;
    private String description;
    private String category;
    private BigDecimal coverageLimit;
    private BigDecimal deductible;
    private int filingWindowDays;
    private String excludedCategories;
    private String policyRulesDescription;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private boolean active;
    private Instant createdAt;

    public PolicyDto() {}

    public static PolicyDto fromEntity(Policy policy, String insurerName) {
        PolicyDto dto = new PolicyDto();
        dto.setId(policy.getId());
        dto.setInsurerId(policy.getInsurerId());
        dto.setInsurerName(insurerName);
        dto.setPolicyNumber(policy.getPolicyNumber());
        dto.setTitle(policy.getTitle());
        dto.setDescription(policy.getDescription());
        dto.setCategory(policy.getCategory());
        dto.setCoverageLimit(policy.getCoverageLimit());
        dto.setDeductible(policy.getDeductible());
        dto.setFilingWindowDays(policy.getFilingWindowDays());
        dto.setExcludedCategories(policy.getExcludedCategories());
        dto.setPolicyRulesDescription(policy.getPolicyRulesDescription());
        dto.setEffectiveDate(policy.getEffectiveDate());
        dto.setExpiryDate(policy.getExpiryDate());
        dto.setActive(policy.isActive());
        dto.setCreatedAt(policy.getCreatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getInsurerId() { return insurerId; }
    public void setInsurerId(UUID insurerId) { this.insurerId = insurerId; }

    public String getInsurerName() { return insurerName; }
    public void setInsurerName(String insurerName) { this.insurerName = insurerName; }

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

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
