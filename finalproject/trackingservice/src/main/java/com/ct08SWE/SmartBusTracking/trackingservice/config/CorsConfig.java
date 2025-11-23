package com.ct08SWE.SmartBusTracking.trackingservice.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho tất cả các đường dẫn
                .allowedOrigins("http://localhost:3000") // Chỉ cho phép Frontend React này
                // .allowedOrigins("*") // Hoặc dùng cái này nếu muốn cho phép tất cả (không an toàn lắm nhưng tiện khi dev)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các method cho phép
                .allowedHeaders("*") // Cho phép mọi Header (quan trọng để gửi Token)
                .allowCredentials(true); // Cho phép gửi Cookie/Auth Header
    }
}