import React, { useState, useEffect } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles';
import { getDocuments, createDocument, deleteDocument } from '../api/documents';

const VehicleRegistry = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);
  
  // Document State
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDocs, setVehicleDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docFormData, setDocFormData] = useState({
    document_type: 'Registration Certificate (RC)',
    file_name: '',
    expiry_date: ''
  });

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

  // Document Handlers
  const handleOpenDocs = (vehicle) => {
    setSelectedVehicle(vehicle);
    setLoadingDocs(true);
    getDocuments('vehicle', vehicle.id)
      .then(data => {
        setVehicleDocs(data);
        setLoadingDocs(false);
      })
      .catch(err => {
        alert('Failed to load vehicle documents: ' + err.message);
        setLoadingDocs(false);
      });
    setDocFormData({
      document_type: 'Registration Certificate (RC)',
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
      entity_type: 'vehicle',
      entity_id: selectedVehicle.id,
      ...docFormData
    };
    createDocument(payload)
      .then(() => {
        getDocuments('vehicle', selectedVehicle.id).then(data => setVehicleDocs(data));
        setDocFormData({
          document_type: 'Registration Certificate (RC)',
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
          getDocuments('vehicle', selectedVehicle.id).then(data => setVehicleDocs(data));
        })
        .catch(err => {
          alert(err.response?.data?.error || err.message || 'Error deleting document');
        });
    }
  };

  const handleDownloadDoc = (doc) => {
    const fileContent = `TransitOps Document Export
------------------------------------
ID: ${doc.id}
Entity Type: ${doc.entity_type.toUpperCase()}
Entity ID: ${doc.entity_id}
Document Type: ${doc.document_type}
File Name: ${doc.file_name}
Expiry Date: ${doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A'}
Status: ${doc.status}
Generated: ${new Date().toLocaleString()}

This is a certified digital export copy of the uploaded document from the TransitOps Fleet Management Platform.`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = doc.file_name.substring(0, doc.file_name.lastIndexOf('.')) || doc.file_name;
    link.setAttribute('download', `${baseName}_export.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDocsCSV = () => {
    if (vehicleDocs.length === 0) {
      alert('No documents to export.');
      return;
    }

    const headers = ['Document ID', 'Document Type', 'File Name', 'Expiry Date', 'Status'];
    const csvRows = [
      headers.join(','),
      ...vehicleDocs.map(doc => [
        doc.id,
        `"${doc.document_type.replace(/"/g, '""')}"`,
        `"${doc.file_name.replace(/"/g, '""')}"`,
        doc.expiry_date ? new Date(doc.expiry_date).toISOString().split('T')[0] : 'N/A',
        doc.status
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedVehicle.name.replace(/\s+/g, '_')}_documents.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--accent-color)' }} onClick={() => handleOpenDocs(v)}>
                      Docs 📁
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

      {showDocModal && selectedVehicle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Documents for {selectedVehicle.name}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {vehicleDocs.length > 0 && (
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--accent-color)', color: 'var(--text-primary)' }} onClick={handleExportDocsCSV}>
                    Export CSV 📊
                  </button>
                )}
                <button className="modal-close" onClick={() => setShowDocModal(false)}>&times;</button>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem', maxHeight: '220px', overflowY: 'auto' }}>
              {loadingDocs ? (
                <p>Loading documents...</p>
              ) : vehicleDocs.length === 0 ? (
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
                    {vehicleDocs.map(doc => (
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
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', borderColor: 'var(--accent-color)' }} onClick={() => handleDownloadDoc(doc)}>
                              Download 📥
                            </button>
                            <button className="btn btn-danger" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }} onClick={() => handleDocDelete(doc.id)}>
                              Delete
                            </button>
                          </div>
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
                  <option value="Registration Certificate (RC)">Registration Certificate (RC)</option>
                  <option value="Insurance">Insurance</option>
                  <option value="PUC Certificate">PUC Certificate</option>
                  <option value="Fitness Certificate">Fitness Certificate</option>
                  <option value="Permit">Permit</option>
                  <option value="Service & Maintenance Records">Service & Maintenance Records</option>
                  <option value="Accident/Claim Documents">Accident/Claim Documents</option>
                  <option value="Vehicle Photos">Vehicle Photos</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">File Name / Description</label>
                <input 
                  type="text" 
                  name="file_name" 
                  className="form-control" 
                  placeholder="e.g. rc_van05.pdf" 
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

export default VehicleRegistry;
