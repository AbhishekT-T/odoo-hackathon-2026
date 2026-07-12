import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Fleet Manager", "role": "Fleet Manager"}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
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
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Logged in as:</p>
        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.8rem' }}>{user.name} ({user.role})</strong>
        <button 
          onClick={handleLogout} 
          className="btn btn-secondary" 
          style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-retired)', border: 'none' }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
