import React, { useState, useEffect } from 'react';
import { getReportsData } from '../api/reports';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReportsData()
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load report analytics.');
        setLoading(false);
      });
  }, []);

  // Exporter: Generates and downloads reports table content as a CSV
  const exportToCSV = () => {
    if (reports.length === 0) return;

    const headers = ['Registration Number', 'Vehicle Name', 'Fuel Cost ($)', 'Maintenance Cost ($)', 'Total Operational Cost ($)', 'Fuel Efficiency (km/L)', 'Vehicle ROI (%)'];
    const csvRows = [headers.join(',')];

    reports.forEach(r => {
      const row = [
        r.registration_number,
        `"${r.name}"`,
        r.fuelCost,
        r.maintenanceCost,
        r.totalOperationalCost,
        r.fuelEfficiency,
        r.roi
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'transitops_vehicle_roi_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading analytics reports...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--status-retired)' }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports &amp; Analytics</h1>
          <p className="page-description">Vehicle efficiency statistics, operational expense breakdowns, and ROI charts</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={exportToCSV}>Export ROI Report (CSV)</button>
          <a href="http://localhost:5000/api/trips" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Export Trips Data
          </a>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Reg Number</th>
              <th>Vehicle Name</th>
              <th>Fuel Cost</th>
              <th>Maintenance Cost</th>
              <th>Total Operational Cost</th>
              <th>Fuel Efficiency</th>
              <th>Vehicle ROI</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 'bold' }}>{r.registration_number}</td>
                <td>{r.name}</td>
                <td>${r.fuelCost.toLocaleString()}</td>
                <td>${r.maintenanceCost.toLocaleString()}</td>
                <td style={{ fontWeight: 'bold' }}>${r.totalOperationalCost.toLocaleString()}</td>
                <td>{r.fuelEfficiency} km/L</td>
                <td style={{ 
                  fontWeight: 'bold', 
                  color: r.roi >= 0 ? 'var(--status-available)' : 'var(--status-retired)' 
                }}>
                  {r.roi}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-charts" style={{ marginTop: '2.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>💡 Analytics Reference Guidelines</h3>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>Operational Cost:</strong> Automatically calculated as the sum of all logged Fuel logs + Maintenance costs.
            </li>
            <li>
              <strong>Fuel Efficiency:</strong> Total Completed Trip Distance (km) / Total Logged Fuel (Liters).
            </li>
            <li>
              <strong>Vehicle ROI:</strong> Computed as: <code>(Trip Revenue - Operational Cost) / Acquisition Cost</code>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
