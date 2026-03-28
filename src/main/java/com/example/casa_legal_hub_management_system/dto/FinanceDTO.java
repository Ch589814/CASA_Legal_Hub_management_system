package com.example.casa_legal_hub_management_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FinanceDTO {

    private Long id;
    private String invoiceNumber;

    @NotBlank(message = "Description is required")
    private String description;

    private String serviceType;
    private BigDecimal amount;
    private BigDecimal amountPaid;
    private BigDecimal balance;
    private String type;
    private String status;
    private String paymentMethod;
    private LocalDate date;
    private LocalDate dueDate;
    private String notes;

    private Long clientId;
    private String clientName;

    private Long linkedCaseId;
    private String linkedCaseNumber;
}
