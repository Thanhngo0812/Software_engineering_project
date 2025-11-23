package com.ct08SWE.SmartBusTracking.notificationservice.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceEventListener {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    // Lắng nghe topic CDC từ Debezium
    @KafkaListener(topics = "smartbus.public.attendance", groupId = "notification-group")
    public void handleDebeziumEvent(String message) {
        try {
            // Parse JSON cấu trúc Debezium
            JsonNode root = objectMapper.readTree(message);
            JsonNode payload = root.path("payload");

            // Lấy loại thao tác (u: update, c: create)
            String op = payload.path("op").asText();

            // Chỉ xử lý khi có thay đổi dữ liệu (Update hoặc Create)
            if ("u".equals(op) || "c".equals(op)) {
                JsonNode after = payload.path("after");

                // Lấy dữ liệu (Tên trường phải khớp với cột trong MySQL)
                Integer studentId = after.path("student_id").asInt();
                String status = after.path("status").asText();

                log.info("Notification Service: Detected change for Student ID {}: {}", studentId, status);

                // Lưu vào Redis để API Frontend gọi lấy
                // Key: notify:student:{studentId}
                redisTemplate.opsForValue().set("notify:student:" + studentId, status, 24, TimeUnit.HOURS);

                // TODO: Tại đây có thể gọi Firebase FCM để bắn Push Notification tới điện thoại
            }

        } catch (Exception e) {
            log.error("Error processing Debezium event", e);
        }
    }
}