package com.insurechain;

import com.insurechain.dto.CreatePolicyRequest;
import com.insurechain.dto.PolicyDto;
import com.insurechain.model.AuditAction;
import com.insurechain.model.Insurer;
import com.insurechain.model.Policy;
import com.insurechain.model.RoleType;
import com.insurechain.model.User;
import com.insurechain.repository.InsurerRepository;
import com.insurechain.repository.PolicyRepository;
import com.insurechain.repository.UserRepository;
import com.insurechain.security.UserDetailsImpl;
import com.insurechain.service.AuditChainService;
import com.insurechain.service.InsurerService;
import com.insurechain.service.PolicyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InsurerAndPolicyManagementTest {

    @Mock
    private InsurerRepository insurerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private AuditChainService auditChainService;

    @InjectMocks
    private InsurerService insurerService;

    @InjectMocks
    private PolicyService policyService;

    private UUID insurerId;
    private UUID adminUserId;
    private UserDetailsImpl adminUser;
    private Insurer insurer;

    @BeforeEach
    public void setUp() {
        insurerId = UUID.randomUUID();
        adminUserId = UUID.randomUUID();

        adminUser = new UserDetailsImpl(
                adminUserId,
                "admin@icici.com",
                "Password123!",
                "Admin Rao",
                RoleType.INSURER_ADMIN,
                insurerId,
                true,
                org.springframework.security.core.authority.AuthorityUtils.createAuthorityList("ROLE_INSURER_ADMIN")
        );

        insurer = new Insurer();
        insurer.setId(insurerId);
        insurer.setName("ICICI Lombard");
        insurer.setHighValueThreshold(new BigDecimal("500000.00"));
    }

    @Test
    @DisplayName("Admin can update insurer high-value threshold with audit logging")
    public void testUpdateHighValueThresholdSuccess() {
        when(insurerRepository.findById(insurerId)).thenReturn(Optional.of(insurer));
        when(insurerRepository.save(any(Insurer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        com.insurechain.dto.InsurerDto updated = insurerService.updateHighValueThreshold(
                insurerId,
                new BigDecimal("750000.00"),
                adminUser,
                "127.0.0.1"
        );

        assertEquals(new BigDecimal("750000.00"), updated.getHighValueThreshold());
        verify(auditChainService, times(1)).logWorkflowEvent(
                isNull(),
                eq(insurerId),
                eq(adminUserId),
                eq("admin@icici.com"),
                eq("INSURER_ADMIN"),
                eq(AuditAction.THRESHOLD_UPDATED),
                eq("₹500000.00"),
                eq("₹750000.00"),
                contains("Insurer high-value threshold updated"),
                eq("127.0.0.1")
        );
    }

    @Test
    @DisplayName("Negative high-value threshold is rejected with IllegalArgumentException")
    public void testNegativeHighValueThresholdRejected() {
        assertThrows(IllegalArgumentException.class, () -> {
            insurerService.updateHighValueThreshold(
                    insurerId,
                    new BigDecimal("-5000.00"),
                    adminUser,
                    "127.0.0.1"
            );
        });

        verify(insurerRepository, never()).save(any());
    }

    @Test
    @DisplayName("Cross-insurer admin cannot update another insurer's threshold")
    public void testCrossInsurerAdminBlockedFromUpdatingThreshold() {
        UUID otherInsurerId = UUID.randomUUID();
        Insurer otherInsurer = new Insurer();
        otherInsurer.setId(otherInsurerId);
        otherInsurer.setName("Other Insurer");
        when(insurerRepository.findById(otherInsurerId)).thenReturn(Optional.of(otherInsurer));

        assertThrows(com.insurechain.exception.UnauthorizedTenantAccessException.class, () -> {
            insurerService.updateHighValueThreshold(
                    otherInsurerId,
                    new BigDecimal("600000.00"),
                    adminUser,
                    "127.0.0.1"
            );
        });
    }

    @Test
    @DisplayName("Admin can assign authorized role to insurer staff member")
    public void testAssignUserRoleSuccess() {
        UUID targetUserId = UUID.randomUUID();
        User targetUser = new User();
        targetUser.setId(targetUserId);
        targetUser.setEmail("staff@icici.com");
        targetUser.setRole(RoleType.CLAIMS_OFFICER);
        targetUser.setInsurerId(insurerId);

        when(insurerRepository.findById(insurerId)).thenReturn(Optional.of(insurer));
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        com.insurechain.dto.UserDto updated = insurerService.updateUserRole(
                insurerId,
                targetUserId,
                RoleType.SUPERVISOR,
                adminUser,
                "127.0.0.1"
        );

        assertEquals(RoleType.SUPERVISOR, updated.getRole());
        verify(auditChainService, times(1)).logWorkflowEvent(
                isNull(),
                eq(insurerId),
                eq(adminUserId),
                eq("admin@icici.com"),
                eq("INSURER_ADMIN"),
                eq(AuditAction.ROLE_ASSIGNED),
                eq("CLAIMS_OFFICER"),
                eq("SUPERVISOR"),
                contains("changed from CLAIMS_OFFICER to SUPERVISOR"),
                eq("127.0.0.1")
        );
    }

    @Test
    @DisplayName("Policy creation with negative deductible or negative filing window is rejected")
    public void testPolicyValidationBounds() {
        CreatePolicyRequest req1 = new CreatePolicyRequest();
        req1.setPolicyNumber("POL-TEST-01");
        req1.setTitle("Test Health");
        req1.setCategory("HEALTH");
        req1.setInsurerId(insurerId);
        req1.setCoverageLimit(new BigDecimal("100000.00"));
        req1.setDeductible(new BigDecimal("-100.00")); // Invalid
        req1.setFilingWindowDays(30);
        req1.setEffectiveDate(LocalDate.now());
        req1.setExpiryDate(LocalDate.now().plusYears(1));

        assertThrows(IllegalArgumentException.class, () -> {
            policyService.createPolicy(insurerId, req1, adminUser, "127.0.0.1");
        });

        CreatePolicyRequest req2 = new CreatePolicyRequest();
        req2.setPolicyNumber("POL-TEST-02");
        req2.setTitle("Test Health");
        req2.setCategory("HEALTH");
        req2.setInsurerId(insurerId);
        req2.setCoverageLimit(new BigDecimal("100000.00"));
        req2.setDeductible(new BigDecimal("500.00"));
        req2.setFilingWindowDays(0); // Invalid <= 0
        req2.setEffectiveDate(LocalDate.now());
        req2.setExpiryDate(LocalDate.now().plusYears(1));

        assertThrows(IllegalArgumentException.class, () -> {
            policyService.createPolicy(insurerId, req2, adminUser, "127.0.0.1");
        });
    }
}
