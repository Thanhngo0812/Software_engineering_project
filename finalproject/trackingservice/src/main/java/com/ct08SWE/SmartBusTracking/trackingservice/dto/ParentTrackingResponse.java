package com.ct08SWE.SmartBusTracking.trackingservice.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParentTrackingResponse {
    private Integer tripId;

    // Thông tin động (Xe đang ở đâu)
    private LatestLocationDTO currentLocation;

    // Thông tin tĩnh (Lộ trình để vẽ đường)
    private List<RouteStopCacheDTO> routeStops;
}
