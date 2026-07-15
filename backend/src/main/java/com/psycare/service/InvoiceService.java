package com.psycare.service;

import com.psycare.model.Client;
import com.psycare.model.Invoice;
import com.psycare.model.Appointment;
import com.psycare.repository.InvoiceRepository;
import com.psycare.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;


    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }

    public List<Invoice> getInvoicesByClient(Client client) {
        return invoiceRepository.findByClient(client);
    }

    public List<Invoice> getInvoicesByClientAndStatus(Client client, String status) {
        return invoiceRepository.findByClientAndStatus(client, status);
    }

    public Invoice saveInvoice(Invoice invoice) {
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isEmpty()) {
            invoice.setInvoiceNumber("INV-" + (System.currentTimeMillis() / 1000));
        }
        if (invoice.getIssueDate() == null) {
            invoice.setIssueDate(LocalDate.now());
        }
        if (invoice.getDueDate() == null) {
            invoice.setDueDate(LocalDate.now().plusDays(14)); // Default 14 days payment term
        }
        if (invoice.getStatus() == null) {
            invoice.setStatus("UNPAID");
        }
        return invoiceRepository.save(invoice);
    }

    public Invoice updateInvoiceStatus(Long id, String status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }

    public double getUnpaidTotal() {
        return invoiceRepository.findByStatus("UNPAID").stream()
                .mapToDouble(Invoice::getAmount)
                .sum();
    }

    @Transactional
    public Invoice processPayment(Long invoiceId, String transactionId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));

        invoice.setStatus("PAID");
        invoice.setTransactionId(transactionId);
        invoice.setPaymentDate(java.time.LocalDateTime.now());
        Invoice savedInvoice = invoiceRepository.save(invoice);

        if (invoice.getAppointmentId() != null) {
            appointmentRepository.findById(invoice.getAppointmentId()).ifPresent(appt -> {
                appt.setPaymentStatus("PAID");
                appt.setStatus("CONFIRMED");
                appointmentRepository.save(appt);
            });
        }

        return savedInvoice;
    }
}

