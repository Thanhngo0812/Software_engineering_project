package com.ct08SWE.SmartBusTracking.dto;



import com.ct08SWE.SmartBusTracking.entity.TripDirection;
import com.ct08SWE.SmartBusTracking.entity.TripStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TripDTO {
    private Integer id;

    // Thông tin liên kết (chỉ lấy tên để hiển thị)
    private Integer routeId;
    private String routeName;

    private Integer busId;
    private String busLicensePlate;

    private Integer driverId;
    private String driverName;

    private LocalDate tripDate;
    private TripDirection direction;
    private TripStatus status;

    private LocalTime plannedStartTime;
    private LocalTime plannedEndTime;
}
