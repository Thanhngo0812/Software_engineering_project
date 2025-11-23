package com.ct08SWE.SmartBusTracking.dto;

import com.ct08SWE.SmartBusTracking.entity.TripDirection;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TripRequest {
    @NotNull(message = "Route is required")
    private Integer routeId;

    // @NotNull(message = "Bus is required") <-- BỎ DÒNG NÀY (Tự động lấy theo Driver)
    // private Integer busId;

    @NotNull(message = "Driver is required")
    private Integer driverId;

    @NotNull(message = "Date is required")
    private LocalDate tripDate;

    @NotNull(message = "Direction is required")
    private TripDirection direction;

    @NotNull(message = "Start time is required")
    private LocalTime plannedStartTime;

    private LocalTime plannedEndTime;
}