package com.ct08SWE.SmartBusTracking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ct08SWE.SmartBusTracking.entity.Route;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
    List<Route> findBySchoolId(Integer schoolId);
    List<Route> findByRouteNameContaining(String routeName);
    // Tìm kiếm theo tên
    Page<Route> findByRouteNameContainingIgnoreCase(String name, Pageable pageable);

    // Check xem Route có đang được dùng bởi Trip nào có status IN_PROGRESS hoặc SCHEDULED không
    @Query("SELECT COUNT(t) > 0 FROM Trip t WHERE t.route.id = :routeId AND t.status IN ('SCHEDULED', 'IN_PROGRESS')")
    boolean isRouteInUse(Integer routeId);

}