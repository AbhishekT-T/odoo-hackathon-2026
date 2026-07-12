import React, { useState, useEffect } from 'react';
import { getReportsData, getFleetSummary } from '../api/reports';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
const fmtFull = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

// Horizontal bar used inside table rows
const MiniBar = ({ value, max, color, label }) => {
  const pct = max > 0 ? Math.min((Math.abs(value) / Math.abs(max)) * 100, 100) : 0;
  return (
    <div style={{ minWidth: '100px' }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color, marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ background: 'var(--bg-input)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '99px', background: color, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
};

// Summary card at the top
const SummaryCard = ({ label, value, sub, accent, icon }) => (
  <div className="card" style={{ flex: '1', minWidth: '160px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: accent || 'var(--text-primary)' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{sub}</div>}
  </div>
);

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('roi');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    Promise.all([getReportsData(), getFleetSummary()])
      .then(([data, fleetData]) => {
        setReports(data);
        setSummary(fleetData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load report analytics.');
        setLoading(false);
      });
  }, []);

  // ── Sorting ───────────────────────────────────────────────────────────────
  const handleSort = (key) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...reports].sort((a, b) => {
    const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  // Max values for scaling bars
  const maxROI = Math.max(...reports.map(r => Math.abs(r.roi)), 1);
  const maxEff = Math.max(...reports.map(r => r.fuelEfficiency), 1);
  const maxRev = Math.max(...reports.map(r => r.revenue), 1);

  // ── CSV Export ────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      'Registration Number', 'Vehicle Name', 'Acquisition Cost ($)',
      'Fuel Cost ($)', 'Maintenance Cost ($)', 'Total Op. Cost ($)',
      'Fuel Efficiency (km/L)', 'Total Distance (km)',
      'Revenue ($)', 'Net Profit ($)', 'ROI (%)'
    ];

    const csvRows = [headers.join(',')];
    sorted.forEach(r => {
      const row = [
        r.registration_number,
        `"${r.name}"`,
        r.acquisitionCost ?? 0,
        r.fuelCost,
        r.maintenanceCost,
        r.totalOperationalCost,
        r.fuelEfficiency,
        r.totalDistance,
        r.revenue,
        r.netProfit,
        r.roi,
      ];
      csvRows.push(row.join(','));
    });

    // Summary row
    if (summary) {
      csvRows.push('');
      csvRows.push([
        'FLEET TOTAL', '', summary.totalAcquisitionCost ?? 0,
        summary.totalFuelCost, summary.totalMaintenanceCost, summary.totalOperationalCost,
        summary.avgFuelEfficiency, summary.totalDistance,
        summary.totalRevenue, summary.netProfit, summary.fleetROI
      ].join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transitops_fleet_roi_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const SortTh = ({ col, children }) => (
    <th
      onClick={() => handleSort(col)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      {children} {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↕</span>}
    </th>
  );

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading analytics reports…</div>
  );
  if (error) return (
    <div style={{ padding: '2rem', color: 'var(--status-retired)' }}>Error: {error}</div>
  );

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-description">Vehicle efficiency, operational costs, and ROI analysis</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button id="btn-export-csv" className="btn btn-secondary" onClick={exportToCSV}>
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* ── Fleet Summary Cards ────────────────────────────── */}
      {summary && (
        <>
          <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
            Fleet-Wide Summary — {summary.vehicleCount} Vehicles
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <SummaryCard label="Total Revenue" value={fmt(summary.totalRevenue)} sub="Completed trips" accent="var(--status-available)" icon="💰" />
            <SummaryCard label="Total Fuel Cost" value={fmt(summary.totalFuelCost)} sub="All fuel logs" accent="#a5b4fc" icon="⛽" />
            <SummaryCard label="Total Maintenance" value={fmt(summary.totalMaintenanceCost)} sub="All maintenance records" accent="var(--status-inshop)" icon="🔧" />
            <SummaryCard label="Total Op. Cost" value={fmt(summary.totalOperationalCost)} sub="Fuel + Maintenance" accent="#f472b6" icon="💸" />
            <SummaryCard
              label="Net Profit"
              value={fmt(summary.netProfit)}
              sub={summary.netProfit >= 0 ? '▲ Profitable' : '▼ At a loss'}
              accent={summary.netProfit >= 0 ? 'var(--status-available)' : 'var(--status-retired)'}
              icon={summary.netProfit >= 0 ? '📈' : '📉'}
            />
            <SummaryCard label="Fleet ROI" value={`${summary.fleetROI}%`} sub="(Revenue−Cost) / Acq. Cost" accent={summary.fleetROI >= 0 ? 'var(--status-available)' : 'var(--status-retired)'} icon="🏆" />
            <SummaryCard label="Avg Fuel Efficiency" value={`${summary.avgFuelEfficiency} km/L`} sub="Fleet average" accent="#67e8f9" icon="⚡" />
          </div>
        </>
      )}

      {/* ── Per-Vehicle Analytics Table ────────────────────── */}
      <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
        Per-Vehicle Breakdown — click column headers to sort
      </h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <SortTh col="registration_number">Reg Number</SortTh>
              <th>Vehicle</th>
              <SortTh col="fuelCost">Fuel Cost</SortTh>
              <SortTh col="maintenanceCost">Maint. Cost</SortTh>
              <SortTh col="totalOperationalCost">Total Op. Cost</SortTh>
              <SortTh col="revenue">Revenue</SortTh>
              <SortTh col="netProfit">Net Profit</SortTh>
              <SortTh col="fuelEfficiency">Fuel Eff.</SortTh>
              <SortTh col="roi">ROI</SortTh>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No vehicle analytics data yet.
                </td>
              </tr>
            ) : (
              sorted.map((r) => {
                const isProfit = r.netProfit >= 0;
                const isGoodROI = r.roi >= 0;
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>
                      {r.registration_number}
                    </td>
                    <td style={{ maxWidth: '160px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.name}
                      </div>
                    </td>
                    <td>{fmtFull(r.fuelCost)}</td>
                    <td>{fmtFull(r.maintenanceCost)}</td>
                    <td style={{ fontWeight: 600 }}>{fmtFull(r.totalOperationalCost)}</td>
                    <td style={{ color: 'var(--status-available)', fontWeight: 600 }}>{fmtFull(r.revenue)}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: isProfit ? 'var(--status-available)' : 'var(--status-retired)',
                      }}>
                        {isProfit ? '+' : ''}{fmtFull(r.netProfit)}
                      </span>
                    </td>
                    <td>
                      <MiniBar value={r.fuelEfficiency} max={maxEff} color="#67e8f9" label={`${r.fuelEfficiency} km/L`} />
                    </td>
                    <td>
                      <MiniBar value={r.roi} max={maxROI} color={isGoodROI ? 'var(--status-available)' : 'var(--status-retired)'}
                        label={`${isGoodROI ? '+' : ''}${r.roi}%`} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Totals footer */}
          {sorted.length > 0 && summary && (
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border-color)', background: 'rgba(99,102,241,0.04)' }}>
                <td colSpan={2} style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Fleet Total
                </td>
                <td style={{ fontWeight: 700 }}>{fmt(summary.totalFuelCost)}</td>
                <td style={{ fontWeight: 700 }}>{fmt(summary.totalMaintenanceCost)}</td>
                <td style={{ fontWeight: 800 }}>{fmt(summary.totalOperationalCost)}</td>
                <td style={{ fontWeight: 700, color: 'var(--status-available)' }}>{fmt(summary.totalRevenue)}</td>
                <td style={{ fontWeight: 800, color: summary.netProfit >= 0 ? 'var(--status-available)' : 'var(--status-retired)' }}>
                  {summary.netProfit >= 0 ? '+' : ''}{fmt(summary.netProfit)}
                </td>
                <td style={{ fontWeight: 700, color: '#67e8f9' }}>{summary.avgFuelEfficiency} km/L</td>
                <td style={{ fontWeight: 800, color: summary.fleetROI >= 0 ? 'var(--status-available)' : 'var(--status-retired)' }}>
                  {summary.fleetROI >= 0 ? '+' : ''}{summary.fleetROI}%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── Formula Reference ──────────────────────────────── */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '0.9rem', fontSize: '0.95rem' }}>📐 Calculation Reference</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Operational Cost', formula: 'Fuel Logs Total + Maintenance Cost', color: '#f472b6' },
            { label: 'Fuel Efficiency', formula: 'Total Completed Distance (km) ÷ Total Fuel (L)', color: '#67e8f9' },
            { label: 'Revenue', formula: 'Completed Trip Distance × $2.50 / km', color: 'var(--status-available)' },
            { label: 'Net Profit', formula: 'Revenue − Operational Cost', color: 'var(--status-available)' },
            { label: 'Vehicle ROI', formula: '(Revenue − Op. Cost) ÷ Acquisition Cost × 100', color: '#a5b4fc' },
            { label: 'Fleet ROI', formula: 'Total Net Profit ÷ Total Acquisition Cost × 100', color: '#a5b4fc' },
          ].map(({ label, formula, color }) => (
            <div key={label} style={{ padding: '0.9rem', background: 'var(--bg-input)', borderRadius: '10px', borderLeft: `3px solid ${color}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{label}</div>
              <code style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{formula}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
