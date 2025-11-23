package com.ct08SWE.SmartBusTracking.service;

import com.ct08SWE.SmartBusTracking.dto.RouteDTO;
import com.ct08SWE.SmartBusTracking.dto.TripDTO;
import com.ct08SWE.SmartBusTracking.dto.TripRequest;
import com.ct08SWE.SmartBusTracking.entity.*;

import com.ct08SWE.SmartBusTracking.exception.ConflictException;
import com.ct08SWE.SmartBusTracking.exception.ResourceNotFoundException;
import com.ct08SWE.SmartBusTracking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final RouteRepository routeRepository;
    private final BusRepository busRepository;
    private final DriverRepository driverRepository;

    public List<TripDTO> getTripsByDate(LocalDate date) {
        if (date == null) date = LocalDate.now();
        return tripRepository.findByTripDateOrderByPlannedStartTimeAsc(date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TripDTO createTrip(TripRequest req) {
        // 1. Tìm Xe của Tài xế (Logic tự động)
        Bus bus = busRepository.findBusByDriverId(req.getDriverId())
                .orElseThrow(() -> new ConflictException("Selected driver does not have an assigned bus. Please assign a bus to this driver first."));

        // 2. Validate xung đột
        LocalTime start = req.getPlannedStartTime();
        LocalTime minTime = start.minusHours(2);
        LocalTime maxTime = start.plusHours(2);

        if (tripRepository.existsConflictCreate(req.getDriverId(), bus.getId(), req.getTripDate(), minTime, maxTime)) {
            throw new ConflictException("Driver or Bus is already scheduled for another trip around this time.");
        }

        Trip trip = new Trip();
        mapRequestToEntity(trip, req, bus); // Truyền bus vào hàm map
        trip.setStatus(TripStatus.scheduled);

        Trip saved = tripRepository.save(trip);
        return mapToDTO(saved);
    }

    @Transactional
    public TripDTO updateTrip(Integer id, TripRequest req) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (trip.getStatus() == TripStatus.in_progress || trip.getStatus() == TripStatus.completed) {
            throw new ConflictException("Cannot edit a trip that is In Progress or Completed.");
        }

        // 1. Tìm Xe của Tài xế
        Bus bus = busRepository.findBusByDriverId(req.getDriverId())
                .orElseThrow(() -> new ConflictException("Selected driver does not have an assigned bus."));

        // 2. Validate xung đột
        LocalTime start = req.getPlannedStartTime();
        LocalTime minTime = start.minusHours(2);
        LocalTime maxTime = start.plusHours(2);

        if (tripRepository.existsConflict(id, req.getDriverId(), bus.getId(), req.getTripDate(), minTime, maxTime)) {
            throw new ConflictException("Driver or Bus is busy at this time.");
        }

        mapRequestToEntity(trip, req, bus);
        Trip saved = tripRepository.save(trip);
        return mapToDTO(saved);
    }

    // ... (Các hàm changeStatus, getTripStops giữ nguyên như cũ) ...
    @Transactional
    public void changeStatus(Integer id, String statusStr) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        try {
            TripStatus newStatus = TripStatus.valueOf(statusStr);
            if (newStatus == TripStatus.in_progress) {
                trip.setActualStartTime(LocalDateTime.now());
            } else if (newStatus == TripStatus.completed) {
                if (trip.getStatus() != TripStatus.in_progress) {
                    throw new ConflictException("Trip must be IN_PROGRESS before Completing.");
                }
                trip.setActualEndTime(LocalDateTime.now());
            }
            trip.setStatus(newStatus);
            tripRepository.save(trip);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + statusStr);
        }
    }

    public List<RouteDTO.RouteStopDTO> getTripStops(Integer tripId) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        List<RouteStop> routeStops = trip.getRoute().getRouteStops();
        List<RouteDTO.RouteStopDTO> stopsDto = routeStops.stream().map(rs -> {
            RouteDTO.RouteStopDTO dto = new RouteDTO.RouteStopDTO();
            dto.setStopId(rs.getStop().getId());
            dto.setStopOrder(rs.getStopOrder());
            RouteDTO.StopInfoDTO info = new RouteDTO.StopInfoDTO();
            info.setId(rs.getStop().getId());
            info.setName(rs.getStop().getStopName());
            info.setAddress(rs.getStop().getAddress());
            info.setLatitude(rs.getStop().getLatitude() != null ? rs.getStop().getLatitude().doubleValue() : null);
            info.setLongitude(rs.getStop().getLongitude() != null ? rs.getStop().getLongitude().doubleValue() : null);
            dto.setStop(info);
            return dto;
        }).collect(Collectors.toList());

        if (trip.getDirection() == TripDirection.to_school) {
            stopsDto.sort(Comparator.comparingInt(RouteDTO.RouteStopDTO::getStopOrder));
        } else {
            stopsDto.sort((a, b) -> b.getStopOrder().compareTo(a.getStopOrder()));
        }
        return stopsDto;
    }

    // --- Helper Methods ---
    // Cập nhật: Hàm này nhận thêm Bus đã tìm được
    private void mapRequestToEntity(Trip trip, TripRequest req, Bus bus) {
        Route route = routeRepository.findById(req.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));

        Driver driver = driverRepository.findById(req.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        trip.setRoute(route);
        trip.setBus(bus); // Gán xe tự động
        trip.setDriver(driver);
        trip.setTripDate(req.getTripDate());
        trip.setDirection(req.getDirection());
        trip.setPlannedStartTime(req.getPlannedStartTime());
        trip.setPlannedEndTime(req.getPlannedEndTime());
    }

    private TripDTO mapToDTO(Trip trip) {
        TripDTO dto = new TripDTO();
        dto.setId(trip.getId());
        if (trip.getRoute() != null) {
            dto.setRouteId(trip.getRoute().getId());
            dto.setRouteName(trip.getRoute().getRouteName());
        }
        if (trip.getBus() != null) {
            dto.setBusId(trip.getBus().getId());
            dto.setBusLicensePlate(trip.getBus().getLicensePlate());
        }
        if (trip.getDriver() != null) {
            dto.setDriverId(trip.getDriver().getId());
            dto.setDriverName(trip.getDriver().getFullName());
        }
        dto.setTripDate(trip.getTripDate());
        dto.setDirection(trip.getDirection());
        dto.setStatus(trip.getStatus());
        dto.setPlannedStartTime(trip.getPlannedStartTime());
        dto.setPlannedEndTime(trip.getPlannedEndTime());
        return dto;
    }
}