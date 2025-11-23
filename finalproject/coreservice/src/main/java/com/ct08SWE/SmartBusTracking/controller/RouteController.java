package com.ct08SWE.SmartBusTracking.controller;


import com.ct08SWE.SmartBusTracking.dto.RouteDTO;
import com.ct08SWE.SmartBusTracking.dto.RouteRequest;
import com.ct08SWE.SmartBusTracking.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
// @CrossOrigin("*") // Bật nếu dev môi trường local khác port
public class RouteController {

    private final RouteService routeService;

    // 1. Get List (Search + Pagination)
    @GetMapping
    public ResponseEntity<Page<RouteDTO>> getRoutes(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 10, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(routeService.getRoutes(query, pageable));
    }

    // 2. Get Detail (For Edit Form)
    @GetMapping("/{id}")
    public ResponseEntity<RouteDTO> getRouteById(@PathVariable Integer id) {
        return ResponseEntity.ok(routeService.getRouteById(id));
    }

    // 3. Create
    @PostMapping
    public ResponseEntity<RouteDTO> createRoute(@Valid @RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.createRoute(request));
    }

    // 4. Update
    @PutMapping("/{id}")
    public ResponseEntity<RouteDTO> updateRoute(
            @PathVariable Integer id,
            @Valid @RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.updateRoute(id, request));
    }

    // 5. Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable Integer id) {
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }
}
