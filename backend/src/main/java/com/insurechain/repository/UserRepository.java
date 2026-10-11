package com.insurechain.repository;

import com.insurechain.model.RoleType;
import com.insurechain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByInsurerId(UUID insurerId);
    List<User> findByRole(RoleType role);
}
