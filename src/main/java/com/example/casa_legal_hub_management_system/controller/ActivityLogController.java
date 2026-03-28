package com.example.casa_legal_hub_management_system.controller;

import com.example.casa_legal_hub_management_system.model.ActivityLog;
import com.example.casa_legal_hub_management_system.repository.ActivityLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityLogController {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogController(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping
    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }

    @GetMapping("/staff/{email}")
    public List<ActivityLog> getLogsByStaff(@PathVariable String email) {
        return activityLogRepository.findByStaffEmailOrderByTimestampDesc(email);
    }
}
