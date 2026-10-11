package com.insurechain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "policies")
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "insurer_id", nullable = false)
    private UUID insurerId;

    @Column(name = "policy_number", nullable = false, unique = true, length = 100)
    private String policyNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "coverage_limit", nullable = false, precision = 14, scale = 2)
    private BigDecimal coverageLimit;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal deductible = BigDecimal.ZERO;

    @Column(name = "filing_window_days", nullable = false)
    private int filingWindowDays = 30;

    @Column(name = "excluded_categories", nullable = false, columnDefinition = "TEXT")
    private String excludedCategories = "[]";

    @Column(name = "policy_rules_description", columnDefinition = "TEXT")
    private String policyRulesDescription;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Policy() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

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

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
