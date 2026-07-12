import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import DriverManagement from './pages/DriverManagement';
import TripManagement from './pages/TripManagement';
import Maintenance from './pages/Maintenance';
import FuelExpense from './pages/FuelExpense';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="auth-container"><div className="auth-card"><p>Loading...</p></div></div>;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="auth-container"><div className="auth-card"><p>Loading...</p></div></div>;
  }
  
  if (isAuthenticated()) {
    return <Navigate to="/" />;
  }
  
  return children;
};

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
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
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
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
