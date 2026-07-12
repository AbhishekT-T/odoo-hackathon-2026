const { pool } = require('./db');

async function checkTables() {
  try {
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('Tables in database:', result.rows.map(r => r.table_name));
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkTables();
