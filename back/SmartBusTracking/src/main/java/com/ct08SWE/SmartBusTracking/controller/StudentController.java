package com.ct08SWE.SmartBusTracking.controller;

import com.ct08SWE.SmartBusTracking.dto.StudentResponseDTO;
import com.ct08SWE.SmartBusTracking.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/admin/v1/students") 
public class StudentController {

    private final StudentService studentService;

    @Autowired
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * API để lấy về danh sách tất cả học sinh.
     * Client sẽ gọi đến URL: GET http://your-domain/api/v1/students
     */
    @GetMapping
    public ResponseEntity<List<StudentResponseDTO>> getAllStudents() {
        List<StudentResponseDTO> studentList = studentService.getAllStudents();
        return ResponseEntity.ok(studentList);
    }
}