package com.example.casa_legal_hub_management_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ClientDTO {

    private Long id;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Pattern(regexp = "\\d{16}", message = "National ID must be exactly 16 digits")
    private String idNumber;

    @Pattern(regexp = "^-$|^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Invalid email format")
    private String email;

    @Pattern(regexp = "\\d{10}", message = "Phone number must be exactly 10 digits")
    private String phone;

    private String province;
    private String district;
    private String sector;
    private String cell;
    private String village;
    private String gender;
    private String nationality;
    private String serviceType;
    private String status;
    private String notes;
    private LocalDate createdAt;
}
