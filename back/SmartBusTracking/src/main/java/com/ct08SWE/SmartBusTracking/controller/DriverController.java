package com.ct08SWE.SmartBusTracking.controller;


import com.ct08SWE.SmartBusTracking.dto.BusDTO;
import com.ct08SWE.SmartBusTracking.dto.DriverDTO;
import com.ct08SWE.SmartBusTracking.dto.UpdateDriverRequest;
import com.ct08SWE.SmartBusTracking.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<List<DriverDTO>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverDTO> updateDriver(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateDriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }
    @GetMapping("/available-buses")
    public ResponseEntity<List<BusDTO>> getAvailableBuses() {
        return ResponseEntity.ok(driverService.getAvailableBuses());
    }
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatus(@PathVariable Integer id) {
        driverService.toggleDriverStatus(id);
        return ResponseEntity.ok().build();
    }

    // API gán xe bus
    @PostMapping("/{id}/assign-bus/{busId}")
    public ResponseEntity<Void> assignBus(
            @PathVariable Integer id,
            @PathVariable Integer busId) {
        driverService.assignBusToDriver(id, busId);
        return ResponseEntity.ok().build();
    }

    // API hủy gán xe bus
    @DeleteMapping("/{id}/unassign-bus")
    public ResponseEntity<Void> unassignBus(@PathVariable Integer id) {
        driverService.unassignBus(id);
        return ResponseEntity.ok().build();
    }
}