package com.ct08SWE.SmartBusTracking.service;

import org.springframework.stereotype.Service;

import com.ct08SWE.SmartBusTracking.dto.StopRequestDTO;
import com.ct08SWE.SmartBusTracking.dto.StopResponseDTO;
import com.ct08SWE.SmartBusTracking.entity.Stop;
import com.ct08SWE.SmartBusTracking.exception.StopCreationException;
import com.ct08SWE.SmartBusTracking.repository.StopRepository;

@Service
public class StopServiceImpl implements StopService {

    private final StopRepository stopRepository;

    public StopServiceImpl(StopRepository stopRepository) {
        this.stopRepository = stopRepository;
    }

    @Override
    public StopResponseDTO createStop(StopRequestDTO stopRequestDto) {
        try {
            // Chuyển đổi từ DTO sang Entity
            Stop stop = new Stop();
            stop.setStopName(stopRequestDto.getStopName());
            stop.setAddress(stopRequestDto.getAddress());
            stop.setLatitude(stopRequestDto.getLatitude());
            stop.setLongitude(stopRequestDto.getLongitude());

            // Lưu vào CSDL
            Stop savedStop = stopRepository.save(stop);

            // Chuyển đổi từ Entity đã lưu sang Response DTO để trả về
            return new StopResponseDTO(
                savedStop.getId(),
                savedStop.getStopName(),
                savedStop.getAddress(),
                savedStop.getLatitude(),
                savedStop.getLongitude()
            );
        } catch (Exception e) {
            // Bắt các lỗi CSDL tiềm ẩn và ném ra exception tùy chỉnh
            throw new StopCreationException("Không thể tạo trạm dừng mới: " + e.getMessage());
        }
    }
}