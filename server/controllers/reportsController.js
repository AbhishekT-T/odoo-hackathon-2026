const db = require('../db');

/**
 * Get Reports and Analytics Data
 * TODO: Implement advanced ROI and efficiency query algorithms.
 * For now, this returns a combined dataset summarizing costs, efficiency, and ROI per vehicle.
 */
exports.getReportsData = async (req, res) => {
  try {
    // Basic aggregation query to calculate operational metrics per vehicle
    const result = await db.query(`
      SELECT 
        v.id,
        v.registration_number,
        v.name,
        v.acquisition_cost,
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

      // Fuel Efficiency (km/L)
      const fuelEfficiency = liters > 0 ? (distance / liters).toFixed(2) : '0.00';

      // Dummy trip revenue to calculate placeholder ROI (revenue = distance * $2.5)
      // TODO: Replace with real trip revenue field summation
      const estimatedRevenue = distance * 2.5;

      // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      const roi = acqCost > 0 
        ? (((estimatedRevenue - totalOpCost) / acqCost) * 100).toFixed(1)
        : '0.0';

      return {
        id: row.id,
        registration_number: row.registration_number,
        name: row.name,
        totalOperationalCost: totalOpCost,
        fuelEfficiency: parseFloat(fuelEfficiency),
        roi: parseFloat(roi),
        maintenanceCost: maintCost,
        fuelCost: fuelCost
      };
    });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving reports: ' + err.message });
  }
};
