const Maintenance = require('../models/maintenance');
const Vehicle = require('../models/vehicle');

/**
 * Get all maintenance logs
 */
exports.getAllMaintenances = async (req, res) => {
  try {
    const logs = await Maintenance.getAll();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving maintenance logs: ' + err.message });
  }
};

/**
 * Get maintenance log by ID
 */
exports.getMaintenanceById = async (req, res) => {
  try {
    const log = await Maintenance.getById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Maintenance log not found.' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving maintenance log: ' + err.message });
  }
};

/**
 * Create a new maintenance record
 * TODO: Enforce active maintenance rules:
 * - Automatically set associated vehicle status to 'In Shop' upon creation
 */
exports.createMaintenance = async (req, res) => {
  try {
    const newLog = await Maintenance.create(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating maintenance record: ' + err.message });
  }
};

/**
 * Update maintenance record status
 * TODO: Enforce status switch rules:
 * - If status is closed, set vehicle status back to 'Available' (unless retired)
 */
exports.updateMaintenance = async (req, res) => {
  try {
    const updatedLog = await Maintenance.update(req.params.id, req.body);
    if (!updatedLog) return res.status(404).json({ error: 'Maintenance log not found.' });
    res.json(updatedLog);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating maintenance: ' + err.message });
  }
};

/**
 * Delete a maintenance record
 */
exports.deleteMaintenance = async (req, res) => {
  try {
    const deleted = await Maintenance.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Maintenance log not found.' });
    res.json({ message: 'Maintenance record deleted successfully.', log: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting maintenance record: ' + err.message });
  }
};
