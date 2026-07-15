import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiChevronLeft, FiChevronRight, FiPlus, FiClock, FiVideo } from 'react-icons/fi';

const AppointmentSchedulerView = () => {
  const { isPsychologist } = useAuth();
  
  // Date states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    clientId: '', title: '', startTime: '', endTime: '', videoLink: '', notes: '', price: '150.00'
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get start and end of the current month view
  const fetchAppointments = async () => {
    const startOfMonth = new Date(year, month, 1).toISOString();
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    try {
      const data = await api.appointments.getAll(startOfMonth, endOfMonth);
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClients = async () => {
    if (!isPsychologist()) return;
    try {
      const data = await api.clients.getAll();
      setClients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAppointments(), fetchClients()]).finally(() => setLoading(false));
  }, [currentDate]);

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleCellClick = (dayNum) => {
    if (!isPsychologist()) return; // Read-only for clients
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
    setNewAppointment({
      clientId: clients[0]?.id || '',
      title: 'Therapy Session',
      startTime: `${dateStr}T10:00`,
      endTime: `${dateStr}T10:50`,
      videoLink: '',
      notes: '',
      price: '150.00'
    });
    setShowBookingModal(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        client: { id: parseInt(newAppointment.clientId) },
        title: newAppointment.title,
        startTime: new Date(newAppointment.startTime).toISOString(),
        endTime: new Date(newAppointment.endTime).toISOString(),
        videoLink: newAppointment.videoLink || null,
        notes: newAppointment.notes || null,
        status: 'CONFIRMED',
        price: parseFloat(newAppointment.price),
        paymentStatus: parseFloat(newAppointment.price) > 0 ? 'UNPAID' : 'EXEMPT'
      };
      await api.appointments.create(payload);
      fetchAppointments();
      setShowBookingModal(false);
    } catch (err) {
      alert(err.message || 'Error booking appointment');
    }
  };

  // Helper to filter appointments for a specific day
  const getDayAppointments = (dayNum) => {
    return appointments.filter(appt => {
      const apptDate = new Date(appt.startTime);
      return apptDate.getDate() === dayNum &&
             apptDate.getMonth() === month &&
             apptDate.getFullYear() === year;
    });
  };

  // Render Calendar Grid Cells
  const renderCells = () => {
    const cells = [];
    
    // Add empty spacer cells for padding
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAppts = getDayAppointments(day);
      cells.push(
        <div key={`day-${day}`} className="calendar-day" onClick={() => handleCellClick(day)}>
          <span className="calendar-day-num">{day}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', overflowY: 'auto', flex: 1 }}>
            {dayAppts.map(appt => (
              <div
                key={appt.id}
                className={`calendar-event ${appt.status === 'CANCELLED' ? 'cancelled' : ''}`}
                title={`${appt.title} (${new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) - ${appt.client?.firstName} ${appt.client?.lastName}`}
              >
                <strong>{new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> {appt.client?.firstName} {appt.client?.lastName.substring(0, 1)}.
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', marginTop: '10%' }}>
        <h3>Loading Schedule...</h3>
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      <div className="glass-card calendar-container">
        {/* Calendar Nav */}
        <div className="calendar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={prevMonth} className="icon-btn"><FiChevronLeft /></button>
            <h2 style={{ margin: 0, minWidth: '180px', textAlign: 'center' }}>
              {monthNames[month]} {year}
            </h2>
            <button onClick={nextMonth} className="icon-btn"><FiChevronRight /></button>
          </div>
          {isPsychologist() && (
            <button onClick={() => handleCellClick(new Date().getDate())} className="btn btn-primary">
              <FiPlus /> Schedule Session
            </button>
          )}
        </div>

        {/* Days of Week Labels */}
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-label">{day}</div>
          ))}
          
          {/* Calendar Day Cells */}
          {renderCells()}
        </div>
      </div>

      {/* MODAL: BOOK APPOINTMENT */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.5rem' }}>Schedule Clinical Session</h3>
            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label className="form-label">Client Name *</label>
                <select
                  required
                  value={newAppointment.clientId}
                  onChange={(e) => setNewAppointment({ ...newAppointment, clientId: e.target.value })}
                  className="form-select"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Session Title</label>
                <input
                  type="text"
                  required
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newAppointment.startTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newAppointment.endTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, endTime: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Telehealth Video Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://meet.jit.si/psycare-room-name"
                  value={newAppointment.videoLink}
                  onChange={(e) => setNewAppointment({ ...newAppointment, videoLink: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Session Fee ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newAppointment.price}
                  onChange={(e) => setNewAppointment({ ...newAppointment, price: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scheduling Notes</label>
                <textarea
                  rows="2"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  className="form-textarea"
                  placeholder="Payment term, reminder notes..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentSchedulerView;
