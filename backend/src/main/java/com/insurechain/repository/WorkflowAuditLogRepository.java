package com.insurechain.repository;

import com.insurechain.model.WorkflowAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowAuditLogRepository extends JpaRepository<WorkflowAuditLog, UUID> {
    List<WorkflowAuditLog> findAllByOrderBySequenceNumberAsc();
    List<WorkflowAuditLog> findAllByOrderBySequenceNumberDesc();
    List<WorkflowAuditLog> findByClaimIdOrderBySequenceNumberAsc(UUID claimId);
    List<WorkflowAuditLog> findByInsurerIdOrderBySequenceNumberDesc(UUID insurerId);

    @Query("SELECT l FROM WorkflowAuditLog l ORDER BY l.sequenceNumber DESC LIMIT 1")
    Optional<WorkflowAuditLog> findLatestLog();
}
