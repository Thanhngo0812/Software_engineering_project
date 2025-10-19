package com.ct08SWE.SmartBusTracking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stops")
public class Stop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "stop_name", nullable = false, unique=true)
    private String stopName;
    
    @Column(name = "address", columnDefinition = "TEXT", nullable = false)
    private String address;
    
    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "pickupStop")
    private List<Student> pickupStudents = new ArrayList<>();
    
    @OneToMany(mappedBy = "dropoffStop")
    private List<Student> dropoffStudents = new ArrayList<>();
    
    @OneToMany(mappedBy = "stop")
    private List<RouteStop> routeStops = new ArrayList<>();
    
    @OneToMany(mappedBy = "stop")
    private List<Attendance> attendances = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Stop() {
    }
    
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
    
    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }
    
    public BigDecimal getLongitude() {
        return longitude;
    }
    
    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<Student> getPickupStudents() {
        return pickupStudents;
    }
    
    public void setPickupStudents(List<Student> pickupStudents) {
        this.pickupStudents = pickupStudents;
    }
    
    public List<Student> getDropoffStudents() {
        return dropoffStudents;
    }
    
    public void setDropoffStudents(List<Student> dropoffStudents) {
        this.dropoffStudents = dropoffStudents;
    }
    
    public List<RouteStop> getRouteStops() {
        return routeStops;
    }
    
    public void setRouteStops(List<RouteStop> routeStops) {
        this.routeStops = routeStops;
    }
    
    public List<Attendance> getAttendances() {
        return attendances;
    }
    
    public void setAttendances(List<Attendance> attendances) {
        this.attendances = attendances;
    }
}