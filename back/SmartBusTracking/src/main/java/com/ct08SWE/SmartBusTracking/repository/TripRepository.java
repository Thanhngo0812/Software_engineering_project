package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.Trip;
import com.ct08SWE.SmartBusTracking.entity.TripStatus;
import com.ct08SWE.SmartBusTracking.entity.TripDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByRouteId(Integer routeId);
    List<Trip> findByBusId(Integer busId);
    List<Trip> findByDriverId(Integer driverId);
    List<Trip> findByTripDate(LocalDate tripDate);
    List<Trip> findByTripDateAndStatus(LocalDate tripDate, TripStatus status);
    List<Trip> findByStatus(TripStatus status);
    List<Trip> findByTripDateAndDirection(LocalDate tripDate, TripDirection direction);
    List<Trip> findByDriverIdAndTripDate(Integer driverId, LocalDate tripDate);
}