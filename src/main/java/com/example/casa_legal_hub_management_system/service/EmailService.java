package com.example.casa_legal_hub_management_system.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@casalegalhub.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken, String baseUrl) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🔐 Password Reset - CASA Legal Hub");
            
            String resetLink = baseUrl + "/reset-password?token=" + resetToken;
            
            String emailBody = String.format("""
                Hello,
                
                You have requested to reset your password for your CASA Legal Hub account.
                
                Click the link below to reset your password:
                %s
                
                This link will expire in 24 hours for security reasons.
                
                If you did not request this password reset, please ignore this email.
                Your password will remain unchanged.
                
                Best regards,
                CASA Legal Hub Team
                
                ---
                This is an automated message. Please do not reply to this email.
                """, resetLink);
            
            message.setText(emailBody);
            mailSender.send(message);
        } catch (Exception e) {
            // Log the error but don't throw exception to avoid breaking the flow
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}