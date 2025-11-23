package com.ct08SWE.SmartBusTracking.service;

import com.ct08SWE.SmartBusTracking.dto.BusDTO;
import com.ct08SWE.SmartBusTracking.dto.BusRequest;
import com.ct08SWE.SmartBusTracking.entity.Bus;
import com.ct08SWE.SmartBusTracking.exception.ConflictException;
import com.ct08SWE.SmartBusTracking.exception.ResourceNotFoundException;
import com.ct08SWE.SmartBusTracking.repository.BusRepository;
import com.ct08SWE.SmartBusTracking.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusService {
    private final SchoolRepository schoolRepository;
    private final BusRepository busRepository;

    // 1. Lấy danh sách
    public List<BusDTO> getAllBuses() {
        return busRepository.findAll().stream().map(bus -> {
            BusDTO dto = new BusDTO();
            dto.setId(bus.getId());
            dto.setLicensePlate(bus.getLicensePlate());
            dto.setModel(bus.getModel());
            dto.setCapacity(bus.getCapacity());

            if (bus.getPrimaryDriver() != null) {
                dto.setPrimaryDriverId(bus.getPrimaryDriver().getId());
                dto.setPrimaryDriverName(bus.getPrimaryDriver().getFullName());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    // 2. Thêm xe mới
    @Transactional
    public BusDTO createBus(BusRequest request) {
        Bus bus = new Bus();
        bus.setLicensePlate(request.getLicensePlate());
        bus.setModel(request.getModel());
        bus.setCapacity(request.getCapacity());
        bus.setSchool(schoolRepository.getReferenceById(1));

        Bus saved = busRepository.save(bus);
        return mapToDTO(saved);
    }

    // --- CHỨC NĂNG MỚI: SỬA XE ---
    @Transactional
    public BusDTO updateBus(Integer id, BusRequest request) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));

        // --- CHECK NGHIỆP VỤ: Không được sửa xe đang có tài xế ---
        if (bus.getPrimaryDriver() != null) {
            throw new ConflictException("Cannot edit bus information while it is assigned to a driver. Please unassign the driver first.");
        }

        bus.setLicensePlate(request.getLicensePlate());
        bus.setModel(request.getModel());
        bus.setCapacity(request.getCapacity());

        Bus saved = busRepository.save(bus);
        return mapToDTO(saved);
    }

    // 3. Xóa xe
    @Transactional
    public void deleteBus(Integer id) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));

        if (bus.getPrimaryDriver() != null) {
            throw new ConflictException("Cannot delete bus. It is currently assigned to driver: " + bus.getPrimaryDriver().getFullName());
        }

        busRepository.delete(bus);
    }

    private BusDTO mapToDTO(Bus bus) {
        BusDTO dto = new BusDTO();
        dto.setId(bus.getId());
        dto.setLicensePlate(bus.getLicensePlate());
        dto.setModel(bus.getModel());
        dto.setCapacity(bus.getCapacity());
        return dto;
    }
}