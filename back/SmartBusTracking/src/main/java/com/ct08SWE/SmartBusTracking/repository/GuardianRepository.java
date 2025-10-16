package com.ct08SWE.SmartBusTracking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ct08SWE.SmartBusTracking.entity.Guardian;

import java.util.Optional;

@Repository
public interface GuardianRepository extends JpaRepository<Guardian, Integer> {
    Optional<Guardian> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);
}