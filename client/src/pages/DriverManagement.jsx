import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../api/drivers';
import { getDocuments, createDocument, deleteDocument } from '../api/documents';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDriverId, setEditDriverId] = useState(null);

  // Document State
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverDocs, setDriverDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docFormData, setDocFormData] = useState({
    document_type: 'Driving License',
    file_name: '',
    expiry_date: ''
  });

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

  const resetForm = () => {
    setFormData({
      name: '',
      license_number: '',
      license_category: 'Class A CDL',
      license_expiry_date: '',
      contact_number: '',
      safety_score: '100',
      status: 'Available'
    });
    setIsEditing(false);
    setEditDriverId(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleEditClick = (d) => {
    // Format date to yyyy-MM-dd for HTML date input
    const expiryDate = d.license_expiry_date 
      ? new Date(d.license_expiry_date).toISOString().split('T')[0] 
      : '';
    setFormData({
      name: d.name,
      license_number: d.license_number,
      license_category: d.license_category,
      license_expiry_date: expiryDate,
      contact_number: d.contact_number || '',
      safety_score: String(d.safety_score),
      status: d.status
    });
    setIsEditing(true);
    setEditDriverId(d.id);
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      deleteDriver(id)
        .then(() => {
          loadDrivers();
        })
        .catch(err => {
          alert(err.response?.data?.error || err.message || 'Error deleting driver');
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      safety_score: parseFloat(formData.safety_score || 100)
    };

    if (isEditing) {
      updateDriver(editDriverId, payload)
        .then(() => {
          setShowModal(false);
          resetForm();
          loadDrivers();
        })
        .catch(err => {
          alert(err.response?.data?.error || err.message || 'Error updating driver');
        });
    } else {
      createDriver(payload)
        .then(() => {
          setShowModal(false);
          resetForm();
          loadDrivers();
        })
        .catch(err => {
          alert(err.response?.data?.error || err.message || 'Error adding driver');
        });
    }
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

  // Document Handlers
  const handleOpenDocs = (driver) => {
    setSelectedDriver(driver);
    setLoadingDocs(true);
    getDocuments('driver', driver.id)
      .then(data => {
        setDriverDocs(data);
        setLoadingDocs(false);
      })
      .catch(err => {
        alert('Failed to load driver documents: ' + err.message);
        setLoadingDocs(false);
      });
    setDocFormData({
      document_type: 'Driving License',
      file_name: '',
      expiry_date: ''
    });
    setShowDocModal(true);
  };

  const handleDocInputChange = (e) => {
    const { name, value } = e.target;
    setDocFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocSubmit = (e) => {
    e.preventDefault();
    const payload = {
      entity_type: 'driver',
      entity_id: selectedDriver.id,
      ...docFormData
    };
    createDocument(payload)
      .then(() => {
        getDocuments('driver', selectedDriver.id).then(data => setDriverDocs(data));
        setDocFormData({
          document_type: 'Driving License',
          file_name: '',
          expiry_date: ''
        });
      })
      .catch(err => {
        alert(err.response?.data?.error || err.message || 'Error adding document');
      });
  };

  const handleDocDelete = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(docId)
        .then(() => {
          getDocuments('driver', selectedDriver.id).then(data => setDriverDocs(data));
        })
        .catch(err => {
          alert(err.response?.data?.error || err.message || 'Error deleting document');
        });
    }
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
        <button className="btn btn-primary" onClick={handleAddClick}>+ Add Driver</button>
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
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEditClick(d)}>
                      Edit
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--accent-color)' }} onClick={() => handleOpenDocs(d)}>
                      Docs 📁
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteClick(d.id)}>
                      Delete
                    </button>
                    {d.status !== 'Suspended' ? (
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => toggleStatus(d, 'Suspended')}>
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
              <h2 className="modal-title">{isEditing ? 'Edit Driver' : 'Register Driver'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
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
                <label className="form-label">Safety Score</label>
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
              <div className="form-group">
                <label className="form-label">Driver Status</label>
                <select name="status" className="form-control" value={formData.status} onChange={handleInputChange} required>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDocModal && selectedDriver && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Documents for {selectedDriver.name}</h2>
              <button className="modal-close" onClick={() => setShowDocModal(false)}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', maxHeight: '220px', overflowY: 'auto' }}>
              {loadingDocs ? (
                <p>Loading documents...</p>
              ) : driverDocs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>No documents uploaded yet.</p>
              ) : (
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>File Name</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverDocs.map(doc => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 'bold' }}>{doc.document_type}</td>
                        <td>{doc.file_name}</td>
                        <td>{doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className={`badge badge-${doc.status.toLowerCase().replace(' ', '')}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-danger" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }} onClick={() => handleDocDelete(doc.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontWeight: 'bold' }}>
              Add Document
            </h3>
            <form onSubmit={handleDocSubmit}>
              <div className="form-group">
                <label className="form-label">Document Type</label>
                <select name="document_type" className="form-control" value={docFormData.document_type} onChange={handleDocInputChange} required>
                  <option value="Driving License">Driving License</option>
                  <option value="Aadhaar/PAN (ID Proof)">Aadhaar/PAN (ID Proof)</option>
                  <option value="Medical Fitness Certificate">Medical Fitness Certificate</option>
                  <option value="Training Certificate">Training Certificate</option>
                  <option value="Employment Documents">Employment Documents</option>
                  <option value="Traffic Violation Records">Traffic Violation Records</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">File Name / Description</label>
                <input 
                  type="text" 
                  name="file_name" 
                  className="form-control" 
                  placeholder="e.g. license_alex.pdf" 
                  value={docFormData.file_name} 
                  onChange={handleDocInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date (Optional)</label>
                <input 
                  type="date" 
                  name="expiry_date" 
                  className="form-control" 
                  value={docFormData.expiry_date} 
                  onChange={handleDocInputChange} 
                />
              </div>
              <div className="modal-footer" style={{ marginTop: '1rem', paddingBottom: '0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Add Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
