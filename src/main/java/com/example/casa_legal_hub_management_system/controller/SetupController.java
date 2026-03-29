package com.example.casa_legal_hub_management_system.controller;

import com.example.casa_legal_hub_management_system.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/setup")
public class SetupController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SetupController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/make-admin")
    public String makeAdmin(@RequestParam String email) {
        return userRepository.findByEmail(email).map(user -> {
            user.setRole("ADMIN");
            userRepository.save(user);
            return "Success! " + email + " is now ADMIN. Please log in.";
        }).orElse("No user found with email: " + email + ". Please register first.");
    }
}
