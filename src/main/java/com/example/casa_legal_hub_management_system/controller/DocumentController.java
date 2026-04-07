package com.example.casa_legal_hub_management_system.controller;

import com.example.casa_legal_hub_management_system.model.Document;
import com.example.casa_legal_hub_management_system.repository.ClientRepository;
import com.example.casa_legal_hub_management_system.repository.DocumentRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final ClientRepository clientRepository;

    public DocumentController(DocumentRepository documentRepository,
                               ClientRepository clientRepository) {
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
            Document doc = new Document();
            doc.setFileName(file.getOriginalFilename());
            doc.setFileType(fileType);
            doc.setMimeType(file.getContentType());
            doc.setCategory(category);
            doc.setDescription(description);
            doc.setUploadDate(LocalDate.now());
            doc.setFileData(file.getBytes());

            if (clientId != null) {
                clientRepository.findById(clientId).ifPresent(doc::setClient);
            }

            return ResponseEntity.ok(documentRepository.save(doc));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    // Download file
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        return documentRepository.findById(id).map(doc -> {
            String mimeType = doc.getMimeType() != null
                    ? doc.getMimeType() : "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mimeType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + doc.getFileName() + "\"")
                    .body(doc.getFileData());
        }).orElse(ResponseEntity.notFound().build());
    }

    // View file in browser
    @GetMapping("/view/{id}")
    public ResponseEntity<byte[]> viewDocument(@PathVariable Long id) {
        return documentRepository.findById(id).map(doc -> {
            String mimeType = detectMimeType(doc.getFileName());
            // Override stored mimeType with detected one for accuracy
            if (doc.getMimeType() != null && !doc.getMimeType().equals("application/octet-stream")) {
                mimeType = doc.getMimeType();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mimeType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + doc.getFileName() + "\"")
                    .header("Cache-Control", "no-cache")
                    .body(doc.getFileData());
        }).orElse(ResponseEntity.notFound().build());
    }

    private String detectMimeType(String fileName) {
        if (fileName == null) return "application/octet-stream";
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf"))  return "application/pdf";
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".gif"))  return "image/gif";
        if (lower.endsWith(".txt"))  return "text/plain";
        if (lower.endsWith(".doc"))  return "application/msword";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".xls"))  return "application/vnd.ms-excel";
        if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        return "application/octet-stream";
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentRepository.findById(id).ifPresent(documentRepository::delete);
        return ResponseEntity.ok().build();
    }
}
