package com.ct08SWE.SmartBusTracking.controller;

import com.ct08SWE.SmartBusTracking.dto.AttendanceRequest;
import com.ct08SWE.SmartBusTracking.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final TripService tripService;

    // API điểm danh
    // POST /api/v1/attendance
    @PostMapping
    public ResponseEntity<Void> markAttendance(@Valid @RequestBody AttendanceRequest request) {
        tripService.markAttendance(request);
        return ResponseEntity.ok().build();
    }
}