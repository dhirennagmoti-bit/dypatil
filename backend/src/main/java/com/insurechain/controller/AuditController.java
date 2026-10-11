package com.insurechain.controller;

import com.insurechain.dto.AuditLogDto;
import com.insurechain.dto.HashChainVerificationResult;
import com.insurechain.model.Insurer;
import com.insurechain.model.RoleType;
import com.insurechain.model.WorkflowAuditLog;
import com.insurechain.repository.InsurerRepository;
import com.insurechain.repository.WorkflowAuditLogRepository;
import com.insurechain.security.UserDetailsImpl;
import com.insurechain.service.AuditChainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private WorkflowAuditLogRepository auditLogRepository;

    @Autowired
    private AuditChainService auditChainService;

    @Autowired
    private InsurerRepository insurerRepository;

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('AUDITOR', 'PLATFORM_ADMIN', 'INSURER_ADMIN', 'SUPERVISOR', 'CLAIMS_OFFICER')")
    public ResponseEntity<List<AuditLogDto>> getAuditLogs(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @RequestParam(required = false) UUID claimId,
            @RequestParam(required = false) UUID insurerId) {

        List<WorkflowAuditLog> logs;

        // Tenancy constraint: Insurer admins/officers can only see their insurer's audit logs
        RoleType role = userPrincipal.getRole();
        if (role == RoleType.CLAIMS_OFFICER || role == RoleType.SUPERVISOR || role == RoleType.INSURER_ADMIN) {
            UUID scopedInsurerId = userPrincipal.getInsurerId();
            if (claimId != null) {
                logs = auditLogRepository.findByClaimIdOrderBySequenceNumberAsc(claimId);
                // filter by insurer
                logs = logs.stream()
                        .filter(l -> l.getInsurerId() == null || l.getInsurerId().equals(scopedInsurerId))
                        .collect(Collectors.toList());
            } else {
                logs = auditLogRepository.findByInsurerIdOrderBySequenceNumberDesc(scopedInsurerId);
            }
        } else {
            // AUDITOR and PLATFORM_ADMIN can view all or filter
            if (claimId != null) {
                logs = auditLogRepository.findByClaimIdOrderBySequenceNumberAsc(claimId);
            } else if (insurerId != null) {
                logs = auditLogRepository.findByInsurerIdOrderBySequenceNumberDesc(insurerId);
            } else {
                logs = auditLogRepository.findAllByOrderBySequenceNumberDesc();
            }
        }

        Map<UUID, String> insurerNames = insurerRepository.findAll().stream()
                .collect(Collectors.toMap(Insurer::getId, Insurer::getName, (a, b) -> a));

        List<AuditLogDto> dtos = logs.stream()
                .map(l -> AuditLogDto.fromEntity(l, insurerNames.getOrDefault(l.getInsurerId(), "Platform")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/verify-chain")
    @PreAuthorize("hasAnyRole('AUDITOR', 'PLATFORM_ADMIN', 'INSURER_ADMIN', 'SUPERVISOR')")
    public ResponseEntity<HashChainVerificationResult> verifyChain() {
        return ResponseEntity.ok(auditChainService.verifyChainIntegrity());
    }
}
