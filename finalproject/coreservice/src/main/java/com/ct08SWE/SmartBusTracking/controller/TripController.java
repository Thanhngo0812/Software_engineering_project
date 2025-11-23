package com.ct08SWE.SmartBusTracking.controller;

import com.ct08SWE.SmartBusTracking.dto.RouteDTO;
import com.ct08SWE.SmartBusTracking.dto.TripDTO;
import com.ct08SWE.SmartBusTracking.dto.TripRequest;
import com.ct08SWE.SmartBusTracking.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // <--- Thêm dòng này
public class TripController {

    private final TripService tripService;

    // 1. Lấy danh sách chuyến đi (Có thể lọc theo ngày)
    // URL: GET /api/v1/trips?date=2023-11-20
    @GetMapping
    public ResponseEntity<List<TripDTO>> getTrips(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        System.out.println(date.toString());
        return ResponseEntity.ok(tripService.getTripsByDate(date));
    }

    // 2. Tạo chuyến đi mới
    // URL: POST /api/v1/trips
    @PostMapping
    public ResponseEntity<TripDTO> createTrip(@Valid @RequestBody TripRequest request) {
        return ResponseEntity.ok(tripService.createTrip(request));
    }

    // 3. Cập nhật chuyến đi (Chỉ cho phép khi chưa chạy)
    // URL: PUT /api/v1/trips/{id}
    @PutMapping("/{id}")
    public ResponseEntity<TripDTO> updateTrip(
            @PathVariable Integer id,
            @Valid @RequestBody TripRequest request) {
        return ResponseEntity.ok(tripService.updateTrip(id, request));
    }

    // 4. Đổi trạng thái chuyến đi (SCHEDULED -> IN_PROGRESS -> COMPLETED / CANCELLED)
    // URL: PATCH /api/v1/trips/{id}/status?status=IN_PROGRESS
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        tripService.changeStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // 5. Xem lộ trình thực tế của chuyến đi (Đã xử lý đảo chiều Stops nếu là chiều về)
    // URL: GET /api/v1/trips/{id}/stops
    @GetMapping("/{id}/stops")
    public ResponseEntity<List<RouteDTO.RouteStopDTO>> getTripStops(@PathVariable Integer id) {
        return ResponseEntity.ok(tripService.getTripStops(id));
    }

    @GetMapping("/{tripId}/stops/{stopId}/manifest")
    public ResponseEntity<Map<String, Object>> getStopManifest(
            @PathVariable Integer tripId,
            @PathVariable Integer stopId) {
        return ResponseEntity.ok(tripService.getStopManifest(tripId, stopId));
    }


}