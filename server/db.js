const { Pool } = require('pg');
require('dotenv').config();

// Initialize the database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:indus.hackthon@127.0.0.1:5432/hackdemo'
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected database error on client:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
