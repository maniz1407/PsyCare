package com.psycare.repository;

import com.psycare.model.Client;
import com.psycare.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByClient(Client client);
    List<Invoice> findByStatus(String status);
    List<Invoice> findByClientAndStatus(Client client, String status);
}
