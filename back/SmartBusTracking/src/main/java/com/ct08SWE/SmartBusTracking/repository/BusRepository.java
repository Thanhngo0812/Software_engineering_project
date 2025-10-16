package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Integer> {
    Optional<Bus> findByLicensePlate(String licensePlate);
    List<Bus> findBySchoolId(Integer schoolId);
    List<Bus> findByPrimaryDriverId(Integer driverId);
    boolean existsByLicensePlate(String licensePlate);
}