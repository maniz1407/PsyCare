import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { FiSearch, FiUserPlus, FiPhone, FiMail, FiCalendar, FiPlus, FiBookOpen, FiFileText } from 'react-icons/fi';

const ClientDirectoryView = () => {
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showClientModal, setShowClientModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // New forms states
  const [newClient, setNewClient] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '',
    dateOfBirth: '', address: '', emergencyContactName: '', emergencyContactPhone: ''
  });

  const [newNote, setNewNote] = useState({
    chiefComplaint: '', mentalStatus: '', summary: '', plan: '', confidentialNotes: '',
    appointmentId: ''
  });

  const [newInvoice, setNewInvoice] = useState({
    amount: '', servicesRendered: '', dueDate: ''
  });

  // Fetch all clients
  const fetchClients = async (query = '') => {
    try {
      const data = await api.clients.getAll(query);
      setClients(data);
      
      // Auto-select first client or URL parameter client
      const urlClientId = searchParams.get('writeNote');
      if (urlClientId && data.length > 0) {
        const found = data.find(c => c.id === parseInt(urlClientId));
        if (found) {
          setSelectedClient(found);
          fetchNotes(found.id);
          const apptId = searchParams.get('appt');
          if (apptId) {
            setNewNote(prev => ({ ...prev, appointmentId: apptId }));
            setShowNoteModal(true);
          }
        }
      } else if (data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
        fetchNotes(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes for selected client
  const fetchNotes = async (clientId) => {
    try {
      const data = await api.notes.getByClientId(clientId);
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(searchQuery);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    fetchNotes(client.id);
  };

  // Create Client
  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const saved = await api.clients.create(newClient);
      fetchClients();
      setSelectedClient(saved);
      setShowClientModal(false);
      setNewClient({
        firstName: '', lastName: '', email: '', phoneNumber: '',
        dateOfBirth: '', address: '', emergencyContactName: '', emergencyContactPhone: ''
      });
    } catch (err) {
      alert(err.message || 'Error saving client profile');
    }
  };

  // Create Session Note
  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newNote,
        client: { id: selectedClient.id },
        appointment: newNote.appointmentId ? { id: parseInt(newNote.appointmentId) } : null,
        noteDate: new Date().toISOString()
      };
      await api.notes.create(payload);
      fetchNotes(selectedClient.id);
      setShowNoteModal(false);
      setNewNote({
        chiefComplaint: '', mentalStatus: '', summary: '', plan: '', confidentialNotes: '',
        appointmentId: ''
      });
    } catch (err) {
      alert(err.message || 'Error saving session note');
    }
  };

  // Create Invoice
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        client: { id: selectedClient.id },
        amount: parseFloat(newInvoice.amount),
        servicesRendered: newInvoice.servicesRendered,
        dueDate: newInvoice.dueDate
      };
      await api.invoices.create(payload);
      alert('Invoice generated successfully.');
      setShowInvoiceModal(false);
      setNewInvoice({ amount: '', servicesRendered: '', dueDate: '' });
    } catch (err) {
      alert(err.message || 'Error generating invoice');
    }
  };

  if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', marginTop: '10%' }}>
        <h3>Loading Clinical Directory...</h3>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      <div className="dashboard-row">
        {/* Left Column: Search & Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </form>
              <button onClick={() => setShowClientModal(true)} className="btn btn-primary" title="Add New Client">
                <FiUserPlus />
              </button>
            </div>

            {/* List of Clients */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {clients.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1.5rem' }}>No clients found.</p>
              ) : (
                clients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className="glass-card"
                    style={{
                      cursor: 'pointer',
                      padding: '1rem',
                      border: selectedClient?.id === client.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                      background: selectedClient?.id === client.id ? 'var(--bg-tertiary)' : 'var(--glass-bg)',
                    }}
                  >
                    <h4 style={{ margin: 0 }}>{client.firstName} {client.lastName}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{client.email}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Clinical Note Timeline */}
        <div>
          {selectedClient ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Profile Card details */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ marginBottom: '0.25rem' }}>{selectedClient.firstName} {selectedClient.lastName}</h2>
                    <span className="badge badge-primary">ID: #{selectedClient.id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowNoteModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      <FiPlus /> New Session Note
                    </button>
                    <button onClick={() => setShowInvoiceModal(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      <FiPlus /> Create Invoice
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', fontSize: '0.95rem' }}>
                  <div>
                    <h5 style={{ color: 'var(--text-secondary)' }}>Contact Info</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}><FiPhone size={14} /> {selectedClient.phoneNumber || 'N/A'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}><FiMail size={14} /> {selectedClient.email}</div>
                  </div>
                  <div>
                    <h5 style={{ color: 'var(--text-secondary)' }}>Demographics</h5>
                    <div style={{ marginTop: '0.5rem' }}>DOB: {selectedClient.dateOfBirth ? new Date(selectedClient.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                    <div style={{ marginTop: '0.25rem' }}>Address: {selectedClient.address || 'N/A'}</div>
                  </div>
                  <div>
                    <h5 style={{ color: 'var(--text-secondary)' }}>Emergency Contact</h5>
                    <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>{selectedClient.emergencyContactName || 'N/A'}</div>
                    <div style={{ marginTop: '0.25rem' }}>{selectedClient.emergencyContactPhone || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Session notes Timeline */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '1.25rem' }}>Clinical Session Notes</h3>
                {notes.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No session notes logged for this client.</p>
                ) : (
                  <div className="notes-history-list">
                    {notes.map(note => (
                      <div key={note.id} className="history-card" style={{ borderLeft: '4px solid var(--color-primary)', background: 'rgba(45, 94, 73, 0.02)', padding: '1rem', borderRadius: '4px' }}>
                        <div className="history-card-header">
                          <span className="history-date">{new Date(note.noteDate).toLocaleString()}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Note ID: #{note.id}</span>
                        </div>
                        {note.chiefComplaint && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9rem' }}>Chief Complaint: </strong>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'inline' }}>{note.chiefComplaint}</p>
                          </div>
                        )}
                        {note.mentalStatus && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9rem' }}>Mental Status: </strong>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'inline' }}>{note.mentalStatus}</p>
                          </div>
                        )}
                        {note.summary && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9rem' }}>Summary: </strong>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'inline' }}>{note.summary}</p>
                          </div>
                        )}
                        {note.plan && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9rem' }}>Plan / Action Items: </strong>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'inline' }}>{note.plan}</p>
                          </div>
                        )}
                        {note.confidentialNotes && (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(196, 140, 90, 0.08)', borderRadius: '4px' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--color-accent-dark)' }}>Confidential (Internal Only): </strong>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'inline' }}>{note.confidentialNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
              <FiBookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Select a client from the directory to review profiles and session summaries.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE CLIENT */}
      {showClientModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Client Profile</h3>
            <form onSubmit={handleCreateClient}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input type="text" required value={newClient.firstName} onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input type="text" required value={newClient.lastName} onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })} className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" required value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="form-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" value={newClient.phoneNumber} onChange={(e) => setNewClient({ ...newClient, phoneNumber: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" value={newClient.dateOfBirth} onChange={(e) => setNewClient({ ...newClient, dateOfBirth: e.target.value })} className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Home Address</label>
                <input type="text" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} className="form-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input type="text" value={newClient.emergencyContactName} onChange={(e) => setNewClient({ ...newClient, emergencyContactName: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input type="tel" value={newClient.emergencyContactPhone} onChange={(e) => setNewClient({ ...newClient, emergencyContactPhone: e.target.value })} className="form-input" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowClientModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Client Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE SESSION NOTE */}
      {showNoteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Write Session Note for {selectedClient.firstName}</h3>
            <form onSubmit={handleCreateNote}>
              <div className="form-group">
                <label className="form-label">Chief Complaint</label>
                <textarea rows="2" value={newNote.chiefComplaint} onChange={(e) => setNewNote({ ...newNote, chiefComplaint: e.target.value })} className="form-textarea" placeholder="E.g., Client reports feelings of heightened anxiety before public presentations..."></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Mental Status Exam</label>
                <textarea rows="2" value={newNote.mentalStatus} onChange={(e) => setNewNote({ ...newNote, mentalStatus: e.target.value })} className="form-textarea" placeholder="Appearance, affect, eye contact, speech coherence..."></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Clinical Session Summary</label>
                <textarea rows="4" required value={newNote.summary} onChange={(e) => setNewNote({ ...newNote, summary: e.target.value })} className="form-textarea" placeholder="Primary interventions, discussion details..."></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Treatment Plan / Homework</label>
                <textarea rows="2" value={newNote.plan} onChange={(e) => setNewNote({ ...newNote, plan: e.target.value })} className="form-textarea" placeholder="Practicing mindfulness for 10 mins daily, next session dates..."></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Confidential Notes (Therapist Private Use)</label>
                <textarea rows="2" value={newNote.confidentialNotes} onChange={(e) => setNewNote({ ...newNote, confidentialNotes: e.target.value })} className="form-textarea" placeholder="Private notes that will NOT be shown to clients in their portals..."></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowNoteModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Session Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE INVOICE */}
      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.5rem' }}>Generate Invoice for {selectedClient.firstName}</h3>
            <form onSubmit={handleCreateInvoice}>
              <div className="form-group">
                <label className="form-label">Service Description</label>
                <input type="text" required placeholder="E.g., CBT Session - 50 mins" value={newInvoice.servicesRendered} onChange={(e) => setNewInvoice({ ...newInvoice, servicesRendered: e.target.value })} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Fee Amount ($)</label>
                <input type="number" step="0.01" required placeholder="E.g., 150.00" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Due Date</label>
                <input type="date" required value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} className="form-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Issue Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDirectoryView;
