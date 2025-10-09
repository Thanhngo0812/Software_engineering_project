package com.nctteam08.SmartBusProject.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;



@Entity
@Table(name = "users")
public class User  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String role;
    
    @Column(name = "is_locked", nullable = false)
    private Integer isLocked = 0;
    // Getters and Setters
    // Getter cho Boolean (convenience method)
    // Getter cho Integer (cần cho JPA)
    public Integer getIsLocked() {
        return isLocked;
    }

    // Setter cho Integer (cần cho JPA)
    public void setIsLocked(Integer isLocked) {
        this.isLocked = isLocked;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
	

}
