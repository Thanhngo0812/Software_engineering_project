package com.ct08SWE.SmartBusTracking.controller;

import jakarta.validation.Valid;

import java.util.Collections;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ct08SWE.SmartBusTracking.dto.GetStopsResponse;
import com.ct08SWE.SmartBusTracking.dto.StopDetailDTO;
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
    /**
     * Endpoint to get a paginated and searchable list of stops.
     * @param page The page number to retrieve (default is 0).
     * @param size The number of items per page (default is 10).
     * @param query An optional search term for stop name or address.
     * @param sort Sorting criteria, e.g., "id,desc" or "name,asc".
     * @return A ResponseEntity containing a Page of StopResponseDto.
     */
    @GetMapping
    public ResponseEntity<Page<GetStopsResponse>> getAllStops(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "id,desc") String[] sort) {

        // Parse sorting parameters
        String sortField = sort[0];
        String sortDirection = sort.length > 1 ? sort[1] : "asc";

        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        
        // Call the service to get the data
        Page<GetStopsResponse> stopPage = stopService.getAllStops(query, pageable);
        
        // Return the data with a 200 OK status
        return ResponseEntity.ok(stopPage);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StopDetailDTO> getStopById(@PathVariable Long id) {
        // Service sẽ ném ra ResourceNotFoundException nếu không tìm thấy
        StopDetailDTO stopDetail = stopService.getStopDetailsById(id);
        
        // Trả về 200 OK cùng với dữ liệu của stop
        return ResponseEntity.ok(stopDetail);
    }
    
    
    // Endpoint để tạo một trạm dừng mới
    @PostMapping
    public ResponseEntity<StopResponseDTO> createStop(@Valid @RequestBody StopRequestDTO stopRequestDto) {
        StopResponseDTO createdStop = stopService.createStop(stopRequestDto);
        return new ResponseEntity<>(createdStop, HttpStatus.CREATED);
    }
    
    @DeleteMapping("/{stopId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')") 
    public ResponseEntity<Map<String, String>> deleteStop(@PathVariable Long stopId) {
            // Bước 1: Gọi Service để kiểm tra và thực hiện xóa
            boolean isDeleted = stopService.deleteStop(stopId);
            if (isDeleted) {
                // Xóa thành công (HTTP 200 OK)
                return ResponseEntity.ok(
                    Collections.singletonMap("message", "Stop với ID: " + stopId + " đã được xóa thành công.")
                );
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Collections.singletonMap("error", "cannot delete stop: " + stopId + ". It is being used in at least a Route.")
                );
            }

    }
    
}

