package com.psycare.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    @Column(nullable = false)
    private Double amount;

    private LocalDate issueDate;

    private LocalDate dueDate;

    @Column(nullable = false)
    private String status; // PAID, UNPAID, OVERDUE

    private String servicesRendered; // e.g. "CBT Session - 50 mins"

    private String transactionId; // GPay transaction ID

    private java.time.LocalDateTime paymentDate; // Timestamp of payment completion

    private Long appointmentId; // Associated appointment ID (optional)
}

