import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiLock, FiUser, FiMail, FiUserCheck } from 'react-icons/fi';

const LoginView = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ROLE_PSYCHOLOGIST');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const data = await api.auth.login(username, password);
        login(
          { id: data.userId, username: data.username, role: data.role },
          data.accessToken
        );
        window.location.href = '/';
      } else {
        await api.auth.register({
          username, password, email, role,
          firstName: role === 'ROLE_CLIENT' ? firstName : null,
          lastName: role === 'ROLE_CLIENT' ? lastName : null
        });
        setSuccess('Registration successful! You can now log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiHeart style={{ animation: 'pulseGlow 2s infinite' }} />
          </div>
          <h2 className="auth-title">PsyCare Workspace</h2>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to access your secure clinical workspace' : 'Create an account to begin'}
          </p>
        </div>

        {error && <div style={{ color: 'var(--color-danger)', background: 'rgba(197, 74, 74, 0.08)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'var(--color-success)', background: 'rgba(60, 130, 90, 0.08)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem', textAlign: 'center' }}>{success}</div>}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <FiUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Account Purpose</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-select"
                    style={{ paddingLeft: '2.5rem' }}
                  >
                    <option value="ROLE_PSYCHOLOGIST">Clinical Psychologist / Administrator</option>
                    <option value="ROLE_CLIENT">Patient / Client portal access</option>
                  </select>
                  <FiUserCheck style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {role === 'ROLE_CLIENT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" required placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" required placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} className="form-input" />
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? 'Processing...' : isLogin ? 'Access Portal' : 'Register Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <span onClick={() => setIsLogin(false)} className="auth-link">
                Sign up
              </span>
            </>
          ) : (
            <>
              Already registered?{' '}
              <span onClick={() => setIsLogin(true)} className="auth-link">
                Sign in
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
