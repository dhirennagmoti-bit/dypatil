package com.insurechain.service;

import com.insurechain.dto.AuthResponse;
import com.insurechain.dto.LoginRequest;
import com.insurechain.dto.RegisterRequest;
import com.insurechain.dto.UserDto;
import com.insurechain.model.Insurer;
import com.insurechain.model.RoleType;
import com.insurechain.model.User;
import com.insurechain.repository.InsurerRepository;
import com.insurechain.repository.UserRepository;
import com.insurechain.security.JwtUtils;
import com.insurechain.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InsurerRepository insurerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(userPrincipal);

        String insurerName = null;
        if (userPrincipal.getInsurerId() != null) {
            insurerName = insurerRepository.findById(userPrincipal.getInsurerId())
                    .map(Insurer::getName)
                    .orElse(null);
        }

        User user = userRepository.findByEmail(userPrincipal.getUsername()).orElseThrow();
        UserDto userDto = UserDto.fromEntity(user, insurerName);

        return new AuthResponse(jwt, userDto);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        // Enforce privilege protection: Public registration is strictly restricted to POLICYHOLDER
        // Privileged roles (SUPERVISOR, CLAIMS_OFFICER, INSURER_ADMIN, AUDITOR) require authorized admin assignment
        user.setRole(RoleType.POLICYHOLDER);
        user.setInsurerId(null);
        user.setPhone(request.getPhone());
        user.setActive(true);

        User savedUser = userRepository.save(user);

        UserDetailsImpl userPrincipal = UserDetailsImpl.build(savedUser);
        String jwt = jwtUtils.generateJwtToken(userPrincipal);

        String insurerName = null;
        if (savedUser.getInsurerId() != null) {
            insurerName = insurerRepository.findById(savedUser.getInsurerId())
                    .map(Insurer::getName)
                    .orElse(null);
        }

        UserDto userDto = UserDto.fromEntity(savedUser, insurerName);
        return new AuthResponse(jwt, userDto);
    }

    public UserDto getCurrentUserDto(UserDetailsImpl userPrincipal) {
        User user = userRepository.findByEmail(userPrincipal.getUsername()).orElseThrow();
        String insurerName = null;
        if (user.getInsurerId() != null) {
            insurerName = insurerRepository.findById(user.getInsurerId())
                    .map(Insurer::getName)
                    .orElse(null);
        }
        return UserDto.fromEntity(user, insurerName);
    }
}
