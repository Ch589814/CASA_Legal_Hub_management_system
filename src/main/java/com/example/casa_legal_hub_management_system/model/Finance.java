package com.example.casa_legal_hub_management_system.model;

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

    // Notary / Mediation / Legal Consultation / Legal Representation
    private String serviceType;

    private BigDecimal amount = BigDecimal.ZERO;

    private BigDecimal amountPaid = BigDecimal.ZERO;

    private String type; // Invoice / Payment / Expense / Refund

    private String status; // Paid / Pending / Overdue / Partial

    private String paymentMethod; // Cash / EFT / Card

    private LocalDate date = LocalDate.now();

    private LocalDate dueDate;

    @Column(length = 500)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "case_id")
    private Case linkedCase;
}
