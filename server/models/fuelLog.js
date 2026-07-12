const db = require('../db');

/**
 * Fuel Log & Expense Data Model Queries
 * Handles interaction with 'fuel_logs' table in PostgreSQL.
 */
const FuelLog = {
  getAll: async () => {
    const result = await db.query(`
      SELECT f.*, v.registration_number as vehicle_number, v.name as vehicle_name 
      FROM fuel_logs f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      ORDER BY f.date DESC, f.id DESC
    `);
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(`
      SELECT f.*, v.registration_number as vehicle_number, v.name as vehicle_name 
      FROM fuel_logs f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      WHERE f.id = $1
    `, [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const { vehicle_id, liters, cost, date, expense_type } = data;
    const result = await db.query(
      `INSERT INTO fuel_logs (vehicle_id, liters, cost, date, expense_type) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [vehicle_id, liters, cost, date || new Date(), expense_type || 'Fuel']
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { vehicle_id, liters, cost, date, expense_type } = data;
    const result = await db.query(
      `UPDATE fuel_logs 
       SET vehicle_id = $1, liters = $2, cost = $3, date = $4, expense_type = $5 
       WHERE id = $6 
       RETURNING *`,
      [vehicle_id, liters, cost, date, expense_type, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM fuel_logs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = FuelLog;
