package com.example.casa_legal_hub_management_system.config;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("errors", List.of(ex.getMessage())));
    }

    @ExceptionHandler({NoSuchElementException.class, EntityNotFoundException.class})
    public ModelAndView handleNotFound(Exception ex) {
        ModelAndView mav = new ModelAndView("error");
        mav.setStatus(HttpStatus.NOT_FOUND);
        mav.addObject("errorCode", 404);
        mav.addObject("errorMessage", "The requested resource was not found.");
        return mav;
    }

    @ExceptionHandler(Exception.class)
    public Object handleGeneral(Exception ex, jakarta.servlet.http.HttpServletRequest request) {
        String acceptHeader = request.getHeader("Accept");
        if (acceptHeader != null && acceptHeader.contains("application/json")) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
        ModelAndView mav = new ModelAndView("error");
        mav.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        mav.addObject("errorCode", 500);
        mav.addObject("errorMessage", "Something went wrong. Please try again.");
        return mav;
    }
}
