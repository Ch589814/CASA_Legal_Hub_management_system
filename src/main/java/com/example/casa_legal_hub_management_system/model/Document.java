package com.example.casa_legal_hub_management_system.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;
    private String filePath;
    private String category = "Client Document";

    @Column(length = 500)
    private String description;

    private LocalDate uploadDate = LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({"cases", "finances", "documents"})
    private Client client;

    @ManyToOne
    @JoinColumn(name = "case_id")
    @JsonIgnoreProperties({"client", "assignedStaff", "finances", "documents"})
    private Case linkedCase;
}
