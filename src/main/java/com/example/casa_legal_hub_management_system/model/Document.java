package com.example.casa_legal_hub_management_system.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;
    private String mimeType;
    private String category = "Client Document";

    @Column(length = 500)
    private String description;

    private LocalDate uploadDate = LocalDate.now();

    @Lob
    @JsonIgnore
    @Column(columnDefinition = "bytea")
    private byte[] fileData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({"cases", "documents"})
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    @JsonIgnoreProperties({"client", "documents"})
    private Case linkedCase;

    // =========================
    // GETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public String getMimeType() {
        return mimeType;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getUploadDate() {
        return uploadDate;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public Client getClient() {
        return client;
    }

    public Case getLinkedCase() {
        return linkedCase;
    }

    // =========================
    // SETTERS
    // =========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setUploadDate(LocalDate uploadDate) {
        this.uploadDate = uploadDate;
    }

    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public void setLinkedCase(Case linkedCase) {
        this.linkedCase = linkedCase;
    }
}
