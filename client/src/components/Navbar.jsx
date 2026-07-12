import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signup');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span style={{ fontSize: '1.5rem' }}>🚚</span>
        <span>TransitOps</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/vehicles" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span>🚛</span> Vehicles
        </NavLink>
        <NavLink to="/drivers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span>👤</span> Drivers
        </NavLink>
        <NavLink to="/trips" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span>🗺️</span> Trips
        </NavLink>
        <NavLink to="/maintenance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span>🔧</span> Maintenance
        </NavLink>
        <NavLink to="/fuel-expenses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span>⛽</span> Fuel &amp; Expenses
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span>📈</span> Reports
        </NavLink>
      </nav>
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>Logged in as:</p>
        <strong style={{ color: 'var(--text-primary)' }}>{user?.full_name || user?.username || 'User'}</strong>
        <button 
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ 
            width: '100%', 
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            padding: '0.5rem'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
