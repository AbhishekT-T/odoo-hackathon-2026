import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriver } from '../api/drivers';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    license_category: 'Class A CDL',
    license_expiry_date: '',
    contact_number: '',
    safety_score: '100',
    status: 'Available'
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = () => {
    setLoading(true);
    getDrivers()
      .then(data => {
        setDrivers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load drivers.');
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      safety_score: parseFloat(formData.safety_score || 100)
    };

    createDriver(payload)
      .then(() => {
        setShowModal(false);
        setFormData({
          name: '',
          license_number: '',
          license_category: 'Class A CDL',
          license_expiry_date: '',
          contact_number: '',
          safety_score: '100',
          status: 'Available'
        });
        loadDrivers();
      })
      .catch(err => {
        alert(err.response?.data?.error || err.message || 'Error adding driver');
      });
  };

  const toggleStatus = (driver, newStatus) => {
    updateDriver(driver.id, { ...driver, status: newStatus })
      .then(() => loadDrivers())
      .catch(err => alert(err.message));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading driver profiles...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--status-retired)' }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Management</h1>
          <p className="page-description">Maintain driver profiles, compliance, and safety scores</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Driver</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>License Number</th>
              <th>Category</th>
              <th>License Expiry</th>
              <th>Contact Number</th>
              <th>Safety Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 'bold' }}>{d.name}</td>
                <td>{d.license_number}</td>
                <td>{d.license_category}</td>
                <td>{formatDate(d.license_expiry_date)}</td>
                <td>{d.contact_number || 'N/A'}</td>
                <td style={{ color: d.safety_score >= 85 ? 'var(--status-available)' : 'var(--status-inshop)' }}>
                  {d.safety_score} / 100
                </td>
                <td>
                  <span className={`badge badge-${d.status.toLowerCase().replace(' ', '')}`}>
                    {d.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {d.status !== 'Suspended' ? (
                      <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--status-suspended)' }} onClick={() => toggleStatus(d, 'Suspended')}>
                        Suspend
                      </button>
                    ) : (
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => toggleStatus(d, 'Available')}>
                        Reinstate
                      </button>
                    )}
                  </div>
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
              <h2 className="modal-title">Register Driver</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Driver Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  placeholder="e.g. Alex" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input 
                  type="text" 
                  name="license_number" 
                  className="form-control" 
                  placeholder="e.g. DL-99999X" 
                  value={formData.license_number} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">License Category</label>
                <select name="license_category" className="form-control" value={formData.license_category} onChange={handleInputChange}>
                  <option value="Class A CDL">Class A CDL (Heavy Trucks)</option>
                  <option value="Class B CDL">Class B CDL (Buses / Straight Trucks)</option>
                  <option value="Standard Driver License">Standard Driver License</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">License Expiry Date</label>
                <input 
                  type="date" 
                  name="license_expiry_date" 
                  className="form-control" 
                  value={formData.license_expiry_date} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input 
                  type="text" 
                  name="contact_number" 
                  className="form-control" 
                  placeholder="e.g. +1 555-0177" 
                  value={formData.contact_number} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Safety Score</label>
                <input 
                  type="number" 
                  name="safety_score" 
                  className="form-control" 
                  min="0" 
                  max="100" 
                  placeholder="e.g. 100" 
                  value={formData.safety_score} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
