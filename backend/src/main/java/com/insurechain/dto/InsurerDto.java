package com.insurechain.dto;

import com.insurechain.model.Insurer;
import java.time.Instant;
import java.util.UUID;

public class InsurerDto {
    private UUID id;
    private String name;
    private String code;
    private String description;
    private String contactEmail;
    private String contactPhone;
    private boolean active;
    private Instant createdAt;

    public InsurerDto() {}

    public static InsurerDto fromEntity(Insurer insurer) {
        InsurerDto dto = new InsurerDto();
        dto.setId(insurer.getId());
        dto.setName(insurer.getName());
        dto.setCode(insurer.getCode());
        dto.setDescription(insurer.getDescription());
        dto.setContactEmail(insurer.getContactEmail());
        dto.setContactPhone(insurer.getContactPhone());
        dto.setActive(insurer.isActive());
        dto.setCreatedAt(insurer.getCreatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
