package com.psycare.controller;

import com.psycare.model.Appointment;
import com.psycare.repository.ClientRepository;
import com.psycare.service.AppointmentService;
import com.psycare.service.InvoiceService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        long totalClients = clientRepository.count();
        long upcomingAppts = appointmentService.countUpcomingAppointments();
        double unpaidTotal = invoiceService.getUnpaidTotal();

        // Get next 5 upcoming appointments sorted by start time
        List<Appointment> recentAppointments = appointmentService.getAllAppointments().stream()
                .filter(appt -> appt.getStartTime().isAfter(LocalDateTime.now()) && !"CANCELLED".equals(appt.getStatus()))
                .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(DashboardStats.builder()
                .totalClients(totalClients)
                .upcomingAppointmentsCount(upcomingAppts)
                .unpaidInvoicesTotal(unpaidTotal)
                .upcomingSessions(recentAppointments)
                .build());
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private long totalClients;
        private long upcomingAppointmentsCount;
        private double unpaidInvoicesTotal;
        private List<Appointment> upcomingSessions;
    }
}
