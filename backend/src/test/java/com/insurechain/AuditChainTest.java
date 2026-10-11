package com.insurechain;

import com.insurechain.dto.HashChainVerificationResult;
import com.insurechain.model.AuditAction;
import com.insurechain.model.WorkflowAuditLog;
import com.insurechain.repository.WorkflowAuditLogRepository;
import com.insurechain.service.AuditChainService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class AuditChainTest {

    @Mock
    private WorkflowAuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditChainService auditChainService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Valid hash chain should successfully verify with 0 errors")
    public void testValidChainVerification() {
        List<WorkflowAuditLog> logs = new ArrayList<>();

        Instant t1 = Instant.now().minusSeconds(3600);
        UUID claimId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();

        String h1 = auditChainService.computeHash(AuditChainService.GENESIS_HASH, claimId, actorId,
                AuditAction.CLAIM_SUBMITTED, null, "SUBMITTED", t1);

        WorkflowAuditLog log1 = new WorkflowAuditLog();
        log1.setId(UUID.randomUUID());
        log1.setSequenceNumber(1L);
        log1.setClaimId(claimId);
        log1.setActorId(actorId);
        log1.setAction(AuditAction.CLAIM_SUBMITTED);
        log1.setPreviousState(null);
        log1.setNewState("SUBMITTED");
        log1.setTimestamp(t1);
        log1.setPreviousHash(AuditChainService.GENESIS_HASH);
        log1.setCurrentHash(h1);
        logs.add(log1);

        Instant t2 = Instant.now().minusSeconds(1800);
        String h2 = auditChainService.computeHash(h1, claimId, actorId,
                AuditAction.CLAIM_APPROVED, "SUBMITTED", "APPROVED", t2);

        WorkflowAuditLog log2 = new WorkflowAuditLog();
        log2.setId(UUID.randomUUID());
        log2.setSequenceNumber(2L);
        log2.setClaimId(claimId);
        log2.setActorId(actorId);
        log2.setAction(AuditAction.CLAIM_APPROVED);
        log2.setPreviousState("SUBMITTED");
        log2.setNewState("APPROVED");
        log2.setTimestamp(t2);
        log2.setPreviousHash(h1);
        log2.setCurrentHash(h2);
        logs.add(log2);

        when(auditLogRepository.findAllByOrderBySequenceNumberAsc()).thenReturn(logs);

        HashChainVerificationResult result = auditChainService.verifyChainIntegrity();

        assertTrue(result.isValid());
        assertEquals(2, result.getTotalRecordsChecked());
        assertNull(result.getBrokenSequenceNumber());
        assertEquals(h2, result.getLatestHash());
    }

    @Test
    @DisplayName("Tampered block with altered previousHash must trigger chain break detection")
    public void testTamperedChainDetected() {
        List<WorkflowAuditLog> logs = new ArrayList<>();

        WorkflowAuditLog log1 = new WorkflowAuditLog();
        log1.setId(UUID.randomUUID());
        log1.setSequenceNumber(1L);
        log1.setPreviousHash(AuditChainService.GENESIS_HASH);
        log1.setCurrentHash("1111111111111111111111111111111111111111111111111111111111111111");
        logs.add(log1);

        WorkflowAuditLog log2 = new WorkflowAuditLog();
        log2.setId(UUID.randomUUID());
        log2.setSequenceNumber(2L);
        // Tampered: points to fake previous hash instead of log1.currentHash
        log2.setPreviousHash("9999999999999999999999999999999999999999999999999999999999999999");
        log2.setCurrentHash("2222222222222222222222222222222222222222222222222222222222222222");
        logs.add(log2);

        when(auditLogRepository.findAllByOrderBySequenceNumberAsc()).thenReturn(logs);

        HashChainVerificationResult result = auditChainService.verifyChainIntegrity();

        assertFalse(result.isValid());
        assertEquals(2L, result.getBrokenSequenceNumber());
        assertTrue(result.getErrorMessage().contains("BLOCKCHAIN BROKEN"));
    }
}
