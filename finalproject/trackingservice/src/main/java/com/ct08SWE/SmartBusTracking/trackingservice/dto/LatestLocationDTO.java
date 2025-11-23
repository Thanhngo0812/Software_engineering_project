package com.ct08SWE.SmartBusTracking.trackingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LatestLocationDTO implements Serializable {
    private Integer tripId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private String lastUpdated; // ISO Timestamp
}