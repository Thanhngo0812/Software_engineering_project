package com.ct08SWE.SmartBusTracking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ct08SWE.SmartBusTracking.entity.Stop;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface StopRepository extends JpaRepository<Stop, Integer> {
    List<Stop> findByStopNameContaining(String stopName);
}
