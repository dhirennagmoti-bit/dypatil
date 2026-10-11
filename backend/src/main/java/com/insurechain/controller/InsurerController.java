package com.insurechain.controller;

import com.insurechain.dto.InsurerDto;
import com.insurechain.dto.InsurerMetricsDto;
import com.insurechain.dto.UserDto;
import com.insurechain.security.UserDetailsImpl;
import com.insurechain.service.InsurerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/insurers")
public class InsurerController {

    @Autowired
    private InsurerService insurerService;

    @GetMapping
    public ResponseEntity<List<InsurerDto>> getAllInsurers() {
        return ResponseEntity.ok(insurerService.getAllInsurers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurerDto> getInsurerById(@PathVariable UUID id) {
        return ResponseEntity.ok(insurerService.getInsurerById(id));
    }

    @GetMapping("/{id}/metrics")
    public ResponseEntity<InsurerMetricsDto> getMetrics(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        return ResponseEntity.ok(insurerService.getInsurerMetrics(id));
    }

    @GetMapping("/{id}/users")
    @PreAuthorize("hasAnyRole('INSURER_ADMIN', 'PLATFORM_ADMIN')")
    public ResponseEntity<List<UserDto>> getInsurerUsers(@PathVariable UUID id) {
        return ResponseEntity.ok(insurerService.getInsurerUsers(id));
    }
}
