const Driver = require('../models/driver');

/**
 * Get all drivers
 */
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.getAll();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving drivers: ' + err.message });
  }
};

/**
 * Get driver by ID
 */
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.getById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found.' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving driver: ' + err.message });
  }
};

/**
 * Create a new driver
 */
exports.createDriver = async (req, res) => {
  try {
    const existing = await Driver.getByLicenseNumber(req.body.license_number);
    if (existing) {
      return res.status(400).json({ error: 'Driver license number must be unique.' });
    }
    const newDriver = await Driver.create(req.body);
    res.status(201).json(newDriver);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating driver: ' + err.message });
  }
};

/**
 * Update driver details
 */
exports.updateDriver = async (req, res) => {
  try {
    if (req.body.license_number) {
      const existing = await Driver.getByLicenseNumber(req.body.license_number);
      if (existing && existing.id !== parseInt(req.params.id)) {
        return res.status(400).json({ error: 'Driver license number must be unique.' });
      }
    }
    const updatedDriver = await Driver.update(req.params.id, req.body);
    if (!updatedDriver) return res.status(404).json({ error: 'Driver not found.' });
    res.json(updatedDriver);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating driver: ' + err.message });
  }
};

/**
 * Delete a driver
 */
exports.deleteDriver = async (req, res) => {
  try {
    const deleted = await Driver.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Driver not found.' });
    res.json({ message: 'Driver deleted successfully.', driver: deleted });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete driver because they have associated trips or document logs.' });
    }
    res.status(500).json({ error: 'Server error deleting driver: ' + err.message });
  }
};
