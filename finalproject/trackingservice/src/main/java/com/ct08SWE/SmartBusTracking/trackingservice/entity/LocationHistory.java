package com.ct08SWE.SmartBusTracking.trackingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "location_history")
@Data
public class LocationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer tripId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private LocalDateTime timestamp;
}