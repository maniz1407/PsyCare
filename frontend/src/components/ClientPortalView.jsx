import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiCalendar, FiDollarSign, FiClock, FiVideo, FiUser } from 'react-icons/fi';
import GooglePayButton from './GooglePayButton';

const ClientPortalView = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPortalData = async () => {
    try {
      const profileData = await api.clients.getMe();
      setProfile(profileData);

      const apptData = await api.appointments.getMe();
      setAppointments(apptData);

      const invoiceData = await api.invoices.getMe();
      setInvoices(invoiceData);
    } catch (err) {
      setError('Could not load client portal data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handlePaymentSuccess = async (invoiceId, transactionId) => {
    try {
      setLoading(true);
      await api.invoices.pay(invoiceId, transactionId);
      alert('Payment completed successfully via Google Pay!');
      await fetchPortalData();
    } catch (err) {
      alert('Failed to register payment on backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', marginTop: '10%' }}>
        <h3>Loading your client portal...</h3>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Hello, {profile?.firstName || 'Client'}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to your personal care portal. View scheduled sessions and invoices below.</p>
      </div>

      {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</div>}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>
              <FiUser />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{profile?.firstName} {profile?.lastName}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Client</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Email:</span>
              <span>{profile?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Phone:</span>
              <span>{profile?.phoneNumber || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Date of Birth:</span>
              <span>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Schedule & Billing Columns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Appointments Card */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem' }}>Upcoming Appointments</h3>
            {appointments.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '1.5rem', textAlign: 'center' }}>
                No scheduled sessions found. Please contact your therapist to book.
              </p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt.id}>
                        <td style={{ fontWeight: 600 }}>{appt.title}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiClock style={{ color: 'var(--color-primary)' }} />
                            <span>
                              {new Date(appt.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${appt.status === 'CONFIRMED' ? 'success' : 'warning'}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          {appt.videoLink && appt.status === 'CONFIRMED' ? (
                            <a href={appt.videoLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                              <FiVideo /> Join Room
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>In Person</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Invoices Card */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem' }}>Your Invoices</h3>
            {invoices.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '1.5rem', textAlign: 'center' }}>
                No invoices issued yet.
              </p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Invoice No.</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                        <td>{inv.servicesRendered}</td>
                        <td style={{ fontWeight: 600 }}>${inv.amount.toFixed(2)}</td>
                        <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${inv.status === 'PAID' ? 'success' : 'danger'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td>
                          {inv.status === 'UNPAID' ? (
                            <GooglePayButton
                              amount={inv.amount}
                              invoiceId={inv.id}
                              onSuccess={(txId) => handlePaymentSuccess(inv.id, txId)}
                            />
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Paid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalView;
