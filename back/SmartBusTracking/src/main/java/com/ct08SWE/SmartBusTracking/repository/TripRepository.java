package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.Trip;
import com.ct08SWE.SmartBusTracking.entity.TripStatus;
import com.ct08SWE.SmartBusTracking.entity.TripDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByRouteId(Integer routeId);
    List<Trip> findByBusId(Integer busId);
    List<Trip> findByDriverId(Integer driverId);
    List<Trip> findByTripDate(LocalDate tripDate);
    List<Trip> findByTripDateAndStatus(LocalDate tripDate, TripStatus status);
    List<Trip> findByStatus(TripStatus status);
    List<Trip> findByTripDateAndDirection(LocalDate tripDate, TripDirection direction);
    List<Trip> findByDriverIdAndTripDate(Integer driverId, LocalDate tripDate);
    // Kiểm tra xem tài xế có đang lái chuyến nào chưa hoàn thành không
    @Query("SELECT COUNT(t) > 0 FROM Trip t WHERE t.driver.id = :driverId")
    boolean existsActiveTripByDriver(Integer driverId);

    @Query("SELECT COUNT(t) > 0 FROM Trip t WHERE t.driver.id = :driverId AND t.status = 'IN_PROGRESS'")
    boolean existsActiveTripProgressByDriver(Integer driverId);

    // Lấy danh sách theo ngày (để filter)
    List<Trip> findByTripDateOrderByPlannedStartTimeAsc(LocalDate date);

    // QUERY QUAN TRỌNG: Kiểm tra xem Tài xế hoặc Xe Bus có bị trùng lịch không
    // Logic: Tìm chuyến đi CÙNG NGÀY, KHÁC ID, mà thời gian bị chồng lấn (StartA < EndB và EndA > StartB)
    // Ở đây mình dùng logic đơn giản hơn: Trong vòng 2 tiếng của chuyến mới, tài xế/xe không được bận.

    // Ở đây mình dùng logic đơn giản hơn: Trong vòng 2 tiếng của chuyến mới, tài xế/xe không được bận.

    @Query("SELECT COUNT(t) > 0 FROM Trip t " +
            "WHERE t.tripDate = :date " +
            "AND t.id != :excludeTripId " +
            "AND t.status != 'CANCELLED' " +
            "AND (t.driver.id = :driverId OR t.bus.id = :busId) " +
            "AND t.plannedStartTime BETWEEN :startTimeMin AND :startTimeMax")
    boolean existsConflict(Integer excludeTripId, Integer driverId, Integer busId, LocalDate date, LocalTime startTimeMin, LocalTime startTimeMax);

    // Check khi Create (không có ID để trừ)
    @Query("SELECT COUNT(t) > 0 FROM Trip t " +
            "WHERE t.tripDate = :date " +
            "AND t.status != 'CANCELLED' " +
            "AND (t.driver.id = :driverId OR t.bus.id = :busId) " +
            "AND t.plannedStartTime BETWEEN :startTimeMin AND :startTimeMax")
    boolean existsConflictCreate(Integer driverId, Integer busId, LocalDate date, LocalTime startTimeMin, LocalTime startTimeMax);
}