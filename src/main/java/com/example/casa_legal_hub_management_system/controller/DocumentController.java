package com.example.casa_legal_hub_management_system.controller;

import com.example.casa_legal_hub_management_system.model.Client;
import com.example.casa_legal_hub_management_system.model.Document;
import com.example.casa_legal_hub_management_system.repository.ClientRepository;
import com.example.casa_legal_hub_management_system.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final ClientRepository clientRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public DocumentController(DocumentRepository documentRepository, ClientRepository clientRepository) {
        this.documentRepository = documentRepository;
        this.clientRepository = clientRepository;
    }

    @GetMapping
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @GetMapping("/category/{category}")
    public List<Document> getByCategory(@PathVariable String category) {
        return documentRepository.findByCategory(category);
    }

    @GetMapping("/client/{clientId}")
    public List<Document> getDocumentsByClient(@PathVariable Long clientId) {
        return documentRepository.findByClientId(clientId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category,
            @RequestParam(value = "clientId", required = false) Long clientId,
            @RequestParam(value = "fileType", required = false, defaultValue = "Other") String fileType,
            @RequestParam(value = "description", required = false) String description) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        try {
            // Create uploads directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // Generate unique filename to avoid conflicts
            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : "";
            String storedName = UUID.randomUUID().toString() + extension;
            Path targetPath = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Save document record
            Document doc = new Document();
            doc.setFileName(originalName);
            doc.setFileType(fileType);
            doc.setFilePath(storedName);
            doc.setCategory(category);
            doc.setDescription(description);
            doc.setUploadDate(LocalDate.now());

            if (clientId != null) {
                clientRepository.findById(clientId).ifPresent(doc::setClient);
            }

            return ResponseEntity.ok(documentRepository.save(doc));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(doc.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + doc.getFileName() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentRepository.findById(id).ifPresent(doc -> {
            // Delete physical file
            try {
                Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(doc.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {}
            documentRepository.delete(doc);
        });
        return ResponseEntity.ok().build();
    }
}
