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

    @Autowired
    private com.insurechain.repository.WorkflowAuditLogRepository auditLogRepository;

    @Autowired
    private AuditChainService auditChainService;

    public InsurerMetricsDto getInsurerMetrics(UUID insurerId) {
        Insurer insurer = insurerRepository.findById(insurerId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurer not found with ID: " + insurerId));

        List<Claim> insurerClaims = claimRepository.findByInsurerIdOrderByCreatedAtDesc(insurerId);
        BigDecimal threshold = insurer.getHighValueThreshold() != null ? insurer.getHighValueThreshold() : new BigDecimal("500000.00");

        InsurerMetricsDto metrics = new InsurerMetricsDto();
        metrics.setInsurerId(insurerId);
        metrics.setInsurerName(insurer.getName());
        metrics.setTotalPolicies(policyRepository.findByInsurerId(insurerId).size());
        metrics.setTotalClaims(insurerClaims.size());
        metrics.setHighValueThreshold(threshold);

        long submitted = 0;
        long underReview = 0;
        long approved = 0;
        long rejected = 0;
        long paid = 0;
        long pendingOfficer = 0;
        long pendingSupervisor = 0;
        long highValuePending = 0;
        long approvedAwaitingAdmin = 0;
        BigDecimal totalRequested = BigDecimal.ZERO;
        BigDecimal totalApproved = BigDecimal.ZERO;

        for (Claim c : insurerClaims) {
            BigDecimal reqAmt = c.getRequestedAmount() != null ? c.getRequestedAmount() : BigDecimal.ZERO;
            boolean isHigh = reqAmt.compareTo(threshold) >= 0;

            if (c.getStatus() == ClaimStatus.SUBMITTED) {
                submitted++;
                pendingOfficer++;
                if (isHigh) highValuePending++;
            } else if (c.getStatus() == ClaimStatus.UNDER_REVIEW) {
                underReview++;
                if (c.getOfficerRecommendation() == null) {
                    pendingOfficer++;
                } else {
                    pendingSupervisor++;
                }
                if (isHigh) highValuePending++;
            } else if (c.getStatus() == ClaimStatus.PENDING_SUPERVISOR_REVIEW) {
                underReview++;
                pendingSupervisor++;
                if (isHigh) highValuePending++;
            } else if (c.getStatus() == ClaimStatus.APPROVED) {
                approved++;
                if (!"SETTLED".equalsIgnoreCase(c.getAdminProcessingStatus())) {
                    approvedAwaitingAdmin++;
                }
            } else if (c.getStatus() == ClaimStatus.REJECTED) {
                rejected++;
            } else if (c.getStatus() == ClaimStatus.PAID) {
                paid++;
            }

            totalRequested = totalRequested.add(reqAmt);
            if (c.getApprovedAmount() != null) {
                totalApproved = totalApproved.add(c.getApprovedAmount());
            }
        }

        long refusedCount = auditLogRepository.findByInsurerIdOrderBySequenceNumberDesc(insurerId)
                .stream().filter(l -> l.getAction() == com.insurechain.model.AuditAction.ACTION_REFUSED).count();

        metrics.setSubmittedClaims(submitted);
        metrics.setUnderReviewClaims(underReview);
        metrics.setApprovedClaims(approved);
        metrics.setRejectedClaims(rejected);
        metrics.setPaidClaims(paid);
        metrics.setPendingOfficerReviews(pendingOfficer);
        metrics.setPendingSupervisorDecisions(pendingSupervisor);
        metrics.setHighValuePendingClaims(highValuePending);
        metrics.setApprovedAwaitingAdmin(approvedAwaitingAdmin);
        metrics.setRefusedViolationsCount(refusedCount);
        metrics.setTotalRequestedAmount(totalRequested);
        metrics.setTotalApprovedAmount(totalApproved);

        return metrics;
    }

    @org.springframework.transaction.annotation.Transactional
    public InsurerDto updateHighValueThreshold(UUID insurerId, BigDecimal newThreshold, com.insurechain.security.UserDetailsImpl currentUser, String clientIp) {
        if (newThreshold == null || newThreshold.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("High-value threshold must be a non-negative amount.");
        }
        if (newThreshold.compareTo(new BigDecimal("100000000.00")) > 0) {
            throw new IllegalArgumentException("High-value threshold exceeds maximum allowable ceiling of ₹10,00,00,000.");
        }

        Insurer insurer = insurerRepository.findById(insurerId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurer not found with ID: " + insurerId));

        if (currentUser.getRole() != com.insurechain.model.RoleType.PLATFORM_ADMIN &&
                (currentUser.getInsurerId() == null || !currentUser.getInsurerId().equals(insurerId))) {
            throw new com.insurechain.exception.UnauthorizedTenantAccessException("Cannot modify configuration of another insurer.");
        }

        BigDecimal oldThreshold = insurer.getHighValueThreshold() != null ? insurer.getHighValueThreshold() : new BigDecimal("500000.00");
        insurer.setHighValueThreshold(newThreshold);
        Insurer saved = insurerRepository.save(insurer);

        // Audit log threshold change
        auditChainService.logWorkflowEvent(
                null,
                insurer.getId(),
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getRole().name(),
                com.insurechain.model.AuditAction.THRESHOLD_UPDATED,
                String.format("₹%s", oldThreshold),
                String.format("₹%s", newThreshold),
                String.format("Insurer high-value threshold updated from ₹%s to ₹%s by %s (%s)",
                        oldThreshold, newThreshold, currentUser.getFullName(), currentUser.getRole()),
                clientIp
        );

        return InsurerDto.fromEntity(saved);
    }

    @org.springframework.transaction.annotation.Transactional
    public UserDto updateUserRole(UUID insurerId, UUID targetUserId, com.insurechain.model.RoleType newRole,
                                  com.insurechain.security.UserDetailsImpl currentUser, String clientIp) {
        if (newRole == null) {
            throw new IllegalArgumentException("Target role cannot be null.");
        }

        Insurer insurer = insurerRepository.findById(insurerId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurer not found with ID: " + insurerId));

        if (currentUser.getRole() != com.insurechain.model.RoleType.PLATFORM_ADMIN) {
            if (currentUser.getInsurerId() == null || !currentUser.getInsurerId().equals(insurerId)) {
                throw new com.insurechain.exception.UnauthorizedTenantAccessException("Cannot manage staff of another insurance company.");
            }
            if (newRole == com.insurechain.model.RoleType.PLATFORM_ADMIN || newRole == com.insurechain.model.RoleType.AUDITOR) {
                throw new IllegalArgumentException("Insurer Admin cannot assign PLATFORM_ADMIN or AUDITOR roles.");
            }
        }

        com.insurechain.model.User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + targetUserId));

        if (targetUser.getInsurerId() != null && !targetUser.getInsurerId().equals(insurerId) &&
                currentUser.getRole() != com.insurechain.model.RoleType.PLATFORM_ADMIN) {
            throw new com.insurechain.exception.UnauthorizedTenantAccessException("User belongs to a different insurer.");
        }

        com.insurechain.model.RoleType oldRole = targetUser.getRole();
        targetUser.setRole(newRole);
        if (newRole != com.insurechain.model.RoleType.POLICYHOLDER && targetUser.getInsurerId() == null) {
            targetUser.setInsurerId(insurerId);
        }
        com.insurechain.model.User savedUser = userRepository.save(targetUser);

        // Audit role assignment
        auditChainService.logWorkflowEvent(
                null,
                insurer.getId(),
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getRole().name(),
                com.insurechain.model.AuditAction.ROLE_ASSIGNED,
                oldRole != null ? oldRole.name() : "NONE",
                newRole.name(),
                String.format("Role for %s (%s) changed from %s to %s by %s (%s)",
                        targetUser.getFullName(), targetUser.getEmail(), oldRole, newRole, currentUser.getFullName(), currentUser.getRole()),
                clientIp
        );

        return UserDto.fromEntity(savedUser, insurer.getName());
    }
}
