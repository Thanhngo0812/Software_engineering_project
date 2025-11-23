package com.ct08SWE.SmartBusTracking.service;

import com.ct08SWE.SmartBusTracking.dto.*;
import com.ct08SWE.SmartBusTracking.entity.*;

import com.ct08SWE.SmartBusTracking.exception.ConflictException;
import com.ct08SWE.SmartBusTracking.exception.ResourceNotFoundException;
import com.ct08SWE.SmartBusTracking.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final TripRepository tripRepository;
    private final RouteRepository routeRepository;
    private final BusRepository busRepository;
    private final DriverRepository driverRepository;
    private final RouteStopRepository routeStopRepository;
    private final StudentRepository studentRepository;     // Mới thêm
    private final AttendanceRepository attendanceRepository;
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
        generateTripManifest(saved);
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
                sendTripStartedEvent(trip);
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
        List<RouteStop> routeStops = routeStopRepository.findByRouteIdWithStop(trip.getRoute().getId());
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
    // --- HÀM MỚI: Bắn Kafka với dữ liệu đã làm phẳng (Flatten) ---
    private void sendTripStartedEvent(Trip trip) {
        try {
            List<RouteDTO.RouteStopDTO> stops = getTripStops(trip.getId());

            // Flatten: Chuyển cấu trúc lồng nhau thành phẳng để Tracking Service dễ đọc
            List<Map<String, Object>> flatStops = stops.stream().map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("stopId", s.getStopId());
                map.put("stopOrder", s.getStopOrder());
                if (s.getStop() != null) {
                    map.put("stopName", s.getStop().getName());
                    map.put("latitude", s.getStop().getLatitude());   // Lấy ra ngoài
                    map.put("longitude", s.getStop().getLongitude()); // Lấy ra ngoài
                }
                return map;
            }).collect(Collectors.toList());

            Map<String, Object> event = new HashMap<>();
            event.put("tripId", trip.getId());
            event.put("stops", flatStops); // Gửi list phẳng

            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send("trip-started-event", json);
            log.info("Sent trip-started-event for Trip ID: {}", trip.getId());

        } catch (Exception e) {
            log.error("Failed to send kafka event", e);
        }
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

    // --- 2. LOGIC TẠO MANIFEST (DANH SÁCH ĐIỂM DANH) ---
    private void generateTripManifest(Trip trip) {
        // Lấy tất cả học sinh thuộc Route này
        List<Student> students = new ArrayList<>();
        if(trip.getDirection() == TripDirection.to_school) {

            students = studentRepository.findStudentsByRouteId(trip.getRoute().getId());

        }
        else{
            students = studentRepository.findStudentsByRouteIdback(trip.getRoute().getId());

        }

        List<Attendance> manifest = students.stream().map(student -> {
            Attendance att = new Attendance();
            att.setTrip(trip);
            att.setStudent(student);
            att.setStatus(AttendanceStatus.WAITING); // Mặc định là chờ
            att.setTimestamp(LocalDateTime.now());
            // Logic xác định điểm đón/trả dựa vào chiều đi
            if (trip.getDirection() == TripDirection.to_school) {
                // Chiều đi: Đón ở Pickup (Nhà), Trả ở Dropoff (Trường)
                att.setStop(student.getPickupStop());
            } else {
                // Chiều về: Đón ở Dropoff cũ (Trường), Trả ở Pickup cũ (Nhà)
                att.setStop(student.getDropoffStop());
            }
            return att;
        }).collect(Collectors.toList());

        attendanceRepository.saveAll(manifest);
    }
    // API quan trọng: Lấy danh sách học sinh cần Đón hoặc Trả tại trạm này
    public Map<String, Object> getStopManifest(Integer tripId, Integer stopId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        // 1. Lấy danh sách Attendance của chuyến này
        List<Attendance> attendances = attendanceRepository.findByTripId(tripId);

        // 2. Lọc ra những học sinh liên quan đến Stop này
        List<StudentManifestDTO> students = new ArrayList<>();
        String actionType = "";

        if (trip.getDirection() == TripDirection.to_school) {
            // CHIỀU ĐI: Tìm học sinh có điểm ĐÓN (Pickup) là trạm này
            actionType = "PICK_UP";
            students = attendances.stream()
                    .filter(a -> a.getStop().getId().equals(stopId))
                    .map(this::mapToManifestDTO)
                    .collect(Collectors.toList());
        } else {
            // CHIỀU VỀ: Tìm học sinh có điểm TRẢ (Dropoff) là trạm này
            actionType = "DROP_OFF";
            students = attendances.stream()
                    .filter(a -> a.getStop().getId().equals(stopId))
                    .map(this::mapToManifestDTO)
                    .collect(Collectors.toList());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("tripId", tripId);
        response.put("stopId", stopId);
        response.put("action", actionType); // Để Frontend hiển thị nút "Đón" hay "Trả"
        response.put("students", students);
        return response;
    }

    // Helper DTO mapping
    private StudentManifestDTO mapToManifestDTO(Attendance attendance) {
        StudentManifestDTO dto = new StudentManifestDTO();
        dto.setStudentId(attendance.getStudent().getId());
        dto.setStudentName(attendance.getStudent().getFullName());
        dto.setStatus(attendance.getStatus().toString()); // WAITING, BOARDED...
        dto.setParentPhone(attendance.getStudent().getGuardian().getPhoneNumber());
        return dto;
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

    @Transactional
    public void markAttendance(AttendanceRequest req) {
        // Tìm bản ghi Attendance dựa trên Trip và Student
        // (Giả sử AttendanceRepository đã có hàm findByTripIdAndStudentId, nếu chưa thì dùng stream lọc tạm hoặc viết thêm query)
        List<Attendance> list = attendanceRepository.findByTripId(req.getTripId());
        Attendance attendance = list.stream()
                .filter(a -> a.getStudent().getId().equals(req.getStudentId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Student not found in this trip"));

        attendance.setStatus(req.getStatus());
        attendance.setTimestamp(LocalDateTime.now());

        attendanceRepository.save(attendance);
    }
}