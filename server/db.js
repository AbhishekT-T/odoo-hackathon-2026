const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Helper to read database
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    // Initial Seed Data if file doesn't exist
    const initialData = {
      vehicles: [
        { id: 1, registration_number: 'TX-707-VN', name: 'Van-05', type: 'Delivery Van', max_load_capacity: 500.0, odometer: 1000.0, acquisition_cost: 25000.0, status: 'Available' },
        { id: 2, registration_number: 'TX-909-OP', name: 'Ford Transit Heavy Truck', type: 'Heavy Duty Truck', max_load_capacity: 15000.0, odometer: 45200.0, acquisition_cost: 85000.0, status: 'Available' },
        { id: 3, registration_number: 'TX-404-SH', name: 'Mercedes Sprinter Cargo', type: 'Delivery Van', max_load_capacity: 3500.0, odometer: 12000.0, acquisition_cost: 35000.0, status: 'In Shop' }
      ],
      drivers: [
        { id: 1, name: 'Alex', license_number: 'DL-99999X', license_category: 'Class B CDL', license_expiry_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], contact_number: '+1 555-0177', safety_score: 95.0, status: 'Available' },
        { id: 2, name: 'Alice Smith', license_number: 'DL-88271A', license_category: 'Class A CDL', license_expiry_date: new Date(Date.now() + 2*365*24*60*60*1000).toISOString().split('T')[0], contact_number: '+1 555-0199', safety_score: 98.5, status: 'Available' },
        { id: 3, name: 'Bob Miller', license_number: 'DL-11029B', license_category: 'Class B CDL', license_expiry_date: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0], contact_number: '+1 555-0144', safety_score: 72.0, status: 'Suspended' }
      ],
      trips: [
        { id: 1, source: 'Chicago Depot', destination: 'New York Hub', vehicle_id: 2, driver_id: 2, cargo_weight: 12500.0, planned_distance: 1270.0, status: 'Draft' }
      ],
      maintenances: [
        { id: 1, vehicle_id: 3, description: 'Brake pad replacement and engine check.', cost: 450.0, status: 'Active' }
      ],
      fuel_logs: [
        { id: 1, vehicle_id: 2, liters: 320.0, cost: 640.0, date: new Date().toISOString().split('T')[0], expense_type: 'Fuel' }
      ],
      documents: [
        { id: 1, entity_type: 'vehicle', entity_id: 1, document_type: 'Registration Certificate (RC)', file_name: 'rc_van_05.pdf', file_url: '#', expiry_date: '2030-12-31', status: 'Active' },
        { id: 2, entity_type: 'driver', entity_id: 1, document_type: 'Driving License', file_name: 'license_alex.pdf', file_url: '#', expiry_date: '2027-06-30', status: 'Active' }
      ],
      nextIds: { vehicles: 4, drivers: 4, trips: 2, maintenances: 2, fuel_logs: 2, documents: 3 }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!dbData.documents) {
    dbData.documents = [
      { id: 1, entity_type: 'vehicle', entity_id: 1, document_type: 'Registration Certificate (RC)', file_name: 'rc_van_05.pdf', file_url: '#', expiry_date: '2030-12-31', status: 'Active' },
      { id: 2, entity_type: 'driver', entity_id: 1, document_type: 'Driving License', file_name: 'license_alex.pdf', file_url: '#', expiry_date: '2027-06-30', status: 'Active' }
    ];
    if (!dbData.nextIds) dbData.nextIds = {};
    dbData.nextIds.documents = 3;
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
  }
  return dbData;
}

// Helper to write database
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const query = async (text, params = []) => {
  // Normalize whitespace
  const sql = text.replace(/\s+/g, ' ').trim();
  const data = readDB();

  // Seed / Schema setup query
  if (sql.startsWith('-- Database schema') || sql.includes('CREATE TABLE')) {
    return { rows: [] };
  }

  // Raw vehicles seed insert
  if (sql.includes('INSERT INTO vehicles') && !params.length) {
    // Reset to seeded state for vehicles
    data.vehicles = [
      { id: 1, registration_number: 'TX-707-VN', name: 'Van-05', type: 'Delivery Van', max_load_capacity: 500.0, odometer: 1000.0, acquisition_cost: 25000.0, status: 'Available' },
      { id: 2, registration_number: 'TX-909-OP', name: 'Ford Transit Heavy Truck', type: 'Heavy Duty Truck', max_load_capacity: 15000.0, odometer: 45200.0, acquisition_cost: 85000.0, status: 'Available' },
      { id: 3, registration_number: 'TX-404-SH', name: 'Mercedes Sprinter Cargo', type: 'Delivery Van', max_load_capacity: 3500.0, odometer: 12000.0, acquisition_cost: 35000.0, status: 'In Shop' }
    ];
    data.nextIds.vehicles = 4;
    writeDB(data);
    return { rows: [
      { id: 1, name: 'Van-05' },
      { id: 2, name: 'Ford Transit Heavy Truck' },
      { id: 3, name: 'Mercedes Sprinter Cargo' }
    ] };
  }

  // Raw drivers seed insert
  if (sql.includes('INSERT INTO drivers') && !params.length) {
    data.drivers = [
      { id: 1, name: 'Alex', license_number: 'DL-99999X', license_category: 'Class B CDL', license_expiry_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], contact_number: '+1 555-0177', safety_score: 95.0, status: 'Available' },
      { id: 2, name: 'Alice Smith', license_number: 'DL-88271A', license_category: 'Class A CDL', license_expiry_date: new Date(Date.now() + 2*365*24*60*60*1000).toISOString().split('T')[0], contact_number: '+1 555-0199', safety_score: 98.5, status: 'Available' },
      { id: 3, name: 'Bob Miller', license_number: 'DL-11029B', license_category: 'Class B CDL', license_expiry_date: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0], contact_number: '+1 555-0144', safety_score: 72.0, status: 'Suspended' }
    ];
    data.nextIds.drivers = 4;
    writeDB(data);
    return { rows: [
      { id: 1, name: 'Alex' },
      { id: 2, name: 'Alice Smith' },
      { id: 3, name: 'Bob Miller' }
    ] };
  }

  // Raw trips seed insert
  if (sql.includes('INSERT INTO trips') && params.length && sql.includes('Chicago Depot')) {
    const id = data.nextIds.trips++;
    const newTrip = {
      id,
      source: 'Chicago Depot',
      destination: 'New York Hub',
      vehicle_id: Number(params[0]),
      driver_id: Number(params[1]),
      cargo_weight: 12500.0,
      planned_distance: 1270.0,
      status: 'Draft'
    };
    data.trips = [newTrip];
    data.nextIds.trips = 2;
    writeDB(data);
    return { rows: [newTrip] };
  }

  // Raw maintenances seed insert
  if (sql.includes('INSERT INTO maintenances') && params.length && sql.includes('Brake pad replacement')) {
    const id = data.nextIds.maintenances++;
    const newMaint = {
      id,
      vehicle_id: Number(params[0]),
      description: 'Brake pad replacement and engine check.',
      cost: 450.0,
      status: 'Active'
    };
    data.maintenances = [newMaint];
    data.nextIds.maintenances = 2;
    writeDB(data);
    return { rows: [newMaint] };
  }

  // Raw fuel logs seed insert
  if (sql.includes('INSERT INTO fuel_logs') && params.length && sql.includes('320.0')) {
    const id = data.nextIds.fuel_logs++;
    const newFuel = {
      id,
      vehicle_id: Number(params[0]),
      liters: 320.0,
      cost: 640.0,
      date: new Date().toISOString().split('T')[0],
      expense_type: 'Fuel'
    };
    data.fuel_logs = [newFuel];
    data.nextIds.fuel_logs = 2;
    writeDB(data);
    return { rows: [newFuel] };
  }

  // 1. SELECT * FROM vehicles ORDER BY id DESC
  if (sql.startsWith('SELECT * FROM vehicles ORDER BY id DESC')) {
    const rows = [...data.vehicles].sort((a, b) => b.id - a.id);
    return { rows };
  }

  // 2. SELECT * FROM vehicles WHERE id = $1
  if (sql.startsWith('SELECT * FROM vehicles WHERE id = $1')) {
    const id = params[0];
    const rows = data.vehicles.filter(v => v.id === Number(id));
    return { rows };
  }

  // 3. INSERT INTO vehicles
  if (sql.startsWith('INSERT INTO vehicles')) {
    const id = data.nextIds.vehicles++;
    const [registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status] = params;
    const newVehicle = {
      id,
      registration_number,
      name,
      type,
      max_load_capacity: Number(max_load_capacity),
      odometer: Number(odometer || 0),
      acquisition_cost: Number(acquisition_cost || 0),
      status: status || 'Available'
    };
    data.vehicles.push(newVehicle);
    writeDB(data);
    return { rows: [newVehicle] };
  }

  // 4. UPDATE vehicles SET status = $1 WHERE id = $2
  if (sql.startsWith('UPDATE vehicles SET status = $1 WHERE id = $2')) {
    const [status, id] = params;
    const vehicle = data.vehicles.find(v => v.id === Number(id));
    if (vehicle) {
      vehicle.status = status;
      writeDB(data);
    }
    return { rows: vehicle ? [vehicle] : [] };
  }

  // 5. UPDATE vehicles (general)
  if (sql.startsWith('UPDATE vehicles SET registration_number = $1')) {
    const [registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status, id] = params;
    const vehicle = data.vehicles.find(v => v.id === Number(id));
    if (vehicle) {
      vehicle.registration_number = registration_number;
      vehicle.name = name;
      vehicle.type = type;
      vehicle.max_load_capacity = Number(max_load_capacity);
      vehicle.odometer = Number(odometer);
      vehicle.acquisition_cost = Number(acquisition_cost);
      vehicle.status = status;
      writeDB(data);
    }
    return { rows: vehicle ? [vehicle] : [] };
  }

  // 6. DELETE FROM vehicles WHERE id = $1
  if (sql.startsWith('DELETE FROM vehicles WHERE id = $1')) {
    const id = params[0];
    const index = data.vehicles.findIndex(v => v.id === Number(id));
    let deleted = null;
    if (index !== -1) {
      // Check foreign key constraints: Trips
      const hasTrips = data.trips.some(t => t.vehicle_id === Number(id));
      if (hasTrips) {
        const err = new Error('foreign key constraint');
        err.code = '23503';
        throw err;
      }
      deleted = data.vehicles.splice(index, 1)[0];
      // Cascade delete: Maintenances, Fuel Logs and Documents
      data.maintenances = data.maintenances.filter(m => m.vehicle_id !== Number(id));
      data.fuel_logs = data.fuel_logs.filter(f => f.vehicle_id !== Number(id));
      data.documents = data.documents.filter(doc => !(doc.entity_type === 'vehicle' && doc.entity_id === Number(id)));
      writeDB(data);
    }
    return { rows: deleted ? [deleted] : [] };
  }

  // 7. SELECT m.*, v.registration_number as vehicle_number, v.name as vehicle_name FROM maintenances
  if (sql.startsWith('SELECT m.*, v.registration_number as vehicle_number, v.name as vehicle_name FROM maintenances m LEFT JOIN vehicles v ON m.vehicle_id = v.id')) {
    let rows = data.maintenances.map(m => {
      const v = data.vehicles.find(veh => veh.id === m.vehicle_id) || {};
      return {
        ...m,
        vehicle_number: v.registration_number || '',
        vehicle_name: v.name || ''
      };
    });
    // Check if it's getById
    if (sql.includes('WHERE m.id = $1')) {
      const id = params[0];
      rows = rows.filter(m => m.id === Number(id));
    } else {
      rows.sort((a, b) => b.id - a.id);
    }
    return { rows };
  }

  // 8. INSERT INTO maintenances
  if (sql.startsWith('INSERT INTO maintenances')) {
    const id = data.nextIds.maintenances++;
    const [vehicle_id, description, cost, status] = params;
    const newMaint = {
      id,
      vehicle_id: Number(vehicle_id),
      description,
      cost: Number(cost || 0),
      status: status || 'Active'
    };
    data.maintenances.push(newMaint);
    writeDB(data);
    return { rows: [newMaint] };
  }

  // 9. UPDATE maintenances
  if (sql.startsWith('UPDATE maintenances SET vehicle_id = $1')) {
    const [vehicle_id, description, cost, status, id] = params;
    const maint = data.maintenances.find(m => m.id === Number(id));
    if (maint) {
      maint.vehicle_id = Number(vehicle_id);
      maint.description = description;
      maint.cost = Number(cost);
      maint.status = status;
      writeDB(data);
    }
    return { rows: maint ? [maint] : [] };
  }

  // 10. DELETE FROM maintenances WHERE id = $1
  if (sql.startsWith('DELETE FROM maintenances WHERE id = $1')) {
    const id = params[0];
    const index = data.maintenances.findIndex(m => m.id === Number(id));
    let deleted = null;
    if (index !== -1) {
      deleted = data.maintenances.splice(index, 1)[0];
      writeDB(data);
    }
    return { rows: deleted ? [deleted] : [] };
  }

  // 11. SELECT COUNT(*) FROM maintenances WHERE vehicle_id = $1 AND status = 'Active'
  if (sql.startsWith("SELECT COUNT(*) FROM maintenances WHERE vehicle_id = $1 AND status = 'Active'")) {
    const vehicle_id = params[0];
    let count = 0;
    if (sql.includes('AND id != $2')) {
      const excludeId = params[1];
      count = data.maintenances.filter(m => m.vehicle_id === Number(vehicle_id) && m.status === 'Active' && m.id !== Number(excludeId)).length;
    } else {
      count = data.maintenances.filter(m => m.vehicle_id === Number(vehicle_id) && m.status === 'Active').length;
    }
    return { rows: [{ count }] };
  }

  // 12. SELECT * FROM drivers
  if (sql.startsWith('SELECT * FROM drivers ORDER BY id DESC')) {
    const rows = [...data.drivers].sort((a, b) => b.id - a.id);
    return { rows };
  }
  if (sql.startsWith('SELECT * FROM drivers WHERE id = $1')) {
    const id = params[0];
    const rows = data.drivers.filter(d => d.id === Number(id));
    return { rows };
  }

  // 13. INSERT INTO drivers
  if (sql.startsWith('INSERT INTO drivers')) {
    const id = data.nextIds.drivers++;
    const [name, license_number, license_category, license_expiry_date, contact_number, safety_score, status] = params;
    const newDriver = {
      id,
      name,
      license_number,
      license_category,
      license_expiry_date,
      contact_number,
      safety_score: Number(safety_score || 100.0),
      status: status || 'Available'
    };
    data.drivers.push(newDriver);
    writeDB(data);
    return { rows: [newDriver] };
  }

  // 14. UPDATE drivers
  if (sql.startsWith('UPDATE drivers SET name = $1')) {
    const [name, license_number, license_category, license_expiry_date, contact_number, safety_score, status, id] = params;
    const driver = data.drivers.find(d => d.id === Number(id));
    if (driver) {
      driver.name = name;
      driver.license_number = license_number;
      driver.license_category = license_category;
      driver.license_expiry_date = license_expiry_date;
      driver.contact_number = contact_number;
      driver.safety_score = Number(safety_score);
      driver.status = status;
      writeDB(data);
    }
    return { rows: driver ? [driver] : [] };
  }

  // 15. DELETE FROM drivers WHERE id = $1
  if (sql.startsWith('DELETE FROM drivers WHERE id = $1')) {
    const id = params[0];
    const index = data.drivers.findIndex(d => d.id === Number(id));
    let deleted = null;
    if (index !== -1) {
      // Check foreign key: Trips
      const hasTrips = data.trips.some(t => t.driver_id === Number(id));
      if (hasTrips) {
        const err = new Error('foreign key');
        err.code = '23503';
        throw err;
      }
      deleted = data.drivers.splice(index, 1)[0];
      // Cascade delete: Documents
      data.documents = data.documents.filter(doc => !(doc.entity_type === 'driver' && doc.entity_id === Number(id)));
      writeDB(data);
    }
    return { rows: deleted ? [deleted] : [] };
  }

  // 16. SELECT t.* FROM trips
  if (sql.startsWith('SELECT t.*, v.registration_number as vehicle_number, v.name as vehicle_name, d.name as driver_name FROM trips t LEFT JOIN vehicles v ON t.vehicle_id = v.id LEFT JOIN drivers d ON t.driver_id = d.id')) {
    let rows = data.trips.map(t => {
      const v = data.vehicles.find(veh => veh.id === t.vehicle_id) || {};
      const d = data.drivers.find(dri => dri.id === t.driver_id) || {};
      return {
        ...t,
        vehicle_number: v.registration_number || '',
        vehicle_name: v.name || '',
        driver_name: d.name || ''
      };
    });
    if (sql.includes('WHERE t.id = $1')) {
      const id = params[0];
      rows = rows.filter(t => t.id === Number(id));
    } else {
      rows.sort((a, b) => b.id - a.id);
    }
    return { rows };
  }

  // 17. INSERT INTO trips
  if (sql.startsWith('INSERT INTO trips')) {
    const id = data.nextIds.trips++;
    const [source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status] = params;
    const newTrip = {
      id,
      source,
      destination,
      vehicle_id: Number(vehicle_id),
      driver_id: Number(driver_id),
      cargo_weight: Number(cargo_weight),
      planned_distance: Number(planned_distance),
      status: status || 'Draft'
    };
    data.trips.push(newTrip);
    writeDB(data);
    return { rows: [newTrip] };
  }

  // 18. UPDATE trips
  if (sql.startsWith('UPDATE trips SET source = $1')) {
    const [source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status, id] = params;
    const trip = data.trips.find(t => t.id === Number(id));
    if (trip) {
      trip.source = source;
      trip.destination = destination;
      trip.vehicle_id = Number(vehicle_id);
      trip.driver_id = Number(driver_id);
      trip.cargo_weight = Number(cargo_weight);
      trip.planned_distance = Number(planned_distance);
      trip.status = status;
      writeDB(data);
    }
    return { rows: trip ? [trip] : [] };
  }

  // 19. DELETE FROM trips WHERE id = $1
  if (sql.startsWith('DELETE FROM trips WHERE id = $1')) {
    const id = params[0];
    const index = data.trips.findIndex(t => t.id === Number(id));
    let deleted = null;
    if (index !== -1) {
      deleted = data.trips.splice(index, 1)[0];
      writeDB(data);
    }
    return { rows: deleted ? [deleted] : [] };
  }

  // 20. SELECT f.* FROM fuel_logs
  if (sql.startsWith('SELECT f.*, v.registration_number as vehicle_number, v.name as vehicle_name FROM fuel_logs f LEFT JOIN vehicles v ON f.vehicle_id = v.id')) {
    let rows = data.fuel_logs.map(f => {
      const v = data.vehicles.find(veh => veh.id === f.vehicle_id) || {};
      return {
        ...f,
        vehicle_number: v.registration_number || '',
        vehicle_name: v.name || ''
      };
    });
    if (sql.includes('WHERE f.id = $1')) {
      const id = params[0];
      rows = rows.filter(f => f.id === Number(id));
    } else {
      rows.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        return dateCompare !== 0 ? dateCompare : b.id - a.id;
      });
    }
    return { rows };
  }

  // 21. INSERT INTO fuel_logs
  if (sql.startsWith('INSERT INTO fuel_logs')) {
    const id = data.nextIds.fuel_logs++;
    const [vehicle_id, liters, cost, date, expense_type] = params;
    const newFuel = {
      id,
      vehicle_id: Number(vehicle_id),
      liters: Number(liters),
      cost: Number(cost),
      date: date || new Date().toISOString().split('T')[0],
      expense_type: expense_type || 'Fuel'
    };
    data.fuel_logs.push(newFuel);
    writeDB(data);
    return { rows: [newFuel] };
  }

  // 22. UPDATE fuel_logs
  if (sql.startsWith('UPDATE fuel_logs SET vehicle_id = $1')) {
    const [vehicle_id, liters, cost, date, expense_type, id] = params;
    const fuel = data.fuel_logs.find(f => f.id === Number(id));
    if (fuel) {
      fuel.vehicle_id = Number(vehicle_id);
      fuel.liters = Number(liters);
      fuel.cost = Number(cost);
      fuel.date = date;
      fuel.expense_type = expense_type;
      writeDB(data);
    }
    return { rows: fuel ? [fuel] : [] };
  }

  // 23. DELETE FROM fuel_logs WHERE id = $1
  if (sql.startsWith('DELETE FROM fuel_logs WHERE id = $1')) {
    const id = params[0];
    const index = data.fuel_logs.findIndex(f => f.id === Number(id));
    let deleted = null;
    if (index !== -1) {
      deleted = data.fuel_logs.splice(index, 1)[0];
      writeDB(data);
    }
    return { rows: deleted ? [deleted] : [] };
  }

  // 24. TRUNCATE TABLE
  if (sql.startsWith('TRUNCATE TABLE')) {
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    readDB();
    return { rows: [] };
  }

  // 25. Counts for Dashboard
  if (sql.startsWith("SELECT COUNT(*) FROM vehicles WHERE status = 'On Trip'")) {
    const count = data.vehicles.filter(v => v.status === 'On Trip').length;
    return { rows: [{ count }] };
  }
  if (sql.startsWith("SELECT COUNT(*) FROM vehicles WHERE status = 'Available'")) {
    const count = data.vehicles.filter(v => v.status === 'Available').length;
    return { rows: [{ count }] };
  }
  if (sql.startsWith("SELECT COUNT(*) FROM vehicles WHERE status = 'In Shop'")) {
    const count = data.vehicles.filter(v => v.status === 'In Shop').length;
    return { rows: [{ count }] };
  }
  if (sql.startsWith("SELECT COUNT(*) FROM trips WHERE status = 'Dispatched'")) {
    const count = data.trips.filter(t => t.status === 'Dispatched').length;
    return { rows: [{ count }] };
  }
  if (sql.startsWith("SELECT COUNT(*) FROM trips WHERE status = 'Draft'")) {
    const count = data.trips.filter(t => t.status === 'Draft').length;
    return { rows: [{ count }] };
  }
  if (sql.startsWith("SELECT COUNT(*) FROM drivers WHERE status = 'On Trip'")) {
    const count = data.drivers.filter(d => d.status === 'On Trip').length;
    return { rows: [{ count }] };
  }
  if (sql.startsWith("SELECT COUNT(*) FROM vehicles WHERE status != 'Retired'")) {
    const count = data.vehicles.filter(v => v.status !== 'Retired').length;
    return { rows: [{ count }] };
  }

  // 26. Reports Aggregation Query
  if (sql.startsWith('SELECT v.id, v.registration_number, v.name, v.acquisition_cost')) {
    const rows = data.vehicles.map(v => {
      const fuelLogs = data.fuel_logs.filter(f => f.vehicle_id === v.id);
      const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
      const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);

      const totalMaintCost = data.maintenances
        .filter(m => m.vehicle_id === v.id)
        .reduce((sum, m) => sum + m.cost, 0);

      const totalDistance = data.trips
        .filter(t => t.vehicle_id === v.id && t.status === 'Completed')
        .reduce((sum, t) => sum + t.planned_distance, 0);

      return {
        id: v.id,
        registration_number: v.registration_number,
        name: v.name,
        acquisition_cost: v.acquisition_cost,
        total_fuel_cost: totalFuelCost,
        total_fuel_liters: totalFuelLiters,
        total_maintenance_cost: totalMaintCost,
        total_distance_completed: totalDistance
      };
    });
    rows.sort((a, b) => b.id - a.id);
    return { rows };
  }

  // 27. Documents Query
  if (sql.startsWith('SELECT * FROM documents WHERE entity_type = $1 AND entity_id = $2')) {
    const [entityType, entityId] = params;
    const rows = data.documents.filter(d => d.entity_type === entityType && d.entity_id === Number(entityId)).sort((a, b) => b.id - a.id);
    return { rows };
  }
  if (sql.startsWith('SELECT * FROM documents WHERE id = $1')) {
    const id = params[0];
    const rows = data.documents.filter(d => d.id === Number(id));
    return { rows };
  }
  if (sql.startsWith('INSERT INTO documents')) {
    const id = data.nextIds.documents++;
    const [entity_type, entity_id, document_type, file_name, file_url, expiry_date, status] = params;
    const newDoc = {
      id,
      entity_type,
      entity_id: Number(entity_id),
      document_type,
      file_name,
      file_url: file_url || '#',
      expiry_date: expiry_date || null,
      status: status || 'Active'
    };
    data.documents.push(newDoc);
    writeDB(data);
    return { rows: [newDoc] };
  }
  if (sql.startsWith('DELETE FROM documents WHERE id = $1')) {
    const id = params[0];
    const index = data.documents.findIndex(d => d.id === Number(id));
    let deleted = null;
    if (index !== -1) {
      deleted = data.documents.splice(index, 1)[0];
      writeDB(data);
    }
    return { rows: deleted ? [deleted] : [] };
  }

  console.log('UNMATCHED SQL QUERY:', sql);
  return { rows: [] };
};

module.exports = {
  query,
  pool: {
    query,
    end: async () => {}
  }
};
