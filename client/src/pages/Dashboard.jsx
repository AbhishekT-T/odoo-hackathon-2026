import React, { useState, useEffect, useCallback } from 'react';
import { getDashboardKPIs } from '../api/dashboard';
import KPICard from '../components/KPICard';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

// Thin progress bar component
const UtilBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {value} / {max}
        </span>
      </div>
      <div style={{ background: 'var(--bg-input)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: '99px',
            background: color,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    completedTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0,
    // financial
    totalFuelSpend: 0,
    totalMaintenanceCost: 0,
    totalOperationalCost: 0,
    totalRevenue: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');

  const loadKPIs = useCallback(() => {
    setLoading(true);
    getDashboardKPIs({ type, status, region })
      .then((data) => { setKpis(data); setLoading(false); })
      .catch((err) => { setError(err.message || 'Failed to load dashboard KPIs.'); setLoading(false); });
  }, [type, status, region]);

  useEffect(() => { loadKPIs(); }, [loadKPIs]);

  const totalFleet = kpis.activeVehicles + kpis.availableVehicles + kpis.vehiclesInMaintenance;
  const isProfitable = kpis.netProfit >= 0;

  if (loading) return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
      <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid var(--accent-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading operations dashboard…
    </div>
  );
  if (error) return <div style={{ padding: '2rem', color: 'var(--status-retired)' }}>Error: {error}</div>;

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-description">Real-time transport and fleet operational metrics</p>
        </div>
        <button className="btn btn-secondary" onClick={loadKPIs} id="dashboard-refresh-btn">
          ↺ Refresh
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Filter Fleet
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Vehicle Type</label>
            <select id="filter-type" className="form-control" value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
              <option value="">All Types</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Delivery Van">Delivery Van</option>
              <option value="Heavy Duty Truck">Heavy Duty Truck</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Vehicle Status</label>
            <select id="filter-status" className="form-control" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%' }}>
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Region</label>
            <select id="filter-region" className="form-control" value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '100%' }}>
              <option value="">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="National">National</option>
            </select>
          </div>
          {(type || status || region) && (
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-secondary" style={{ width: '100%' }}
                onClick={() => { setType(''); setStatus(''); setRegion(''); }}>
                ✕ Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Operational KPI Cards ─────────────────────────── */}
      <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
        Operational KPIs
      </h2>
      <div className="grid-kpis" style={{ marginBottom: '2rem' }}>
        <KPICard title="Active (On Trip)" value={kpis.activeVehicles} footer="Vehicles currently on trip" icon="🚚" />
        <KPICard title="Available" value={kpis.availableVehicles} footer="Ready for dispatching" icon="✅" />
        <KPICard title="In Maintenance" value={kpis.vehiclesInMaintenance} footer="Vehicles in the shop" icon="🔧" />
        <KPICard title="Active Trips" value={kpis.activeTrips} footer="Trips currently dispatched" icon="🗺️" />
        <KPICard title="Pending Trips" value={kpis.pendingTrips} footer="Trips in draft status" icon="📝" />
        <KPICard title="Completed Trips" value={kpis.completedTrips} footer="Successfully finished trips" icon="🏁" />
        <KPICard title="Drivers On Duty" value={kpis.driversOnDuty} footer="Drivers on dispatched trips" icon="👤" />
      </div>

      {/* ── Financial KPI Cards ───────────────────────────── */}
      <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
        Financial KPIs
      </h2>
      <div className="grid-kpis" style={{ marginBottom: '2rem' }}>
        <KPICard title="Total Fuel Spend" value={fmt(kpis.totalFuelSpend)} footer="All fuel & expense logs" icon="⛽" />
        <KPICard title="Maintenance Cost" value={fmt(kpis.totalMaintenanceCost)} footer="All maintenance records" icon="🛠️" />
        <KPICard title="Total Op. Cost" value={fmt(kpis.totalOperationalCost)} footer="Fuel + Maintenance" icon="💸" />
        <KPICard title="Total Revenue" value={fmt(kpis.totalRevenue)} footer="Completed trip revenue" icon="💰" />
        <KPICard
          title="Net Profit"
          value={fmt(kpis.netProfit)}
          footer={isProfitable ? '▲ Operating at a profit' : '▼ Operating at a loss'}
          icon={isProfitable ? '📈' : '📉'}
        />
      </div>

      {/* ── Fleet Utilization Panel ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>
            Fleet Status Breakdown
          </h3>
          {/* Big utilization number */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `conic-gradient(var(--accent-color) ${kpis.fleetUtilization * 3.6}deg, var(--bg-input) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 0 0 4px var(--bg-card)',
            }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-color)' }}>{kpis.fleetUtilization}%</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{kpis.fleetUtilization}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fleet Utilization Rate</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Active / Non-Retired Vehicles</div>
            </div>
          </div>
          <UtilBar label="Available" value={kpis.availableVehicles} max={totalFleet} color="var(--status-available)" />
          <UtilBar label="On Trip" value={kpis.activeVehicles} max={totalFleet} color="var(--status-ontrip)" />
          <UtilBar label="In Maintenance" value={kpis.vehiclesInMaintenance} max={totalFleet} color="var(--status-inshop)" />
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>
            Financial Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {[
              { label: 'Revenue', val: kpis.totalRevenue, color: 'var(--status-available)' },
              { label: 'Fuel Spend', val: kpis.totalFuelSpend, color: 'var(--status-inshop)' },
              { label: 'Maintenance', val: kpis.totalMaintenanceCost, color: '#a78bfa' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{label}</span>
                </div>
                <span style={{ fontWeight: 700, color }}>{fmt(val)}</span>
              </div>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Net Profit</span>
              <span style={{ fontWeight: 800, color: isProfitable ? 'var(--status-available)' : 'var(--status-retired)', fontSize: '1.05rem' }}>
                {fmt(kpis.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────── */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/vehicles" className="btn btn-secondary" id="dash-link-fleet">Manage Fleet Registry</a>
          <a href="/trips" className="btn btn-primary" id="dash-link-trips">Dispatch New Trip</a>
          <a href="/fuel-expenses" className="btn btn-secondary" id="dash-link-fuel">Log Fuel Expense</a>
          <a href="/reports" className="btn btn-secondary" id="dash-link-reports">View Reports & ROI</a>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
