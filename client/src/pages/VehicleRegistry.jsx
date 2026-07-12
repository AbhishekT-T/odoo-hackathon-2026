import React, { useState, useEffect } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles';

const VehicleRegistry = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    registration_number: '',
    name: '',
    type: 'Delivery Van',
    max_load_capacity: '',
    odometer: '',
    acquisition_cost: '',
    status: 'Available'
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = () => {
    setLoading(true);
    getVehicles()
      .then(data => {
        setVehicles(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load vehicles.');
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      registration_number: '',
      name: '',
      type: 'Delivery Van',
      max_load_capacity: '',
      odometer: '',
      acquisition_cost: '',
      status: 'Available'
    });
    setIsEditing(false);
    setEditVehicleId(null);
  };

  const handleRegisterClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleEditClick = (v) => {
    setFormData({
      registration_number: v.registration_number,
      name: v.name,
      type: v.type,
      max_load_capacity: v.max_load_capacity,
      odometer: v.odometer,
      acquisition_cost: v.acquisition_cost,
      status: v.status
    });
    setIsEditing(true);
    setEditVehicleId(v.id);
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle(id)
        .then(() => {
          loadVehicles();
        })
        .catch(err => {
          alert(err.response?.data?.error || err.message || 'Error deleting vehicle');
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert numerical inputs
    const payload = {
      ...formData,
      max_load_capacity: parseFloat(formData.max_load_capacity),
      odometer: parseFloat(formData.odometer || 0),
      acquisition_cost: parseFloat(formData.acquisition_cost || 0)
    };

    if (isEditing) {
      updateVehicle(editVehicleId, payload)
        .then(() => {
          setShowModal(false);
          resetForm();
          loadVehicles();
        })
        .catch(err => {
          alert(err.response?.data?.error || err.message || 'Error updating vehicle');
        });
    } else {
      createVehicle(payload)
        .then(() => {
          setShowModal(false);
          resetForm();
          loadVehicles();
        })
        .catch(err => {
          alert(err.response?.data?.error || err.message || 'Error creating vehicle');
        });
    }
  };

  const toggleStatus = (vehicle, newStatus) => {
    updateVehicle(vehicle.id, { ...vehicle, status: newStatus })
      .then(() => loadVehicles())
      .catch(err => alert(err.response?.data?.error || err.message));
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading vehicle registry...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--status-retired)' }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Registry</h1>
          <p className="page-description">Manage and view company transport vehicles</p>
        </div>
        <button className="btn btn-primary" onClick={handleRegisterClick}>+ Register Vehicle</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Reg Number</th>
              <th>Vehicle Name/Model</th>
              <th>Type</th>
              <th>Max Load</th>
              <th>Odometer</th>
              <th>Acq Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td style={{ fontWeight: 'bold' }}>{v.registration_number}</td>
                <td>{v.name}</td>
                <td>{v.type}</td>
                <td>{v.max_load_capacity} kg</td>
                <td>{v.odometer} km</td>
                <td>${parseFloat(v.acquisition_cost).toLocaleString()}</td>
                <td>
                  <span className={`badge badge-${v.status.toLowerCase().replace(' ', '')}`}>
                    {v.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEditClick(v)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteClick(v.id)}>
                      Delete
                    </button>
                    {v.status !== 'Retired' && (
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => toggleStatus(v, 'Retired')}>
                        Retire
                      </button>
                    )}
                    {v.status === 'In Shop' && (
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => toggleStatus(v, 'Available')}>
                        Release
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
              <h2 className="modal-title">{isEditing ? 'Edit Vehicle' : 'Register Vehicle'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Registration Number (Unique)</label>
                <input 
                  type="text" 
                  name="registration_number" 
                  className="form-control" 
                  placeholder="e.g. TX-707-VN" 
                  value={formData.registration_number} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Name / Model</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  placeholder="e.g. Ford Transit Cargo Van" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select name="type" className="form-control" value={formData.type} onChange={handleInputChange}>
                  <option value="Delivery Van">Delivery Van</option>
                  <option value="Heavy Duty Truck">Heavy Duty Truck</option>
                  <option value="Flatbed Truck">Flatbed Truck</option>
                  <option value="Electric Cargo">Electric Cargo</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Max Load Capacity (kg)</label>
                <input 
                  type="number" 
                  name="max_load_capacity" 
                  className="form-control" 
                  placeholder="e.g. 500" 
                  value={formData.max_load_capacity} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Odometer (km)</label>
                <input 
                  type="number" 
                  name="odometer" 
                  className="form-control" 
                  placeholder="e.g. 0" 
                  value={formData.odometer} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Acquisition Cost ($)</label>
                <input 
                  type="number" 
                  name="acquisition_cost" 
                  className="form-control" 
                  placeholder="e.g. 25000" 
                  value={formData.acquisition_cost} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Status</label>
                <select name="status" className="form-control" value={formData.status} onChange={handleInputChange} required>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistry;
