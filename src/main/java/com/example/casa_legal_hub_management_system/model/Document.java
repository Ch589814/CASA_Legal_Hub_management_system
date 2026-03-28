package com.example.casa_legal_hub_management_system.model;

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

    // Client Document / Case Document / Staff Resource
    private String category = "Client Document";

    @Column(length = 500)
    private String description;

    private LocalDate uploadDate = LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "case_id")
    private Case linkedCase;
}
