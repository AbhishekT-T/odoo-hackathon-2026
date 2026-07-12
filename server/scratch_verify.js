const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: body });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

const { execSync } = require('child_process');

async function runTests() {
  console.log('--- STARTING TRANSITOPS BUSINESS RULES VERIFICATION ---');

  console.log('Resetting database...');
  execSync('node seed.js');

  // Step 1: Register a vehicle 'Van-05' (max capacity: 500 kg)
  console.log('\n[Step 1] Registering vehicle "Van-05"...');
  const vReg = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/vehicles',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    registration_number: 'Van-05',
    name: 'Delivery Van 05',
    type: 'Van',
    max_load_capacity: 500.0,
    odometer: 1000.0,
    acquisition_cost: 25000.0,
    status: 'Available'
  });
  console.log('Response Status:', vReg.status, 'Body:', vReg.body);
  const vehicleId = vReg.body.id;

  // Verify unique registration constraint
  console.log('[Step 1.1] Testing duplicate vehicle registration uniqueness...');
  const vRegDup = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/vehicles',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    registration_number: 'Van-05',
    name: 'Duplicate Van',
    max_load_capacity: 300
  });
  console.log('Response (Expected 400):', vRegDup.status, 'Error Message:', vRegDup.body.error);

  // Step 2: Register driver 'Alex' with a valid driving license
  console.log('\n[Step 2] Registering driver "Alex"...');
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years in future

  const dReg = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/drivers',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Alex',
    license_number: 'DL-99999',
    license_category: 'Class A CDL',
    license_expiry_date: expiryDate.toISOString().split('T')[0],
    contact_number: '555-0199',
    safety_score: 95.0,
    status: 'Available'
  });
  console.log('Response Status:', dReg.status, 'Body:', dReg.body);
  const driverId = dReg.body.id;

  // Step 3 & 4: Create a trip (Cargo Weight: 450 kg <= 500 kg max capacity)
  console.log('\n[Step 3 & 4] Creating a trip (Cargo: 450 kg)...');
  const tCreate = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/trips',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    source: 'Warehouse A',
    destination: 'Retail Center B',
    vehicle_id: vehicleId,
    driver_id: driverId,
    cargo_weight: 450.0,
    planned_distance: 120.0,
    status: 'Draft'
  });
  console.log('Response Status:', tCreate.status, 'Body:', tCreate.body);
  const tripId = tCreate.body.id;

  // Test capacity check validation
  console.log('[Step 4.1] Testing overload capacity validation (600 kg)...');
  const tCreateOver = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/trips',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    source: 'Warehouse A',
    destination: 'Retail Center B',
    vehicle_id: vehicleId,
    driver_id: driverId,
    cargo_weight: 600.0,
    planned_distance: 120.0,
    status: 'Draft'
  });
  console.log('Response (Expected 400):', tCreateOver.status, 'Error Message:', tCreateOver.body.error);

  // Step 5: Dispatch the trip (Vehicle & Driver status automatically become On Trip)
  console.log('\n[Step 5] Dispatching the trip...');
  const tDispatch = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/trips/${tripId}/dispatch`,
    method: 'POST'
  });
  console.log('Response Status:', tDispatch.status, 'Body:', tDispatch.body);

  // Verify vehicle and driver status are 'On Trip'
  console.log('[Step 5.1] Checking vehicle and driver statuses...');
  const vCheck = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/vehicles/${vehicleId}`, method: 'GET' });
  const dCheck = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/drivers/${driverId}`, method: 'GET' });
  console.log('Vehicle Status (Expected "On Trip"):', vCheck.body.status);
  console.log('Driver Status (Expected "On Trip"):', dCheck.body.status);

  // Step 6 & 7: Complete the trip entering final odometer and fuel consumed
  console.log('\n[Step 6 & 7] Completing the trip (End Odo: 1120.0, Fuel Consumed: 15L)...');
  const tComplete = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/trips/${tripId}/complete`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    end_odometer: 1120.0,
    fuel_consumed: 15.0
  });
  console.log('Response Status:', tComplete.status, 'Body:', tComplete.body);

  // Verify vehicle and driver statuses are restored to 'Available' and Odometer is updated
  console.log('[Step 7.1] Checking vehicle odometer and statuses...');
  const vCheck2 = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/vehicles/${vehicleId}`, method: 'GET' });
  const dCheck2 = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/drivers/${driverId}`, method: 'GET' });
  console.log('Vehicle Status (Expected "Available"):', vCheck2.body.status, 'Odometer (Expected 1120.0):', vCheck2.body.odometer);
  console.log('Driver Status (Expected "Available"):', dCheck2.body.status);

  // Step 8: Create a maintenance record
  console.log('\n[Step 8] Creating active maintenance record for vehicle...');
  const mCreate = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/maintenance',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    vehicle_id: vehicleId,
    description: 'Oil Change and General Service',
    cost: 150.0,
    status: 'Active'
  });
  console.log('Response Status:', mCreate.status, 'Body:', mCreate.body);

  // Verify vehicle status becomes 'In Shop'
  console.log('[Step 8.1] Checking vehicle status...');
  const vCheck3 = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/vehicles/${vehicleId}`, method: 'GET' });
  console.log('Vehicle Status (Expected "In Shop"):', vCheck3.body.status);

  // Close the maintenance record
  console.log('[Step 8.2] Closing the maintenance log...');
  const mClose = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/maintenance/${mCreate.body.id}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    ...mCreate.body,
    status: 'Closed'
  });
  console.log('Response Status:', mClose.status, 'Body:', mClose.body);

  // Verify vehicle status becomes 'Available' again
  const vCheck4 = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/vehicles/${vehicleId}`, method: 'GET' });
  console.log('Vehicle Status (Expected "Available"):', vCheck4.body.status);

  // Step 9: Reports check
  console.log('\n[Step 9] Checking operational performance metrics report...');
  const rCheck = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/reports/analytics', method: 'GET' });
  const vehicleReport = rCheck.body.find(r => r.registration_number === 'Van-05');
  console.log('Van-05 Report Metrics:');
  console.log('  Total Operational Cost (Expected 172.5 = 150.0 maintenance + 22.5 fuel):', vehicleReport?.totalOperationalCost);
  console.log('  Fuel Efficiency (Expected 8.00 = 120km / 15L):', vehicleReport?.fuelEfficiency);
  console.log('  ROI (%):', vehicleReport?.roi);

  console.log('\n--- VERIFICATION COMPLETED ---');
}

runTests().catch(console.error);
