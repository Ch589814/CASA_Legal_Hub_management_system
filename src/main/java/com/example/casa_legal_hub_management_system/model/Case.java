package com.example.casa_legal_hub_management_system.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cases")
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Case number is required")
    private String caseNumber;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String caseType;
    private String status = "Open";
    private String priority = "Normal";
    private LocalDate courtDate;
    private LocalDate closedDate;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String notes;

    private String outcome;
    private LocalDate createdAt = LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({"cases", "finances", "documents"})
    private Client client;

    @ManyToOne
    @JoinColumn(name = "assigned_staff_id")
    @JsonIgnoreProperties({"password", "resetToken"})
    private User assignedStaff;
}
