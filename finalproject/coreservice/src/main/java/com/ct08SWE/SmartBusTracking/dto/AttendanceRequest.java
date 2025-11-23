package com.ct08SWE.SmartBusTracking.dto;

import com.ct08SWE.SmartBusTracking.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AttendanceRequest {
    @NotNull
    private Integer studentId;

    @NotNull
    private Integer tripId;

    @NotNull
    private AttendanceStatus status; // BOARDED, ALIGHTED, ABSENT

    private Double latitude;
    private Double longitude;
}
