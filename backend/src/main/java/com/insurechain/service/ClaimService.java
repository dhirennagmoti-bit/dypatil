package com.insurechain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurechain.dto.*;
import com.insurechain.exception.InvalidWorkflowTransitionException;
import com.insurechain.exception.ResourceNotFoundException;
import com.insurechain.exception.UnauthorizedTenantAccessException;
import com.insurechain.model.*;
import com.insurechain.repository.*;
import com.insurechain.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private InsurerRepository insurerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClaimEvidenceRepository claimEvidenceRepository;

    @Autowired
    private EligibilityEvaluationRepository eligibilityEvaluationRepository;

    @Autowired
    private AiExtractionResultRepository aiExtractionResultRepository;

    @Autowired
    private EligibilityEngine eligibilityEngine;

    @Autowired
    private DuplicateDetectionService duplicateDetectionService;

    @Autowired
    private AuditChainService auditChainService;

    @Autowired
    private AiReviewService aiReviewService;

    @Autowired
    private WorkflowAuditLogRepository auditLogRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public ClaimDetailResponse createClaim(UserDetailsImpl currentUser, CreateClaimRequest request, String ipAddress) {
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + request.getPolicyId()));

        Insurer insurer = insurerRepository.findById(policy.getInsurerId())
                .orElseThrow(() -> new ResourceNotFoundException("Insurer not found with ID: " + policy.getInsurerId()));

        // 1. Check for duplicates (using stable incident identifier and SHA-256 fingerprint)
        DuplicateDetectionService.DuplicateCheckOutcome duplicateCheck = duplicateDetectionService.checkDuplicate(
                null,
                policy.getId(),
                request.getIncidentId(),
                request.getIncidentDate(),
                request.getCategory(),
                request.getRequestedAmount()
        );

        String fingerprint = duplicateDetectionService.computeFingerprint(
                policy.getId(),
                request.getIncidentId(),
                request.getIncidentDate(),
                request.getCategory(),
                request.getRequestedAmount()
        );

        // 2. Generate unique human-readable claim reference
        String prefix = insurer.getCode() != null ? insurer.getCode() : "CLM";
        String claimRef = String.format("%s-%d-%04d", prefix, LocalDate.now().getYear(), random.nextInt(9000) + 1000);

        Claim claim = new Claim();
        claim.setClaimReference(claimRef);
        claim.setPolicyId(policy.getId());
        claim.setPolicyholderId(currentUser.getId());
        claim.setInsurerId(insurer.getId());
        claim.setCategory(request.getCategory());
        claim.setRequestedAmount(request.getRequestedAmount());
        claim.setIncidentDate(request.getIncidentDate());
        claim.setFilingDate(LocalDate.now());
        claim.setNarrative(request.getNarrative());
        claim.setIncidentLocation(request.getIncidentLocation());
        claim.setStatus(ClaimStatus.SUBMITTED);
        claim.setIncidentId(request.getIncidentId());
        claim.setIncidentFingerprint(fingerprint);
        claim.setDuplicateSuspected(duplicateCheck.isDuplicate());
        claim.setDuplicateReason(duplicateCheck.getReason());

        Claim savedClaim = claimRepository.save(claim);

        // 3. Save evidence items
        List<ClaimEvidence> savedEvidences = new ArrayList<>();
        if (request.getEvidence() != null) {
            for (CreateClaimRequest.EvidenceItem item : request.getEvidence()) {
                ClaimEvidence ev = new ClaimEvidence(
                        savedClaim.getId(),
                        item.getFileName(),
                        item.getFileType(),
                        item.getFileUrl(),
                        item.getFileSizeBytes(),
                        item.getDescription()
                );
                savedEvidences.add(claimEvidenceRepository.save(ev));
            }
        }

        // 4. Run Deterministic Eligibility Engine
        EligibilityResultDto eligibilityResult = eligibilityEngine.evaluateClaim(savedClaim, policy);
        String rulesJson = "[]";
        try {
            rulesJson = objectMapper.writeValueAsString(eligibilityResult.getRules());
        } catch (Exception ignored) {}

        EligibilityEvaluation evaluation = new EligibilityEvaluation(
                savedClaim.getId(),
                eligibilityResult.isEligible(),
                eligibilityResult.getSuggestedPayoutAmount(),
                rulesJson,
                eligibilityResult.getPrimaryExplanation()
        );
        eligibilityEvaluationRepository.save(evaluation);

        // 5. Run AI Narrative Extraction Advisory
        AiExtractionDto aiExtraction = aiReviewService.analyzeAndSave(savedClaim);

        // 6. Cryptographic Audit Chain Log
        auditChainService.logWorkflowEvent(
                savedClaim.getId(),
                insurer.getId(),
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getRole().name(),
                AuditAction.CLAIM_SUBMITTED,
                null,
                ClaimStatus.SUBMITTED.name(),
                "Initial claim submission by policyholder. " + (duplicateCheck.isDuplicate() ? "[Duplicate flag generated]" : ""),
                ipAddress
        );

        return buildClaimDetail(savedClaim, policy, insurer.getName(), currentUser.getFullName(), savedEvidences, eligibilityResult, aiExtraction);
    }

    @Transactional
    public ClaimDetailResponse transitionWorkflow(UUID claimId, UserDetailsImpl currentUser,
                                                  WorkflowTransitionRequest request, String ipAddress) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));

        Policy policy = policyRepository.findById(claim.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found for claim: " + claimId));

        String insurerName = insurerRepository.findById(claim.getInsurerId())
                .map(Insurer::getName)
                .orElse("Insurer");

        String policyholderName = userRepository.findById(claim.getPolicyholderId())
                .map(User::getFullName)
                .orElse("Policyholder");

        // 1. Multi-Insurer Tenancy Isolation Enforcement
        RoleType role = currentUser.getRole();
        if (role == RoleType.CLAIMS_OFFICER || role == RoleType.SUPERVISOR || role == RoleType.INSURER_ADMIN) {
            if (currentUser.getInsurerId() == null || !currentUser.getInsurerId().equals(claim.getInsurerId())) {
                String refusalMsg = String.format("User %s (%s) attempted unauthorized transition on claim %s belonging to insurer %s",
                        currentUser.getUsername(), role, claim.getClaimReference(), claim.getInsurerId());
                auditChainService.logRefusedAction(
                        claim.getId(),
                        claim.getInsurerId(),
                        currentUser.getId(),
                        currentUser.getUsername(),
                        role.name(),
                        AuditAction.STATUS_CHANGE,
                        refusalMsg,
                        ipAddress
                );
                throw new UnauthorizedTenantAccessException("Access denied: You are not authorized to manage claims outside your assigned insurance company.");
            }
        }

        // 2. State Machine Rule Validation & Duplicate Payout Blocker
        ClaimStatus currentStatus = claim.getStatus();
        ClaimStatus targetStatus = request.getTargetStatus();

        try {
            validateStateTransition(claim, currentStatus, targetStatus, role, request);
        } catch (InvalidWorkflowTransitionException ex) {
            AuditAction attemptedAction = targetStatus == ClaimStatus.APPROVED ? AuditAction.CLAIM_APPROVED
                    : targetStatus == ClaimStatus.PAID ? AuditAction.PAYMENT_ISSUED
                    : targetStatus == ClaimStatus.REJECTED ? AuditAction.CLAIM_REJECTED
                    : targetStatus == ClaimStatus.PENDING_SUPERVISOR_REVIEW ? AuditAction.OFFICER_RECOMMENDATION_SUBMITTED
                    : AuditAction.STATUS_CHANGE;

            auditChainService.logRefusedAction(
                    claim.getId(),
                    claim.getInsurerId(),
                    currentUser.getId(),
                    currentUser.getUsername(),
                    role.name(),
                    attemptedAction,
                    ex.getMessage(),
                    ipAddress
            );
            throw ex;
        }

        // 3. Apply Transition and Record Role Responsibilities
        ClaimStatus previousStatus = currentStatus;
        claim.setStatus(targetStatus);

        AuditAction auditAction = AuditAction.STATUS_CHANGE;

        if (targetStatus == ClaimStatus.PENDING_SUPERVISOR_REVIEW) {
            // Claims Officer recommendation recorded
            claim.setOfficerRecommendation(request.getOfficerRecommendation() != null ? request.getOfficerRecommendation().toUpperCase() : "APPROVE");
            claim.setOfficerRecommendationJustification(request.getDecisionReason());
            claim.setOfficerRecommendedAt(Instant.now());
            claim.setOfficerId(currentUser.getId());
            auditAction = AuditAction.OFFICER_RECOMMENDATION_SUBMITTED;
        } else if (targetStatus == ClaimStatus.APPROVED) {
            // Supervisor Approval
            BigDecimal approvedAmount = request.getApprovedAmount();
            if (approvedAmount == null || approvedAmount.compareTo(BigDecimal.ZERO) <= 0) {
                Optional<EligibilityEvaluation> evalOpt = eligibilityEvaluationRepository.findByClaimId(claimId);
                approvedAmount = evalOpt.map(EligibilityEvaluation::getSuggestedPayoutAmount).orElse(claim.getRequestedAmount());
            }
            claim.setApprovedAmount(approvedAmount);
            claim.setSupervisorDecision("APPROVED");
            claim.setSupervisorDecisionJustification(request.getDecisionReason());
            claim.setSupervisorDecidedAt(Instant.now());
            claim.setSupervisorId(currentUser.getId());
            claim.setAdminProcessingStatus("PENDING");
            auditAction = AuditAction.CLAIM_APPROVED;
        } else if (targetStatus == ClaimStatus.REJECTED) {
            // Rejection (Supervisor / Admin)
            claim.setApprovedAmount(BigDecimal.ZERO);
            claim.setSupervisorDecision("REJECTED");
            claim.setSupervisorDecisionJustification(request.getDecisionReason());
            claim.setSupervisorDecidedAt(Instant.now());
            claim.setSupervisorId(currentUser.getId());
            auditAction = AuditAction.CLAIM_REJECTED;
        } else if (targetStatus == ClaimStatus.PAID) {
            // Insurer Admin Settlement Execution
            if (request.getSettlementReference() != null && !request.getSettlementReference().isBlank()) {
                claim.setSettlementReference(request.getSettlementReference().trim());
            } else if (claim.getSettlementReference() == null) {
                claim.setSettlementReference("SETTLE-" + System.currentTimeMillis());
            }
            claim.setAdminProcessingStatus("SETTLED");
            claim.setAdminProcessedAt(Instant.now());
            claim.setAdminId(currentUser.getId());
            if (request.getNotes() != null) {
                claim.setAdminNotes(request.getNotes());
            }
            auditAction = AuditAction.PAYMENT_ISSUED;
        } else if (targetStatus == ClaimStatus.ADDITIONAL_INFO_REQUIRED) {
            auditAction = AuditAction.ADDITIONAL_INFO_REQUESTED;
        }

        Claim updatedClaim = claimRepository.save(claim);

        // 4. Cryptographic Hash-Chain Logging
        auditChainService.logWorkflowEvent(
                claim.getId(),
                claim.getInsurerId(),
                currentUser.getId(),
                currentUser.getUsername(),
                role.name(),
                auditAction,
                previousStatus.name(),
                targetStatus.name(),
                request.getDecisionReason(),
                ipAddress
        );

        return getClaimDetail(claimId, currentUser);
    }

    private void validateStateTransition(Claim claim, ClaimStatus current, ClaimStatus target, RoleType role, WorkflowTransitionRequest request) {
        if (current == target) {
            // Allow admin processing update while in APPROVED state
            if (current == ClaimStatus.APPROVED && (role == RoleType.INSURER_ADMIN || role == RoleType.PLATFORM_ADMIN)) {
                return;
            }
            throw new InvalidWorkflowTransitionException("Claim is already in status: " + current);
        }

        // Feature 2: Anti-Duplicate Progression Blocker
        if (target == ClaimStatus.APPROVED || target == ClaimStatus.PAID || target == ClaimStatus.PENDING_SUPERVISOR_REVIEW) {
            if (claim.isDuplicateSuspected() && (target == ClaimStatus.APPROVED || target == ClaimStatus.PAID)) {
                throw new InvalidWorkflowTransitionException(
                        String.format("DUPLICATE INCIDENT BLOCKED: Claim '%s' is flagged as a duplicate collision (%s). Prohibited from progressing to %s by IRDAI anti-double-dipping rules.",
                                claim.getClaimReference(),
                                claim.getDuplicateReason() != null ? claim.getDuplicateReason() : "Incident collision detected",
                                target));
            }

            if (claim.getIncidentId() != null && !claim.getIncidentId().trim().isEmpty()) {
                List<Claim> matchingClaims = claimRepository.findByPolicyIdAndIncidentIdAndIdNot(claim.getPolicyId(), claim.getIncidentId().trim(), claim.getId());
                for (Claim other : matchingClaims) {
                    if (other.getStatus() == ClaimStatus.PAID || other.getStatus() == ClaimStatus.APPROVED) {
                        throw new InvalidWorkflowTransitionException(
                                String.format("DUPLICATE INCIDENT BLOCKED: The same incident ('%s') under this policy has already been %s in claim '%s'. Duplicate payment is strictly prohibited.",
                                         claim.getIncidentId(), other.getStatus(), other.getClaimReference()));
                    }
                }
            }
        }

        // Hard Eligibility Failure Blocker: Approval is prohibited if any hard deterministic rule failed
        if (target == ClaimStatus.APPROVED) {
            Optional<EligibilityEvaluation> evalOpt = eligibilityEvaluationRepository.findByClaimId(claim.getId());
            if (evalOpt.isPresent() && !evalOpt.get().isEligible()) {
                throw new InvalidWorkflowTransitionException(
                        String.format("HARD ELIGIBILITY FAILURE: Cannot approve claim '%s'. Reason: %s. Supervisor cannot bypass hard eligibility rules.",
                                claim.getClaimReference(), evalOpt.get().getPrimaryExplanation()));
            }
        }

        switch (current) {
            case SUBMITTED -> {
                if (target == ClaimStatus.UNDER_REVIEW) {
                    if (role != RoleType.CLAIMS_OFFICER && role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only claims officers, supervisors, or admins may transition a claim to UNDER_REVIEW.");
                    }
                } else if (target == ClaimStatus.REJECTED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only supervisors or administrators may reject a submitted claim. Officer role lacks rejection authority.");
                    }
                } else {
                    throw new InvalidWorkflowTransitionException("Invalid transition from SUBMITTED to " + target + ". Direct jump to " + target + " is strictly prohibited. Allowed: UNDER_REVIEW or REJECTED.");
                }
            }
            case UNDER_REVIEW -> {
                if (target == ClaimStatus.PENDING_SUPERVISOR_REVIEW) {
                    // Claims Officer records recommendation to supervisor
                    if (role != RoleType.CLAIMS_OFFICER && role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only claims officers or supervisors may submit recommendations for supervisor decision.");
                    }
                    if (request.getOfficerRecommendation() == null || request.getOfficerRecommendation().trim().isEmpty()) {
                        throw new InvalidWorkflowTransitionException("Mandatory officer recommendation (APPROVE or REJECT) is required to escalate to supervisor.");
                    }
                } else if (target == ClaimStatus.APPROVED) {
                    // Claims officer CANNOT approve claims! Only SUPERVISOR, INSURER_ADMIN, PLATFORM_ADMIN
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("UNAUTHORIZED APPROVAL: Claims officers cannot approve claims. Claim approval requires SUPERVISOR or INSURER_ADMIN role.");
                    }
                } else if (target == ClaimStatus.REJECTED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("UNAUTHORIZED REJECTION: Claims officers cannot reject claims. Final rejection requires SUPERVISOR or INSURER_ADMIN role.");
                    }
                } else if (target == ClaimStatus.ADDITIONAL_INFO_REQUIRED) {
                    if (role != RoleType.CLAIMS_OFFICER && role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only claims officers or supervisors can request additional information.");
                    }
                } else {
                    throw new InvalidWorkflowTransitionException("Invalid transition from UNDER_REVIEW to " + target + ". Allowed: PENDING_SUPERVISOR_REVIEW, APPROVED, REJECTED, ADDITIONAL_INFO_REQUIRED.");
                }
            }
            case PENDING_SUPERVISOR_REVIEW -> {
                if (target == ClaimStatus.APPROVED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("UNAUTHORIZED APPROVAL: Only supervisors or admins may approve claims in supervisor queue. Claims officers are forbidden.");
                    }
                } else if (target == ClaimStatus.REJECTED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("UNAUTHORIZED REJECTION: Only supervisors or admins may make final rejection decisions.");
                    }
                } else if (target == ClaimStatus.ADDITIONAL_INFO_REQUIRED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only supervisors or admins may request additional information during supervisor review.");
                    }
                } else {
                    throw new InvalidWorkflowTransitionException("Invalid transition from PENDING_SUPERVISOR_REVIEW to " + target + ". Allowed: APPROVED, REJECTED, ADDITIONAL_INFO_REQUIRED.");
                }
            }
            case ADDITIONAL_INFO_REQUIRED -> {
                if (target == ClaimStatus.UNDER_REVIEW) {
                    // Allowed for policyholder or officer to return to review
                } else if (target == ClaimStatus.REJECTED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only supervisors may reject a claim pending additional info.");
                    }
                } else {
                    throw new InvalidWorkflowTransitionException("Invalid transition from ADDITIONAL_INFO_REQUIRED to " + target + ". Allowed: UNDER_REVIEW or REJECTED.");
                }
            }
            case APPROVED -> {
                if (target == ClaimStatus.PAID) {
                    if (role != RoleType.INSURER_ADMIN && role != RoleType.SUPERVISOR && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only insurer administrators or supervisors can mark claims as PAID.");
                    }
                } else {
                    throw new InvalidWorkflowTransitionException("Claims in APPROVED state can only transition to PAID.");
                }
            }
            case REJECTED -> {
                throw new InvalidWorkflowTransitionException("Terminal state reached (REJECTED). Admin cannot convert a rejected claim to approved or paid.");
            }
            case PAID -> {
                throw new InvalidWorkflowTransitionException("Final state reached (PAID). Claim has already been paid and settled. No further transitions permitted.");
            }
        }
    }

    @Transactional(readOnly = true)
    public ClaimDetailResponse getClaimDetail(UUID claimId, UserDetailsImpl currentUser) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));

        // Tenancy & authorization check
        RoleType role = currentUser.getRole();
        if (role == RoleType.POLICYHOLDER && !claim.getPolicyholderId().equals(currentUser.getId())) {
            throw new UnauthorizedTenantAccessException("Access denied: You cannot view claims filed by other policyholders.");
        }
        if ((role == RoleType.CLAIMS_OFFICER || role == RoleType.SUPERVISOR || role == RoleType.INSURER_ADMIN)
                && currentUser.getInsurerId() != null && !currentUser.getInsurerId().equals(claim.getInsurerId())) {
            throw new UnauthorizedTenantAccessException("Access denied: Claim belongs to a different insurer organization.");
        }

        Policy policy = policyRepository.findById(claim.getPolicyId()).orElse(null);
        String insurerName = insurerRepository.findById(claim.getInsurerId()).map(Insurer::getName).orElse("Insurer");
        String policyholderName = userRepository.findById(claim.getPolicyholderId()).map(User::getFullName).orElse("Policyholder");

        List<ClaimEvidence> evidences = claimEvidenceRepository.findByClaimId(claimId);
        Optional<EligibilityEvaluation> evalOpt = eligibilityEvaluationRepository.findByClaimId(claimId);
        Optional<AiExtractionResult> aiOpt = aiExtractionResultRepository.findByClaimId(claimId);
        List<WorkflowAuditLog> logs = auditLogRepository.findByClaimIdOrderBySequenceNumberAsc(claimId);

        EligibilityResultDto eligibilityDto = null;
        if (evalOpt.isPresent()) {
            EligibilityEvaluation eval = evalOpt.get();
            List<RuleCheckResult> ruleResults = new ArrayList<>();
            try {
                ruleResults = objectMapper.readValue(eval.getRuleResultsJson(), new com.fasterxml.jackson.core.type.TypeReference<List<RuleCheckResult>>() {});
            } catch (Exception ignored) {}
            eligibilityDto = new EligibilityResultDto(eval.isEligible(), eval.getSuggestedPayoutAmount(), eval.getPrimaryExplanation(), ruleResults);
        }

        AiExtractionDto aiDto = aiOpt.map(AiExtractionDto::fromEntity).orElse(null);

        List<AuditLogDto> logDtos = logs.stream()
                .map(l -> AuditLogDto.fromEntity(l, insurerName))
                .collect(Collectors.toList());

        ClaimDto claimDto = ClaimDto.fromEntity(claim, policy != null ? policy.getTitle() : "", policy != null ? policy.getPolicyNumber() : "", policyholderName, insurerName);
        Insurer ins = insurerRepository.findById(claim.getInsurerId()).orElse(null);
        BigDecimal threshold = ins != null && ins.getHighValueThreshold() != null ? ins.getHighValueThreshold() : new BigDecimal("500000.00");
        claimDto.setHighValueThreshold(threshold);
        claimDto.setHighValue(claim.getRequestedAmount() != null && claim.getRequestedAmount().compareTo(threshold) >= 0);
        if (policy != null) {
            claimDto.setCoverageLimit(policy.getCoverageLimit());
            claimDto.setDeductible(policy.getDeductible());
        }
        if (evalOpt.isPresent()) {
            claimDto.setSuggestedPayoutAmount(evalOpt.get().getSuggestedPayoutAmount());
            claimDto.setEligible(evalOpt.get().isEligible());
        }

        PolicyDto policyDto = policy != null ? PolicyDto.fromEntity(policy, insurerName) : null;
        List<ClaimEvidenceDto> evidenceDtos = evidences.stream().map(ClaimEvidenceDto::fromEntity).collect(Collectors.toList());

        return new ClaimDetailResponse(claimDto, policyDto, evidenceDtos, eligibilityDto, aiDto, logDtos);
    }

    @Transactional(readOnly = true)
    public List<ClaimDto> getClaimsForCurrentUser(UserDetailsImpl currentUser) {
        RoleType role = currentUser.getRole();
        List<Claim> claims;

        if (role == RoleType.POLICYHOLDER) {
            claims = claimRepository.findByPolicyholderIdOrderByCreatedAtDesc(currentUser.getId());
        } else if (role == RoleType.CLAIMS_OFFICER || role == RoleType.SUPERVISOR || role == RoleType.INSURER_ADMIN) {
            if (currentUser.getInsurerId() != null) {
                claims = claimRepository.findByInsurerIdOrderByCreatedAtDesc(currentUser.getInsurerId());
            } else {
                claims = Collections.emptyList();
            }
        } else {
            // AUDITOR, PLATFORM_ADMIN
            claims = claimRepository.findAll();
        }

        Map<UUID, Insurer> insurers = insurerRepository.findAll().stream().collect(Collectors.toMap(Insurer::getId, i -> i, (a, b) -> a));
        Map<UUID, User> users = userRepository.findAll().stream().collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));
        Map<UUID, Policy> policies = policyRepository.findAll().stream().collect(Collectors.toMap(Policy::getId, p -> p, (a, b) -> a));
        Map<UUID, EligibilityEvaluation> evaluations = eligibilityEvaluationRepository.findAll().stream().collect(Collectors.toMap(EligibilityEvaluation::getClaimId, e -> e, (a, b) -> a));

        return claims.stream().map(c -> {
            Policy p = policies.get(c.getPolicyId());
            Insurer ins = insurers.get(c.getInsurerId());
            User u = users.get(c.getPolicyholderId());
            EligibilityEvaluation eval = evaluations.get(c.getId());
            BigDecimal threshold = ins != null && ins.getHighValueThreshold() != null ? ins.getHighValueThreshold() : new BigDecimal("500000.00");
            boolean isHigh = c.getRequestedAmount() != null && c.getRequestedAmount().compareTo(threshold) >= 0;

            ClaimDto dto = ClaimDto.fromEntity(
                    c,
                    p != null ? p.getTitle() : "Policy",
                    p != null ? p.getPolicyNumber() : "",
                    u != null ? u.getFullName() : "Policyholder",
                    ins != null ? ins.getName() : "Insurer"
            );
            dto.setHighValue(isHigh);
            dto.setHighValueThreshold(threshold);
            if (p != null) {
                dto.setCoverageLimit(p.getCoverageLimit());
                dto.setDeductible(p.getDeductible());
            }
            if (eval != null) {
                dto.setSuggestedPayoutAmount(eval.getSuggestedPayoutAmount());
                dto.setEligible(eval.isEligible());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    private ClaimDetailResponse buildClaimDetail(Claim claim, Policy policy, String insurerName, String policyholderName,
                                                List<ClaimEvidence> evidences, EligibilityResultDto eligibility,
                                                AiExtractionDto aiExtraction) {
        ClaimDto claimDto = ClaimDto.fromEntity(claim, policy.getTitle(), policy.getPolicyNumber(), policyholderName, insurerName);
        Insurer ins = insurerRepository.findById(claim.getInsurerId()).orElse(null);
        BigDecimal threshold = ins != null && ins.getHighValueThreshold() != null ? ins.getHighValueThreshold() : new BigDecimal("500000.00");
        claimDto.setHighValueThreshold(threshold);
        claimDto.setHighValue(claim.getRequestedAmount() != null && claim.getRequestedAmount().compareTo(threshold) >= 0);
        claimDto.setCoverageLimit(policy.getCoverageLimit());
        claimDto.setDeductible(policy.getDeductible());
        if (eligibility != null) {
            claimDto.setSuggestedPayoutAmount(eligibility.getSuggestedPayoutAmount());
            claimDto.setEligible(eligibility.isEligible());
        }

        PolicyDto policyDto = PolicyDto.fromEntity(policy, insurerName);
        List<ClaimEvidenceDto> evidenceDtos = evidences.stream().map(ClaimEvidenceDto::fromEntity).collect(Collectors.toList());

        List<WorkflowAuditLog> logs = auditLogRepository.findByClaimIdOrderBySequenceNumberAsc(claim.getId());
        List<AuditLogDto> logDtos = logs.stream().map(l -> AuditLogDto.fromEntity(l, insurerName)).collect(Collectors.toList());

        return new ClaimDetailResponse(claimDto, policyDto, evidenceDtos, eligibility, aiExtraction, logDtos);
    }
}
