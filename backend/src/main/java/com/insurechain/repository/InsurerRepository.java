package com.insurechain.repository;

import com.insurechain.model.Insurer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InsurerRepository extends JpaRepository<Insurer, UUID> {
    Optional<Insurer> findByCode(String code);
    boolean existsByCode(String code);
}
