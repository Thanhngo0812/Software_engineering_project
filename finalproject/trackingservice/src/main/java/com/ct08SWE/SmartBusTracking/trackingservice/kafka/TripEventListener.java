package com.ct08SWE.SmartBusTracking.trackingservice.kafka;

import com.ct08SWE.SmartBusTracking.trackingservice.dto.RouteStopCacheDTO;
import com.ct08SWE.SmartBusTracking.trackingservice.service.TrackingService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TripEventListener {

    private final TrackingService trackingService;
    private final ObjectMapper objectMapper;

    // Topic này phải trùng với Topic mà Core Service bắn ra
    @KafkaListener(topics = "trip-started-event", groupId = "tracking-group")
    public void handleTripStarted(String message) {
        try {
            log.info("Received Trip Started Event: {}", message);

            // Parse message JSON từ Core Service
            // Giả sử message format: { "tripId": 100, "stops": [...] }
            Map<String, Object> eventData = objectMapper.readValue(message, new TypeReference<>() {});

            Integer tripId = (Integer) eventData.get("tripId");
            List<RouteStopCacheDTO> stops = objectMapper.convertValue(
                    eventData.get("stops"),
                    new TypeReference<List<RouteStopCacheDTO>>() {}
            );

            // Khởi tạo cache để bắt đầu theo dõi
            trackingService.initTripTracking(tripId, stops);

        } catch (Exception e) {
            log.error("Error processing trip start event", e);
        }
    }
}