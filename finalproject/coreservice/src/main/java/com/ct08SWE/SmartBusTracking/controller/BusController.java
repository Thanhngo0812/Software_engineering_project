package com.ct08SWE.SmartBusTracking.controller;

import com.ct08SWE.SmartBusTracking.dto.BusDTO;
import com.ct08SWE.SmartBusTracking.dto.BusRequest;
import com.ct08SWE.SmartBusTracking.service.BusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/buses")
@RequiredArgsConstructor
public class BusController {

    private final BusService busService;

    @GetMapping
    public ResponseEntity<List<BusDTO>> getAllBuses() {
        return ResponseEntity.ok(busService.getAllBuses());
    }

    @PostMapping
    public ResponseEntity<BusDTO> createBus(@Valid @RequestBody BusRequest request) {
        return ResponseEntity.ok(busService.createBus(request));
    }

    // API Sửa xe
    @PutMapping("/{id}")
    public ResponseEntity<BusDTO> updateBus(
            @PathVariable Integer id,
            @Valid @RequestBody BusRequest request) {
        return ResponseEntity.ok(busService.updateBus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable Integer id) {
        busService.deleteBus(id);
        return ResponseEntity.ok().build();
    }
}