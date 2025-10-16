package com.ct08SWE.SmartBusTracking.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp; // Import annotation mới
import java.time.LocalDateTime; // Import kiểu dữ liệu thời gian mới
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ... các trường cũ giữ nguyên
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(nullable = false)
    private Boolean accountNonLocked = true;

    // --- TRƯỜNG MỚI ĐƯỢC THÊM VÀO ---
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, 
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
    // ------------------------------------
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // --- Constructors ---
    public User() {
    }

    // Constructor đã được cập nhật với trường mới
    public User(Long id, String username, String email, String password, Boolean enabled, Boolean accountNonLocked, LocalDateTime createdAt, Set<Role> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.accountNonLocked = accountNonLocked;
        this.createdAt = createdAt; // Cập nhật
        this.roles = roles;
    }

    // --- Getters and Setters ---
    
    // ... các getter/setter cũ giữ nguyên ...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Boolean getAccountNonLocked() { return accountNonLocked; }
    public void setAccountNonLocked(Boolean accountNonLocked) { this.accountNonLocked = accountNonLocked; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    // Thêm getter/setter cho trường mới
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // --- equals() and hashCode() ---
    // Không cần thay đổi vì createdAt không phải là định danh của đối tượng
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id) && Objects.equals(username, user.username) && Objects.equals(email, user.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, username, email);
    }
    
    // --- toString() ---
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", enabled=" + enabled +
                ", accountNonLocked=" + accountNonLocked +
                ", createdAt=" + createdAt + // Cập nhật
                ", roles=" + roles +
                '}';
    }

    // Builder cũng cần được cập nhật
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String username;
        private String email;
        private String password;
        private Boolean enabled = true;
        private Boolean accountNonLocked = true;
        private LocalDateTime createdAt; // Cập nhật
        private Set<Role> roles = new HashSet<>();
        
        // ... các method của builder ...
        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder enabled(Boolean enabled) { this.enabled = enabled; return this; }
        public UserBuilder accountNonLocked(Boolean accountNonLocked) { this.accountNonLocked = accountNonLocked; return this; }
        public UserBuilder roles(Set<Role> roles) { this.roles = roles; return this; }
        
        // Thêm method cho createdAt (không bắt buộc vì nó tự động)
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            return new User(id, username, email, password, enabled, accountNonLocked, createdAt, roles);
        }
    }
}