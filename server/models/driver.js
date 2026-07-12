const db = require('../db');

/**
 * Driver Data Model Queries
 * Handles interaction with 'drivers' table in PostgreSQL.
 */
const Driver = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM drivers ORDER BY id DESC');
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query('SELECT * FROM drivers WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const { name, license_number, license_category, license_expiry_date, contact_number, safety_score, status } = data;
    const result = await db.query(
      `INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, license_number, license_category, license_expiry_date, contact_number, safety_score || 100.0, status || 'Available']
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { name, license_number, license_category, license_expiry_date, contact_number, safety_score, status } = data;
    const result = await db.query(
      `UPDATE drivers 
       SET name = $1, license_number = $2, license_category = $3, license_expiry_date = $4, contact_number = $5, safety_score = $6, status = $7 
       WHERE id = $8 
       RETURNING *`,
      [name, license_number, license_category, license_expiry_date, contact_number, safety_score, status, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Driver;
