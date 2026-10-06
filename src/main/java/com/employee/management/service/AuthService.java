package com.employee.management.service;

import com.employee.management.dto.AuthResponse;
import com.employee.management.dto.LoginRequest;
import com.employee.management.dto.RegisterRequest;
import com.employee.management.entity.User;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.repository.UserRepository;
import com.employee.management.security.CustomUserDetailsService;
import com.employee.management.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        String trimmedUsername = request.username().trim();
        String trimmedEmail = request.email().trim();

        if (userRepository.existsByUsername(trimmedUsername)) {
            throw new DuplicateResourceException("Username '" + trimmedUsername + "' is already taken.");
        }

        if (userRepository.existsByEmail(trimmedEmail)) {
            throw new DuplicateResourceException("Email '" + trimmedEmail + "' is already registered.");
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = new User(trimmedUsername, trimmedEmail, encodedPassword, "USER");
        userRepository.save(user);

        return Map.of(
                "message", "User registered successfully",
                "username", trimmedUsername
        );
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.username().trim(),
                            request.password()
                    )
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username().trim());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, "Bearer", jwtService.getExpirationInSeconds());
    }
}
