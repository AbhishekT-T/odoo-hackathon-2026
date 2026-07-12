const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('Starting database seeding...');

  try {
    // Read and run schema.sql to ensure tables exist
    const schemaSql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('Database tables verified/created.');

    // Clear existing data to allow fresh seeds
    await pool.query('TRUNCATE TABLE fuel_logs, maintenances, trips, drivers, vehicles, users RESTART IDENTITY CASCADE;');

    // Insert Vehicles
    const vehiclesResult = await pool.query(`
      INSERT INTO vehicles (registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status)
      VALUES 
        ('TX-707-VN', 'Van-05', 'Delivery Van', 500, 1000.0, 25000.0, 'Available'),
        ('TX-909-OP', 'Ford Transit Heavy Truck', 'Heavy Duty Truck', 15000, 45200.0, 85000.0, 'Available'),
        ('TX-404-SH', 'Mercedes Sprinter Cargo', 'Delivery Van', 3500, 12000.0, 35000.0, 'In Shop')
      RETURNING id, name;
    `);
    console.log('Seeded vehicles.');

    // Insert Drivers
    const driversResult = await pool.query(`
      INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status)
      VALUES 
        ('Alex', 'DL-99999X', 'Class B CDL', CURRENT_DATE + INTERVAL '1 year', '+1 555-0177', 95.0, 'Available'),
        ('Alice Smith', 'DL-88271A', 'Class A CDL', CURRENT_DATE + INTERVAL '2 years', '+1 555-0199', 98.5, 'Available'),
        ('Bob Miller', 'DL-11029B', 'Class B CDL', CURRENT_DATE + INTERVAL '6 months', '+1 555-0144', 72.0, 'Suspended')
      RETURNING id, name;
    `);
    console.log('Seeded drivers.');

    const vehicleId1 = vehiclesResult.rows[1].id; // Ford Transit Heavy Truck
    const driverId1 = driversResult.rows[1].id; // Alice Smith

    // Insert Trips
    await pool.query(`
      INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status)
      VALUES 
        ('Chicago Depot', 'New York Hub', $1, $2, 12500.0, 1270.0, 'Draft')
    `, [vehicleId1, driverId1]);
    console.log('Seeded trips.');

    // Insert Maintenances
    const vehicleId2 = vehiclesResult.rows[2].id; // Mercedes Sprinter (In Shop)
    await pool.query(`
      INSERT INTO maintenances (vehicle_id, description, cost, status)
      VALUES 
        ($1, 'Brake pad replacement and engine check.', 450.0, 'Active')
    `, [vehicleId2]);
    console.log('Seeded maintenance logs.');

    // Insert Fuel Logs
    await pool.query(`
      INSERT INTO fuel_logs (vehicle_id, liters, cost, date, expense_type)
      VALUES 
        ($1, 320.0, 640.0, CURRENT_DATE, 'Fuel')
    `, [vehicleId1]);
    console.log('Seeded fuel logs.');

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
}

seed();
