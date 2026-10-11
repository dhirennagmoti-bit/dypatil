package com.insurechain.dto;

import com.insurechain.model.RoleType;
import com.insurechain.model.User;
import java.util.UUID;

public class UserDto {
    private UUID id;
    private String email;
    private String fullName;
    private RoleType role;
    private UUID insurerId;
    private String insurerName;
    private String phone;
    private boolean active;

    public UserDto() {}

    public static UserDto fromEntity(User user, String insurerName) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setInsurerId(user.getInsurerId());
        dto.setInsurerName(insurerName);
        dto.setPhone(user.getPhone());
        dto.setActive(user.isActive());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public RoleType getRole() { return role; }
    public void setRole(RoleType role) { this.role = role; }

    public UUID getInsurerId() { return insurerId; }
    public void setInsurerId(UUID insurerId) { this.insurerId = insurerId; }

    public String getInsurerName() { return insurerName; }
    public void setInsurerName(String insurerName) { this.insurerName = insurerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
