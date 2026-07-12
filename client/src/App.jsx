import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import DriverManagement from './pages/DriverManagement';
import TripManagement from './pages/TripManagement';
import Maintenance from './pages/Maintenance';
import FuelExpense from './pages/FuelExpense';
import Reports from './pages/Reports';

import Login from './pages/Login';

function App() {
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <Router>
        <div className="app-container" style={{ justifyContent: 'center' }}>
          <main className="main-content" style={{ marginLeft: 0, padding: 0, width: '100%' }}>
            <Routes>
              <Route path="*" element={<Login />} />
            </Routes>
          </main>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar Nav */}
        <Navbar />

        {/* Content View */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehicleRegistry />} />
            <Route path="/drivers" element={<DriverManagement />} />
            <Route path="/trips" element={<TripManagement />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/fuel-expenses" element={<FuelExpense />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
