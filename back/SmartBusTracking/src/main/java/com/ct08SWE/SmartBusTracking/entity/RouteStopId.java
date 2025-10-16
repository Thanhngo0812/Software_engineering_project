package com.ct08SWE.SmartBusTracking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RouteStopId implements Serializable {
    
    @Column(name = "route_id")
    private Integer routeId;
    
    @Column(name = "stop_id")
    private Integer stopId;
    
    public RouteStopId() {
    }
    
    public RouteStopId(Integer routeId, Integer stopId) {
        this.routeId = routeId;
        this.stopId = stopId;
    }
    
    public Integer getRouteId() {
        return routeId;
    }
    
    public void setRouteId(Integer routeId) {
        this.routeId = routeId;
    }
    
    public Integer getStopId() {
        return stopId;
    }
    
    public void setStopId(Integer stopId) {
        this.stopId = stopId;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RouteStopId that = (RouteStopId) o;
        return Objects.equals(routeId, that.routeId) && 
               Objects.equals(stopId, that.stopId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(routeId, stopId);
    }
}