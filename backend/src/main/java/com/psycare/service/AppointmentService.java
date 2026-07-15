package com.psycare.service;

import com.psycare.model.Appointment;
import com.psycare.model.Client;
import com.psycare.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    public List<Appointment> getAppointmentsByClient(Client client) {
        return appointmentRepository.findByClient(client);
    }

    public List<Appointment> getAppointmentsByRange(LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findByStartTimeBetween(start, end);
    }

    public List<Appointment> getAppointmentsByClientAndRange(Client client, LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findByClientAndStartTimeBetween(client, start, end);
    }

    public Appointment saveAppointment(Appointment appointment) {
        // Here we could add logic to check scheduling conflicts
        if (appointment.getStatus() == null) {
            appointment.setStatus("PENDING");
        }
        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(Long id, Appointment apptDetails) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        appointment.setStartTime(apptDetails.getStartTime());
        appointment.setEndTime(apptDetails.getEndTime());
        appointment.setStatus(apptDetails.getStatus());
        appointment.setTitle(apptDetails.getTitle());
        appointment.setNotes(apptDetails.getNotes());
        appointment.setVideoLink(apptDetails.getVideoLink());

        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    public long countUpcomingAppointments() {
        return appointmentRepository.findByStartTimeAfterAndStatusNot(LocalDateTime.now(), "CANCELLED").size();
    }
}
