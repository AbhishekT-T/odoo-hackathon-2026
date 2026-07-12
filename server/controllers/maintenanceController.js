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
    if (newLog && newLog.status === 'Active') {
      const vehicle = await Vehicle.getById(newLog.vehicle_id);
      if (vehicle && vehicle.status !== 'Retired') {
        await Vehicle.updateStatus(newLog.vehicle_id, 'In Shop');
      }
    }
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
    const oldLog = await Maintenance.getById(req.params.id);
    if (!oldLog) return res.status(404).json({ error: 'Maintenance log not found.' });

    const updatedLog = await Maintenance.update(req.params.id, req.body);
    if (!updatedLog) return res.status(404).json({ error: 'Maintenance log not found.' });

    // Status transition: Closed
    if (updatedLog.status === 'Closed' && oldLog.status !== 'Closed') {
      const hasActive = await Maintenance.hasActiveMaintenance(updatedLog.vehicle_id);
      if (!hasActive) {
        const vehicle = await Vehicle.getById(updatedLog.vehicle_id);
        if (vehicle && vehicle.status !== 'Retired') {
          await Vehicle.updateStatus(updatedLog.vehicle_id, 'Available');
        }
      }
    }
    // Status transition: Re-opened (Active)
    else if (updatedLog.status === 'Active' && oldLog.status !== 'Active') {
      const vehicle = await Vehicle.getById(updatedLog.vehicle_id);
      if (vehicle && vehicle.status !== 'Retired') {
        await Vehicle.updateStatus(updatedLog.vehicle_id, 'In Shop');
      }
    }

    // Vehicle change transition
    if (updatedLog.vehicle_id !== oldLog.vehicle_id) {
      if (oldLog.status === 'Active') {
        const hasActiveOld = await Maintenance.hasActiveMaintenance(oldLog.vehicle_id);
        if (!hasActiveOld) {
          const oldVehicle = await Vehicle.getById(oldLog.vehicle_id);
          if (oldVehicle && oldVehicle.status !== 'Retired') {
            await Vehicle.updateStatus(oldLog.vehicle_id, 'Available');
          }
        }
      }
      if (updatedLog.status === 'Active') {
        const newVehicle = await Vehicle.getById(updatedLog.vehicle_id);
        if (newVehicle && newVehicle.status !== 'Retired') {
          await Vehicle.updateStatus(updatedLog.vehicle_id, 'In Shop');
        }
      }
    }

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

    if (deleted.status === 'Active') {
      const hasActive = await Maintenance.hasActiveMaintenance(deleted.vehicle_id);
      if (!hasActive) {
        const vehicle = await Vehicle.getById(deleted.vehicle_id);
        if (vehicle && vehicle.status !== 'Retired') {
          await Vehicle.updateStatus(deleted.vehicle_id, 'Available');
        }
      }
    }

    res.json({ message: 'Maintenance record deleted successfully.', log: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting maintenance record: ' + err.message });
  }
};
