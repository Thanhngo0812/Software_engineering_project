package com.ct08SWE.SmartBusTracking.notificationservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
// @CrossOrigin("*") // Bật nếu chạy local
public class NotificationController {

    private final RedisTemplate<String, Object> redisTemplate;

    // API cho App Phụ huynh polling
    // URL: GET /api/v1/notifications/student/{studentId}/status
    @GetMapping("/student/{studentId}/status")
    public ResponseEntity<Map<String, String>> getStudentStatus(@PathVariable Integer studentId) {
        String status = (String) redisTemplate.opsForValue().get("notify:student:" + studentId);

        if (status == null) {
            status = "WAITING"; // Trạng thái mặc định
        }

        return ResponseEntity.ok(Collections.singletonMap("status", status));
    }
}