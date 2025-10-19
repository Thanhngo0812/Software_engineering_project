package com.ct08SWE.SmartBusTracking.mapper;

import com.ct08SWE.SmartBusTracking.dto.StopDetailDTO;
import com.ct08SWE.SmartBusTracking.entity.Stop;
import org.springframework.stereotype.Component;

/**
 * Spring Bean này chịu trách nhiệm ánh xạ (mapping) 
 * từ Entity {@link Stop} sang {@link StopDetailDTO}.
 * Tên bean được chỉ định rõ là "StopDetailDTOMapper".
 */
@Component("StopDetailDTOMapper") // Chỉ định tên bean một cách rõ ràng
public class StopDetailDTOMapper {

    /**
     * Chuyển đổi một đối tượng Stop (Entity) sang StopDetailDTO.
     *
     * @param stop Đối tượng Stop entity từ cơ sở dữ liệu.
     * @return Một đối tượng StopDetailDTO chứa dữ liệu đã được ánh xạ.
     */
    public StopDetailDTO toStopDetailDTO(Stop stop) {
        if (stop == null) {
            return null;
        }

        StopDetailDTO dto = new StopDetailDTO();
        
        dto.setId(stop.getId());
        dto.setStopName(stop.getStopName()); // Giả sử tên trường giống nhau
        dto.setAddress(stop.getAddress());
        dto.setLatitude(stop.getLatitude());
        dto.setLongitude(stop.getLongitude());
        
        // Thêm bất kỳ logic ánh xạ phức tạp nào khác ở đây
        // Ví dụ: dto.setRouteCount(stop.getRoutes().size());

        return dto;
    }

    // Bạn cũng có thể thêm các hàm map ngược lại hoặc map danh sách ở đây
    // public Stop toStop(StopDetailDTO dto) { ... }
}
