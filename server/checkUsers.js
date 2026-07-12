const { pool } = require('./db');

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, username, email, full_name, role FROM users');
    console.log('Existing users:');
    result.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Name: ${user.full_name}, Role: ${user.role}`);
    });
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUsers();
