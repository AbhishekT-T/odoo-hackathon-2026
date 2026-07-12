const Vehicle = require('../models/vehicle');

/**
 * Get all vehicles
 */
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.getAll();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving vehicles: ' + err.message });
  }
};

/**
 * Get vehicle by ID
 */
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.getById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving vehicle: ' + err.message });
  }
};

/**
 * Create a new vehicle
 */
exports.createVehicle = async (req, res) => {
  try {
    const existing = await Vehicle.getByRegistrationNumber(req.body.registration_number);
    if (existing) {
      return res.status(400).json({ error: 'Vehicle registration number must be unique.' });
    }
    const newVehicle = await Vehicle.create(req.body);
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating vehicle: ' + err.message });
  }
};

/**
 * Update vehicle details
 */
exports.updateVehicle = async (req, res) => {
  try {
    if (req.body.registration_number) {
      const existing = await Vehicle.getByRegistrationNumber(req.body.registration_number);
      if (existing && existing.id !== parseInt(req.params.id)) {
        return res.status(400).json({ error: 'Vehicle registration number must be unique.' });
      }
    }
    const updatedVehicle = await Vehicle.update(req.params.id, req.body);
    if (!updatedVehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json(updatedVehicle);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating vehicle: ' + err.message });
  }
};

/**
 * Delete a vehicle
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const deleted = await Vehicle.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json({ message: 'Vehicle deleted successfully.', vehicle: deleted });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete vehicle because it has associated trips or maintenance records.' });
    }
    res.status(500).json({ error: 'Server error deleting vehicle: ' + err.message });
  }
};
