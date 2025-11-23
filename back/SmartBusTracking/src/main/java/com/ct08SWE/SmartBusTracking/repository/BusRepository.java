package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Integer> {
    Optional<Bus> findByLicensePlate(String licensePlate);
    List<Bus> findBySchoolId(Integer schoolId);
    Optional<Bus> findByPrimaryDriverId(Integer driverId);
    boolean existsByLicensePlate(String licensePlate);
    // Tìm xe mà tài xế này đang là tài xế chính
    // Lưu ý: Giả sử trong Entity Bus có trường 'primaryDriver' hoặc 'primaryDriverId'
    // Nếu Entity Bus quan hệ object: findByPrimaryDriverId(Integer id)
    @Query("SELECT b FROM Bus b WHERE b.primaryDriver.id = :driverId")
    Optional<Bus> findBusByDriverId(Integer driverId);

    // Lấy danh sách xe chưa có tài xế (để gán)
    @Query("SELECT b FROM Bus b WHERE b.primaryDriver IS NULL")
    List<Bus> findAllAvailableBuses();

}