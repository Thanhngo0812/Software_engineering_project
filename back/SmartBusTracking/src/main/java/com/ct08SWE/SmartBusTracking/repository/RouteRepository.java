package com.ct08SWE.SmartBusTracking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ct08SWE.SmartBusTracking.entity.Route;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
    List<Route> findBySchoolId(Integer schoolId);
    List<Route> findByRouteNameContaining(String routeName);
}