package com.ct08SWE.SmartBusTracking.service;

import com.ct08SWE.SmartBusTracking.dto.StudentResponseDTO;
import com.ct08SWE.SmartBusTracking.entity.Student;
import com.ct08SWE.SmartBusTracking.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /**
     * Lấy danh sách tất cả học sinh và chuyển đổi sang DTO.
     * @return List<StudentResponseDTO>
     */
    public List<StudentResponseDTO> getAllStudents() {
        // 1. Lấy tất cả Student entity từ CSDL
        List<Student> students = studentRepository.findAll();

        // 2. Dùng stream để duyệt qua danh sách và chuyển đổi mỗi Student entity thành StudentResponseDTO
        return students.stream()
                .map(student -> new StudentResponseDTO(student))
                .collect(Collectors.toList());
    }
}