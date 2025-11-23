package com.ct08SWE.SmartBusTracking.controller;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {
    
    @GetMapping("/user/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public String userProfile() {
        return "User Profile - Accessible by USER and ADMIN";
    }
    
    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminDashboard() {
        return "Admin Dashboard - Only ADMIN can access";
    }
    
    @PutMapping("/admin/users/{userId}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> lockUser(@PathVariable Long userId) {
        // Implement lock user logic here
        Map<String, String> response = new HashMap<>();
        response.put("message", "User locked successfully");
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/admin/users/{userId}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> unlockUser(@PathVariable Long userId) {
        // Implement unlock user logic here
        Map<String, String> response = new HashMap<>();
        response.put("message", "User unlocked successfully");
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/admin/users/{userId}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> disableUser(@PathVariable Long userId) {
        // Implement disable user logic here
        Map<String, String> response = new HashMap<>();
        response.put("message", "User disabled successfully");
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/admin/users/{userId}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> enableUser(@PathVariable Long userId) {
        // Implement enable user logic here
        Map<String, String> response = new HashMap<>();
        response.put("message", "User enabled successfully");
        return ResponseEntity.ok(response);
    }
}
