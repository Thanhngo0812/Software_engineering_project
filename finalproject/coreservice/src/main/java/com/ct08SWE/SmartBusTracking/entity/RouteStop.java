package com.ct08SWE.SmartBusTracking.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "route_stops")
public class RouteStop {

    // 1. QUAN TRỌNG: Phải khởi tạo ngay để tránh lỗi Null Pointer khi Hibernate map ID
    @EmbeddedId
    private RouteStopId id = new RouteStopId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("routeId") // Map với field routeId bên trong RouteStopId
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("stopId") // Map với field stopId bên trong RouteStopId
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

    // 2. Cần thiết cho Composite Key hoạt động đúng trong List/Set
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RouteStop routeStop = (RouteStop) o;
        return Objects.equals(id, routeStop.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}