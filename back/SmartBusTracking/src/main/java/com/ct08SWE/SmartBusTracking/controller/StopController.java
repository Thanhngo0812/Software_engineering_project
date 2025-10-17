package com.ct08SWE.SmartBusTracking.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ct08SWE.SmartBusTracking.dto.StopRequestDTO;
import com.ct08SWE.SmartBusTracking.dto.StopResponseDTO;
import com.ct08SWE.SmartBusTracking.service.StopService;

@RestController
@RequestMapping("/api/school/v1/stops")
public class StopController {

    private final StopService stopService;

    public StopController(StopService stopService) {
        this.stopService = stopService;
    }

    // Endpoint để tạo một trạm dừng mới
    @PostMapping
    public ResponseEntity<StopResponseDTO> createStop(@Valid @RequestBody StopRequestDTO stopRequestDto) {
        StopResponseDTO createdStop = stopService.createStop(stopRequestDto);
        return new ResponseEntity<>(createdStop, HttpStatus.CREATED);
    }
}

