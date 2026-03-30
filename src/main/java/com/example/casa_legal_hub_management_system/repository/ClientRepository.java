package com.example.casa_legal_hub_management_system.repository;

import com.example.casa_legal_hub_management_system.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {

    List<Client> findByFullNameContainingIgnoreCase(String keyword);

    Optional<Client> findByIdNumber(String idNumber);

    boolean existsByIdNumber(String idNumber);
}