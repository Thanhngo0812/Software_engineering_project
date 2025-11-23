package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.RouteStop;
import com.ct08SWE.SmartBusTracking.entity.RouteStopId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RouteStopRepository extends JpaRepository<RouteStop, RouteStopId> {
    List<RouteStop> findByRouteIdOrderByStopOrder(Integer routeId);
    List<RouteStop> findByStopId(Integer stopId);
    void deleteByRouteId(Integer routeId);
    List<RouteStop> findByRouteIdOrderByStopOrderAsc(Integer routeId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RouteStop rs WHERE rs.id.routeId = :routeId")
    void deleteAllByRouteId(Integer routeId);
}