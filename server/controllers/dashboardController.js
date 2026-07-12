const db = require('../db');

/**
 * Get Dashboard KPIs
 * Retrieves dynamic counts and statistics for fleet operations.
 */
exports.getDashboardKPIs = async (req, res) => {
  try {
    // Queries to calculate KPIs dynamically from the database
    // Active Vehicles (Status = 'On Trip')
    const activeVehiclesRes = await db.query("SELECT COUNT(*) FROM vehicles WHERE status = 'On Trip'");
    
    // Available Vehicles (Status = 'Available')
    const availableVehiclesRes = await db.query("SELECT COUNT(*) FROM vehicles WHERE status = 'Available'");
    
    // Vehicles in Maintenance (Status = 'In Shop')
    const maintenanceVehiclesRes = await db.query("SELECT COUNT(*) FROM vehicles WHERE status = 'In Shop'");
    
    // Active Trips (Status = 'Dispatched')
    const activeTripsRes = await db.query("SELECT COUNT(*) FROM trips WHERE status = 'Dispatched'");
    
    // Pending Trips (Status = 'Draft')
    const pendingTripsRes = await db.query("SELECT COUNT(*) FROM trips WHERE status = 'Draft'");
    
    // Drivers On Duty (Status = 'On Trip')
    const driversOnDutyRes = await db.query("SELECT COUNT(*) FROM drivers WHERE status = 'On Trip'");
    
    // Total Vehicles
    const totalVehiclesRes = await db.query("SELECT COUNT(*) FROM vehicles WHERE status != 'Retired'");
    
    const activeVehiclesCount = parseInt(activeVehiclesRes.rows[0].count);
    const totalVehiclesCount = parseInt(totalVehiclesRes.rows[0].count);
    
    // Fleet Utilization (%) = (Active Vehicles / Total Non-Retired Vehicles) * 100
    const fleetUtilization = totalVehiclesCount > 0 
      ? Math.round((activeVehiclesCount / totalVehiclesCount) * 100) 
      : 0;

    res.json({
      activeVehicles: activeVehiclesCount,
      availableVehicles: parseInt(availableVehiclesRes.rows[0].count),
      vehiclesInMaintenance: parseInt(maintenanceVehiclesRes.rows[0].count),
      activeTrips: parseInt(activeTripsRes.rows[0].count),
      pendingTrips: parseInt(pendingTripsRes.rows[0].count),
      driversOnDuty: parseInt(driversOnDutyRes.rows[0].count),
      fleetUtilization: fleetUtilization
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving KPIs: ' + err.message });
  }
};
