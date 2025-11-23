package com.ct08SWE.SmartBusTracking.trackingservice.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class RouteStopCacheDTO implements Serializable {
    private Integer stopId;
    private String stopName;
    private Double latitude;
    private Double longitude;
    private Integer stopOrder;

    // Cờ đánh dấu xe đã đi qua trạm này chưa (để tránh báo nhiều lần)
    private boolean passed = false;
}