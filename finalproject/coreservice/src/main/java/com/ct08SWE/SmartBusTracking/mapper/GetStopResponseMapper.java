package com.ct08SWE.SmartBusTracking.mapper;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.stereotype.Component;

import com.ct08SWE.SmartBusTracking.dto.GetStopsResponse;
import com.ct08SWE.SmartBusTracking.entity.Stop;
import com.ct08SWE.SmartBusTracking.repository.RouteStopsRepository;

@Component
public class GetStopResponseMapper {

    private final RouteStopsRepository routeStopsRepository;
    private final DateTimeFormatter formatter;

    public GetStopResponseMapper(RouteStopsRepository routeStopsRepository) {
        this.routeStopsRepository = routeStopsRepository;
        this.formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy - hh:mm a", Locale.ENGLISH);
    }

    /**
     * Chuyển đổi một đối tượng Stop (Entity) sang StopResponseDto.
     */
    public GetStopsResponse toStopResponseDto(Stop stop) {
        if (stop == null) {
            return null;
        }

        // Đếm số lượng tuyến đường liên kết với trạm dừng này
        long routeCount = routeStopsRepository.countByStopId(stop.getId());

        // Định dạng ngày tạo
        String formattedDate = stop.getCreatedAt() != null ? stop.getCreatedAt().format(formatter) : "N/A";

        // Xử lý tọa độ (Chuyển BigDecimal sang Double nếu cần, hoặc null-safe)
        Double latitude = stop.getLatitude() != null ? stop.getLatitude().doubleValue() : null;
        Double longitude = stop.getLongitude() != null ? stop.getLongitude().doubleValue() : null;

        // Tạo và trả về DTO mới (Cần cập nhật constructor DTO)
        return new GetStopsResponse(
                stop.getId(),
                stop.getStopName(),
                stop.getAddress(),
                routeCount,
                formattedDate,
                latitude,  // <-- Thêm trường này
                longitude  // <-- Thêm trường này
        );
    }
}