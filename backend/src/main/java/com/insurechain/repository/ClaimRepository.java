package com.insurechain.repository;

import com.insurechain.model.Claim;
import com.insurechain.model.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, UUID> {
    Optional<Claim> findByClaimReference(String claimReference);
    List<Claim> findByPolicyholderIdOrderByCreatedAtDesc(UUID policyholderId);
    List<Claim> findByInsurerIdOrderByCreatedAtDesc(UUID insurerId);
    List<Claim> findByInsurerIdAndStatusOrderByCreatedAtDesc(UUID insurerId, ClaimStatus status);
    List<Claim> findByStatusOrderByCreatedAtDesc(ClaimStatus status);

    List<Claim> findByIncidentFingerprint(String incidentFingerprint);
    List<Claim> findByPolicyIdAndIncidentId(UUID policyId, String incidentId);
    List<Claim> findByPolicyIdAndIncidentIdAndIdNot(UUID policyId, String incidentId, UUID id);

    @Query("SELECT c FROM Claim c WHERE c.policyId = :policyId AND c.incidentDate BETWEEN :startDate AND :endDate AND c.id <> :excludeClaimId")
    List<Claim> findSimilarClaims(
            @Param("policyId") UUID policyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeClaimId") UUID excludeClaimId);

    long countByInsurerId(UUID insurerId);
    long countByInsurerIdAndStatus(UUID insurerId, ClaimStatus status);
}
