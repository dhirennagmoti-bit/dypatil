package com.insurechain.controller;

import com.insurechain.dto.AiExtractionDto;
import com.insurechain.exception.ResourceNotFoundException;
import com.insurechain.model.Claim;
import com.insurechain.repository.AiExtractionResultRepository;
import com.insurechain.repository.ClaimRepository;
import com.insurechain.service.AiReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class AiReviewController {

    @Autowired
    private AiExtractionResultRepository aiExtractionResultRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private AiReviewService aiReviewService;

    @GetMapping("/review/{claimId}")
    public ResponseEntity<AiExtractionDto> getAiReview(@PathVariable UUID claimId) {
        return aiExtractionResultRepository.findByClaimId(claimId)
                .map(AiExtractionDto::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reanalyze/{claimId}")
    public ResponseEntity<AiExtractionDto> reanalyzeClaim(@PathVariable UUID claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));
        return ResponseEntity.ok(aiReviewService.analyzeAndSave(claim));
    }
}
