package com.psycare.repository;

import com.psycare.model.Client;
import com.psycare.model.SessionNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionNoteRepository extends JpaRepository<SessionNote, Long> {
    List<SessionNote> findByClientOrderByNoteDateDesc(Client client);
}
