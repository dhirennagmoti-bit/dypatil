package com.insurechain.controller;

import com.insurechain.dto.CreatePolicyRequest;
import com.insurechain.dto.PolicyDto;
import com.insurechain.model.RoleType;
import com.insurechain.security.UserDetailsImpl;
import com.insurechain.service.PolicyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    @Autowired
    private PolicyService policyService;

    @GetMapping
    public ResponseEntity<List<PolicyDto>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllActivePolicies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PolicyDto> getPolicyById(@PathVariable UUID id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    @GetMapping("/insurer/{insurerId}")
    public ResponseEntity<List<PolicyDto>> getPoliciesByInsurer(@PathVariable UUID insurerId) {
        return ResponseEntity.ok(policyService.getPoliciesByInsurer(insurerId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<PolicyDto>> getMyEnrolledPolicies(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        return ResponseEntity.ok(policyService.getUserEnrolledPolicies(userPrincipal.getId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSURER_ADMIN', 'PLATFORM_ADMIN')")
    public ResponseEntity<PolicyDto> createPolicy(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody CreatePolicyRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        UUID insurerId = userPrincipal.getInsurerId() != null ? userPrincipal.getInsurerId() : request.getInsurerId();
        if (insurerId == null) {
            throw new IllegalArgumentException("Insurer ID is required to create a policy.");
        }
        return ResponseEntity.ok(policyService.createPolicy(insurerId, request, userPrincipal, servletRequest.getRemoteAddr()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSURER_ADMIN', 'PLATFORM_ADMIN')")
    public ResponseEntity<PolicyDto> updatePolicy(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody CreatePolicyRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        return ResponseEntity.ok(policyService.updatePolicy(id, request, userPrincipal, servletRequest.getRemoteAddr()));
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<Void> enrollPolicy(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        policyService.enrollUser(userPrincipal.getId(), id);
        return ResponseEntity.ok().build();
    }
}
