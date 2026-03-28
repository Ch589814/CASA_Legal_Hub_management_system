package com.example.casa_legal_hub_management_system.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String staffEmail;

    private String staffName;

    private String action;       // LOGIN / ADD_CLIENT / UPDATE_CLIENT / DELETE_CLIENT /
                                 // ADD_CASE / UPDATE_CASE / ADD_FINANCE / UPLOAD_DOCUMENT / LOGOUT

    private String module;       // AUTH / CLIENTS / CASES / FINANCE / DOCUMENTS

    @Column(length = 500)
    private String details;      // e.g. "Added client: John Doe"

    private String ipAddress;

    private LocalDateTime timestamp = LocalDateTime.now();
}
