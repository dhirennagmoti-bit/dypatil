package com.insurechain.repository;

import com.insurechain.model.UserPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPolicyRepository extends JpaRepository<UserPolicy, UUID> {
    List<UserPolicy> findByUserId(UUID userId);
    Optional<UserPolicy> findByUserIdAndPolicyId(UUID userId, UUID policyId);
    boolean existsByUserIdAndPolicyId(UUID userId, UUID policyId);
}
