package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.RouteStop;
import com.ct08SWE.SmartBusTracking.entity.RouteStopId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RouteStopsRepository extends JpaRepository<RouteStop, RouteStopId> {
    
    /**
     * Counts how many routes are associated with a given stopId.
     * @param stopId The ID of the stop.
     * @return The number of routes that include this stop.
     */
    long countByStopId(int stopId);
}