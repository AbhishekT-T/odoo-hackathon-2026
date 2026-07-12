import React, { useState, useEffect } from 'react';
import { getDashboardKPIs } from '../api/dashboard';
import KPICard from '../components/KPICard';

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    setLoading(true);
    getDashboardKPIs({ type, status, region })
      .then(data => {
        setKpis(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load dashboard KPIs.');
        setLoading(false);
      });
  }, [type, status, region]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading operations dashboard...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--status-retired)' }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-description">Real-time transport and fleet operational metrics</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>Filter Operations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Vehicle Type</label>
            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
              <option value="">All Types</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Vehicle Status</label>
            <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%' }}>
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Region</label>
            <select className="form-control" value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '100%' }}>
              <option value="">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="National">National</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid-kpis">
        <KPICard 
          title="Active Vehicles" 
          value={kpis.activeVehicles} 
          footer="Vehicles currently on trip" 
          icon="🚚" 
        />
        <KPICard 
          title="Available Vehicles" 
          value={kpis.availableVehicles} 
          footer="Ready for dispatching" 
          icon="✅" 
        />
        <KPICard 
          title="In Maintenance" 
          value={kpis.vehiclesInMaintenance} 
          footer="Vehicles in the shop" 
          icon="🔧" 
        />
        <KPICard 
          title="Active Trips" 
          value={kpis.activeTrips} 
          footer="Trips currently dispatched" 
          icon="🗺️" 
        />
        <KPICard 
          title="Pending Trips" 
          value={kpis.pendingTrips} 
          footer="Trips in draft status" 
          icon="📝" 
        />
        <KPICard 
          title="Drivers On Duty" 
          value={kpis.driversOnDuty} 
          footer="Drivers on dispatched trips" 
          icon="👤" 
        />
        <KPICard 
          title="Fleet Utilization" 
          value={`${kpis.fleetUtilization}%`} 
          footer="Active / Non-Retired Vehicles" 
          icon="📈" 
        />
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Team Hackathon Notes &amp; Quick Links</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          This boilerplate connects the React frontend to the PostgreSQL backend database. All queries pull real-time database counts.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/vehicles" className="btn btn-secondary">Manage Fleet Registry</a>
          <a href="/trips" className="btn btn-primary">Dispatch New Trip</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
