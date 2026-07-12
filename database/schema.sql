-- Database schema for TransitOps platform

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    max_load_capacity NUMERIC(10,2) NOT NULL,
    odometer NUMERIC(10,2) DEFAULT 0.0,
    acquisition_cost NUMERIC(12,2) DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'In Shop', 'Retired')),
    region VARCHAR(50) DEFAULT 'National'
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_category VARCHAR(50),
    license_expiry_date DATE NOT NULL,
    contact_number VARCHAR(20),
    safety_score NUMERIC(5,2) DEFAULT 100.0,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'Off Duty', 'Suspended'))
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id INT REFERENCES drivers(id) ON DELETE RESTRICT,
    cargo_weight NUMERIC(10,2) NOT NULL,
    planned_distance NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled'))
);

-- Maintenances Table
CREATE TABLE IF NOT EXISTS maintenances (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
    description TEXT,
    cost NUMERIC(12,2) DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Closed'))
);

-- Fuel Logs & Expenses Table
CREATE TABLE IF NOT EXISTS fuel_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
    liters NUMERIC(10,2) NOT NULL,
    cost NUMERIC(12,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_type VARCHAR(50) DEFAULT 'Fuel'
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Fleet Manager'
);
