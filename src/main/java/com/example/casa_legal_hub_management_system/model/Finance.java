package com.example.casa_legal_hub_management_system.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "finance")
public class Finance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNumber;

    @NotBlank(message = "Description is required")
    private String description;

    private String serviceType;
    private BigDecimal amount = BigDecimal.ZERO;
    private BigDecimal amountPaid = BigDecimal.ZERO;
    private String type;
    private String status;
    private String paymentMethod;
    private LocalDate date = LocalDate.now();
    private LocalDate dueDate;

    @Column(length = 500)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({"cases", "finances", "documents"})
    private Client client;

    @ManyToOne
    @JoinColumn(name = "case_id")
    @JsonIgnoreProperties({"client", "assignedStaff", "finances", "documents"})
    private Case linkedCase;
}
