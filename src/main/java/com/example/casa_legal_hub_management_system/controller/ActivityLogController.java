package com.example.casa_legal_hub_management_system.controller;

import com.example.casa_legal_hub_management_system.model.ActivityLog;
import com.example.casa_legal_hub_management_system.repository.ActivityLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @DeleteMapping("/module/{module}")
    public ResponseEntity<?> deleteLogsByModule(@PathVariable String module) {
        try {
            activityLogRepository.deleteByModule(module);
            return ResponseEntity.ok(Map.of("message", "Logs for module '" + module + "' deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete logs: " + e.getMessage()));
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllLogs() {
        try {
            activityLogRepository.deleteAll();
            return ResponseEntity.ok(Map.of("message", "All logs deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete all logs: " + e.getMessage()));
        }
    }
}
