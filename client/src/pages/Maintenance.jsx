import React, { useState, useEffect } from 'react';
import { getMaintenances, createMaintenance, updateMaintenance } from '../api/maintenance';
import { getVehicles } from '../api/vehicles';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: '',
    description: '',
    cost: '',
    status: 'Active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const logsData = await getMaintenances();
      const vehiclesData = await getVehicles();
      setLogs(logsData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      vehicle_id: parseInt(formData.vehicle_id),
      cost: parseFloat(formData.cost || 0)
    };

    createMaintenance(payload)
      .then(() => {
        setShowModal(false);
        setFormData({ vehicle_id: '', description: '', cost: '', status: 'Active' });
        loadData();
      })
      .catch(err => {
        alert(err.response?.data?.error || err.message || 'Error logging maintenance');
      });
  };

  const closeLog = (log) => {
    updateMaintenance(log.id, { ...log, status: 'Closed' })
      .then(() => loadData())
      .catch(err => alert(err.message));
  };

  const renderMaintenanceProgress = (status) => {
    const isActive = status === 'Active';
    const isClosed = status === 'Closed';
    return (
      <div className="stepper-progress maint">
        <div className={`step active ${isActive ? 'active' : 'completed'}`}>
          <div className="step-dot"></div>
          <span className="step-label">Active</span>
        </div>
        <div className={`step-line ${isClosed ? 'active-completed' : ''}`}></div>
        <div className={`step ${isClosed ? 'active completed' : 'inactive'}`}>
          <div className="step-dot"></div>
          <span className="step-label">Closed</span>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading maintenance logs...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Maintenance</h1>
          <p className="page-description">Log repair operations, diagnostic checklists, and track costs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Maintenance</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Log Ref</th>
              <th>Vehicle</th>
              <th>Description</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 'bold' }}>MAINT-{l.id}</td>
                <td>{l.vehicle_name} ({l.vehicle_number})</td>
                <td>{l.description || 'No description provided.'}</td>
                <td>${parseFloat(l.cost).toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span className={`badge badge-${l.status.toLowerCase()}`} style={{ width: 'fit-content' }}>
                      {l.status}
                    </span>
                    {renderMaintenanceProgress(l.status)}
                  </div>
                </td>
                <td>
                  {l.status === 'Active' && (
                    <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--status-available)' }} onClick={() => closeLog(l)}>
                      Close Log
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Log Vehicle Maintenance</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Vehicle</label>
                <select name="vehicle_id" className="form-control" value={formData.vehicle_id} onChange={handleInputChange} required>
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.registration_number}) - Status: {v.status}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea 
                  name="description" 
                  className="form-control" 
                  placeholder="e.g. Brake replacement, regular service, battery diagnostic"
                  rows="3"
                  value={formData.description} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated/Actual Cost ($)</label>
                <input 
                  type="number" 
                  name="cost" 
                  className="form-control" 
                  placeholder="e.g. 150" 
                  value={formData.cost} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Start Maintenance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
