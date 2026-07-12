const { pool } = require('./db');

async function clearUsers() {
  try {
    const result = await pool.query('DELETE FROM users');
    console.log(`Deleted ${result.rowCount} user(s) from database`);
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

clearUsers();
