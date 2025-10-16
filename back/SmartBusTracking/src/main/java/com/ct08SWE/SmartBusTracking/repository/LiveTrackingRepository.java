package com.ct08SWE.SmartBusTracking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ct08SWE.SmartBusTracking.entity.LiveTracking;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LiveTrackingRepository extends JpaRepository<LiveTracking, Long> {
    List<LiveTracking> findByTripIdOrderByTimestampDesc(Integer tripId);
    
    @Query("SELECT lt FROM LiveTracking lt WHERE lt.trip.id = :tripId " +
           "ORDER BY lt.timestamp DESC LIMIT 1")
    Optional<LiveTracking> findLatestByTripId(@Param("tripId") Integer tripId);
    
    List<LiveTracking> findByTripIdAndTimestampBetween(
        Integer tripId, 
        LocalDateTime startTime, 
        LocalDateTime endTime
    );
    
    void deleteByTripId(Integer tripId);
}