package com.example.casa_legal_hub_management_system.controller;

import com.example.casa_legal_hub_management_system.model.Client;
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
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientRepository clientRepository;
    private final ActivityLogService activityLogService;

    public ClientController(ClientRepository clientRepository, ActivityLogService activityLogService) {
        this.clientRepository = clientRepository;
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClient(@PathVariable Long id) {
        return clientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createClient(@Valid @RequestBody Client client,
                                           BindingResult result, HttpServletRequest request) {
        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }
        if (client.getIdNumber() != null && !client.getIdNumber().isBlank()
                && clientRepository.existsByIdNumber(client.getIdNumber())) {
            return ResponseEntity.badRequest().body(Map.of("errors",
                    List.of("A client with this National ID already exists. Please open a new case for the existing client.")));
        }
        Client saved = clientRepository.save(client);
        activityLogService.log("ADD_CLIENT", "CLIENTS", "Added client: " + saved.getFullName(), request);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @Valid @RequestBody Client client,
                                           BindingResult result, HttpServletRequest request) {
        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }
        if (client.getIdNumber() != null && !client.getIdNumber().isBlank()) {
            clientRepository.findByIdNumber(client.getIdNumber()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Another client already has this National ID.");
                }
            });
        }
        client.setId(id);
        Client saved = clientRepository.save(client);
        activityLogService.log("UPDATE_CLIENT", "CLIENTS", "Updated client: " + saved.getFullName(), request);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id, HttpServletRequest request) {
        clientRepository.findById(id).ifPresent(c ->
                activityLogService.log("DELETE_CLIENT", "CLIENTS", "Deleted client: " + c.getFullName(), request));
        clientRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public List<Client> searchClients(@RequestParam String keyword) {
        return clientRepository.findByFullNameContainingIgnoreCase(keyword);
    }
}
