const db = require('../db');

/**
 * Trip Data Model Queries
 * Handles interaction with 'trips' table in PostgreSQL.
 */
const Trip = {
  getAll: async () => {
    // Joining vehicle and driver names/details for display
    const result = await db.query(`
      SELECT t.*, v.registration_number as vehicle_number, v.name as vehicle_name, d.name as driver_name 
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      ORDER BY t.id DESC
    `);
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(`
      SELECT t.*, v.registration_number as vehicle_number, v.name as vehicle_name, d.name as driver_name 
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.id = $1
    `, [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const { source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status } = data;
    const result = await db.query(
      `INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status || 'Draft']
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status } = data;
    const result = await db.query(
      `UPDATE trips 
       SET source = $1, destination = $2, vehicle_id = $3, driver_id = $4, cargo_weight = $5, planned_distance = $6, status = $7 
       WHERE id = $8 
       RETURNING *`,
      [source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM trips WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Trip;
