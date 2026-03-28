package com.example.casa_legal_hub_management_system.controller;

import com.example.casa_legal_hub_management_system.model.Case;
import com.example.casa_legal_hub_management_system.repository.CaseRepository;
import com.example.casa_legal_hub_management_system.repository.ClientRepository;
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
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseRepository caseRepository;
    private final ClientRepository clientRepository;
    private final ActivityLogService activityLogService;

    public CaseController(CaseRepository caseRepository, ClientRepository clientRepository,
                          ActivityLogService activityLogService) {
        this.caseRepository = caseRepository;
        this.clientRepository = clientRepository;
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public List<Case> getAllCases() {
        return caseRepository.findAll();
    }

    @GetMapping("/client/{clientId}")
    public List<Case> getCasesByClient(@PathVariable Long clientId) {
        return caseRepository.findByClientId(clientId);
    }

    @GetMapping("/search")
    public List<Case> searchCases(@RequestParam String keyword) {
        return caseRepository.findByCaseNumberContainingIgnoreCaseOrCaseTypeContainingIgnoreCase(keyword, keyword);
    }

    @PostMapping
    public ResponseEntity<?> createCase(@Valid @RequestBody Case newCase,
                                         BindingResult result, HttpServletRequest request) {
        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }
        Case saved = caseRepository.save(newCase);
        activityLogService.log("ADD_CASE", "CASES",
                "Added case: " + saved.getCaseNumber() + " [" + saved.getServiceType() + "]", request);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCase(@PathVariable Long id, @Valid @RequestBody Case updatedCase,
                                         BindingResult result, HttpServletRequest request) {
        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }
        updatedCase.setId(id);
        Case saved = caseRepository.save(updatedCase);
        activityLogService.log("UPDATE_CASE", "CASES", "Updated case: " + saved.getCaseNumber(), request);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable Long id, HttpServletRequest request) {
        caseRepository.findById(id).ifPresent(c ->
                activityLogService.log("DELETE_CASE", "CASES", "Deleted case: " + c.getCaseNumber(), request));
        caseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCaseStatus(@PathVariable Long id,
                                               @RequestBody java.util.Map<String, String> body,
                                               HttpServletRequest request) {
        return caseRepository.findById(id).map(c -> {
            String newStatus = body.get("status");
            c.setStatus(newStatus);
            Case saved = caseRepository.save(c);
            activityLogService.log("UPDATE_CASE", "CASES",
                    "Admin set case " + saved.getCaseNumber() + " to " + newStatus, request);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
