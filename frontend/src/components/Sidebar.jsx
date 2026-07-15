import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiUsers, FiCalendar, FiDollarSign, FiLogOut, FiHeart } from 'react-icons/fi';

const Sidebar = () => {
  const { logout, user, isPsychologist } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <FiHeart />
        </div>
        <span className="brand-name">PsyCare</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <FiGrid size={18} />
          <span>Dashboard</span>
        </NavLink>

        {isPsychologist() && (
          <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FiUsers size={18} />
            <span>Clients</span>
          </NavLink>
        )}

        <NavLink to="/scheduler" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiCalendar size={18} />
          <span>Appointments</span>
        </NavLink>

        <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiDollarSign size={18} />
          <span>Billing & Invoices</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'PS'}
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">
              {isPsychologist() ? 'Clinical Psychologist' : 'Client Profile'}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
          <FiLogOut />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
