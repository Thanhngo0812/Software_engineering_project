package com.nctteam08.SmartBusProject.auth.dto;

public class LoginResponseDTO {
    private String token;
    private String type = "Bearer";
    private String email;
    private Integer isLocked;

    public LoginResponseDTO(String token, String email,Integer isLocked) {
        this.token = token;
        this.email = email;
    }

    // Getters and Setters
    public Integer getisLocked() { return isLocked; }
    public void setToken(Integer isLocked) { this.isLocked = isLocked; }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}