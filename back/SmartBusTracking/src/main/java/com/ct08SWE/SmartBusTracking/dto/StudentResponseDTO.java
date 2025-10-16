package com.ct08SWE.SmartBusTracking.dto;

import com.ct08SWE.SmartBusTracking.entity.Student;
import java.time.LocalDateTime;

// DTO = Data Transfer Object
public class StudentResponseDTO {

    private Long studentId;
    private String fullname;
    private String parentFullname;
    private String studentEmail;
    private boolean isAccountLocked;
    private LocalDateTime accountCreatedAt;

    // Constructor để chuyển đổi từ Entity sang DTO
    public StudentResponseDTO(Student student) {
        this.studentId = student.getId();
        this.fullname = student.getFullname();
        this.parentFullname = student.getParentFullname();
        this.studentEmail = student.getStudentEmail();
        // Lấy thông tin từ User entity liên quan
        if (student.getUser() != null) {
            this.isAccountLocked = !student.getUser().getAccountNonLocked();
            this.accountCreatedAt = student.getUser().getCreatedAt();
        }
    }

    // Getters and Setters
    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getParentFullname() {
        return parentFullname;
    }

    public void setParentFullname(String parentFullname) {
        this.parentFullname = parentFullname;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public boolean isAccountLocked() {
        return isAccountLocked;
    }

    public void setAccountLocked(boolean accountLocked) {
        isAccountLocked = accountLocked;
    }

    public LocalDateTime getAccountCreatedAt() {
        return accountCreatedAt;
    }

    public void setAccountCreatedAt(LocalDateTime accountCreatedAt) {
        this.accountCreatedAt = accountCreatedAt;
    }
}