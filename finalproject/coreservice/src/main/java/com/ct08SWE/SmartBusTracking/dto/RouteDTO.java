package com.ct08SWE.SmartBusTracking.dto;


import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RouteDTO {
    private Integer id;
    private String routeName;
    private String description;
    private Integer stopCount;    // Số lượng trạm (để hiển thị list)
    private boolean inUse;        // Cờ báo hiệu route này có đang chạy trip nào không
    private LocalDateTime createdAt;
    // Dùng cho chi tiết (Detail)
    private List<RouteStopDTO> routeStops;

    @Data
    public static class RouteStopDTO {
        private Integer stopId;
        private Integer stopOrder;
        private StopInfoDTO stop; // Thông tin chi tiết trạm (tên, địa chỉ)
    }

    @Data
    public static class StopInfoDTO {
        private Integer id;
        private String name;
        private String address;
        private Double latitude;
        private Double longitude;
    }
}
