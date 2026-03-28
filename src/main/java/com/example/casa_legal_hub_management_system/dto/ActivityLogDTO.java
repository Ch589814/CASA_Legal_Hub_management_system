package com.example.casa_legal_hub_management_system.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActivityLogDTO {

    private Long id;
    private String staffEmail;
    private String staffName;
    private String action;
    private String module;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
