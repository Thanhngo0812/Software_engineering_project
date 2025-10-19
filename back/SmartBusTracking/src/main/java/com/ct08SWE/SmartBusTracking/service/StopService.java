package com.ct08SWE.SmartBusTracking.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ct08SWE.SmartBusTracking.dto.GetStopsResponse;
import com.ct08SWE.SmartBusTracking.dto.StopDetailDTO;
import com.ct08SWE.SmartBusTracking.dto.StopRequestDTO;
import com.ct08SWE.SmartBusTracking.dto.StopResponseDTO;
import com.ct08SWE.SmartBusTracking.mapper.StopDetailDTOMapper;

public interface StopService {
    StopResponseDTO createStop(StopRequestDTO stopRequestDto);
    /**
     * Lấy về một danh sách các trạm dừng đã được phân trang
     * và lọc theo từ khóa tìm kiếm.
     *
     * @param query Từ khóa để tìm kiếm theo tên hoặc địa chỉ của trạm dừng.
     * @param pageable Thông tin phân trang (số trang, kích thước trang).
     * @return Một đối tượng Page chứa danh sách StopResponseDto.
     */
    Page<GetStopsResponse> getAllStops(String query, Pageable pageable);
    boolean deleteStop(Long stopId);
    // Trong tương lai, bạn có thể thêm các định nghĩa hàm khác ở đây
    // ví dụ: StopResponseDto createStop(StopRequestDto stopRequest);
    //        void deleteStop(int id);
    StopDetailDTO getStopDetailsById(Long id);

}

