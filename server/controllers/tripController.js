const Trip = require('../models/trip');
const Vehicle = require('../models/vehicle');
const Driver = require('../models/driver');
const FuelLog = require('../models/fuelLog');

/**
 * Get all trips
 */
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.getAll();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving trips: ' + err.message });
  }
};

/**
 * Get trip by ID
 */
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.getById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving trip: ' + err.message });
  }
};

/**
 * Create a new trip (Draft status by default)
 */
exports.createTrip = async (req, res) => {
  try {
    const { vehicle_id, driver_id, cargo_weight } = req.body;

    // Fetch vehicle details
    const vehicle = await Vehicle.getById(vehicle_id);
    if (!vehicle) {
      return res.status(400).json({ error: 'Selected vehicle does not exist.' });
    }

    // Verify vehicle status is Available
    if (vehicle.status !== 'Available') {
      return res.status(400).json({ error: `Selected vehicle is not available (Current status: ${vehicle.status}).` });
    }

    // Verify cargo weight <= max load capacity of selected vehicle
    if (parseFloat(cargo_weight) > parseFloat(vehicle.max_load_capacity)) {
      return res.status(400).json({ error: `Cargo weight (${cargo_weight} kg) exceeds vehicle's maximum load capacity (${vehicle.max_load_capacity} kg).` });
    }

    // Fetch driver details
    const driver = await Driver.getById(driver_id);
    if (!driver) {
      return res.status(400).json({ error: 'Selected driver does not exist.' });
    }

    // Verify driver status is Available
    if (driver.status !== 'Available') {
      return res.status(400).json({ error: `Selected driver is not available (Current status: ${driver.status}).` });
    }

    // Verify driver license is not expired
    const today = new Date();
    // Normalize today's date to midnight for date-only comparison
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(driver.license_expiry_date);
    expiryDate.setHours(0, 0, 0, 0);
    if (expiryDate < today) {
      return res.status(400).json({ error: 'Selected driver has an expired license.' });
    }

    const newTrip = await Trip.create(req.body);
    res.status(201).json(newTrip);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating trip: ' + err.message });
  }
};

/**
 * Update trip details
 */
exports.updateTrip = async (req, res) => {
  try {
    const updatedTrip = await Trip.update(req.params.id, req.body);
    if (!updatedTrip) return res.status(404).json({ error: 'Trip not found.' });
    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating trip: ' + err.message });
  }
};

/**
 * Dispatch a trip
 * TODO: Enforce dispatch status rules:
 * - Update trip status to 'Dispatched'
 * - Update associated Vehicle status to 'On Trip'
 * - Update associated Driver status to 'On Trip'
 */
exports.dispatchTrip = async (req, res) => {
  try {
    const trip = await Trip.getById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    if (trip.status !== 'Draft') {
      return res.status(400).json({ error: 'Only Draft trips can be dispatched.' });
    }

    // Retrieve and verify vehicle and driver status are still Available
    const vehicle = await Vehicle.getById(trip.vehicle_id);
    const driver = await Driver.getById(trip.driver_id);

    if (!vehicle || vehicle.status !== 'Available') {
      return res.status(400).json({ error: 'Vehicle is not available for dispatch.' });
    }
    if (!driver || driver.status !== 'Available') {
      return res.status(400).json({ error: 'Driver is not available for dispatch.' });
    }

    // Perform updates
    await Vehicle.update(vehicle.id, { ...vehicle, status: 'On Trip' });
    await Driver.update(driver.id, { ...driver, status: 'On Trip' });
    const updated = await Trip.update(trip.id, { ...trip, status: 'Dispatched' });

    res.json({ message: 'Trip successfully dispatched.', trip: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error dispatching trip: ' + err.message });
  }
};

/**
 * Complete a trip
 * TODO: Enforce trip completion rules:
 * - Update trip status to 'Completed'
 * - Record final odometer (must exceed vehicle's current odometer) and update vehicle's odometer
 * - Record fuel consumed and create a corresponding FuelLog database entry
 * - Restore associated Vehicle and Driver status back to 'Available'
 */
exports.completeTrip = async (req, res) => {
  try {
    const { end_odometer, fuel_consumed } = req.body;
    const trip = await Trip.getById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ error: 'Only Dispatched trips can be completed.' });
    }

    const vehicle = await Vehicle.getById(trip.vehicle_id);
    const driver = await Driver.getById(trip.driver_id);

    // Validate odometer progression
    if (parseFloat(end_odometer) <= parseFloat(vehicle.odometer)) {
      return res.status(400).json({ 
        error: `Ending odometer (${end_odometer}) must exceed vehicle's current odometer (${vehicle.odometer}).` 
      });
    }

    // Create automatic FuelLog entry if fuel was consumed
    if (parseFloat(fuel_consumed) > 0) {
      await FuelLog.create({
        vehicle_id: trip.vehicle_id,
        liters: parseFloat(fuel_consumed),
        cost: parseFloat(fuel_consumed) * 1.5,
        date: new Date(),
        expense_type: 'Fuel'
      });
    }

    // Update statuses back to Available
    await Vehicle.update(vehicle.id, { ...vehicle, odometer: parseFloat(end_odometer), status: 'Available' });
    await Driver.update(driver.id, { ...driver, status: 'Available' });

    // Update trip status
    const updated = await Trip.update(trip.id, { ...trip, status: 'Completed' });
    res.json({ message: 'Trip successfully completed.', trip: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error completing trip: ' + err.message });
  }
};

/**
 * Cancel a trip
 * TODO: Enforce cancel rules:
 * - Update trip status to 'Cancelled'
 * - If the trip was already dispatched, restore associated Vehicle and Driver status to 'Available'
 */
exports.cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.getById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    if (trip.status === 'Cancelled' || trip.status === 'Completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed or already cancelled trip.' });
    }

    // If dispatched, restore vehicle and driver status to Available
    if (trip.status === 'Dispatched') {
      const vehicle = await Vehicle.getById(trip.vehicle_id);
      const driver = await Driver.getById(trip.driver_id);
      if (vehicle) await Vehicle.update(vehicle.id, { ...vehicle, status: 'Available' });
      if (driver) await Driver.update(driver.id, { ...driver, status: 'Available' });
    }

    const updated = await Trip.update(trip.id, { ...trip, status: 'Cancelled' });
    res.json({ message: 'Trip successfully cancelled.', trip: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error cancelling trip: ' + err.message });
  }
};

/**
 * Delete a trip record
 */
exports.deleteTrip = async (req, res) => {
  try {
    const deleted = await Trip.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ message: 'Trip deleted successfully.', trip: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting trip: ' + err.message });
  }
};
