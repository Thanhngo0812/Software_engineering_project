package com.ct08SWE.SmartBusTracking.service;

import com.ct08SWE.SmartBusTracking.dto.BusDTO;
import com.ct08SWE.SmartBusTracking.dto.DriverDTO;
import com.ct08SWE.SmartBusTracking.dto.UpdateDriverRequest;
import com.ct08SWE.SmartBusTracking.entity.Bus;
import com.ct08SWE.SmartBusTracking.entity.Driver;
import com.ct08SWE.SmartBusTracking.entity.User;
import com.ct08SWE.SmartBusTracking.exception.ConflictException;
import com.ct08SWE.SmartBusTracking.exception.ResourceNotFoundException;
import com.ct08SWE.SmartBusTracking.repository.BusRepository;
import com.ct08SWE.SmartBusTracking.repository.DriverRepository;
import com.ct08SWE.SmartBusTracking.repository.TripRepository;
import com.ct08SWE.SmartBusTracking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final BusRepository busRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    // 1. Lấy danh sách tài xế
    public List<DriverDTO> getAllDrivers() {
        return driverRepository.findAll().stream().map(driver -> {
            DriverDTO dto = new DriverDTO();
            dto.setId(driver.getId());
            dto.setFullName(driver.getFullName());
            dto.setEmail(driver.getEmail());
            dto.setPhoneNumber(driver.getPhoneNumber());
            dto.setLicenseNumber(driver.getLicenseNumber());
            if (driver.getCreatedAt() != null) {
                dto.setCreatedAt(driver.getCreatedAt().toString());
            }

            if (driver.getUser() != null) {
                dto.setActive(driver.getUser().getAccountNonLocked());
            }

            Optional<Bus> bus = busRepository.findBusByDriverId(driver.getId());
            if (bus.isPresent()) {
                dto.setAssignedBusId(bus.get().getId());
                dto.setAssignedBusLicense(bus.get().getLicensePlate());
            } else {
                dto.setAssignedBusLicense("No Bus");
            }

            return dto;
        }).collect(Collectors.toList());
    }

    // 2. Cập nhật thông tin
    @Transactional
    public DriverDTO updateDriver(Integer id, UpdateDriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        driver.setFullName(request.getFullName());
        driver.setPhoneNumber(request.getPhoneNumber());

        driverRepository.save(driver);
        return getAllDrivers().stream().filter(d -> d.getId().equals(id)).findFirst().orElse(null);
    }

    // 3. Khóa / Mở khóa tài xế
    @Transactional
    public void toggleDriverStatus(Integer id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        User user = driver.getUser();
        if (user == null) return;

        if (user.getAccountNonLocked()) {
            boolean hasActiveTrip = tripRepository.existsActiveTripByDriver(id);
            if (hasActiveTrip) {
                throw new ConflictException("Cannot lock driver while they are on an active trip.");
            }
            user.setAccountNonLocked(false);
        } else {
            user.setAccountNonLocked(true);
        }
        userRepository.save(user);
    }

    // 4. Gán xe cho tài xế
    @Transactional
    public void assignBusToDriver(Integer driverId, Integer busId) {
        // --- CHECK NGHIỆP VỤ: Tài xế đang lái xe thì không được đổi xe ---
        if (tripRepository.existsActiveTripProgressByDriver(driverId)) {
            throw new ConflictException("Cannot assign bus. Driver has an active trip in progress.");
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        // Nếu tài xế đang có xe khác -> Gỡ ra trước
        Optional<Bus> currentBus = busRepository.findBusByDriverId(driverId);
        currentBus.ifPresent(bus -> {
            bus.setPrimaryDriver(null);
            busRepository.save(bus);
        });

        // Tìm xe mới và gán
        Bus newBus = busRepository.findById(busId)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));

        newBus.setPrimaryDriver(driver);
        busRepository.save(newBus);
    }

    // 5. Hủy gán xe (Unassign)
    @Transactional
    public void unassignBus(Integer driverId) {
        // --- CHECK NGHIỆP VỤ: Tài xế đang lái xe thì không được gỡ xe ---
        if (tripRepository.existsActiveTripProgressByDriver(driverId)) {
            throw new ConflictException("Cannot unassign bus. Driver has an active trip in progress.");
        }

        Optional<Bus> bus = busRepository.findBusByDriverId(driverId);
        if (bus.isPresent()) {
            Bus b = bus.get();
            b.setPrimaryDriver(null);
            busRepository.save(b);
        }
    }

    // 6. Lấy danh sách xe bus rảnh
    public List<BusDTO> getAvailableBuses() {
        return busRepository.findAllAvailableBuses().stream().map(bus -> {
            BusDTO dto = new BusDTO();
            dto.setId(bus.getId());
            dto.setLicensePlate(bus.getLicensePlate());
            dto.setModel(bus.getModel());
            dto.setCapacity(bus.getCapacity());
            return dto;
        }).collect(Collectors.toList());
    }
}