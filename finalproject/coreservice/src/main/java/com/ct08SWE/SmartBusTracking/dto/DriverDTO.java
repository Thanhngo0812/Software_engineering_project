package com.ct08SWE.SmartBusTracking.dto;

import lombok.Data;

@Data
public class DriverDTO {
    private Integer id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String licenseNumber;

    // Thông tin xe bus đang phụ trách (nếu có)
    private String assignedBusLicense;
    private Integer assignedBusId;

    // Trạng thái tài khoản (từ bảng Users)
    private boolean active;
    private String createdAt;
}