package com.ct08SWE.SmartBusTracking.service;

import com.ct08SWE.SmartBusTracking.dto.RouteDTO;
import com.ct08SWE.SmartBusTracking.dto.RouteRequest;
import com.ct08SWE.SmartBusTracking.entity.Route;
import com.ct08SWE.SmartBusTracking.entity.RouteStop;
import com.ct08SWE.SmartBusTracking.entity.Stop;
import com.ct08SWE.SmartBusTracking.exception.ConflictException;
import com.ct08SWE.SmartBusTracking.exception.ResourceNotFoundException;
import com.ct08SWE.SmartBusTracking.repository.RouteRepository;
import com.ct08SWE.SmartBusTracking.repository.StopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final StopRepository stopRepository;

    public Page<RouteDTO> getRoutes(String query, Pageable pageable) {
        Page<Route> routes;
        if (query != null && !query.isEmpty()) {
            routes = routeRepository.findByRouteNameContainingIgnoreCase(query, pageable);
        } else {
            routes = routeRepository.findAll(pageable);
        }
        return routes.map(this::mapToSummaryDTO);
    }

    @Transactional(readOnly = true)
    public RouteDTO getRouteById(Integer id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));

        boolean inUse = routeRepository.isRouteInUse(id);
        return mapToDetailDTO(route, route.getRouteStops(), inUse);
    }

    @Transactional
    public RouteDTO createRoute(RouteRequest request) {
        Route route = new Route();
        route.setRouteName(request.getRouteName());
        route.setDescription(request.getDescription());
        route.setSchool(1);

        updateRouteStopsFromRequest(route, request.getRouteStops());

        Route savedRoute = routeRepository.save(route);
        return mapToDetailDTO(savedRoute, savedRoute.getRouteStops(), false);
    }

    @Transactional
    public RouteDTO updateRoute(Integer id, RouteRequest request) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));

        if (routeRepository.isRouteInUse(id)) {
            throw new ConflictException("Cannot update route because it is assigned to active trips.");
        }

        route.setRouteName(request.getRouteName());
        route.setDescription(request.getDescription());

        // --- SỬA LỖI DUPLICATE ENTRY: DÙNG SMART MERGE ---
        // Thay vì xóa hết (clear) rồi thêm lại, ta sẽ cập nhật list hiện có

        List<RouteRequest.RouteStopRequest> incomingStops = request.getRouteStops();
        List<RouteStop> currentStops = route.getRouteStops();

        // 1. Xóa những trạm không còn trong danh sách mới
        // (Logic: Nếu trạm cũ KHÔNG tồn tại trong danh sách mới -> Xóa)
        currentStops.removeIf(existing ->
                incomingStops.stream().noneMatch(req -> req.getStopId().equals(existing.getStop().getId()))
        );

        // 2. Cập nhật trạm cũ HOẶC Thêm trạm mới
        for (RouteRequest.RouteStopRequest req : incomingStops) {
            // Tìm xem trạm này đã có trong route chưa
            RouteStop existing = currentStops.stream()
                    .filter(s -> s.getStop().getId().equals(req.getStopId()))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                // A. Nếu đã có -> Chỉ cập nhật thứ tự (Order)
                // ID giữ nguyên -> Không bao giờ bị lỗi Duplicate Entry
                existing.setStopOrder(req.getStopOrder());
            } else {
                // B. Nếu chưa có -> Tạo mới và thêm vào
                RouteStop newStop = new RouteStop();
                newStop.setStopOrder(req.getStopOrder());

                Stop stopProxy = stopRepository.getReferenceById(req.getStopId());
                newStop.setStop(stopProxy);

                route.addStop(newStop); // Hàm helper trong Entity sẽ set quan hệ cha-con
            }
        }

        Route savedRoute = routeRepository.save(route);
        return mapToDetailDTO(savedRoute, savedRoute.getRouteStops(), false);
    }

    @Transactional
    public void deleteRoute(Integer id) {
        if (routeRepository.isRouteInUse(id)) {
            throw new ConflictException("Cannot delete route because it is assigned to active trips.");
        }
        routeRepository.deleteById(id);
    }

    // --- Helper Methods ---

    // Hàm này chỉ dùng cho Create (khi list rỗng)
    private void updateRouteStopsFromRequest(Route route, List<RouteRequest.RouteStopRequest> stopRequests) {
        for (RouteRequest.RouteStopRequest req : stopRequests) {
            RouteStop rs = new RouteStop();
            rs.setStopOrder(req.getStopOrder());

            Stop stopProxy = stopRepository.getReferenceById(req.getStopId());
            rs.setStop(stopProxy);

            route.addStop(rs);
        }
    }

    private RouteDTO mapToSummaryDTO(Route route) {
        RouteDTO dto = new RouteDTO();
        dto.setId(route.getId());
        dto.setRouteName(route.getRouteName());
        dto.setDescription(route.getDescription());
        if(route.getCreatedAt() != null)
            dto.setCreatedAt(route.getCreatedAt());
        dto.setStopCount(route.getRouteStops() != null ? route.getRouteStops().size() : 0);
        return dto;
    }

    private RouteDTO mapToDetailDTO(Route route, List<RouteStop> routeStops, boolean inUse) {
        RouteDTO dto = mapToSummaryDTO(route);
        dto.setInUse(inUse);

        if (routeStops != null) {
            List<RouteDTO.RouteStopDTO> stopDTOs = routeStops.stream().map(rs -> {
                RouteDTO.RouteStopDTO rsDto = new RouteDTO.RouteStopDTO();
                rsDto.setStopId(rs.getStop().getId());
                rsDto.setStopOrder(rs.getStopOrder());

                Stop stop = rs.getStop();
                if (stop != null) {
                    RouteDTO.StopInfoDTO info = new RouteDTO.StopInfoDTO();
                    info.setId(stop.getId());
                    info.setName(stop.getStopName());
                    info.setAddress(stop.getAddress());
                    info.setLatitude(stop.getLatitude().doubleValue()); // Đảm bảo Stop entity có getLatitude trả về Double
                    info.setLongitude(stop.getLongitude().doubleValue());
                    rsDto.setStop(info);
                }
                return rsDto;
            }).collect(Collectors.toList());

            dto.setRouteStops(stopDTOs);
        }
        return dto;
    }
}