package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.RouteStop;
import com.ct08SWE.SmartBusTracking.entity.RouteStopId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RouteStopRepository extends JpaRepository<RouteStop, RouteStopId> {
    List<RouteStop> findByRouteIdOrderByStopOrder(Integer routeId);
    List<RouteStop> findByStopId(Integer stopId);
    void deleteByRouteId(Integer routeId);
}