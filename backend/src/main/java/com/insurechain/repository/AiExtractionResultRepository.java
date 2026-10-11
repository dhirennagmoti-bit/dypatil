package com.insurechain.repository;

import com.insurechain.model.AiExtractionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiExtractionResultRepository extends JpaRepository<AiExtractionResult, UUID> {
    Optional<AiExtractionResult> findByClaimId(UUID claimId);
}
