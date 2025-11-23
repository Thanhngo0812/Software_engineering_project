package com.ct08SWE.SmartBusTracking.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

// DTO này dùng để nhận dữ liệu từ client khi tạo một Stop mới
public class StopRequestDTO {

    @NotBlank(message = "Stop name must no be blank.")
    private String stopName;
    
    @NotBlank(message = "Address name must no be blank.")
    private String address;

    @NotNull(message = "latitude must no be blank")
    @DecimalMin(value = "-90.0", message = "Vĩ độ phải lớn hơn hoặc bằng -90")
    @DecimalMax(value = "90.0", message = "Vĩ độ phải nhỏ hơn hoặc bằng 90")
    private BigDecimal latitude;

    @NotNull(message = "longtitude must no be blank")
    @DecimalMin(value = "-180.0", message = "Kinh độ phải lớn hơn hoặc bằng -180")
    @DecimalMax(value = "180.0", message = "Kinh độ phải nhỏ hơn hoặc bằng 180")
    private BigDecimal longitude;
    
    // Constructors
    public StopRequestDTO() {}

    // Getters and Setters
    public String getStopName() { return stopName; }
    public void setStopName(String stopName) { this.stopName = stopName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
}
