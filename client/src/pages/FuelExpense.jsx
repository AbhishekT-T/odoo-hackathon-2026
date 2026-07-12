import React, { useState, useEffect, useCallback } from 'react';
import { getFuelLogs, createFuelLog, deleteFuelLog } from '../api/fuelLogs';
import { getVehicles } from '../api/vehicles';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

const EXPENSE_TYPES = ['Fuel', 'Tolls', 'Oil', 'Tires', 'Other'];

const TYPE_COLORS = {
  Fuel:   { bg: 'rgba(99,102,241,0.15)',  text: '#a5b4fc' },
  Tolls:  { bg: 'rgba(245,158,11,0.15)',  text: '#fcd34d' },
  Oil:    { bg: 'rgba(16,185,129,0.15)',  text: '#6ee7b7' },
  Tires:  { bg: 'rgba(236,72,153,0.15)', text: '#f9a8d4' },
  Other:  { bg: 'rgba(100,116,139,0.15)',text: '#94a3b8' },
};

const StatChip = ({ label, value, accent }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '12px', padding: '1rem 1.4rem', flex: '1', minWidth: '140px',
  }}>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{label}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: accent || 'var(--text-primary)' }}>{value}</div>
  </div>
);

const FuelExpense = () => {
  const [allLogs, setAllLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to delete

  // Filters
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: '', liters: '', cost: '',
    date: new Date().toISOString().split('T')[0],
    expense_type: 'Fuel',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsData, vehiclesData] = await Promise.all([getFuelLogs(), getVehicles()]);
      setAllLogs(logsData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived filtered list ──────────────────────────────────────────────────
  const logs = allLogs.filter((l) => {
    if (filterVehicle && l.vehicle_id !== Number(filterVehicle)) return false;
    if (filterType && l.expense_type !== filterType) return false;
    if (filterFrom && l.date < filterFrom) return false;
    if (filterTo && l.date > filterTo) return false;
    return true;
  });

  // ── Summary stats over filtered list ──────────────────────────────────────
  const totalCost = logs.reduce((s, l) => s + parseFloat(l.cost || 0), 0);
  const totalLiters = logs.filter(l => l.expense_type === 'Fuel').reduce((s, l) => s + parseFloat(l.liters || 0), 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const payload = {
      ...formData,
      vehicle_id: parseInt(formData.vehicle_id),
      liters: formData.liters ? parseFloat(formData.liters) : 0,
      cost: parseFloat(formData.cost),
    };
    setSubmitting(true);
    try {
      await createFuelLog(payload);
      setShowModal(false);
      setFormData({ vehicle_id: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0], expense_type: 'Fuel' });
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Error logging expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFuelLog(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error deleting log');
    }
  };

  const clearFilters = () => { setFilterVehicle(''); setFilterType(''); setFilterFrom(''); setFilterTo(''); };
  const hasFilters = filterVehicle || filterType || filterFrom || filterTo;

  const formatDate = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return d; }
  };

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading fuel & expense logs…</div>
  );

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel & Expense Management</h1>
          <p className="page-description">Record fuel receipts, tolls, and other operational expenses</p>
        </div>
        <button id="btn-record-log" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Record Log
        </button>
      </div>

      {/* ── Summary Stats ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <StatChip label="Logs Shown" value={logs.length} />
        <StatChip label="Total Spend" value={fmt(totalCost)} accent="var(--status-inshop)" />
        <StatChip label="Total Fuel Liters" value={`${totalLiters.toFixed(1)} L`} accent="#a5b4fc" />
        <StatChip label="All-time Logs" value={allLogs.length} accent="var(--text-secondary)" />
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Vehicle</label>
            <select id="filter-vehicle" className="form-control" value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
              <option value="">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.registration_number})</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Expense Type</label>
            <select id="filter-type" className="form-control" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>From Date</label>
            <input id="filter-from" type="date" className="form-control" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>To Date</label>
            <input id="filter-to" type="date" className="form-control" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
          </div>
          {hasFilters && (
            <button className="btn btn-secondary" onClick={clearFilters} style={{ height: '38px' }}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Liters</th>
              <th>Cost</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  {hasFilters ? 'No logs match the current filters.' : 'No fuel logs recorded yet.'}
                </td>
              </tr>
            ) : (
              logs.map((l) => {
                const tc = TYPE_COLORS[l.expense_type] || TYPE_COLORS.Other;
                return (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{formatDate(l.date)}</td>
                    <td style={{ fontWeight: 600 }}>{l.vehicle_name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({l.vehicle_number})</span></td>
                    <td>
                      <span style={{ background: tc.bg, color: tc.text, padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600 }}>
                        {l.expense_type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{l.liters > 0 ? `${parseFloat(l.liters).toFixed(1)} L` : '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--status-inshop)' }}>{fmt(l.cost)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        id={`btn-delete-log-${l.id}`}
                        onClick={() => setDeleteConfirm(l.id)}
                        style={{
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                          color: 'var(--status-retired)', borderRadius: '8px', padding: '0.3rem 0.75rem',
                          cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.25)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {logs.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                <td colSpan={3} style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Totals ({logs.length} log{logs.length !== 1 ? 's' : ''})
                </td>
                <td style={{ fontWeight: 700 }}>{totalLiters.toFixed(1)} L</td>
                <td style={{ fontWeight: 800, color: 'var(--status-inshop)', fontSize: '1rem' }}>{fmt(totalCost)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── Create Modal ───────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Record Expense Log</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setFormError(''); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {formError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--status-retired)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                  ⚠ {formError}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Select Vehicle *</label>
                <select id="form-vehicle" name="vehicle_id" className="form-control" value={formData.vehicle_id} onChange={handleInputChange} required>
                  <option value="">— Choose Vehicle —</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.registration_number})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Expense Category *</label>
                <select id="form-expense-type" name="expense_type" className="form-control" value={formData.expense_type} onChange={handleInputChange}>
                  <option value="Fuel">Fuel (Diesel / Gas)</option>
                  <option value="Tolls">Tolls</option>
                  <option value="Oil">Oil & Fluids</option>
                  <option value="Tires">Tires</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>
              {(formData.expense_type === 'Fuel') && (
                <div className="form-group">
                  <label className="form-label">Liters *</label>
                  <input id="form-liters" type="number" step="0.01" min="0.01" name="liters" className="form-control"
                    placeholder="e.g. 45.5" value={formData.liters} onChange={handleInputChange} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Total Cost ($) *</label>
                <input id="form-cost" type="number" step="0.01" min="0.01" name="cost" className="form-control"
                  placeholder="e.g. 90.00" value={formData.cost} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input id="form-date" type="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setFormError(''); }}>Cancel</button>
                <button id="btn-save-expense" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────── */}
      {deleteConfirm !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: 'var(--status-retired)' }}>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Are you sure you want to permanently delete this fuel log? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                id="btn-confirm-delete"
                className="btn"
                style={{ background: 'var(--status-retired)', color: '#fff' }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelExpense;
