package com.insurechain.repository;

import com.insurechain.model.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, UUID> {
    Optional<Policy> findByPolicyNumber(String policyNumber);
    List<Policy> findByInsurerId(UUID insurerId);
    List<Policy> findByActiveTrue();
    List<Policy> findByInsurerIdAndActiveTrue(UUID insurerId);
}
