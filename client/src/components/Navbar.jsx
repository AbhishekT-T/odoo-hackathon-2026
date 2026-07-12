import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
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
        <strong style={{ color: 'var(--text-primary)' }}>Fleet Manager</strong>
      </div>
    </aside>
  );
};

export default Navbar;
