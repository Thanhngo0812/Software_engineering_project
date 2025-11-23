package com.ct08SWE.SmartBusTracking.dto;


import lombok.Data;
import java.util.List;


@Data
public class RouteRequest {
    private String routeName;

    private String description;

    private List<RouteStopRequest> routeStops;

    @Data
    public static class RouteStopRequest {
        private Integer stopId;
        private Integer stopOrder;
    }
}
