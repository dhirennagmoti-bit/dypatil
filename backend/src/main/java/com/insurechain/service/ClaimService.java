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

        // 1. Check for duplicates
        DuplicateDetectionService.DuplicateCheckOutcome duplicateCheck = duplicateDetectionService.checkDuplicate(
                null,
                policy.getId(),
                request.getIncidentDate(),
                request.getCategory(),
                request.getRequestedAmount()
        );

        String fingerprint = duplicateDetectionService.computeFingerprint(
                policy.getId(),
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

        // 2. State Machine Rule Validation
        ClaimStatus currentStatus = claim.getStatus();
        ClaimStatus targetStatus = request.getTargetStatus();

        validateStateTransition(currentStatus, targetStatus, role);

        // 3. Apply Transition
        ClaimStatus previousStatus = currentStatus;
        claim.setStatus(targetStatus);

        AuditAction auditAction = AuditAction.STATUS_CHANGE;

        if (targetStatus == ClaimStatus.APPROVED) {
            BigDecimal approvedAmount = request.getApprovedAmount();
            if (approvedAmount == null || approvedAmount.compareTo(BigDecimal.ZERO) <= 0) {
                // If not provided in request, default to suggested payout from deterministic evaluation
                Optional<EligibilityEvaluation> evalOpt = eligibilityEvaluationRepository.findByClaimId(claimId);
                approvedAmount = evalOpt.map(EligibilityEvaluation::getSuggestedPayoutAmount).orElse(claim.getRequestedAmount());
            }
            claim.setApprovedAmount(approvedAmount);
            auditAction = AuditAction.CLAIM_APPROVED;
        } else if (targetStatus == ClaimStatus.REJECTED) {
            claim.setApprovedAmount(BigDecimal.ZERO);
            auditAction = AuditAction.CLAIM_REJECTED;
        } else if (targetStatus == ClaimStatus.PAID) {
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

    private void validateStateTransition(ClaimStatus current, ClaimStatus target, RoleType role) {
        if (current == target) {
            throw new InvalidWorkflowTransitionException("Claim is already in status: " + current);
        }

        switch (current) {
            case SUBMITTED -> {
                if (target == ClaimStatus.UNDER_REVIEW) {
                    if (role != RoleType.CLAIMS_OFFICER && role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only claims officers, supervisors, or admins may transition a claim to UNDER_REVIEW.");
                    }
                } else if (target == ClaimStatus.REJECTED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.CLAIMS_OFFICER && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only authorized personnel may reject a submitted claim.");
                    }
                } else {
                    throw new InvalidWorkflowTransitionException("Invalid transition from SUBMITTED to " + target + ". Allowed: UNDER_REVIEW or REJECTED.");
                }
            }
            case UNDER_REVIEW -> {
                if (target == ClaimStatus.APPROVED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN && role != RoleType.CLAIMS_OFFICER) {
                        throw new InvalidWorkflowTransitionException("Only supervisors or authorized claims officers can approve claims.");
                    }
                } else if (target == ClaimStatus.REJECTED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN && role != RoleType.PLATFORM_ADMIN && role != RoleType.CLAIMS_OFFICER) {
                        throw new InvalidWorkflowTransitionException("Only supervisors or authorized claims officers can reject claims.");
                    }
                } else if (target == ClaimStatus.ADDITIONAL_INFO_REQUIRED) {
                    if (role != RoleType.CLAIMS_OFFICER && role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN) {
                        throw new InvalidWorkflowTransitionException("Only claims officers or supervisors can request additional information.");
                    }
                } else {
                    throw new InvalidWorkflowTransitionException("Invalid transition from UNDER_REVIEW to " + target + ". Allowed: APPROVED, REJECTED, ADDITIONAL_INFO_REQUIRED.");
                }
            }
            case ADDITIONAL_INFO_REQUIRED -> {
                if (target == ClaimStatus.UNDER_REVIEW) {
                    // Allowed for policyholder or officer to return to review
                } else if (target == ClaimStatus.REJECTED) {
                    if (role != RoleType.SUPERVISOR && role != RoleType.INSURER_ADMIN) {
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
            case REJECTED, PAID -> {
                throw new InvalidWorkflowTransitionException("Final state reached (" + current + "). No further transitions permitted.");
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

        Map<UUID, String> insurerNames = insurerRepository.findAll().stream().collect(Collectors.toMap(Insurer::getId, Insurer::getName, (a, b) -> a));
        Map<UUID, String> userNames = userRepository.findAll().stream().collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));
        Map<UUID, Policy> policies = policyRepository.findAll().stream().collect(Collectors.toMap(Policy::getId, p -> p, (a, b) -> a));

        return claims.stream().map(c -> {
            Policy p = policies.get(c.getPolicyId());
            return ClaimDto.fromEntity(
                    c,
                    p != null ? p.getTitle() : "Policy",
                    p != null ? p.getPolicyNumber() : "",
                    userNames.getOrDefault(c.getPolicyholderId(), "Policyholder"),
                    insurerNames.getOrDefault(c.getInsurerId(), "Insurer")
            );
        }).collect(Collectors.toList());
    }

    private ClaimDetailResponse buildClaimDetail(Claim claim, Policy policy, String insurerName, String policyholderName,
                                                List<ClaimEvidence> evidences, EligibilityResultDto eligibility,
                                                AiExtractionDto aiExtraction) {
        ClaimDto claimDto = ClaimDto.fromEntity(claim, policy.getTitle(), policy.getPolicyNumber(), policyholderName, insurerName);
        PolicyDto policyDto = PolicyDto.fromEntity(policy, insurerName);
        List<ClaimEvidenceDto> evidenceDtos = evidences.stream().map(ClaimEvidenceDto::fromEntity).collect(Collectors.toList());

        List<WorkflowAuditLog> logs = auditLogRepository.findByClaimIdOrderBySequenceNumberAsc(claim.getId());
        List<AuditLogDto> logDtos = logs.stream().map(l -> AuditLogDto.fromEntity(l, insurerName)).collect(Collectors.toList());

        return new ClaimDetailResponse(claimDto, policyDto, evidenceDtos, eligibility, aiExtraction, logDtos);
    }
}
