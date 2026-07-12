const db = require('../db');

/**
 * GET /api/reports/analytics
 * Per-vehicle breakdown: fuel cost, maintenance cost, total op cost,
 * fuel efficiency (km/L), trip revenue, and ROI.
 * Revenue = sum of completed trips' planned_distance * $2.5/km
 * (industry-standard rate; replace with a real revenue field when trips model supports it)
 * ROI = (Revenue − Op Cost) / Acquisition Cost × 100
 */
exports.getReportsData = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.id, v.registration_number, v.name, v.acquisition_cost,
        COALESCE(SUM(f.cost), 0) as total_fuel_cost,
        COALESCE(SUM(f.liters), 0) as total_fuel_liters,
        (
          SELECT COALESCE(SUM(m.cost), 0)
          FROM maintenances m
          WHERE m.vehicle_id = v.id
        ) as total_maintenance_cost,
        (
          SELECT COALESCE(SUM(t.planned_distance), 0)
          FROM trips t
          WHERE t.vehicle_id = v.id AND t.status = 'Completed'
        ) as total_distance_completed
      FROM vehicles v
      LEFT JOIN fuel_logs f ON v.id = f.vehicle_id
      GROUP BY v.id
      ORDER BY v.id DESC
    `);

    const reports = result.rows.map(row => {
      const fuelCost = parseFloat(row.total_fuel_cost);
      const maintCost = parseFloat(row.total_maintenance_cost);
      const totalOpCost = fuelCost + maintCost;
      const distance = parseFloat(row.total_distance_completed);
      const liters = parseFloat(row.total_fuel_liters);
      const acqCost = parseFloat(row.acquisition_cost);

      // Fuel Efficiency (km/L) — only meaningful when fuel was logged
      const fuelEfficiency = liters > 0 ? parseFloat((distance / liters).toFixed(2)) : 0;

      // Revenue: $2.5 per km of completed trips
      const revenue = parseFloat((distance * 2.5).toFixed(2));

      // ROI = (Revenue - OpCost) / AcqCost × 100
      const roi = acqCost > 0
        ? parseFloat(((revenue - totalOpCost) / acqCost * 100).toFixed(1))
        : 0;

      // Net profit per vehicle
      const netProfit = parseFloat((revenue - totalOpCost).toFixed(2));

      return {
        id: row.id,
        registration_number: row.registration_number,
        name: row.name,
        acquisitionCost: acqCost,
        fuelCost: parseFloat(fuelCost.toFixed(2)),
        maintenanceCost: parseFloat(maintCost.toFixed(2)),
        totalOperationalCost: parseFloat(totalOpCost.toFixed(2)),
        fuelEfficiency,
        totalDistance: distance,
        revenue,
        netProfit,
        roi
      };
    });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving analytics: ' + err.message });
  }
};

/**
 * GET /api/reports/fleet-summary
 * Grand total aggregation across all vehicles:
 * total revenue, total operational cost, fleet-wide ROI, total acquisition cost.
 */
exports.getFleetSummary = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.id, v.registration_number, v.name, v.acquisition_cost,
        COALESCE(SUM(f.cost), 0) as total_fuel_cost,
        COALESCE(SUM(f.liters), 0) as total_fuel_liters,
        (
          SELECT COALESCE(SUM(m.cost), 0)
          FROM maintenances m
          WHERE m.vehicle_id = v.id
        ) as total_maintenance_cost,
        (
          SELECT COALESCE(SUM(t.planned_distance), 0)
          FROM trips t
          WHERE t.vehicle_id = v.id AND t.status = 'Completed'
        ) as total_distance_completed
      FROM vehicles v
      LEFT JOIN fuel_logs f ON v.id = f.vehicle_id
      GROUP BY v.id
      ORDER BY v.id DESC
    `);

    let totalRevenue = 0;
    let totalFuelCost = 0;
    let totalMaintenanceCost = 0;
    let totalAcquisitionCost = 0;
    let totalDistance = 0;
    let totalLiters = 0;

    for (const row of result.rows) {
      const dist = parseFloat(row.total_distance_completed);
      totalRevenue += dist * 2.5;
      totalFuelCost += parseFloat(row.total_fuel_cost);
      totalMaintenanceCost += parseFloat(row.total_maintenance_cost);
      totalAcquisitionCost += parseFloat(row.acquisition_cost);
      totalDistance += dist;
      totalLiters += parseFloat(row.total_fuel_liters);
    }

    const totalOpCost = totalFuelCost + totalMaintenanceCost;
    const netProfit = totalRevenue - totalOpCost;
    const fleetROI = totalAcquisitionCost > 0
      ? parseFloat(((netProfit / totalAcquisitionCost) * 100).toFixed(1))
      : 0;
    const avgFuelEfficiency = totalLiters > 0
      ? parseFloat((totalDistance / totalLiters).toFixed(2))
      : 0;

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
      totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
      totalOperationalCost: parseFloat(totalOpCost.toFixed(2)),
      totalAcquisitionCost: parseFloat(totalAcquisitionCost.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      fleetROI,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      avgFuelEfficiency,
      vehicleCount: result.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving fleet summary: ' + err.message });
  }
};
