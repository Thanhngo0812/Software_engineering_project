package com.ct08SWE.SmartBusTracking.trackingservice.repository;


import com.ct08SWE.SmartBusTracking.trackingservice.entity.LocationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationHistoryRepository extends JpaRepository<LocationHistory, Long> {

    // Tìm lịch sử di chuyển của một chuyến đi, sắp xếp theo thời gian
    List<LocationHistory> findByTripIdOrderByTimestampAsc(Integer tripId);
}