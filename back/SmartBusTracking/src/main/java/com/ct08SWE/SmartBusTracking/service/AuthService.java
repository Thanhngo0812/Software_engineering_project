package com.ct08SWE.SmartBusTracking.service;

import com.ct08SWE.SmartBusTracking.dto.*;
import com.ct08SWE.SmartBusTracking.entity.*;
import com.ct08SWE.SmartBusTracking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
//import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {
    
    // Khai báo các dependency final
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    // --- Constructor (thay thế cho @RequiredArgsConstructor) ---
    @Autowired
    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       UserDetailsServiceImpl userDetailsService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtService.generateToken(userDetails);
        
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
   

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(Role.RoleEnum.ROLE_STUDENT)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(Role.RoleEnum.ROLE_STUDENT);
                    return roleRepository.save(newRole);
                });
        roles.add(userRole);

        // --- Thay thế User.builder() bằng constructor và setters ---
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);
        user.setAccountNonLocked(true);
        user.setRoles(roles);

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        // --- Thay thế AuthResponse.builder() ---
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        return response;
    }
}