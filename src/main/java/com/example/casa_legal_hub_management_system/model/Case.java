package com.example.casa_legal_hub_management_system.model;

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

    // Notary / Mediation / Legal Consultation / Legal Representation
    @NotBlank(message = "Service type is required")
    private String serviceType;

    // Criminal / Civil / Family / Labour / Property / Immigration / Other
    private String caseType;

    private String status = "Open"; // Open / In Progress / Pending / Closed / Won / Lost

    private String priority = "Normal"; // Low / Normal / High / Urgent

    private LocalDate courtDate;

    private LocalDate closedDate;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String notes;

    private String outcome; // Won / Lost / Settled / Withdrawn

    private LocalDate createdAt = LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff;
}
