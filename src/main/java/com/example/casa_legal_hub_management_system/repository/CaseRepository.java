package com.example.casa_legal_hub_management_system.repository;

import com.example.casa_legal_hub_management_system.model.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CaseRepository extends JpaRepository<Case, Long> {
    List<Case> findByClientId(Long clientId);
    List<Case> findByStatus(String status);
    long countByStatus(String status);
    List<Case> findByCaseNumberContainingIgnoreCaseOrCaseTypeContainingIgnoreCase(String caseNumber, String caseType);
}
