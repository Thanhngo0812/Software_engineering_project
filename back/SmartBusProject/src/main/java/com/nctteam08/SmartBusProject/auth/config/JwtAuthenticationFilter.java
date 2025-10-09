package com.nctteam08.SmartBusProject.auth.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nctteam08.SmartBusProject.auth.security.JwtUtil;
import com.nctteam08.SmartBusProject.auth.service.UserService;

import io.jsonwebtoken.ExpiredJwtException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserService userService;
    
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }
    


    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt)) {
                if (jwtUtil.validateToken(jwt)) {
                    // Token hợp lệ và chưa hết hạn
                    String email = jwtUtil.getUsernameFromToken(jwt);
                    String role = jwtUtil.getRoleFromToken(jwt);
                    
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority(role)
                    );
                    
                    UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                        email, "", authorities
                    );
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities
                        );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                } else {
                    // Token không hợp lệ hoặc đã hết hạn
                    handleInvalidToken(response, "Token has expired or is invalid");
                    return;
                }
            }
        } catch (ExpiredJwtException e) {
            handleInvalidToken(response, "Token has expired");
            return;
        } catch (Exception ex) {
            logger.error("Authentication error", ex);
            handleInvalidToken(response, "Authentication failed");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    private void handleInvalidToken(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Unauthorized");
        errorResponse.put("message", message);
        errorResponse.put("status", 401);
        errorResponse.put("timestamp", new Date());
        
        response.getWriter().write(new ObjectMapper().writeValueAsString(errorResponse));
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}