package com.ct08SWE.SmartBusTracking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Áp dụng cho tất cả endpoint bắt đầu bằng /api/
        .allowedOrigins("http://localhost:3000") // Cho phép frontend của bạn
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức cho phép
        .allowedHeaders("*") // Cho phép tất cả các header (bao gồm Authorization)
        .allowCredentials(true);
    }
}