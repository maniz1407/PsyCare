package com.psycare.controller;

import com.psycare.model.Client;
import com.psycare.model.Invoice;
import com.psycare.model.User;
import com.psycare.repository.UserRepository;
import com.psycare.service.ClientService;
import com.psycare.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private ClientService clientService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Invoice>> getInvoicesByClient(@PathVariable Long clientId) {
        return clientService.getClientById(clientId)
                .map(client -> ResponseEntity.ok(invoiceService.getInvoicesByClient(client)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Invoice>> getMyInvoices(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        Client client = clientService.getClientByUser(user)
                .orElseThrow(() -> new RuntimeException("Client profile not found"));

        return ResponseEntity.ok(invoiceService.getInvoicesByClient(client));
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        if (invoice.getClient() != null && invoice.getClient().getId() != null) {
            Client client = clientService.getClientById(invoice.getClient().getId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            invoice.setClient(client);
        }
        return ResponseEntity.ok(invoiceService.saveInvoice(invoice));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Invoice> updateInvoiceStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Invoice> payInvoice(@PathVariable Long id, @RequestParam String transactionId) {
        try {
            return ResponseEntity.ok(invoiceService.processPayment(id, transactionId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

