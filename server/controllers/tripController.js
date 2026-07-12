const Trip = require('../models/trip');
const Vehicle = require('../models/vehicle');
const Driver = require('../models/driver');

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
    // TODO: Verify cargo weight <= max load capacity of selected vehicle
    // TODO: Validate that the vehicle is currently 'Available' and not in shop/retired
    // TODO: Validate that the driver is 'Available' (not suspended, off duty, or expired license)
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

    // Placeholder update
    const updated = await Trip.update(trip.id, { ...trip, status: 'Dispatched' });
    res.json({ message: 'Trip dispatched (placeholder).', trip: updated });
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
    const trip = await Trip.getById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    // Placeholder update
    const updated = await Trip.update(trip.id, { ...trip, status: 'Completed' });
    res.json({ message: 'Trip completed (placeholder).', trip: updated });
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

    // Placeholder update
    const updated = await Trip.update(trip.id, { ...trip, status: 'Cancelled' });
    res.json({ message: 'Trip cancelled (placeholder).', trip: updated });
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
