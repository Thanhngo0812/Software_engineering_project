package com.ct08SWE.SmartBusTracking.trackingservice.controller;


import com.ct08SWE.SmartBusTracking.trackingservice.dto.LatestLocationDTO;
import com.ct08SWE.SmartBusTracking.trackingservice.dto.ParentTrackingResponse;
import com.ct08SWE.SmartBusTracking.trackingservice.service.TrackingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    // 1. API cho Tài xế: Bắn tọa độ liên tục (VD: 5s/lần)
    @PostMapping("/update")
    public ResponseEntity<Void> updateLocation(@RequestBody LocationUpdateRequest req) {
        trackingService.processLocationUpdate(req.getTripId(), req.getLatitude(), req.getLongitude(), req.getSpeed());
        return ResponseEntity.ok().build();
    }

    // 2. API cho Phụ huynh: Xem vị trí xe (Lấy từ Redis siêu nhanh)
    @GetMapping("/{tripId}")
    public ResponseEntity<LatestLocationDTO> getBusLocation(@PathVariable Integer tripId) {
        LatestLocationDTO loc = trackingService.getLatestLocation(tripId);
        if (loc == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(loc);
    }
    @GetMapping("/trip/{tripId}/full")
    public ResponseEntity<ParentTrackingResponse> getTripTrackingInfo(@PathVariable Integer tripId) {
        ParentTrackingResponse response = trackingService.getFullTripInfo(tripId);
        if (response == null) {
            return ResponseEntity.notFound().build(); // Trip chưa bắt đầu
        }
        return ResponseEntity.ok(response);
    }

    @Data
    static class LocationUpdateRequest {
        private Integer tripId;
        private Double latitude;
        private Double longitude;
        private Double speed;
    }
}
