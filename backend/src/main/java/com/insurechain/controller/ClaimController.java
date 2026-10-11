package com.insurechain.controller;

import com.insurechain.dto.ClaimDetailResponse;
import com.insurechain.dto.ClaimDto;
import com.insurechain.dto.CreateClaimRequest;
import com.insurechain.dto.WorkflowTransitionRequest;
import com.insurechain.security.UserDetailsImpl;
import com.insurechain.service.ClaimService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    @Autowired
    private ClaimService claimService;

    @GetMapping
    public ResponseEntity<List<ClaimDto>> getClaims(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        return ResponseEntity.ok(claimService.getClaimsForCurrentUser(userPrincipal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimDetailResponse> getClaimById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        return ResponseEntity.ok(claimService.getClaimDetail(id, userPrincipal));
    }

    @PostMapping
    public ResponseEntity<ClaimDetailResponse> submitClaim(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody CreateClaimRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(claimService.createClaim(userPrincipal, request, clientIp));
    }

    @PostMapping("/{id}/transition")
    public ResponseEntity<ClaimDetailResponse> transitionWorkflow(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody WorkflowTransitionRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(claimService.transitionWorkflow(id, userPrincipal, request, clientIp));
    }
}
