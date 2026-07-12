import React, { useState, useEffect } from 'react';
import { getFuelLogs, createFuelLog } from '../api/fuelLogs';
import { getVehicles } from '../api/vehicles';

const FuelExpense = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: '',
    liters: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    expense_type: 'Fuel'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const logsData = await getFuelLogs();
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
      liters: parseFloat(formData.liters),
      cost: parseFloat(formData.cost)
    };

    createFuelLog(payload)
      .then(() => {
        setShowModal(false);
        setFormData({
          vehicle_id: '',
          liters: '',
          cost: '',
          date: new Date().toISOString().split('T')[0],
          expense_type: 'Fuel'
        });
        loadData();
      })
      .catch(err => {
        alert(err.response?.data?.error || err.message || 'Error logging fuel expense');
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading fuel &amp; expense logs...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel &amp; Expense Management</h1>
          <p className="page-description">Record fuel receipts, tolls, and other operational expenses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record Log</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Expense Type</th>
              <th>Liters</th>
              <th>Cost ($)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td>{formatDate(l.date)}</td>
                <td style={{ fontWeight: 'bold' }}>{l.vehicle_name} ({l.vehicle_number})</td>
                <td>
                  <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                    {l.expense_type}
                  </span>
                </td>
                <td>{l.liters ? `${l.liters} L` : 'N/A'}</td>
                <td style={{ fontWeight: 'bold' }}>${parseFloat(l.cost).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Record Expense Log</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Vehicle</label>
                <select name="vehicle_id" className="form-control" value={formData.vehicle_id} onChange={handleInputChange} required>
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.registration_number})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Expense Category</label>
                <select name="expense_type" className="form-control" value={formData.expense_type} onChange={handleInputChange}>
                  <option value="Fuel">Fuel (Diesel / Gas)</option>
                  <option value="Tolls">Tolls</option>
                  <option value="Oil">Oil &amp; Fluids</option>
                  <option value="Tires">Tires</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Liters (Only for Fuel)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="liters" 
                  className="form-control" 
                  placeholder="e.g. 45" 
                  value={formData.liters} 
                  onChange={handleInputChange} 
                  required={formData.expense_type === 'Fuel'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="cost" 
                  className="form-control" 
                  placeholder="e.g. 90.00" 
                  value={formData.cost} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  className="form-control" 
                  value={formData.date} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelExpense;
