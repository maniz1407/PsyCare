import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const [theme, setTheme] = useState(localStorage.getItem('psycare_theme') || 'light');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('psycare_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/clients':
        return 'Client Directory';
      case '/scheduler':
        return 'Interactive Scheduler';
      case '/billing':
        return 'Billing & Financials';
      default:
        return 'PsyCare Workspace';
    }
  };

  return (
    <header className="header">
      <h2 className="header-title">{getPageTitle()}</h2>
      <div className="header-actions">
        <button onClick={toggleTheme} className="icon-btn" title="Toggle Light/Dark Theme">
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
