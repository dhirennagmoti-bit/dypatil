package com.insurechain.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_policies", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "policy_id"})
})
public class UserPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "enrolled_at", nullable = false)
    private Instant enrolledAt = Instant.now();

    @Column(nullable = false, length = 50)
    private String status = "ACTIVE";

    public UserPolicy() {}

    public UserPolicy(UUID userId, UUID policyId) {
        this.userId = userId;
        this.policyId = policyId;
        this.enrolledAt = Instant.now();
        this.status = "ACTIVE";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getPolicyId() { return policyId; }
    public void setPolicyId(UUID policyId) { this.policyId = policyId; }

    public Instant getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(Instant enrolledAt) { this.enrolledAt = enrolledAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
