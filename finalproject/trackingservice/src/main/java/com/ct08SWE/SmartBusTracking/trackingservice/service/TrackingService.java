package com.ct08SWE.SmartBusTracking.trackingservice.service;

import com.ct08SWE.SmartBusTracking.trackingservice.dto.LatestLocationDTO;
import com.ct08SWE.SmartBusTracking.trackingservice.dto.ParentTrackingResponse;
import com.ct08SWE.SmartBusTracking.trackingservice.dto.RouteStopCacheDTO;
import com.ct08SWE.SmartBusTracking.trackingservice.entity.LocationHistory;
import com.ct08SWE.SmartBusTracking.trackingservice.repository.LocationHistoryRepository;
import com.ct08SWE.SmartBusTracking.trackingservice.util.GeoUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {

    private final LocationHistoryRepository locationHistoryRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${core-service.url}")
    private String coreServiceUrl;

    private static final double ARRIVAL_THRESHOLD_METERS = 50.0;

    // 1. Xử lý sự kiện Trip Start (Từ Kafka)
    public void initTripTracking(Integer tripId, List<RouteStopCacheDTO> stops) {
        String key = "trip:route:" + tripId;
        // Lưu danh sách trạm vào Redis để tính toán nhanh
        redisTemplate.opsForValue().set(key, stops, 24, TimeUnit.HOURS);
        log.info("Initialized tracking cache for Trip ID: {}", tripId);
    }

    // 2. Nhận vị trí từ Tài xế (GPS Update)
    public void processLocationUpdate(Integer tripId, Double lat, Double lng, Double speed) {
        // A. Lưu Redis (Để App Phụ huynh xem Realtime)
        LatestLocationDTO latest = new LatestLocationDTO(tripId, lat, lng, speed, LocalDateTime.now().toString());
        redisTemplate.opsForValue().set("trip:latest:" + tripId, latest, 1, TimeUnit.HOURS);

        // B. Lưu PostgreSQL (Lưu vết lịch sử - chạy Async để không block)
        saveHistoryAsync(tripId, lat, lng, speed);

        // C. Tính toán khoảng cách tới trạm (Geofencing logic)
        checkProximityToStops(tripId, lat, lng);
    }

    @Async
    public void saveHistoryAsync(Integer tripId, Double lat, Double lng, Double speed) {
        LocationHistory history = new LocationHistory();
        history.setTripId(tripId);
        history.setLatitude(lat);
        history.setLongitude(lng);
        history.setSpeed(speed);
        history.setTimestamp(LocalDateTime.now());
        locationHistoryRepository.save(history);
    }

    // Logic quan trọng: Kiểm tra xem đã tới trạm chưa
    private void checkProximityToStops(Integer tripId, Double currentLat, Double currentLng) {
        String routeKey = "trip:route:" + tripId;

        // Lấy danh sách trạm từ Redis
        List<RouteStopCacheDTO> stops = (List<RouteStopCacheDTO>) redisTemplate.opsForValue().get(routeKey);
        if (stops == null) return; // Chưa có dữ liệu lộ trình

        boolean routeUpdated = false;

        for (RouteStopCacheDTO stop : stops) {
            if (stop.isPassed()) continue; // Bỏ qua trạm đã đi qua

            double distance = GeoUtils.calculateDistance(currentLat, currentLng, stop.getLatitude(), stop.getLongitude());

            if (distance <= ARRIVAL_THRESHOLD_METERS) {
                log.info("Bus arrived at stop: {} (Distance: {}m)", stop.getStopName(), distance);

                // --- GỌI CORE API ĐỂ LẤY DANH SÁCH HỌC SINH ---
                triggerArrivalAction(tripId, stop.getStopId());

                // Đánh dấu đã qua trạm để không gọi lại
                stop.setPassed(true);
                routeUpdated = true;
            }
        }

        // Cập nhật lại trạng thái các trạm vào Redis nếu có thay đổi
        if (routeUpdated) {
            redisTemplate.opsForValue().set(routeKey, stops, 24, TimeUnit.HOURS);
        }
    }

    // Gọi sang Core Service
    private void triggerArrivalAction(Integer tripId, Integer stopId) {
        try {
            String url = coreServiceUrl + "/api/v1/trips/" + tripId + "/stops/" + stopId + "/manifest";
            // Ở đây Core Service sẽ trả về list học sinh, bạn có thể bắn Socket/Firebase cho tài xế
            Object manifest = restTemplate.getForObject(url, Object.class);

            log.info("Fetched manifest for Stop {}: {}", stopId, manifest);

            // TODO: Bắn thông báo Realtime qua WebSocket/Firebase cho App Tài xế hiển thị popup
            // notificationService.notifyDriver(tripId, manifest);

        } catch (Exception e) {
            log.error("Failed to call Core Service: {}", e.getMessage());
        }
    }

    // 3. API cho Phụ huynh xem vị trí (Lấy từ Redis)
    public LatestLocationDTO getLatestLocation(Integer tripId) {
        return (LatestLocationDTO) redisTemplate.opsForValue().get("trip:latest:" + tripId);
    }

    public ParentTrackingResponse getFullTripInfo(Integer tripId) {
        // 1. Lấy vị trí xe hiện tại (Redis)
        LatestLocationDTO location = (LatestLocationDTO) redisTemplate.opsForValue().get("trip:latest:" + tripId);

        // 2. Lấy lộ trình các trạm (Redis)
        List<RouteStopCacheDTO> stops = (List<RouteStopCacheDTO>) redisTemplate.opsForValue().get("trip:route:" + tripId);

        if (stops == null) {
            // Trường hợp hiếm: Trip đang chạy nhưng cache route bị mất (hoặc chưa start)
            // Lúc này có thể fallback gọi sang Core Service để lấy lại, nhưng tạm thời trả về null
            return null;
        }

        return new ParentTrackingResponse(tripId, location, stops);
    }
}