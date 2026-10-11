package com.insurechain;

import com.insurechain.dto.EligibilityResultDto;
import com.insurechain.dto.RuleCheckResult;
import com.insurechain.model.Claim;
import com.insurechain.model.Policy;
import com.insurechain.service.EligibilityEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class EligibilityEngineTest {

    private EligibilityEngine engine;
    private Policy standardPolicy;

    @BeforeEach
    public void setUp() {
        engine = new EligibilityEngine();

        standardPolicy = new Policy();
        standardPolicy.setId(UUID.randomUUID());
        standardPolicy.setPolicyNumber("TEST-POL-01");
        standardPolicy.setTitle("Standard Auto Protection");
        standardPolicy.setCategory("AUTO");
        standardPolicy.setCoverageLimit(new BigDecimal("10000.00"));
        standardPolicy.setDeductible(new BigDecimal("500.00"));
        standardPolicy.setFilingWindowDays(30);
        standardPolicy.setExcludedCategories("[\"RACING\", \"DRIVING_UNDER_INFLUENCE\", \"WAR\"]");
        standardPolicy.setEffectiveDate(LocalDate.of(2026, 1, 1));
        standardPolicy.setExpiryDate(LocalDate.of(2026, 12, 31));
        standardPolicy.setActive(true);
    }

    @Test
    @DisplayName("Eligible claim within limits and window should be approved with deductible subtracted")
    public void testEligibleClaim() {
        Claim claim = new Claim();
        claim.setId(UUID.randomUUID());
        claim.setCategory("AUTO");
        claim.setRequestedAmount(new BigDecimal("3000.00"));
        claim.setIncidentDate(LocalDate.now().minusDays(5));
        claim.setFilingDate(LocalDate.now());
        claim.setNarrative("Minor fender bender at intersection.");

        EligibilityResultDto result = engine.evaluateClaim(claim, standardPolicy);

        assertTrue(result.isEligible());
        assertEquals(new BigDecimal("2500.00"), result.getSuggestedPayoutAmount()); // 3000 - 500
        assertTrue(result.getPrimaryExplanation().contains("ELIGIBLE"));
    }

    @Test
    @DisplayName("Late filing claim exceeding policy window must be marked ineligible with explanation")
    public void testLateFilingClaim() {
        Claim claim = new Claim();
        claim.setId(UUID.randomUUID());
        claim.setCategory("AUTO");
        claim.setRequestedAmount(new BigDecimal("2000.00"));
        claim.setIncidentDate(LocalDate.now().minusDays(45)); // 45 days > 30 day window
        claim.setFilingDate(LocalDate.now());
        claim.setNarrative("Cracked rear tail light from last month.");

        EligibilityResultDto result = engine.evaluateClaim(claim, standardPolicy);

        assertFalse(result.isEligible());
        assertEquals(BigDecimal.ZERO, result.getSuggestedPayoutAmount());
        assertTrue(result.getPrimaryExplanation().contains("Late filing"));

        RuleCheckResult windowRule = result.getRules().stream()
                .filter(r -> "FILING_WINDOW".equals(r.getRule()))
                .findFirst()
                .orElse(null);
        assertNotNull(windowRule);
        assertFalse(windowRule.isPassed());
    }

    @Test
    @DisplayName("Excluded category claim must be marked ineligible with clear exclusion explanation")
    public void testExcludedCategoryClaim() {
        Claim claim = new Claim();
        claim.setId(UUID.randomUUID());
        claim.setCategory("AUTO");
        claim.setRequestedAmount(new BigDecimal("4000.00"));
        claim.setIncidentDate(LocalDate.now().minusDays(2));
        claim.setFilingDate(LocalDate.now());
        claim.setNarrative("Engine blown while participating in amateur racing event.");

        EligibilityResultDto result = engine.evaluateClaim(claim, standardPolicy);

        assertFalse(result.isEligible());
        assertEquals(BigDecimal.ZERO, result.getSuggestedPayoutAmount());
        assertTrue(result.getPrimaryExplanation().contains("Excluded peril"));
    }

    @Test
    @DisplayName("Above-limit claim must be capped at policy limit minus deductible with documented rule explanation")
    public void testAboveLimitClaimCapping() {
        Claim claim = new Claim();
        claim.setId(UUID.randomUUID());
        claim.setCategory("AUTO");
        claim.setRequestedAmount(new BigDecimal("15000.00")); // exceeds 10,000 limit
        claim.setIncidentDate(LocalDate.now().minusDays(3));
        claim.setFilingDate(LocalDate.now());
        claim.setNarrative("Vehicle totaled in severe multicar collision.");

        EligibilityResultDto result = engine.evaluateClaim(claim, standardPolicy);

        assertTrue(result.isEligible()); // Partially eligible
        assertEquals(new BigDecimal("9500.00"), result.getSuggestedPayoutAmount()); // 10000 limit - 500 deductible
        assertTrue(result.getPrimaryExplanation().contains("CAPPED"));

        RuleCheckResult limitRule = result.getRules().stream()
                .filter(r -> "COVERAGE_LIMIT".equals(r.getRule()))
                .findFirst()
                .orElse(null);
        assertNotNull(limitRule);
        assertFalse(limitRule.isPassed()); // flagged as exceeding limit
        assertTrue(limitRule.getMessage().contains("exceeds policy coverage limit"));
    }
}
