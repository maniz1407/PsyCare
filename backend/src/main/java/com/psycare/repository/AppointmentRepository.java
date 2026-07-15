package com.psycare.repository;

import com.psycare.model.Appointment;
import com.psycare.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByClient(Client client);
    List<Appointment> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Appointment> findByClientAndStartTimeBetween(Client client, LocalDateTime start, LocalDateTime end);
    List<Appointment> findByStartTimeAfterAndStatusNot(LocalDateTime time, String status);
}
