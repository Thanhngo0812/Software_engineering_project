package com.nctteam08.SmartBusProject.auth.controller;

import com.nctteam08.SmartBusProject.auth.dto.LoginRequestDTO;
import com.nctteam08.SmartBusProject.auth.dto.LoginResponseDTO;
import com.nctteam08.SmartBusProject.auth.dto.RegisterRequestDTO;
import com.nctteam08.SmartBusProject.auth.entity.User;
import com.nctteam08.SmartBusProject.auth.security.JwtUtil;
import com.nctteam08.SmartBusProject.auth.service.UserService;

//import io.jsonwebtoken.lang.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.authentication.DisabledException;
//import org.springframework.security.core.AuthenticationException;
//import org.springframework.http.HttpStatus;
import java.util.Collections;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
    	try {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(authentication);
        
        User user = userService.findByEmail(loginRequest.getEmail());
        
        return ResponseEntity.ok(new LoginResponseDTO(
            jwt, 
            user.getEmail(),
            user.getIsLocked()
        ));
    } catch (LockedException e) {
        // Lỗi 1: Tài khoản bị vô hiệu hóa (Disabled/Locked/Expired)
        // Trả về HTTP 403 FORBIDDEN hoặc 401 UNAUTHORIZED
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(Collections.singletonMap("message", "Tài khoản của bạn đã bị vô hiệu hóa."));
            
    } catch (BadCredentialsException e) {
        // Lỗi 2: Sai Tên người dùng hoặc Sai Mật khẩu
        // Spring Security sẽ ném BadCredentialsException cho cả hai trường hợp này
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED) // HTTP 401 UNAUTHORIZED
            .body(Collections.singletonMap("message", "Tên đăng nhập hoặc mật khẩu không chính xác."));
            
    } catch (AuthenticationException e) {
        // Lỗi 3: Bắt các ngoại lệ xác thực khác
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED) // HTTP 401 UNAUTHORIZED
            .body(Collections.singletonMap("message", "Xác thực thất bại. Vui lòng thử lại."));
    }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO registerRequest) {
        if (userService.findByEmail(registerRequest.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        
        User user = userService.createUser(
        		registerRequest.getEmail(),
            registerRequest.getPassword(),
            "ROLE_"+registerRequest.getRole() 
        );
        
        return ResponseEntity.ok("User registered successfully");
    }
}