package com.example.casa_legal_hub_management_system.repository;

import com.example.casa_legal_hub_management_system.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByClientId(Long clientId);
    List<Document> findByCategory(String category);
}
