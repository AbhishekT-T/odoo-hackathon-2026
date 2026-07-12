import React, { useState, useEffect } from 'react';
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../api/trips';
import { getVehicles } from '../api/vehicles';
import { getDrivers } from '../api/drivers';

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    cargo_weight: '',
    planned_distance: ''
  });

  // Completion Form State
  const [completionData, setCompletionData] = useState({
    end_odometer: '',
    fuel_consumed: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const tripsData = await getTrips();
      const vehiclesData = await getVehicles();
      const driversData = await getDrivers();
      setTrips(tripsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
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

  const handleCompletionInputChange = (e) => {
    const { name, value } = e.target;
    setCompletionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      vehicle_id: parseInt(formData.vehicle_id),
      driver_id: parseInt(formData.driver_id),
      cargo_weight: parseFloat(formData.cargo_weight),
      planned_distance: parseFloat(formData.planned_distance)
    };

    createTrip(payload)
      .then(() => {
        setShowModal(false);
        setFormData({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
        loadData();
      })
      .catch(err => {
        alert(err.response?.data?.error || err.message || 'Error creating trip');
      });
  };

  const handleDispatch = (id) => {
    dispatchTrip(id)
      .then(() => loadData())
      .catch(err => alert(err.response?.data?.error || err.message));
  };

  const openCompleteModal = (id) => {
    setSelectedTripId(id);
    setCompletionData({ end_odometer: '', fuel_consumed: '' });
    setShowCompleteModal(true);
  };

  const handleComplete = (e) => {
    e.preventDefault();
    const payload = {
      end_odometer: parseFloat(completionData.end_odometer),
      fuel_consumed: parseFloat(completionData.fuel_consumed)
    };

    completeTrip(selectedTripId, payload)
      .then(() => {
        setShowCompleteModal(false);
        loadData();
      })
      .catch(err => alert(err.response?.data?.error || err.message));
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      cancelTrip(id)
        .then(() => loadData())
        .catch(err => alert(err.response?.data?.error || err.message));
    }
  };

  const renderTripProgress = (status) => {
    if (status === 'Cancelled') {
      return (
        <div className="stepper-progress cancelled">
          <div className="step active draft">
            <div className="step-dot"></div>
            <span className="step-label">Draft</span>
          </div>
          <div className="step-line active-cancelled"></div>
          <div className="step active cancelled">
            <div className="step-dot"></div>
            <span className="step-label">Cancelled</span>
          </div>
        </div>
      );
    }

    const getStepClass = (stepName) => {
      const statusOrder = { 'Draft': 0, 'Dispatched': 1, 'Completed': 2 };
      const currentOrder = statusOrder[status] !== undefined ? statusOrder[status] : -1;
      const stepOrder = statusOrder[stepName];
      
      if (stepOrder <= currentOrder) {
        return `step active ${stepName.toLowerCase()}`;
      }
      return 'step inactive';
    };

    return (
      <div className="stepper-progress">
        <div className={getStepClass('Draft')}>
          <div className="step-dot"></div>
          <span className="step-label">Draft</span>
        </div>
        <div className={`step-line ${status === 'Dispatched' || status === 'Completed' ? 'active-dispatched' : ''}`}></div>
        <div className={getStepClass('Dispatched')}>
          <div className="step-dot"></div>
          <span className="step-label">Dispatched</span>
        </div>
        <div className={`step-line ${status === 'Completed' ? 'active-completed' : ''}`}></div>
        <div className={getStepClass('Completed')}>
          <div className="step-dot"></div>
          <span className="step-label">Completed</span>
        </div>
      </div>
    );
  };

  // Only allow Available vehicles / drivers in dispatch pool
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers; // Allow assigning a trip to any driver

  if (loading) return <div style={{ padding: '2rem' }}>Loading trip plans...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trip Management</h1>
          <p className="page-description">Route dispatching, real-time vehicle mapping, and closures</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Plan Trip</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Weight</th>
              <th>Distance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: 'bold' }}>TRIP-{t.id}</td>
                <td>{t.source} &rarr; {t.destination}</td>
                <td>{t.vehicle_name || 'Unassigned'} ({t.vehicle_number || ''})</td>
                <td>{t.driver_name || 'Unassigned'}</td>
                <td>{t.cargo_weight} kg</td>
                <td>{t.planned_distance} km</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span className={`badge badge-${t.status.toLowerCase()}`} style={{ width: 'fit-content' }}>
                      {t.status}
                    </span>
                    {renderTripProgress(t.status)}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {t.status === 'Draft' && (
                      <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDispatch(t.id)}>
                        Dispatch
                      </button>
                    )}
                    {t.status === 'Dispatched' && (
                      <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--status-available)' }} onClick={() => openCompleteModal(t.id)}>
                        Complete
                      </button>
                    )}
                    {t.status !== 'Completed' && t.status !== 'Cancelled' && (
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleCancel(t.id)}>
                        Cancel
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
              <h2 className="modal-title">Plan New Trip</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Source Location</label>
                <input 
                  type="text" 
                  name="source" 
                  className="form-control" 
                  placeholder="e.g. Chicago Depot" 
                  value={formData.source} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Destination Location</label>
                <input 
                  type="text" 
                  name="destination" 
                  className="form-control" 
                  placeholder="e.g. New York Hub" 
                  value={formData.destination} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Select Available Vehicle (Pool Filtered)</label>
                <select name="vehicle_id" className="form-control" value={formData.vehicle_id} onChange={handleInputChange} required>
                  <option value="">-- Choose Vehicle --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.registration_number}) - Max load: {v.max_load_capacity}kg</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Select Available Driver (Compliance Filtered)</label>
                <select name="driver_id" className="form-control" value={formData.driver_id} onChange={handleInputChange} required>
                  <option value="">-- Choose Driver --</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} (Status: {d.status}, Safety Score: {d.safety_score})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cargo Weight (kg)</label>
                <input 
                  type="number" 
                  name="cargo_weight" 
                  className="form-control" 
                  placeholder="e.g. 450" 
                  value={formData.cargo_weight} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Planned Distance (km)</label>
                <input 
                  type="number" 
                  name="planned_distance" 
                  className="form-control" 
                  placeholder="e.g. 1270" 
                  value={formData.planned_distance} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Complete Trip</h2>
              <button className="modal-close" onClick={() => setShowCompleteModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleComplete}>
              <div className="form-group">
                <label className="form-label">Final Vehicle Odometer (km)</label>
                <input 
                  type="number" 
                  name="end_odometer" 
                  className="form-control" 
                  placeholder="Must exceed current odometer" 
                  value={completionData.end_odometer} 
                  onChange={handleCompletionInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Trip Fuel Consumed (Liters)</label>
                <input 
                  type="number" 
                  name="fuel_consumed" 
                  className="form-control" 
                  placeholder="e.g. 45" 
                  value={completionData.fuel_consumed} 
                  onChange={handleCompletionInputChange} 
                  required 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--status-available)' }}>Submit Completion</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManagement;
