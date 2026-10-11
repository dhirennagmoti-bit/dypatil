package com.insurechain.service;

import com.insurechain.dto.InsurerDto;
import com.insurechain.dto.InsurerMetricsDto;
import com.insurechain.dto.UserDto;
import com.insurechain.exception.ResourceNotFoundException;
import com.insurechain.model.Claim;
import com.insurechain.model.ClaimStatus;
import com.insurechain.model.Insurer;
import com.insurechain.repository.ClaimRepository;
import com.insurechain.repository.InsurerRepository;
import com.insurechain.repository.PolicyRepository;
import com.insurechain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InsurerService {

    @Autowired
    private InsurerRepository insurerRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private UserRepository userRepository;

    public List<InsurerDto> getAllInsurers() {
        return insurerRepository.findAll().stream()
                .map(InsurerDto::fromEntity)
                .collect(Collectors.toList());
    }

    public InsurerDto getInsurerById(UUID id) {
        Insurer insurer = insurerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurer not found with ID: " + id));
        return InsurerDto.fromEntity(insurer);
    }

    public List<UserDto> getInsurerUsers(UUID insurerId) {
        String insurerName = insurerRepository.findById(insurerId).map(Insurer::getName).orElse("Insurer");
        return userRepository.findByInsurerId(insurerId).stream()
                .map(u -> UserDto.fromEntity(u, insurerName))
                .collect(Collectors.toList());
    }

    public InsurerMetricsDto getInsurerMetrics(UUID insurerId) {
        Insurer insurer = insurerRepository.findById(insurerId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurer not found with ID: " + insurerId));

        List<Claim> insurerClaims = claimRepository.findByInsurerIdOrderByCreatedAtDesc(insurerId);

        InsurerMetricsDto metrics = new InsurerMetricsDto();
        metrics.setInsurerId(insurerId);
        metrics.setInsurerName(insurer.getName());
        metrics.setTotalPolicies(policyRepository.findByInsurerId(insurerId).size());
        metrics.setTotalClaims(insurerClaims.size());

        long submitted = 0;
        long underReview = 0;
        long approved = 0;
        long rejected = 0;
        long paid = 0;
        BigDecimal totalRequested = BigDecimal.ZERO;
        BigDecimal totalApproved = BigDecimal.ZERO;

        for (Claim c : insurerClaims) {
            if (c.getStatus() == ClaimStatus.SUBMITTED) submitted++;
            else if (c.getStatus() == ClaimStatus.UNDER_REVIEW) underReview++;
            else if (c.getStatus() == ClaimStatus.APPROVED) approved++;
            else if (c.getStatus() == ClaimStatus.REJECTED) rejected++;
            else if (c.getStatus() == ClaimStatus.PAID) paid++;

            if (c.getRequestedAmount() != null) {
                totalRequested = totalRequested.add(c.getRequestedAmount());
            }
            if (c.getApprovedAmount() != null) {
                totalApproved = totalApproved.add(c.getApprovedAmount());
            }
        }

        metrics.setSubmittedClaims(submitted);
        metrics.setUnderReviewClaims(underReview);
        metrics.setApprovedClaims(approved);
        metrics.setRejectedClaims(rejected);
        metrics.setPaidClaims(paid);
        metrics.setTotalRequestedAmount(totalRequested);
        metrics.setTotalApprovedAmount(totalApproved);

        return metrics;
    }
}
