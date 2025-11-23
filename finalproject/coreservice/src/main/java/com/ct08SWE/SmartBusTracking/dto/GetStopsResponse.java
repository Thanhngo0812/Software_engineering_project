package com.ct08SWE.SmartBusTracking.dto;


/**
 * DTO for sending Stop information to the client, matching the frontend table structure.
 * This prevents exposing the full JPA entity.
 */
public class GetStopsResponse {

    private int id;
    private String name; // Renamed from stopName
    private String address;
    private long routes; // Number of routes associated with this stop
    private String created; // Formatted date string
    private Double latitude;
    private Double longitude;
    // Constructors
    public GetStopsResponse() {
    }

    public GetStopsResponse(int id, String name, String address, long routes, String created, Double latitude, Double longitude) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.routes = routes;
        this.created = created;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public long getRoutes() {
        return routes;
    }

    public void setRoutes(long routes) {
        this.routes = routes;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
