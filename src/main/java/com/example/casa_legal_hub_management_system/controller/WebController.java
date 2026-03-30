package com.example.casa_legal_hub_management_system.controller;

import com.example.casa_legal_hub_management_system.repository.*;
import com.example.casa_legal_hub_management_system.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@Controller
public class WebController {

    private final ClientRepository clientRepository;
    private final CaseRepository caseRepository;
    private final FinanceRepository financeRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public WebController(ClientRepository clientRepository, CaseRepository caseRepository,
                         FinanceRepository financeRepository, DocumentRepository documentRepository,
                         UserRepository userRepository, ActivityLogRepository activityLogRepository) {
        this.clientRepository = clientRepository;
        this.caseRepository = caseRepository;
        this.financeRepository = financeRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping("/")
    public String root(@RequestParam(required = false) String logout, Model model) {
        if (logout != null) model.addAttribute("logout", "You have been logged out successfully.");
        return "landing";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("userName", principal.getFullName());
        model.addAttribute("totalClients", clientRepository.count());
        model.addAttribute("totalCases", caseRepository.count());
        model.addAttribute("totalDocuments", documentRepository.count());
        model.addAttribute("recentClients", clientRepository.findTop5ByOrderByCreatedAtDesc());
        model.addAttribute("recentCases", caseRepository.findTop5ByOrderByCreatedAtDesc());

        // Court dates in the next 7 days
        LocalDate today = LocalDate.now();
        model.addAttribute("upcomingCourtCases",
                caseRepository.findByCourtDateBetween(today, today.plusDays(7)));

        if (isAdmin) {
            model.addAttribute("totalUsers", userRepository.count());
            model.addAttribute("allUsers", userRepository.findAll());
        }
        return "dashboard";
    }

    @GetMapping("/profile")
    public String profile(Model model, Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        model.addAttribute("currentUser", principal.getUser());
        return "profile";
    }

    @GetMapping("/clients")
    public String clients() {
        return "clients";
    }

    @GetMapping("/clients/view/{id}")
    public String viewClient(@PathVariable Long id, Model model) {
        model.addAttribute("client", clientRepository.findById(id).orElseThrow());
        model.addAttribute("cases", caseRepository.findByClientId(id));
        model.addAttribute("finances", financeRepository.findByClientId(id));
        model.addAttribute("documents", documentRepository.findByClientId(id));
        return "client-details";
    }

    @GetMapping("/cases")
    public String cases(Model model) {
        model.addAttribute("clients", clientRepository.findAll());
        return "cases";
    }

    @GetMapping("/finance")
    public String finance(Model model, Authentication auth) {
        model.addAttribute("clients", clientRepository.findAll());
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        model.addAttribute("isAdmin", isAdmin);
        return "finance";
    }

    @GetMapping("/documents")
    public String documents(Model model) {
        model.addAttribute("clients", clientRepository.findAll());
        return "documents";
    }

    @GetMapping("/users")
    public String users() {
        return "users";
    }

    @GetMapping("/activity")
    public String activityLog(Model model) {
        model.addAttribute("logs", activityLogRepository.findAllByOrderByTimestampDesc());
        model.addAttribute("staffList", userRepository.findAll());
        return "activity";
    }

    @GetMapping("/admin")
    public String adminPanel(Model model) {
        // Finance overview
        model.addAttribute("approvedFinance",  financeRepository.findByStatus("Approved"));
        model.addAttribute("pendingFinance",   financeRepository.findByStatus("Pending"));
        model.addAttribute("overdueFinance",   financeRepository.findByStatus("Overdue"));
        model.addAttribute("refundedFinance",  financeRepository.findByStatus("Refunded"));
        model.addAttribute("countApproved",    financeRepository.countByStatus("Approved"));
        model.addAttribute("countPending",     financeRepository.countByStatus("Pending"));
        model.addAttribute("countOverdue",     financeRepository.countByStatus("Overdue"));
        // Case overview
        model.addAttribute("openCases",        caseRepository.findByStatus("Open"));
        model.addAttribute("countOpenCases",   caseRepository.countByStatus("Open"));
        model.addAttribute("countClosedCases", caseRepository.countByStatus("Closed"));
        // Staff
        model.addAttribute("allUsers",         userRepository.findAll());
        model.addAttribute("allClients",       clientRepository.findAll());
        // Recent activity
        model.addAttribute("recentLogs",       activityLogRepository.findAllByOrderByTimestampDesc()
                .stream().limit(20).toList());
        return "admin";
    }
}
