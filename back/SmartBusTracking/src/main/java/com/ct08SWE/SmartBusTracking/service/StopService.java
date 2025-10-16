package com.ct08SWE.SmartBusTracking.service;

import com.ct08SWE.SmartBusTracking.dto.StopRequestDTO;
import com.ct08SWE.SmartBusTracking.dto.StopResponseDTO;

public interface StopService {
    StopResponseDTO createStop(StopRequestDTO stopRequestDto);
}

