package com.example.casa_legal_hub_management_system.repository;

import com.example.casa_legal_hub_management_system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
