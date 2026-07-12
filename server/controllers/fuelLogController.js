const FuelLog = require('../models/fuelLog');

/**
 * Get all fuel logs (with optional ?vehicle_id= filter)
 */
exports.getAllFuelLogs = async (req, res) => {
  try {
    const logs = await FuelLog.getAll();
    const { vehicle_id } = req.query;
    if (vehicle_id) {
      const filtered = logs.filter(l => l.vehicle_id === Number(vehicle_id));
      return res.json(filtered);
    }
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
 * Create a new fuel log.
 * Validation (positive liters, positive cost) is enforced by validateFuelLog middleware.
 */
exports.createFuelLog = async (req, res) => {
  try {
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

/**
 * GET /api/fuel-logs/summary
 * Returns grand totals + per-vehicle cost breakdown for the dashboard and finance page.
 */
exports.getFuelSummary = async (req, res) => {
  try {
    const logs = await FuelLog.getAll();

    // Grand totals
    const totalCost = logs.reduce((sum, l) => sum + parseFloat(l.cost || 0), 0);
    const totalLiters = logs.reduce((sum, l) => sum + parseFloat(l.liters || 0), 0);
    const totalLogs = logs.length;

    // Per-vehicle breakdown (group by vehicle_id)
    const vehicleMap = {};
    for (const l of logs) {
      const key = l.vehicle_id;
      if (!vehicleMap[key]) {
        vehicleMap[key] = {
          vehicle_id: l.vehicle_id,
          vehicle_name: l.vehicle_name || '',
          vehicle_number: l.vehicle_number || '',
          totalCost: 0,
          totalLiters: 0,
          logCount: 0
        };
      }
      vehicleMap[key].totalCost += parseFloat(l.cost || 0);
      vehicleMap[key].totalLiters += parseFloat(l.liters || 0);
      vehicleMap[key].logCount += 1;
    }

    const byVehicle = Object.values(vehicleMap).sort((a, b) => b.totalCost - a.totalCost);

    res.json({ totalCost, totalLiters, totalLogs, byVehicle });
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving fuel summary: ' + err.message });
  }
};
