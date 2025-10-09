package com.ct08SWE.SmartBusTracking.controller;

import com.ct08SWE.SmartBusTracking.dto.AuthResponse;
import com.ct08SWE.SmartBusTracking.dto.LoginRequest;
import com.ct08SWE.SmartBusTracking.dto.RegisterRequest;
import com.ct08SWE.SmartBusTracking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    // Thay thế @RequiredArgsConstructor bằng constructor tường minh
    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}