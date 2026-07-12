const db = require('../db');

/**
 * Vehicle Data Model Queries
 * Handles interaction with 'vehicles' table in PostgreSQL.
 */
const Vehicle = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM vehicles ORDER BY id DESC');
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
    return result.rows[0];
  },

  getByRegistrationNumber: async (registration_number) => {
    const result = await db.query('SELECT * FROM vehicles WHERE registration_number = $1', [registration_number]);
    return result.rows[0];
  },

  create: async (data) => {
    const { registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status } = data;
    const result = await db.query(
      `INSERT INTO vehicles (registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [registration_number, name, type, max_load_capacity, odometer || 0, acquisition_cost || 0, status || 'Available']
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status } = data;
    const result = await db.query(
      `UPDATE vehicles 
       SET registration_number = $1, name = $2, type = $3, max_load_capacity = $4, odometer = $5, acquisition_cost = $6, status = $7 
       WHERE id = $8 
       RETURNING *`,
      [registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  updateStatus: async (id, status) => {
    const result = await db.query(
      'UPDATE vehicles SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
};

module.exports = Vehicle;
