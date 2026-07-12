const FuelLog = require('../models/fuelLog');

/**
 * Get all fuel logs
 */
exports.getAllFuelLogs = async (req, res) => {
  try {
    const logs = await FuelLog.getAll();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving fuel logs: ' + err.message });
  }
};

/**
 * Get fuel log by ID
 */
exports.getFuelLogById = async (req, res) => {
  try {
    const log = await FuelLog.getById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Fuel log not found.' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving fuel log: ' + err.message });
  }
};

/**
 * Create a new fuel log
 */
exports.createFuelLog = async (req, res) => {
  try {
    // TODO: Verify liters and cost are positive numbers
    const newLog = await FuelLog.create(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating fuel log: ' + err.message });
  }
};

/**
 * Update fuel log details
 */
exports.updateFuelLog = async (req, res) => {
  try {
    const updatedLog = await FuelLog.update(req.params.id, req.body);
    if (!updatedLog) return res.status(404).json({ error: 'Fuel log not found.' });
    res.json(updatedLog);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating fuel log: ' + err.message });
  }
};

/**
 * Delete a fuel log
 */
exports.deleteFuelLog = async (req, res) => {
  try {
    const deleted = await FuelLog.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Fuel log not found.' });
    res.json({ message: 'Fuel log deleted successfully.', log: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting fuel log: ' + err.message });
  }
};
