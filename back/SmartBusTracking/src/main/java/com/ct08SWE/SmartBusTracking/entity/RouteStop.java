package com.ct08SWE.SmartBusTracking.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "route_stops")
public class RouteStop {
    
    @EmbeddedId
    private RouteStopId id;
    
    @ManyToOne
    @MapsId("routeId")
    @JoinColumn(name = "route_id")
    private Route route;
    
    @ManyToOne
    @MapsId("stopId")
    @JoinColumn(name = "stop_id")
    private Stop stop;
    
    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;
    
    public RouteStop() {
    }
    
    public RouteStopId getId() {
        return id;
    }
    
    public void setId(RouteStopId id) {
        this.id = id;
    }
    
    public Route getRoute() {
        return route;
    }
    
    public void setRoute(Route route) {
        this.route = route;
    }
    
    public Stop getStop() {
        return stop;
    }
    
    public void setStop(Stop stop) {
        this.stop = stop;
    }
    
    public Integer getStopOrder() {
        return stopOrder;
    }
    
    public void setStopOrder(Integer stopOrder) {
        this.stopOrder = stopOrder;
    }
}
