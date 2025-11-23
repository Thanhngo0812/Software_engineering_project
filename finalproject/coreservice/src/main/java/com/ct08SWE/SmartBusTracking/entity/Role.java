package com.ct08SWE.SmartBusTracking.entity;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private RoleEnum name;
    
    public enum RoleEnum {
        ROLE_STUDENT,
        ROLE_SCHOOL,
        ROLE_ADMIN,
        ROLE_DRIVER
    }

    // --- Constructors (thay thế @NoArgsConstructor và @AllArgsConstructor) ---
    public Role() {
    }

    public Role(Long id, RoleEnum name) {
        this.id = id;
        this.name = name;
    }

    // --- Getters and Setters (thay thế một phần của @Data) ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RoleEnum getName() {
        return name;
    }

    public void setName(RoleEnum name) {
        this.name = name;
    }

    // --- equals() and hashCode() (thay thế một phần của @Data) ---
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        return Objects.equals(id, role.id) && name == role.name;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }

    // --- toString() (thay thế một phần của @Data) ---
    @Override
    public String toString() {
        return "Role{" +
                "id=" + id +
                ", name=" + name +
                '}';
    }
}