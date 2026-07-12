const db = require('../db');

/**
 * Document Data Model Queries
 * Handles interaction with 'documents' table in database.
 */
const Document = {
  getByEntity: async (entityType, entityId) => {
    const result = await db.query(
      'SELECT * FROM documents WHERE entity_type = $1 AND entity_id = $2 ORDER BY id DESC',
      [entityType, entityId]
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const { entity_type, entity_id, document_type, file_name, file_url, expiry_date, status } = data;
    const result = await db.query(
      `INSERT INTO documents (entity_type, entity_id, document_type, file_name, file_url, expiry_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [entity_type, entity_id, document_type, file_name, file_url || '#', expiry_date || null, status || 'Active']
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Document;
