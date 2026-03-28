package com.example.casa_legal_hub_management_system.repository;

import com.example.casa_legal_hub_management_system.model.Finance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FinanceRepository extends JpaRepository<Finance, Long> {
    List<Finance> findByClientId(Long clientId);
    List<Finance> findByStatus(String status);
    List<Finance> findByStatusIn(List<String> statuses);
    long countByStatus(String status);
}
