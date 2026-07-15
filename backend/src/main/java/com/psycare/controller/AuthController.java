package com.psycare.controller;

import com.psycare.config.JwtTokenProvider;
import com.psycare.model.Role;
import com.psycare.model.User;
import com.psycare.model.Client;
import com.psycare.repository.UserRepository;
import com.psycare.service.ClientService;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClientService clientService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostConstruct
    public void initDefaultPsychologist() {
        if (!userRepository.existsByUsername("psychologist")) {
            User psycho = User.builder()
                    .username("psychologist")
                    .password(passwordEncoder.encode("password123"))
                    .email("dr.psycare@example.com")
                    .role(Role.ROLE_PSYCHOLOGIST)
                    .build();
            userRepository.save(psycho);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();

        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt, user.getUsername(), user.getRole().name(), user.getId()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email Address already in use!");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .email(registerRequest.getEmail())
                .role(Role.valueOf(registerRequest.getRole()))
                .build();

        User savedUser = userRepository.save(user);

        // If registering a client, initialize their client profile automatically
        if (savedUser.getRole() == Role.ROLE_CLIENT) {
            Client client = Client.builder()
                    .user(savedUser)
                    .firstName(registerRequest.getFirstName() != null ? registerRequest.getFirstName() : savedUser.getUsername())
                    .lastName(registerRequest.getLastName() != null ? registerRequest.getLastName() : "Client")
                    .email(savedUser.getEmail())
                    .build();
            clientService.saveClient(client);
        }

        return ResponseEntity.ok("User registered successfully");
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JwtAuthenticationResponse {
        private String accessToken;
        private String tokenType = "Bearer";
        private String username;
        private String role;
        private Long userId;

        public JwtAuthenticationResponse(String accessToken, String username, String role, Long userId) {
            this.accessToken = accessToken;
            this.username = username;
            this.role = role;
            this.userId = userId;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        private String role; // ROLE_PSYCHOLOGIST or ROLE_CLIENT
        private String firstName;
        private String lastName;
    }
}
