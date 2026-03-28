package com.example.casa_legal_hub_management_system.service;

import com.example.casa_legal_hub_management_system.model.ActivityLog;
import com.example.casa_legal_hub_management_system.model.User;
import com.example.casa_legal_hub_management_system.repository.ActivityLogRepository;
import com.example.casa_legal_hub_management_system.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    public void log(String action, String module, String details, HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return;

        String email = auth.getName();
        String name = userRepository.findByEmail(email)
                .map(User::getFullName).orElse(email);

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null) ip = request.getRemoteAddr();

        ActivityLog log = new ActivityLog();
        log.setStaffEmail(email);
        log.setStaffName(name);
        log.setAction(action);
        log.setModule(module);
        log.setDetails(details);
        log.setIpAddress(ip);
        activityLogRepository.save(log);
    }
}
