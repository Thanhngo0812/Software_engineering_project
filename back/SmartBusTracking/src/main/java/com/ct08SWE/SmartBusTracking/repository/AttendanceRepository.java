package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.Attendance;
import com.ct08SWE.SmartBusTracking.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByTripId(Integer tripId);
    List<Attendance> findByStudentId(Integer studentId);
    List<Attendance> findByStopId(Integer stopId);
    List<Attendance> findByTripIdAndStatus(Integer tripId, AttendanceStatus status);
    List<Attendance> findByTripIdAndStudentId(Integer tripId, Integer studentId);
}
