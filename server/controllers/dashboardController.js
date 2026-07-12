const db = require('../db');

/**
 * GET /api/dashboard/kpis
 * Returns operational + financial KPI aggregates for the dashboard.
 * Supports optional filters: ?type=&status=&region=
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

    // ── Operational KPIs ─────────────────────────────────────────────────────
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

    const activeTripsRes = await db.query(
      `SELECT COUNT(*) FROM trips t JOIN vehicles v ON t.vehicle_id = v.id ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} t.status = 'Dispatched'`,
      vFilter.params
    );

    const pendingTripsRes = await db.query(
      `SELECT COUNT(*) FROM trips t JOIN vehicles v ON t.vehicle_id = v.id ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} t.status = 'Draft'`,
      vFilter.params
    );

    const driversOnDutyRes = await db.query(
      `SELECT COUNT(*) FROM trips t JOIN vehicles v ON t.vehicle_id = v.id ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} t.status = 'Dispatched'`,
      vFilter.params
    );

    const activeVehiclesCount = parseInt(activeVehiclesRes.rows[0].count);
    const totalVehiclesCount = parseInt(totalVehiclesRes.rows[0].count);
    const fleetUtilization = totalVehiclesCount > 0
      ? Math.round((activeVehiclesCount / totalVehiclesCount) * 100)
      : 0;

    // ── Financial KPIs — computed directly from JSON DB data ─────────────────
    // We read raw data via the reports aggregation query which returns per-vehicle
    // fuel/maintenance/distance totals, then we sum it all up here.
    const reportsRes = await db.query(
      `SELECT v.id, v.registration_number, v.name, v.acquisition_cost, COALESCE(SUM(f.cost), 0) as total_fuel_cost, COALESCE(SUM(f.liters), 0) as total_fuel_liters, ( SELECT COALESCE(SUM(m.cost), 0) FROM maintenances m WHERE m.vehicle_id = v.id ) as total_maintenance_cost, ( SELECT COALESCE(SUM(t.planned_distance), 0) FROM trips t WHERE t.vehicle_id = v.id AND t.status = 'Completed' ) as total_distance_completed FROM vehicles v LEFT JOIN fuel_logs f ON v.id = f.vehicle_id GROUP BY v.id ORDER BY v.id DESC`
    );

    let totalFuelSpend = 0;
    let totalMaintenanceCost = 0;
    let totalRevenue = 0;

    for (const row of reportsRes.rows) {
      totalFuelSpend += parseFloat(row.total_fuel_cost || 0);
      totalMaintenanceCost += parseFloat(row.total_maintenance_cost || 0);
      // Revenue: distance * $2.5 per km (standard industry rate used throughout the app)
      const distance = parseFloat(row.total_distance_completed || 0);
      totalRevenue += distance * 2.5;
    }

    const totalOperationalCost = totalFuelSpend + totalMaintenanceCost;
    const netProfit = totalRevenue - totalOperationalCost;

    // Count completed trips
    const completedTripsRes = await db.query(
      `SELECT COUNT(*) FROM trips t JOIN vehicles v ON t.vehicle_id = v.id ${vFilter.sqlClause ? vFilter.sqlClause + ' AND' : 'WHERE'} t.status = 'Completed'`,
      vFilter.params
    );

    res.json({
      // Operational KPIs
      activeVehicles: activeVehiclesCount,
      availableVehicles: parseInt(availableVehiclesRes.rows[0].count),
      vehiclesInMaintenance: parseInt(maintenanceVehiclesRes.rows[0].count),
      activeTrips: parseInt(activeTripsRes.rows[0].count),
      pendingTrips: parseInt(pendingTripsRes.rows[0].count),
      driversOnDuty: parseInt(driversOnDutyRes.rows[0].count),
      fleetUtilization,
      completedTrips: parseInt(completedTripsRes.rows[0].count),
      // Financial KPIs
      totalFuelSpend: parseFloat(totalFuelSpend.toFixed(2)),
      totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
      totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving KPIs: ' + err.message });
  }
};
