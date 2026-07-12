const db = require('../db');

/**
 * Get Dashboard KPIs
 * Retrieves dynamic counts and statistics for fleet operations.
 */
exports.getDashboardKPIs = async (req, res) => {
  try {
    const { type, status, region } = req.query;

    const buildFilter = (baseConditions = []) => {
      const clauses = [...baseConditions];
      const params = [];
      if (type) {
        params.push(type);
        clauses.push(`v.type = $${params.length}`);
      }
      if (status) {
        params.push(status);
        clauses.push(`v.status = $${params.length}`);
      }
      if (region) {
        params.push(region);
        clauses.push(`v.region = $${params.length}`);
      }
      const sqlClause = clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '';
      return { sqlClause, params };
    };

    // 1. Vehicle Counts
    const vFilter = buildFilter();
    
    const activeVehiclesRes = await db.query(
      `SELECT COUNT(*) FROM vehicles v ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} v.status = 'On Trip'`,
      vFilter.params
    );
    
    const availableVehiclesRes = await db.query(
      `SELECT COUNT(*) FROM vehicles v ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} v.status = 'Available'`,
      vFilter.params
    );

    const maintenanceVehiclesRes = await db.query(
      `SELECT COUNT(*) FROM vehicles v ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} v.status = 'In Shop'`,
      vFilter.params
    );

    const totalVehiclesRes = await db.query(
      `SELECT COUNT(*) FROM vehicles v ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} v.status != 'Retired'`,
      vFilter.params
    );

    // 2. Trip Counts
    const activeTripsRes = await db.query(
      `SELECT COUNT(*) FROM trips t JOIN vehicles v ON t.vehicle_id = v.id ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} t.status = 'Dispatched'`,
      vFilter.params
    );

    const pendingTripsRes = await db.query(
      `SELECT COUNT(*) FROM trips t JOIN vehicles v ON t.vehicle_id = v.id ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} t.status = 'Draft'`,
      vFilter.params
    );

    // 3. Driver Counts
    const driversOnDutyRes = await db.query(
      `SELECT COUNT(*) FROM trips t JOIN vehicles v ON t.vehicle_id = v.id ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} t.status = 'Dispatched'`,
      vFilter.params
    );

    const activeVehiclesCount = parseInt(activeVehiclesRes.rows[0].count);
    const totalVehiclesCount = parseInt(totalVehiclesRes.rows[0].count);
    
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
