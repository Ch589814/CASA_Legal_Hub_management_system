package com.example.casa_legal_hub_management_system.controller;

import com.example.casa_legal_hub_management_system.model.Finance;
import com.example.casa_legal_hub_management_system.repository.FinanceRepository;
import com.example.casa_legal_hub_management_system.service.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceRepository financeRepository;
    private final ActivityLogService activityLogService;

    public FinanceController(FinanceRepository financeRepository, ActivityLogService activityLogService) {
        this.financeRepository = financeRepository;
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public List<Finance> getAllFinance() {
        return financeRepository.findAll();
    }

    @GetMapping("/client/{clientId}")
    public List<Finance> getFinanceByClient(@PathVariable Long clientId) {
        return financeRepository.findByClientId(clientId);
    }

    @PostMapping
    public ResponseEntity<?> createFinance(@Valid @RequestBody Finance finance,
                                            BindingResult result, HttpServletRequest request) {
        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }
        Finance saved = financeRepository.save(finance);
        activityLogService.log("ADD_FINANCE", "FINANCE",
                "Added finance record: " + saved.getDescription() + " R" + saved.getAmount(), request);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFinance(@PathVariable Long id, @Valid @RequestBody Finance finance,
                                            BindingResult result, HttpServletRequest request) {
        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }
        finance.setId(id);
        Finance saved = financeRepository.save(finance);
        activityLogService.log("UPDATE_FINANCE", "FINANCE", "Updated finance record: " + saved.getDescription(), request);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFinance(@PathVariable Long id, HttpServletRequest request) {
        financeRepository.findById(id).ifPresent(f ->
                activityLogService.log("DELETE_FINANCE", "FINANCE", "Deleted finance record: " + f.getDescription(), request));
        financeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveFinance(@PathVariable Long id, HttpServletRequest request) {
        return financeRepository.findById(id).map(f -> {
            f.setStatus("Approved");
            Finance saved = financeRepository.save(f);
            activityLogService.log("APPROVE_FINANCE", "FINANCE", "Approved finance record: " + saved.getDescription(), request);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<?> unlockFinance(@PathVariable Long id, HttpServletRequest request) {
        return financeRepository.findById(id).map(f -> {
            f.setStatus("Pending");
            Finance saved = financeRepository.save(f);
            activityLogService.log("UNLOCK_FINANCE", "FINANCE", "Unlocked finance record: " + saved.getDescription(), request);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/refund")
    public ResponseEntity<?> refundFinance(@PathVariable Long id, HttpServletRequest request) {
        return financeRepository.findById(id).map(f -> {
            f.setStatus("Refunded");
            f.setType("Refund");
            Finance saved = financeRepository.save(f);
            activityLogService.log("REFUND_FINANCE", "FINANCE", "Processed refund for: " + saved.getDescription(), request);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/pending")
    public ResponseEntity<?> setPending(@PathVariable Long id, HttpServletRequest request) {
        return financeRepository.findById(id).map(f -> {
            f.setStatus("Pending");
            Finance saved = financeRepository.save(f);
            activityLogService.log("FIX_FINANCE", "FINANCE", "Set to Pending: " + saved.getDescription(), request);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/overdue")
    public ResponseEntity<?> setOverdue(@PathVariable Long id, HttpServletRequest request) {
        return financeRepository.findById(id).map(f -> {
            f.setStatus("Overdue");
            Finance saved = financeRepository.save(f);
            activityLogService.log("FIX_FINANCE", "FINANCE", "Set to Overdue: " + saved.getDescription(), request);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
