// Stub validators for incoming API requests

/**
 * Validate vehicle fields
 * TODO: Implement strict validation. Enforce registration number uniqueness.
 */
const validateVehicle = (req, res, next) => {
  const { registration_number, name, max_load_capacity } = req.body;
  if (!registration_number || !name || !max_load_capacity) {
    return res.status(400).json({ error: 'Registration number, name, and max load capacity are required.' });
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
const validateMaintenance = (req, res, next) => {
  const { vehicle_id } = req.body;
  if (!vehicle_id) {
    return res.status(400).json({ error: 'Vehicle ID is required for maintenance logging.' });
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
