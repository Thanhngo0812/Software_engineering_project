package com.ct08SWE.SmartBusTracking.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ct08SWE.SmartBusTracking.entity.School;

import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, Integer> {
    Optional<School> findByUserId(Long userId);
    Optional<School> findByEmail(String email);
    boolean existsByEmail(String email);
}
