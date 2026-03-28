package com.example.casa_legal_hub_management_system.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "clients")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Pattern(regexp = "\\d{16}", message = "National ID must be exactly 16 digits")
    private String idNumber;

    @Pattern(regexp = "^-$|^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Invalid email format")
    private String email;

    @Pattern(regexp = "\\d{10}", message = "Phone number must be exactly 10 digits")
    private String phone;

    // Address broken into Rwanda administrative levels
    private String province;

    private String district;

    private String sector;

    private String cell;

    private String village;

    private String gender;

    private String nationality;

    private String serviceType;

    private String status = "Active";

    @Column(length = 1000)
    private String notes;

    private LocalDate createdAt = LocalDate.now();
}
