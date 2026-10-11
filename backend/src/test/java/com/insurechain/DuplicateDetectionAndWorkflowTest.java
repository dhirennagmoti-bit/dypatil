package com.insurechain;

import com.insurechain.dto.WorkflowTransitionRequest;
import com.insurechain.exception.InvalidWorkflowTransitionException;
import com.insurechain.model.*;
import com.insurechain.repository.*;
import com.insurechain.security.UserDetailsImpl;
import com.insurechain.service.AuditChainService;
import com.insurechain.service.ClaimService;
import com.insurechain.service.DuplicateDetectionService;
import com.insurechain.service.EligibilityEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DuplicateDetectionAndWorkflowTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private InsurerRepository insurerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClaimEvidenceRepository claimEvidenceRepository;

    @Mock
    private EligibilityEvaluationRepository eligibilityEvaluationRepository;

    @Mock
    private AiExtractionResultRepository aiExtractionResultRepository;

    @Mock
    private WorkflowAuditLogRepository auditLogRepository;

    @Mock
    private AuditChainService auditChainService;

    @Mock
    private EligibilityEngine eligibilityEngine;

    @InjectMocks
    private DuplicateDetectionService duplicateDetectionService;

    @InjectMocks
    private ClaimService claimService;

    private UUID policyId;
    private UUID insurerId;
    private UUID officerUserId;
    private UUID supervisorUserId;
    private UUID adminUserId;
    private UserDetailsImpl officerUser;
    private UserDetailsImpl supervisorUser;
    private UserDetailsImpl adminUser;
    private Policy policy;

    @BeforeEach
    public void setUp() {
        policyId = UUID.randomUUID();
        insurerId = UUID.randomUUID();
        officerUserId = UUID.randomUUID();
        supervisorUserId = UUID.randomUUID();
        adminUserId = UUID.randomUUID();

        officerUser = new UserDetailsImpl(
                officerUserId,
                "officer@test.com",
                "Password123!",
                "Officer Sharma",
                RoleType.CLAIMS_OFFICER,
                insurerId,
                true,
                org.springframework.security.core.authority.AuthorityUtils.createAuthorityList("ROLE_CLAIMS_OFFICER")
        );

        supervisorUser = new UserDetailsImpl(
                supervisorUserId,
                "supervisor@test.com",
                "Password123!",
                "Supervisor Patel",
                RoleType.SUPERVISOR,
                insurerId,
                true,
                org.springframework.security.core.authority.AuthorityUtils.createAuthorityList("ROLE_SUPERVISOR")
        );

        adminUser = new UserDetailsImpl(
                adminUserId,
                "admin@test.com",
                "Password123!",
                "Admin Rao",
                RoleType.INSURER_ADMIN,
                insurerId,
                true,
                org.springframework.security.core.authority.AuthorityUtils.createAuthorityList("ROLE_INSURER_ADMIN")
        );

        policy = new Policy();
        policy.setId(policyId);
        policy.setInsurerId(insurerId);
        policy.setPolicyNumber("POL-01");
        policy.setCoverageLimit(new BigDecimal("100000.00"));
        policy.setDeductible(new BigDecimal("1000.00"));
        policy.setFilingWindowDays(30);
        policy.setActive(true);

        ReflectionTestUtils.setField(claimService, "duplicateDetectionService", duplicateDetectionService);
    }

    @Test
    @DisplayName("Feature 2: Stable incident ID duplicate detection (Claim 101 vs Claim 205 on INC-55)")
    public void testStableIncidentDuplicateDetection() {
        // Claim 101 is already registered with incidentId "INC-55" under POL-01
        Claim claim101 = new Claim();
        claim101.setId(UUID.randomUUID());
        claim101.setClaimReference("CLM-101");
        claim101.setPolicyId(policyId);
        claim101.setIncidentId("INC-55");
        claim101.setRequestedAmount(new BigDecimal("20000.00"));
        claim101.setStatus(ClaimStatus.SUBMITTED);
        claim101.setIncidentDate(LocalDate.now().minusDays(2));
        claim101.setCategory("MOTOR");

        when(claimRepository.findByPolicyIdAndIncidentId(eq(policyId), eq("INC-55")))
                .thenReturn(List.of(claim101));

        // Attempting to check Claim 205 with different claimReference but same Incident ID INC-55
        DuplicateDetectionService.DuplicateCheckOutcome outcome = duplicateDetectionService.checkDuplicate(
                null,
                policyId,
                "INC-55",
                LocalDate.now().minusDays(2),
                "MOTOR",
                new BigDecimal("20000.00")
        );

        assertTrue(outcome.isDuplicate(), "System must detect match for same incident ID under same policy");
        assertTrue(outcome.getReason().contains("INC-55"), "Reason must reference the stable incident ID");
        assertTrue(outcome.getReason().contains("CLM-101"), "Reason must reference existing conflicting claim");
    }

    @Test
    @DisplayName("Feature 3 & 4: Claims Officer attempting unauthorized approval is rejected and logged as ACTION_REFUSED")
    public void testOfficerUnauthorizedApprovalBlockedAndAudited() {
        UUID claimId = UUID.randomUUID();
        Claim claim = new Claim();
        claim.setId(claimId);
        claim.setClaimReference("CLM-101");
        claim.setPolicyId(policyId);
        claim.setInsurerId(insurerId);
        claim.setStatus(ClaimStatus.UNDER_REVIEW);

        when(claimRepository.findById(claimId)).thenReturn(Optional.of(claim));
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));

        WorkflowTransitionRequest request = new WorkflowTransitionRequest();
        request.setTargetStatus(ClaimStatus.APPROVED);
        request.setDecisionReason("Officer attempting approval directly");

        InvalidWorkflowTransitionException ex = assertThrows(InvalidWorkflowTransitionException.class, () -> {
            claimService.transitionWorkflow(claimId, officerUser, request, "127.0.0.1");
        });

        assertTrue(ex.getMessage().contains("UNAUTHORIZED APPROVAL"), "Should refuse unauthorized officer approval");

        // Verify that refused action was logged into audit chain with role and reason
        verify(auditChainService, times(1)).logRefusedAction(
                eq(claimId),
                eq(insurerId),
                eq(officerUserId),
                eq("officer@test.com"),
                eq("CLAIMS_OFFICER"),
                eq(AuditAction.CLAIM_APPROVED),
                contains("UNAUTHORIZED APPROVAL"),
                eq("127.0.0.1")
        );
    }

    @Test
    @DisplayName("Feature 3: Invalid jump from SUBMITTED directly to PAID is refused and audited")
    public void testDirectJumpToPaidBlockedAndAudited() {
        UUID claimId = UUID.randomUUID();
        Claim claim = new Claim();
        claim.setId(claimId);
        claim.setClaimReference("CLM-101");
        claim.setPolicyId(policyId);
        claim.setInsurerId(insurerId);
        claim.setStatus(ClaimStatus.SUBMITTED);

        when(claimRepository.findById(claimId)).thenReturn(Optional.of(claim));
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));

        WorkflowTransitionRequest request = new WorkflowTransitionRequest();
        request.setTargetStatus(ClaimStatus.PAID);
        request.setDecisionReason("Attempting skip to PAID");

        InvalidWorkflowTransitionException ex = assertThrows(InvalidWorkflowTransitionException.class, () -> {
            claimService.transitionWorkflow(claimId, supervisorUser, request, "127.0.0.1");
        });

        assertTrue(ex.getMessage().contains("Direct jump"), "Must block direct leap to PAID");

        verify(auditChainService, times(1)).logRefusedAction(
                eq(claimId),
                eq(insurerId),
                eq(supervisorUserId),
                eq("supervisor@test.com"),
                eq("SUPERVISOR"),
                eq(AuditAction.PAYMENT_ISSUED),
                contains("Direct jump"),
                eq("127.0.0.1")
        );
    }

    @Test
    @DisplayName("Feature 2: Duplicate incident claim is hard-blocked from progressing to PAID/APPROVED")
    public void testDuplicateClaimBlockedFromPayment() {
        UUID claimId = UUID.randomUUID();
        Claim claim = new Claim();
        claim.setId(claimId);
        claim.setClaimReference("CLM-205");
        claim.setPolicyId(policyId);
        claim.setInsurerId(insurerId);
        claim.setStatus(ClaimStatus.UNDER_REVIEW);
        claim.setDuplicateSuspected(true);
        claim.setDuplicateReason("Duplicate incident INC-55 collision");

        when(claimRepository.findById(claimId)).thenReturn(Optional.of(claim));
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));

        WorkflowTransitionRequest request = new WorkflowTransitionRequest();
        request.setTargetStatus(ClaimStatus.APPROVED);
        request.setDecisionReason("Supervisor attempting to approve duplicate");

        InvalidWorkflowTransitionException ex = assertThrows(InvalidWorkflowTransitionException.class, () -> {
            claimService.transitionWorkflow(claimId, supervisorUser, request, "127.0.0.1");
        });

        assertTrue(ex.getMessage().contains("DUPLICATE INCIDENT BLOCKED"));

        verify(auditChainService, times(1)).logRefusedAction(
                eq(claimId),
                eq(insurerId),
                eq(supervisorUserId),
                eq("supervisor@test.com"),
                eq("SUPERVISOR"),
                eq(AuditAction.CLAIM_APPROVED),
                contains("DUPLICATE INCIDENT BLOCKED"),
                eq("127.0.0.1")
        );
    }

    @Test
    @DisplayName("Feature: Officer recommendation moves claim to PENDING_SUPERVISOR_REVIEW with recommendation recorded")
    public void testOfficerRecommendationMovesClaimToPendingSupervisorReview() {
        UUID claimId = UUID.randomUUID();
        Claim claim = new Claim();
        claim.setId(claimId);
        claim.setClaimReference("CLM-301");
        claim.setPolicyId(policyId);
        claim.setInsurerId(insurerId);
        claim.setStatus(ClaimStatus.UNDER_REVIEW);

        when(claimRepository.findById(claimId)).thenReturn(Optional.of(claim));
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));
        when(claimRepository.save(any(Claim.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkflowTransitionRequest request = new WorkflowTransitionRequest();
        request.setTargetStatus(ClaimStatus.PENDING_SUPERVISOR_REVIEW);
        request.setOfficerRecommendation("APPROVE");
        request.setDecisionReason("Documents verified and incident within coverage terms");

        claimService.transitionWorkflow(claimId, officerUser, request, "127.0.0.1");

        assertEquals(ClaimStatus.PENDING_SUPERVISOR_REVIEW, claim.getStatus());
        assertEquals("APPROVE", claim.getOfficerRecommendation());
        assertEquals("Documents verified and incident within coverage terms", claim.getOfficerRecommendationJustification());
        assertEquals(officerUserId, claim.getOfficerId());
        assertNotNull(claim.getOfficerRecommendedAt());

        verify(auditChainService, times(1)).logWorkflowEvent(
                eq(claimId),
                eq(insurerId),
                eq(officerUserId),
                eq("officer@test.com"),
                eq("CLAIMS_OFFICER"),
                eq(AuditAction.OFFICER_RECOMMENDATION_SUBMITTED),
                eq("UNDER_REVIEW"),
                eq("PENDING_SUPERVISOR_REVIEW"),
                eq("Documents verified and incident within coverage terms"),
                eq("127.0.0.1")
        );
    }

    @Test
    @DisplayName("Feature: Supervisor cannot approve a claim with hard eligibility failure (e.g. late filing or inactive)")
    public void testSupervisorCannotApproveHardEligibilityFailure() {
        UUID claimId = UUID.randomUUID();
        Claim claim = new Claim();
        claim.setId(claimId);
        claim.setClaimReference("CLM-401");
        claim.setPolicyId(policyId);
        claim.setInsurerId(insurerId);
        claim.setStatus(ClaimStatus.PENDING_SUPERVISOR_REVIEW);

        when(claimRepository.findById(claimId)).thenReturn(Optional.of(claim));
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));

        // Mock eligibility evaluation with hard failure
        EligibilityEvaluation eval = new EligibilityEvaluation();
        eval.setEligible(false);
        eval.setPrimaryExplanation("LATE_FILING: Incident filed 45 days after incident, exceeding 30-day window");
        when(eligibilityEvaluationRepository.findByClaimId(claimId))
                .thenReturn(Optional.of(eval));

        WorkflowTransitionRequest request = new WorkflowTransitionRequest();
        request.setTargetStatus(ClaimStatus.APPROVED);
        request.setDecisionReason("Attempting to approve claim despite late filing");

        InvalidWorkflowTransitionException ex = assertThrows(InvalidWorkflowTransitionException.class, () -> {
            claimService.transitionWorkflow(claimId, supervisorUser, request, "127.0.0.1");
        });

        assertTrue(ex.getMessage().contains("HARD ELIGIBILITY FAILURE"));

        verify(auditChainService, times(1)).logRefusedAction(
                eq(claimId),
                eq(insurerId),
                eq(supervisorUserId),
                eq("supervisor@test.com"),
                eq("SUPERVISOR"),
                eq(AuditAction.CLAIM_APPROVED),
                contains("HARD ELIGIBILITY FAILURE"),
                eq("127.0.0.1")
        );
    }

    @Test
    @DisplayName("Feature: Insurer Admin processes approved claim to PAID with settlement reference")
    public void testAdminProcessesApprovedClaimToPaid() {
        UUID claimId = UUID.randomUUID();
        Claim claim = new Claim();
        claim.setId(claimId);
        claim.setClaimReference("CLM-501");
        claim.setPolicyId(policyId);
        claim.setInsurerId(insurerId);
        claim.setStatus(ClaimStatus.APPROVED);

        when(claimRepository.findById(claimId)).thenReturn(Optional.of(claim));
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));
        when(claimRepository.save(any(Claim.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkflowTransitionRequest request = new WorkflowTransitionRequest();
        request.setTargetStatus(ClaimStatus.PAID);
        request.setSettlementReference("NEFT-20261011-98765");
        request.setDecisionReason("Bank disbursement completed via NEFT batch 42");

        claimService.transitionWorkflow(claimId, adminUser, request, "127.0.0.1");

        assertEquals(ClaimStatus.PAID, claim.getStatus());
        assertEquals("NEFT-20261011-98765", claim.getSettlementReference());
        assertEquals("SETTLED", claim.getAdminProcessingStatus());
        assertEquals(adminUserId, claim.getAdminId());
        assertNotNull(claim.getAdminProcessedAt());

        verify(auditChainService, times(1)).logWorkflowEvent(
                eq(claimId),
                eq(insurerId),
                eq(adminUserId),
                eq("admin@test.com"),
                eq("INSURER_ADMIN"),
                eq(AuditAction.PAYMENT_ISSUED),
                eq("APPROVED"),
                eq("PAID"),
                eq("Bank disbursement completed via NEFT batch 42"),
                eq("127.0.0.1")
        );
    }

    @Test
    @DisplayName("Feature: Insurer Admin cannot mark REJECTED claim as PAID")
    public void testAdminCannotMarkRejectedClaimAsPaid() {
        UUID claimId = UUID.randomUUID();
        Claim claim = new Claim();
        claim.setId(claimId);
        claim.setClaimReference("CLM-601");
        claim.setPolicyId(policyId);
        claim.setInsurerId(insurerId);
        claim.setStatus(ClaimStatus.REJECTED);

        when(claimRepository.findById(claimId)).thenReturn(Optional.of(claim));
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));

        WorkflowTransitionRequest request = new WorkflowTransitionRequest();
        request.setTargetStatus(ClaimStatus.PAID);
        request.setDecisionReason("Attempting to pay a rejected claim");

        InvalidWorkflowTransitionException ex = assertThrows(InvalidWorkflowTransitionException.class, () -> {
            claimService.transitionWorkflow(claimId, adminUser, request, "127.0.0.1");
        });

        assertTrue(ex.getMessage().contains("Terminal state reached (REJECTED)"));

        verify(auditChainService, times(1)).logRefusedAction(
                eq(claimId),
                eq(insurerId),
                eq(adminUserId),
                eq("admin@test.com"),
                eq("INSURER_ADMIN"),
                eq(AuditAction.PAYMENT_ISSUED),
                contains("Terminal state reached (REJECTED)"),
                eq("127.0.0.1")
        );
    }
}
