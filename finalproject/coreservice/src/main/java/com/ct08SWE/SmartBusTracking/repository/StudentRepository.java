package com.ct08SWE.SmartBusTracking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ct08SWE.SmartBusTracking.entity.Student;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    /**
     * Tìm danh sách học sinh thuộc về một Route cụ thể.
     * Logic: Học sinh có "Điểm đón" (Pickup Stop) nằm trong danh sách các trạm của Route đó.
     */
    @Query("SELECT DISTINCT s FROM Student s " +
            "JOIN RouteStop rs ON s.pickupStop.id = rs.stop.id " +
            "WHERE rs.route.id = :routeId")
    List<Student> findStudentsByRouteId(Integer routeId);
    @Query("SELECT DISTINCT s FROM Student s " +
            "JOIN RouteStop rs ON s.dropoffStop.id = rs.stop.id " +
            "WHERE rs.route.id = :routeId")
    List<Student> findStudentsByRouteIdback(Integer routeId);
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByEmail(String email);
    List<Student> findBySchoolId(Integer schoolId);
    List<Student> findByGuardianId(Integer guardianId);
    List<Student> findByPickupStopId(Integer stopId);
    List<Student> findByDropoffStopId(Integer stopId);
    boolean existsByEmail(String email);
}
