const Vehicle = require('../models/vehicle');

// Stub validators for incoming API requests

/**
 * Validate vehicle fields
 * TODO: Implement strict validation. Enforce registration number uniqueness.
 */
const validateVehicle = async (req, res, next) => {
  const { registration_number, name, max_load_capacity, odometer } = req.body;
  if (!registration_number || !registration_number.trim() || !name || !name.trim() || max_load_capacity === undefined || max_load_capacity === null) {
    return res.status(400).json({ error: 'Registration number, name, and max load capacity are required.' });
  }

  const capacity = Number(max_load_capacity);
  if (isNaN(capacity) || capacity <= 0) {
    return res.status(400).json({ error: 'Max load capacity must be a positive number.' });
  }

  if (odometer !== undefined && odometer !== null) {
    const odo = Number(odometer);
    if (isNaN(odo) || odo < 0) {
      return res.status(400).json({ error: 'Odometer must be a non-negative number.' });
    }
  }

  try {
    // Unique registration number check
    const vehicles = await Vehicle.getAll();
    const isDuplicate = vehicles.some(v => 
      v.registration_number.trim().toLowerCase() === registration_number.trim().toLowerCase() && 
      v.id !== Number(req.params.id || 0)
    );
    if (isDuplicate) {
      return res.status(400).json({ error: 'Vehicle registration number must be unique.' });
    }

    // Odometer decrease check on update
    if (req.params.id) {
      const current = await Vehicle.getById(req.params.id);
      if (current) {
        const newOdo = odometer !== undefined ? Number(odometer) : Number(current.odometer);
        if (newOdo < Number(current.odometer)) {
          return res.status(400).json({ error: `Odometer reading cannot be decreased from the current value of ${Number(current.odometer)} km.` });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({ error: 'Validation error: ' + err.message });
  }

  next();
};

/**
 * Validate driver fields
 * TODO: Implement license number validation.
 */
const validateDriver = (req, res, next) => {
  const { name, license_number, license_expiry_date } = req.body;
  if (!name || !license_number || !license_expiry_date) {
    return res.status(400).json({ error: 'Name, license number, and license expiry date are required.' });
  }
  next();
};

/**
 * Validate trip fields
 * TODO: Implement cargo weight, vehicle & driver availability, and expired license checks.
 */
const validateTrip = (req, res, next) => {
  const { source, destination, vehicle_id, driver_id, cargo_weight, planned_distance } = req.body;
  if (!source || !destination || !vehicle_id || !driver_id || !cargo_weight || !planned_distance) {
    return res.status(400).json({ error: 'Source, destination, vehicle_id, driver_id, cargo_weight, and planned_distance are required.' });
  }
  next();
};

/**
 * Validate maintenance fields
 * TODO: Validate active log logic (automatically sets vehicle to In Shop).
 */
const validateMaintenance = async (req, res, next) => {
  const { vehicle_id } = req.body;
  if (!vehicle_id) {
    return res.status(400).json({ error: 'Vehicle ID is required for maintenance logging.' });
  }

  try {
    const vehicle = await Vehicle.getById(vehicle_id);
    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle not found.' });
    }
    if (vehicle.status === 'Retired') {
      return res.status(400).json({ error: 'Cannot log maintenance for a retired vehicle.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Validation error checking vehicle: ' + err.message });
  }

  next();
};

/**
 * Validate fuel log fields
 * TODO: Validate that cost and liters are positive numeric values.
 */
const validateFuelLog = (req, res, next) => {
  const { vehicle_id, liters, cost } = req.body;
  if (!vehicle_id || liters === undefined || cost === undefined) {
    return res.status(400).json({ error: 'Vehicle ID, liters, and cost are required.' });
  }
  next();
};

module.exports = {
  validateVehicle,
  validateDriver,
  validateTrip,
  validateMaintenance,
  validateFuelLog
};
