package com.example.casa_legal_hub_management_system.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DocumentDTO {

    private Long id;
    private String fileName;
    private String fileType;
    private String filePath;
    private String category;
    private String description;
    private LocalDate uploadDate;

    private Long clientId;
    private String clientName;

    private Long linkedCaseId;
    private String linkedCaseNumber;
}
