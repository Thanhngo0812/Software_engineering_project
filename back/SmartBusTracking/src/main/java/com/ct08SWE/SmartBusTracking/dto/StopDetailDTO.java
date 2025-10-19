package com.ct08SWE.SmartBusTracking.dto;

import java.math.BigDecimal;

public class StopDetailDTO {

    private Integer id;
    private String stopName;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // 1. Constructor rỗng (Rất quan trọng cho Jackson/JSON)
    public StopDetailDTO() {
    }

    // 2. Constructor đầy đủ (Tùy chọn, nhưng hữu ích)
    public StopDetailDTO(Integer id, String stopName, String address, BigDecimal latitude, BigDecimal longitude) {
        this.id = id;
        this.stopName = stopName;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // 3. Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getStopName() {
        return stopName;
    }

    public void setStopName(String stopName) {
        this.stopName = stopName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal bigDecimal) {
        this.latitude = bigDecimal;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }
}