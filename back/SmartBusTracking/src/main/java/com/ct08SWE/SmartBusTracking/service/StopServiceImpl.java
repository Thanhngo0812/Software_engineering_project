package com.ct08SWE.SmartBusTracking.service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ct08SWE.SmartBusTracking.dto.GetStopsResponse;
import com.ct08SWE.SmartBusTracking.dto.StopDetailDTO;
import com.ct08SWE.SmartBusTracking.dto.StopRequestDTO;
import com.ct08SWE.SmartBusTracking.dto.StopResponseDTO;
import com.ct08SWE.SmartBusTracking.entity.Stop;
import com.ct08SWE.SmartBusTracking.exception.ResourceNotFoundException;
import com.ct08SWE.SmartBusTracking.exception.StopCreationException;
import com.ct08SWE.SmartBusTracking.mapper.GetStopResponseMapper;
import com.ct08SWE.SmartBusTracking.mapper.StopDetailDTOMapper;
import com.ct08SWE.SmartBusTracking.repository.RouteStopsRepository;
import com.ct08SWE.SmartBusTracking.repository.StopRepository;

@Service
public class StopServiceImpl implements StopService {

    private final StopRepository stopRepository;
    private final RouteStopsRepository routeStopsRepository;
    private final DateTimeFormatter formatter;
    private final GetStopResponseMapper getStopResponseMapper;
    private final StopDetailDTOMapper stopMapper;
    public StopServiceImpl(StopRepository stopRepository, RouteStopsRepository routeStopsRepository,GetStopResponseMapper getStopResponseMapper,StopDetailDTOMapper stopMapper) {
        this.stopRepository = stopRepository;
        this.routeStopsRepository = routeStopsRepository;
        // Formatter để khớp với giao diện frontend: "March 15, 2025 - 10:15 PM"
        this.formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy - hh:mm a", Locale.ENGLISH);
        this.getStopResponseMapper=getStopResponseMapper;
        this.stopMapper=stopMapper;
    }

    @Override
    public Page<GetStopsResponse> getAllStops(String query, Pageable pageable) {
        Page<Stop> stopPage;
        
        if (query == null || query.trim().isEmpty()) {
            stopPage = stopRepository.findAll(pageable);
        } else {
            stopPage = stopRepository.findByNameOrAddressContainingIgnoreCase(query, pageable);
        }

        // Dòng này có nghĩa là: "Với mỗi 'stop' trong 'stopPage',
        // hãy gọi phương thức 'toStopResponseDto' của 'stopMapper' với 'stop' đó"
        return stopPage.map(getStopResponseMapper::toStopResponseDto); 
    }

    /**
     * Lấy thông tin chi tiết của Stop bằng ID.
     *
     * @param id ID của stop.
     * @return StopDetailDTO.
     * @throws ResourceNotFoundException nếu không tìm thấy stop với ID này.
     */
    @Override
    public StopDetailDTO getStopDetailsById(Long id) {
        Stop stop = stopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("cannot find stop with id: " + id));

        // Chuyển đổi từ Entity (Stop) sang DTO (StopDetailDTO)
        StopDetailDTO dto = stopMapper.toStopDetailDTO(stop);
        return dto;
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
        } catch (DataIntegrityViolationException ex) {
            // Kiểm tra xem có phải lỗi unique constraint không (có thể check message)
            if (ex.getRootCause() != null && ex.getRootCause().getMessage().contains("unique_stop_name")) {
                throw new StopCreationException("Stop name already exists");
            }
            throw new StopCreationException("Database error: " + ex.getMessage());
        } catch (Exception e) {
            throw new StopCreationException("Không thể tạo trạm dừng mới: " + e.getMessage());
        }
    }
    
    public boolean deleteStop(Long stopId) throws ResourceNotFoundException {
        Stop stop = stopRepository.findById(stopId)
                    .orElseThrow(() -> new ResourceNotFoundException("Stop không tồn tại với ID: " + stopId));

        // GIẢ SỬ Stop có một list các StopRoute liên kết
        // VÀ stop.getStopRoutes() TRẢ VỀ DANH SÁCH CÁC LIÊN KẾT

        if (stop.getRouteStops() != null && !stop.getRouteStops().isEmpty()) {
            // Stop có liên kết (StopRoute), KHÔNG CHO PHÉP XÓA
            return false;
        }

        // Không có liên kết, TIẾN HÀNH XÓA
        stopRepository.delete(stop);
        return true;
    }

}