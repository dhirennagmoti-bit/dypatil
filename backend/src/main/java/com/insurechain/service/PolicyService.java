package com.insurechain.service;

import com.insurechain.dto.CreatePolicyRequest;
import com.insurechain.dto.PolicyDto;
import com.insurechain.exception.ResourceNotFoundException;
import com.insurechain.model.Insurer;
import com.insurechain.model.Policy;
import com.insurechain.model.UserPolicy;
import com.insurechain.repository.InsurerRepository;
import com.insurechain.repository.PolicyRepository;
import com.insurechain.repository.UserPolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PolicyService {

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private InsurerRepository insurerRepository;

    @Autowired
    private UserPolicyRepository userPolicyRepository;

    public List<PolicyDto> getAllActivePolicies() {
        Map<UUID, String> insurerNames = getInsurerNameMap();
        return policyRepository.findByActiveTrue().stream()
                .map(p -> PolicyDto.fromEntity(p, insurerNames.getOrDefault(p.getInsurerId(), "Unknown Insurer")))
                .collect(Collectors.toList());
    }

    public List<PolicyDto> getPoliciesByInsurer(UUID insurerId) {
        String insurerName = insurerRepository.findById(insurerId)
                .map(Insurer::getName)
                .orElse("Unknown Insurer");
        return policyRepository.findByInsurerId(insurerId).stream()
                .map(p -> PolicyDto.fromEntity(p, insurerName))
                .collect(Collectors.toList());
    }

    public PolicyDto getPolicyById(UUID policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));
        String insurerName = insurerRepository.findById(policy.getInsurerId())
                .map(Insurer::getName)
                .orElse("Unknown Insurer");
        return PolicyDto.fromEntity(policy, insurerName);
    }

    public List<PolicyDto> getUserEnrolledPolicies(UUID userId) {
        List<UserPolicy> enrollments = userPolicyRepository.findByUserId(userId);
        if (enrollments.isEmpty()) {
            return Collections.emptyList();
        }
        Map<UUID, String> insurerNames = getInsurerNameMap();
        List<PolicyDto> results = new ArrayList<>();
        for (UserPolicy up : enrollments) {
            policyRepository.findById(up.getPolicyId()).ifPresent(p ->
                results.add(PolicyDto.fromEntity(p, insurerNames.getOrDefault(p.getInsurerId(), "Unknown Insurer")))
            );
        }
        return results;
    }

    @Autowired
    private AuditChainService auditChainService;

    private void validatePolicyParameters(CreatePolicyRequest request) {
        if (request.getCoverageLimit() == null || request.getCoverageLimit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Coverage limit must be greater than zero.");
        }
        if (request.getDeductible() == null || request.getDeductible().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Deductible must be non-negative.");
        }
        if (request.getDeductible().compareTo(request.getCoverageLimit()) >= 0) {
            throw new IllegalArgumentException("Deductible cannot be equal to or exceed total coverage limit.");
        }
        if (request.getFilingWindowDays() <= 0 || request.getFilingWindowDays() > 365) {
            throw new IllegalArgumentException("Filing window must be between 1 and 365 days.");
        }
        if (request.getEffectiveDate() == null || request.getExpiryDate() == null) {
            throw new IllegalArgumentException("Effective date and expiry date are required.");
        }
        if (request.getEffectiveDate().isAfter(request.getExpiryDate())) {
            throw new IllegalArgumentException("Policy effective date cannot be after expiry date.");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Policy title cannot be empty.");
        }
        if (request.getPolicyNumber() == null || request.getPolicyNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Policy number cannot be empty.");
        }
    }

    @Transactional
    public PolicyDto createPolicy(UUID insurerId, CreatePolicyRequest request) {
        return createPolicy(insurerId, request, null, "127.0.0.1");
    }

    @Transactional
    public PolicyDto createPolicy(UUID insurerId, CreatePolicyRequest request, com.insurechain.security.UserDetailsImpl currentUser, String clientIp) {
        validatePolicyParameters(request);

        Policy policy = new Policy();
        policy.setInsurerId(insurerId);
        policy.setPolicyNumber(request.getPolicyNumber().trim());
        policy.setTitle(request.getTitle().trim());
        policy.setDescription(request.getDescription());
        policy.setCategory(request.getCategory().trim().toUpperCase());
        policy.setCoverageLimit(request.getCoverageLimit());
        policy.setDeductible(request.getDeductible());
        policy.setFilingWindowDays(request.getFilingWindowDays());
        policy.setExcludedCategories(request.getExcludedCategories() != null ? request.getExcludedCategories() : "[]");
        policy.setPolicyRulesDescription(request.getPolicyRulesDescription());
        policy.setEffectiveDate(request.getEffectiveDate());
        policy.setExpiryDate(request.getExpiryDate());
        policy.setActive(true);

        Policy saved = policyRepository.save(policy);
        String insurerName = insurerRepository.findById(insurerId).map(Insurer::getName).orElse("Insurer");

        if (currentUser != null) {
            auditChainService.logWorkflowEvent(
                    null,
                    insurerId,
                    currentUser.getId(),
                    currentUser.getUsername(),
                    currentUser.getRole().name(),
                    com.insurechain.model.AuditAction.POLICY_CREATED,
                    null,
                    saved.getPolicyNumber(),
                    String.format("Created policy '%s' (%s) with coverage ₹%s, deductible ₹%s, filing window %dd",
                            saved.getTitle(), saved.getPolicyNumber(), saved.getCoverageLimit(), saved.getDeductible(), saved.getFilingWindowDays()),
                    clientIp
            );
        }

        return PolicyDto.fromEntity(saved, insurerName);
    }

    @Transactional
    public PolicyDto updatePolicy(UUID policyId, CreatePolicyRequest request, com.insurechain.security.UserDetailsImpl currentUser, String clientIp) {
        validatePolicyParameters(request);

        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));

        if (currentUser.getRole() != com.insurechain.model.RoleType.PLATFORM_ADMIN &&
                (currentUser.getInsurerId() == null || !currentUser.getInsurerId().equals(policy.getInsurerId()))) {
            throw new com.insurechain.exception.UnauthorizedTenantAccessException("Cannot edit policy belonging to another insurer.");
        }

        String oldConfig = String.format("Limit: ₹%s, Deductible: ₹%s, Window: %dd",
                policy.getCoverageLimit(), policy.getDeductible(), policy.getFilingWindowDays());

        policy.setTitle(request.getTitle().trim());
        policy.setDescription(request.getDescription());
        policy.setCategory(request.getCategory().trim().toUpperCase());
        policy.setCoverageLimit(request.getCoverageLimit());
        policy.setDeductible(request.getDeductible());
        policy.setFilingWindowDays(request.getFilingWindowDays());
        policy.setExcludedCategories(request.getExcludedCategories() != null ? request.getExcludedCategories() : "[]");
        policy.setPolicyRulesDescription(request.getPolicyRulesDescription());
        policy.setEffectiveDate(request.getEffectiveDate());
        policy.setExpiryDate(request.getExpiryDate());

        Policy saved = policyRepository.save(policy);
        String insurerName = insurerRepository.findById(policy.getInsurerId()).map(Insurer::getName).orElse("Insurer");

        String newConfig = String.format("Limit: ₹%s, Deductible: ₹%s, Window: %dd",
                saved.getCoverageLimit(), saved.getDeductible(), saved.getFilingWindowDays());

        auditChainService.logWorkflowEvent(
                null,
                policy.getInsurerId(),
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getRole().name(),
                com.insurechain.model.AuditAction.POLICY_UPDATED,
                oldConfig,
                newConfig,
                String.format("Updated policy '%s' (%s) rules by %s (%s)",
                        saved.getTitle(), saved.getPolicyNumber(), currentUser.getFullName(), currentUser.getRole()),
                clientIp
        );

        return PolicyDto.fromEntity(saved, insurerName);
    }

    @Transactional
    public void enrollUser(UUID userId, UUID policyId) {
        if (!userPolicyRepository.existsByUserIdAndPolicyId(userId, policyId)) {
            userPolicyRepository.save(new UserPolicy(userId, policyId));
        }
    }

    private Map<UUID, String> getInsurerNameMap() {
        return insurerRepository.findAll().stream()
                .collect(Collectors.toMap(Insurer::getId, Insurer::getName, (a, b) -> a));
    }
}
