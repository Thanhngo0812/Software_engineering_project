package com.ct08SWE.SmartBusTracking.dto;


import lombok.Data;

@Data
public class StudentManifestDTO {
    private Integer studentId;
    private String studentName;
    private String status;      // WAITING, BOARDED...
    private String parentPhone; // Để tài xế gọi nếu cần
}
