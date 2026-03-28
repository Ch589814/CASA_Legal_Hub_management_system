package com.example.casa_legal_hub_management_system.security;

import com.example.casa_legal_hub_management_system.service.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final ActivityLogService activityLogService;

    public LoginSuccessHandler(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        activityLogService.log("LOGIN", "AUTH", "User logged in", request);
        response.sendRedirect("/dashboard");
    }
}
