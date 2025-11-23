package com.ct08SWE.SmartBusTracking.dto;

import java.math.BigDecimal;

//DTO này dùng để trả dữ liệu về cho client sau khi tạo thành công
public class StopResponseDTO {

 private Integer id;
 private String stopName;
 private String address;
 private BigDecimal latitude;
 private BigDecimal longitude;
 
 // Constructors
 public StopResponseDTO() {}

 public StopResponseDTO(Integer id, String stopName, String address, BigDecimal latitude, BigDecimal longitude) {
     this.id = id;
     this.stopName = stopName;
     this.address = address;
     this.latitude = latitude;
     this.longitude = longitude;
 }

 // Getters and Setters
 public Integer getId() { return id; }
 public void setId(Integer id) { this.id = id; }
 public String getStopName() { return stopName; }
 public void setStopName(String stopName) { this.stopName = stopName; }
 public String getAddress() { return address; }
 public void setAddress(String address) { this.address = address; }
 public BigDecimal getLatitude() { return latitude; }
 public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
 public BigDecimal getLongitude() { return longitude; }
 public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
}

