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

	    // Các dependency cần thiết sẽ được Spring tự động inject vào
	    public GetStopResponseMapper(RouteStopsRepository routeStopsRepository) {
	        this.routeStopsRepository = routeStopsRepository;
	        this.formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy - hh:mm a", Locale.ENGLISH);
	    }

	    /**
	     * Chuyển đổi một đối tượng Stop (Entity) sang StopResponseDto.
	     *
	     * @param stop Entity Stop cần chuyển đổi.
	     * @return Đối tượng StopResponseDto tương ứng.
	     */
	    public GetStopsResponse toStopResponseDto(Stop stop) {
	        if (stop == null) {
	            return null;
	        }

	        // Đếm số lượng tuyến đường liên kết với trạm dừng này
	        long routeCount = routeStopsRepository.countByStopId(stop.getId());

	        // Định dạng ngày tạo theo yêu cầu của frontend
	        String formattedDate = stop.getCreatedAt() != null ? stop.getCreatedAt().format(formatter) : "N/A";

	        // Tạo và trả về DTO mới
	        return new GetStopsResponse(
	            stop.getId(),
	            stop.getStopName(),
	            stop.getAddress(),
	            routeCount,
	            formattedDate
	        );
	    }
}
