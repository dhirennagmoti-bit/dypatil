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

    @Transactional
    public PolicyDto createPolicy(UUID insurerId, CreatePolicyRequest request) {
        Policy policy = new Policy();
        policy.setInsurerId(insurerId);
        policy.setPolicyNumber(request.getPolicyNumber());
        policy.setTitle(request.getTitle());
        policy.setDescription(request.getDescription());
        policy.setCategory(request.getCategory());
        policy.setCoverageLimit(request.getCoverageLimit());
        policy.setDeductible(request.getDeductible());
        policy.setFilingWindowDays(request.getFilingWindowDays());
        policy.setExcludedCategories(request.getExcludedCategories());
        policy.setPolicyRulesDescription(request.getPolicyRulesDescription());
        policy.setEffectiveDate(request.getEffectiveDate());
        policy.setExpiryDate(request.getExpiryDate());
        policy.setActive(true);

        Policy saved = policyRepository.save(policy);
        String insurerName = insurerRepository.findById(insurerId).map(Insurer::getName).orElse("Insurer");
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
