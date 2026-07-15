package com.psycare.service;

import com.psycare.model.Client;
import com.psycare.model.SessionNote;
import com.psycare.repository.SessionNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SessionNoteService {

    @Autowired
    private SessionNoteRepository sessionNoteRepository;

    public List<SessionNote> getNotesByClient(Client client) {
        return sessionNoteRepository.findByClientOrderByNoteDateDesc(client);
    }

    public Optional<SessionNote> getNoteById(Long id) {
        return sessionNoteRepository.findById(id);
    }

    public SessionNote saveNote(SessionNote note) {
        if (note.getNoteDate() == null) {
            note.setNoteDate(LocalDateTime.now());
        }
        return sessionNoteRepository.save(note);
    }

    public SessionNote updateNote(Long id, SessionNote noteDetails) {
        SessionNote note = sessionNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session note not found with id: " + id));

        note.setChiefComplaint(noteDetails.getChiefComplaint());
        note.setMentalStatus(noteDetails.getMentalStatus());
        note.setSummary(noteDetails.getSummary());
        note.setPlan(noteDetails.getPlan());
        note.setConfidentialNotes(noteDetails.getConfidentialNotes());

        return sessionNoteRepository.save(note);
    }

    public void deleteNote(Long id) {
        sessionNoteRepository.deleteById(id);
    }
}
