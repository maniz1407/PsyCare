import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiDollarSign, FiClock, FiCheckCircle, FiFileText } from 'react-icons/fi';

const BillingView = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchInvoices = async () => {
    try {
      const data = await api.invoices.getAll();
      setInvoices(data);
    } catch (err) {
      setError('Could not load billing records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkPaid = async (invoiceId) => {
    try {
      await api.invoices.updateStatus(invoiceId, 'PAID');
      fetchInvoices();
    } catch (err) {
      alert('Error updating payment status: ' + err.message);
    }
  };

  const calculateOutstanding = () => {
    return invoices
      .filter(inv => inv.status === 'UNPAID')
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  const calculateReceived = () => {
    return invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter === 'ALL') return true;
    return inv.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', marginTop: '10%' }}>
        <h3>Loading financial records...</h3>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</div>}

      {/* Financial Overview Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="stat-info">
            <span className="stat-label">Payments Received</span>
            <span className="stat-value" style={{ color: 'var(--color-success)' }}>
              ${calculateReceived().toFixed(2)}
            </span>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(60, 130, 90, 0.08)', color: 'var(--color-success)' }}>
            <FiCheckCircle />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div className="stat-info">
            <span className="stat-label">Outstanding Balances</span>
            <span className="stat-value" style={{ color: 'var(--color-danger)' }}>
              ${calculateOutstanding().toFixed(2)}
            </span>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(197, 74, 74, 0.08)', color: 'var(--color-danger)' }}>
            <FiClock />
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>Invoices Timeline</h3>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'UNPAID', 'PAID'].map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`btn ${statusFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2.5rem' }}>
            No matching invoice records found.
          </p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Client</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                    <td>{inv.client?.firstName} {inv.client?.lastName}</td>
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
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          Mark as Paid
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Settled</span>
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
  );
};

export default BillingView;
