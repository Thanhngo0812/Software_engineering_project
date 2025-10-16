package com.ct08SWE.SmartBusTracking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ct08SWE.SmartBusTracking.entity.Student;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByEmail(String email);
    List<Student> findBySchoolId(Integer schoolId);
    List<Student> findByGuardianId(Integer guardianId);
    List<Student> findByPickupStopId(Integer stopId);
    List<Student> findByDropoffStopId(Integer stopId);
    boolean existsByEmail(String email);
}
