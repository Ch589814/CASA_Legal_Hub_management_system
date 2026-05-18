package com.example.casa_legal_hub_management_system.config;

import com.example.casa_legal_hub_management_system.model.User;
import com.example.casa_legal_hub_management_system.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // 👉 CHANGE THIS EMAIL TO YOUR REAL EMAIL
        String adminEmail = "clemantineumutesi063@gmail.com";

        User admin = userRepository.findByEmail(adminEmail).orElse(null);

        if (admin == null) {
            admin = new User();
            admin.setEmail(adminEmail);
            admin.setFullName("System Administrator");
        }

        // Always ensure admin credentials are correct
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");
        admin.setStatus("Active");

        userRepository.save(admin);

        System.out.println("✅ ADMIN READY: " + adminEmail + " / admin123");
    }
}