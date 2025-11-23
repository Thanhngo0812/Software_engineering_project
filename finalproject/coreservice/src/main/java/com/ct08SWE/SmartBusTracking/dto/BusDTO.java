package com.ct08SWE.SmartBusTracking.dto;
import lombok.Data;

@Data
public class BusDTO {
    private Integer id;
    private String licensePlate;
    private String model;
    private Integer primaryDriverId;
    private String primaryDriverName;
    private Integer capacity;
}
