package com.psycare.service;

import com.psycare.model.Client;
import com.psycare.model.User;
import com.psycare.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    public Optional<Client> getClientByUser(User user) {
        return clientRepository.findByUser(user);
    }

    public List<Client> searchClients(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllClients();
        }
        return clientRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                query, query, query);
    }

    public Client saveClient(Client client) {
        return clientRepository.save(client);
    }

    public Client updateClient(Long id, Client clientDetails) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        client.setFirstName(clientDetails.getFirstName());
        client.setLastName(clientDetails.getLastName());
        client.setEmail(clientDetails.getEmail());
        client.setPhoneNumber(clientDetails.getPhoneNumber());
        client.setDateOfBirth(clientDetails.getDateOfBirth());
        client.setAddress(clientDetails.getAddress());
        client.setEmergencyContactName(clientDetails.getEmergencyContactName());
        client.setEmergencyContactPhone(clientDetails.getEmergencyContactPhone());

        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}
