package com.insurechain.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.insurechain.model.RoleType;
import com.insurechain.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class UserDetailsImpl implements UserDetails {

    private UUID id;
    private String email;
    @JsonIgnore
    private String password;
    private String fullName;
    private RoleType role;
    private UUID insurerId;
    private boolean active;
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(UUID id, String email, String password, String fullName, RoleType role,
                           UUID insurerId, boolean active, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.insurerId = insurerId;
        this.active = active;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getRole(),
                user.getInsurerId(),
                user.isActive(),
                authorities
        );
    }

    public UUID getId() { return id; }
    public String getFullName() { return fullName; }
    public RoleType getRole() { return role; }
    public UUID getInsurerId() { return insurerId; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return active; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return active; }
}
