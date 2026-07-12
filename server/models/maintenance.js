const db = require('../db');

/**
 * Maintenance Data Model Queries
 * Handles interaction with 'maintenances' table in PostgreSQL.
 */
const Maintenance = {
  getAll: async () => {
    const result = await db.query(`
      SELECT m.*, v.registration_number as vehicle_number, v.name as vehicle_name 
      FROM maintenances m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.id DESC
    `);
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(`
      SELECT m.*, v.registration_number as vehicle_number, v.name as vehicle_name 
      FROM maintenances m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.id = $1
    `, [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const { vehicle_id, description, cost, status } = data;
    const result = await db.query(
      `INSERT INTO maintenances (vehicle_id, description, cost, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [vehicle_id, description, cost || 0.0, status || 'Active']
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { vehicle_id, description, cost, status } = data;
    const result = await db.query(
      `UPDATE maintenances 
       SET vehicle_id = $1, description = $2, cost = $3, status = $4 
       WHERE id = $5 
       RETURNING *`,
      [vehicle_id, description, cost, status, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM maintenances WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  hasActiveMaintenance: async (vehicleId, excludeId = null) => {
    let query = "SELECT COUNT(*) FROM maintenances WHERE vehicle_id = $1 AND status = 'Active'";
    let params = [vehicleId];
    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }
    const result = await db.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }
};

module.exports = Maintenance;
