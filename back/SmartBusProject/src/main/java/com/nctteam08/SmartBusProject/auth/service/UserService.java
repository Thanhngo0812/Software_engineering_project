package com.nctteam08.SmartBusProject.auth.service;

import com.nctteam08.SmartBusProject.auth.entity.User;
import com.nctteam08.SmartBusProject.auth.repository.UserRepository;

//import io.jsonwebtoken.lang.Arrays;


import java.util.Collections;
import java.util.List;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    

 // QUAN TRỌNG: Phương thức này cho Spring Security
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        
        // DEBUG: Kiểm tra trạng thái user
        System.out.println("=== DEBUG UserService ===");
        System.out.println("Email: " + user.getEmail());
        System.out.println("isLocked: " + user.getIsLocked()); // SỬA: getIsLocked()
//        System.out.println("Will return accountNonLocked: " + !user.getIsLocked());
        
        // Tạo authorities
        String roleWithPrefix = user.getRole().startsWith("ROLE_") ? 
                               user.getRole() : "ROLE_" + user.getRole();
        
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority(roleWithPrefix)
        );
        
        // QUAN TRỌNG: accountNonLocked = !isLocked
        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            authorities
        );
    }
    
    public User createUser( String email,String password,String role) {
        User user = new User();
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole(role);
        user.setIsLocked(0); 
        return userRepository.save(user);
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}