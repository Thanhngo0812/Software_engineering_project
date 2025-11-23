package com.ct08SWE.SmartBusTracking.controller;

import com.ct08SWE.SmartBusTracking.dto.StudentResponseDTO;
import com.ct08SWE.SmartBusTracking.repository.AttendanceRepository;
import com.ct08SWE.SmartBusTracking.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/students")
public class StudentController {

    private final StudentService studentService;
    private final AttendanceRepository  attendanceRepository;


    @Autowired
    public StudentController(StudentService studentService, AttendanceRepository attendanceRepository) {
        this.studentService = studentService;
        this.attendanceRepository = attendanceRepository;
    }

    /**
     * API để lấy về danh sách tất cả học sinh.
     * Client sẽ gọi đến URL: GET http://your-domain/api/v1/students
     */
//    @GetMapping
//    public ResponseEntity<List<StudentResponseDTO>> getAllStudents() {
//        List<StudentResponseDTO> studentList = studentService.getAllStudents();
//        return ResponseEntity.ok(studentList);
//    }
    @GetMapping("/{id}/active-trip")
    public ResponseEntity<Map<String, Integer>> getActiveTrip(@PathVariable Integer id) {
        List<Integer> activeTrips = attendanceRepository.findActiveTripIdByStudent(id, LocalDate.now());

        // 2. Kiểm tra nếu có ít nhất 1 chuyến
        if (!activeTrips.isEmpty()) {
            // Lấy chuyến đầu tiên (đã được sort ưu tiên IN_PROGRESS hoặc giờ sớm hơn)
            Integer tripId = activeTrips.get(0);
            return ResponseEntity.ok(Collections.singletonMap("tripId", tripId));
        } else {
            return ResponseEntity.status(404).body(null);
        }
    }
}