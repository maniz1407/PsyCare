package com.psycare.controller;

import com.psycare.model.Client;
import com.psycare.model.SessionNote;
import com.psycare.service.ClientService;
import com.psycare.service.SessionNoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class SessionNoteController {

    @Autowired
    private SessionNoteService sessionNoteService;

    @Autowired
    private ClientService clientService;

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<SessionNote>> getNotesByClient(@PathVariable Long clientId) {
        return clientService.getClientById(clientId)
                .map(client -> ResponseEntity.ok(sessionNoteService.getNotesByClient(client)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionNote> getNoteById(@PathVariable Long id) {
        return sessionNoteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SessionNote> createNote(@RequestBody SessionNote note) {
        if (note.getClient() != null && note.getClient().getId() != null) {
            Client client = clientService.getClientById(note.getClient().getId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            note.setClient(client);
        }
        return ResponseEntity.ok(sessionNoteService.saveNote(note));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionNote> updateNote(@PathVariable Long id, @RequestBody SessionNote noteDetails) {
        try {
            return ResponseEntity.ok(sessionNoteService.updateNote(id, noteDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        sessionNoteService.deleteNote(id);
        return ResponseEntity.ok("Session note deleted successfully");
    }
}
