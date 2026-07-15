import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import ClientDirectoryView from './components/ClientDirectoryView';
import AppointmentSchedulerView from './components/AppointmentSchedulerView';
import BillingView from './components/BillingView';

// Protected layout wrapper
const AppLayout = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <h3>Initializing secure session...</h3>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/clients" element={<PsychologistRoute><ClientDirectoryView /></PsychologistRoute>} />
          <Route path="/scheduler" element={<AppointmentSchedulerView />} />
          <Route path="/billing" element={<BillingView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Route protection for psychologist portal only
const PsychologistRoute = ({ children }) => {
  const { isPsychologist } = useAuth();
  if (!isPsychologist()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute><LoginView /></LoginRoute>} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Prevent logged in users from hitting /login
const LoginRoute = ({ children }) => {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default App;
