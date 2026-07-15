package com.psycare.controller;

import com.psycare.model.Appointment;
import com.psycare.model.Client;
import com.psycare.model.User;
import com.psycare.model.Invoice;
import com.psycare.repository.UserRepository;
import com.psycare.service.AppointmentService;
import com.psycare.service.ClientService;
import com.psycare.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private InvoiceService invoiceService;


    @Autowired
    private ClientService clientService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Appointment>> getAppointments(
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        if (start != null && end != null) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByRange(start, end));
        }
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByClient(@PathVariable Long clientId) {
        return clientService.getClientById(clientId)
                .map(client -> ResponseEntity.ok(appointmentService.getAppointmentsByClient(client)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Appointment>> getMyAppointments(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        Client client = clientService.getClientByUser(user)
                .orElseThrow(() -> new RuntimeException("Client profile not found"));

        return ResponseEntity.ok(appointmentService.getAppointmentsByClient(client));
    }

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        // Fetch full client if id is passed
        if (appointment.getClient() != null && appointment.getClient().getId() != null) {
            Client client = clientService.getClientById(appointment.getClient().getId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            appointment.setClient(client);
        }

        if (appointment.getPrice() == null) {
            appointment.setPrice(150.0); // Default price for sessions
        }
        if (appointment.getPaymentStatus() == null) {
            appointment.setPaymentStatus("UNPAID");
        }

        Appointment savedAppt = appointmentService.saveAppointment(appointment);

        // Auto-generate invoice if price is greater than 0
        if (savedAppt.getPrice() > 0) {
            Invoice invoice = Invoice.builder()
                    .client(savedAppt.getClient())
                    .amount(savedAppt.getPrice())
                    .servicesRendered(savedAppt.getTitle() != null ? savedAppt.getTitle() : "Therapy Session")
                    .status("UNPAID")
                    .appointmentId(savedAppt.getId())
                    .build();
            invoiceService.saveInvoice(invoice);
        }

        return ResponseEntity.ok(savedAppt);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointmentDetails) {
        try {
            return ResponseEntity.ok(appointmentService.updateAppointment(id, appointmentDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok("Appointment deleted successfully");
    }
}
