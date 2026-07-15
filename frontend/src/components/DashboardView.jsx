import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ClientPortalView from './ClientPortalView';
import { FiUsers, FiCalendar, FiDollarSign, FiClock, FiVideo, FiFilePlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DashboardView = () => {
  const { isClient } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isClient()) return; // ClientPortalView will handle its own loading

    const fetchStats = async () => {
      try {
        const data = await api.dashboard.getStats();
        setStats(data);
      } catch (err) {
        setError('Could not load dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isClient]);

  if (isClient()) {
    return <ClientPortalView />;
  }

  if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', marginTop: '10%' }}>
        <h3>Loading your workspace statistics...</h3>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Welcome back, Doctor</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here is an overview of your clinical practice for today.</p>
      </div>

      {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</div>}

      {/* Stats Cards Grid */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Clients</span>
            <span className="stat-value">{stats?.totalClients || 0}</span>
          </div>
          <div className="stat-icon">
            <FiUsers />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <span className="stat-label">Upcoming Sessions</span>
            <span className="stat-value">{stats?.upcomingAppointmentsCount || 0}</span>
          </div>
          <div className="stat-icon">
            <FiCalendar />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <span className="stat-label">Outstanding Invoices</span>
            <span className="stat-value">${stats?.unpaidInvoicesTotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="stat-icon">
            <FiDollarSign />
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        {/* Upcoming Sessions Section */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Upcoming Sessions</h3>
            <Link to="/scheduler" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              View Schedule
            </Link>
          </div>

          {stats?.upcomingSessions?.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              No upcoming appointments scheduled.
            </p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.upcomingSessions?.map((session) => (
                    <tr key={session.id}>
                      <td style={{ fontWeight: 600 }}>{session.client?.firstName} {session.client?.lastName}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FiClock style={{ color: 'var(--color-primary)' }} />
                          <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            ({new Date(session.startTime).toLocaleDateString()})
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${session.status === 'CONFIRMED' ? 'success' : 'warning'}`}>
                          {session.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {session.videoLink && (
                            <a href={session.videoLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} title="Join Session">
                              <FiVideo />
                            </a>
                          )}
                          <Link to={`/clients?writeNote=${session.client?.id}&appt=${session.id}`} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} title="Create Session Note">
                            <FiFilePlus />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Clinical Reminder Widget */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Clinical Guidelines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
              <h5 style={{ color: 'var(--color-primary)' }}>Session Notes Deadline</h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Ensure all session logs and clinical assessments are entered within 24 hours of completion for compliance.
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid var(--color-accent)' }}>
              <h5 style={{ color: 'var(--color-accent-dark)' }}>Secure Communications</h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Keep all client sensitive identifiers separate from clinical summaries where appropriate to safeguard privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
