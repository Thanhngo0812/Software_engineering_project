package com.ct08SWE.SmartBusTracking.dto;

import java.util.Objects;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private String username;
    private String email;

    // --- Constructors (thay thế một phần của @Data) ---

    public AuthResponse() {
    }

    public AuthResponse(String token, String type, String username, String email) {
        this.token = token;
        this.type = type;
        this.username = username;
        this.email = email;
    }

    // --- Getters and Setters (thay thế một phần của @Data) ---

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // --- equals() and hashCode() (thay thế một phần của @Data) ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuthResponse that = (AuthResponse) o;
        return Objects.equals(token, that.token) &&
               Objects.equals(type, that.type) &&
               Objects.equals(username, that.username) &&
               Objects.equals(email, that.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(token, type, username, email);
    }
    
    // --- toString() (thay thế một phần của @Data) ---

    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='" + token + '\'' +
                ", type='" + type + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                '}';
    }

    // --- Builder (thay thế @Builder) ---

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String type = "Bearer";
        private String username;
        private String email;

        AuthResponseBuilder() {
        }

        public AuthResponseBuilder token(String token) {
            this.token = token;
            return this;
        }

        public AuthResponseBuilder type(String type) {
            this.type = type;
            return this;
        }

        public AuthResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public AuthResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(token, type, username, email);
        }
    }
}