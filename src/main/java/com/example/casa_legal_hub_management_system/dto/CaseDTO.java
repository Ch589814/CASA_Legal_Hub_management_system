package com.example.casa_legal_hub_management_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CaseDTO {

    private Long id;

    @NotBlank(message = "Case number is required")
    private String caseNumber;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String caseType;
    private String status;
    private String priority;
    private LocalDate courtDate;
    private LocalDate closedDate;
    private String description;
    private String notes;
    private String outcome;
    private LocalDate createdAt;

    private Long clientId;
    private String clientName;

    private Long assignedStaffId;
    private String assignedStaffName;
}
