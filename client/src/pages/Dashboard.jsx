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

  useEffect(() => {
    getDashboardKPIs()
      .then(data => {
        setKpis(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load dashboard KPIs.');
        setLoading(false);
      });
  }, []);

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
