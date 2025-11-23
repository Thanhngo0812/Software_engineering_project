package com.ct08SWE.SmartBusTracking.repository;

import com.ct08SWE.SmartBusTracking.entity.Attendance;
import com.ct08SWE.SmartBusTracking.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByTripId(Integer tripId);
    List<Attendance> findByStudentId(Integer studentId);
    List<Attendance> findByStopId(Integer stopId);
    List<Attendance> findByTripIdAndStatus(Integer tripId, AttendanceStatus status);
    List<Attendance> findByTripIdAndStudentId(Integer tripId, Integer studentId);
    // --- QUERY CẦN THÊM ---
    // Tìm chuyến đi ĐANG CHẠY (IN_PROGRESS) hoặc SẮP CHẠY (SCHEDULED) trong hôm nay của học sinh
    @Query("""
SELECT a.trip.id FROM Attendance a
WHERE a.student.id = :studentId
AND a.trip.status IN ('in_progress', 'scheduled')
ORDER BY a.trip.status ASC
""")
    List<Integer> findActiveTripIdByStudent(@Param("studentId") Integer studentId,
                                                @Param("today") LocalDate today);
}
