const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'transitops-super-secret-key-1234';

/**
 * Handle user login and sign JWT token
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user in the database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password hash
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Auto-create driver profile on login if role is Driver and no profile exists
    if (user.role === 'Driver') {
      const driverRes = await pool.query('SELECT * FROM drivers ORDER BY id DESC');
      const driverExists = driverRes.rows.some(d => d.name.toLowerCase() === user.name.toLowerCase());
      if (!driverExists) {
        const defLicense = 'LIC-' + Math.floor(100000 + Math.random() * 900000);
        const defExpiry = new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0];
        await pool.query(
          `INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [user.name, defLicense, 'Standard Driver License', defExpiry, 'N/A', 100.0, 'Available']
        );
      }
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
};

/**
 * Handle user registration
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    // Check if email already exists
    const existingResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, passwordHash, name, role || 'Fleet Manager']
    );

    // Auto-create driver profile on registration if role is Driver
    if (role === 'Driver') {
      const defLicense = 'LIC-' + Math.floor(100000 + Math.random() * 900000);
      const defExpiry = new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0];
      await pool.query(
        `INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [name, defLicense, 'Standard Driver License', defExpiry, 'N/A', 100.0, 'Available']
      );
    }

    res.status(201).json({
      message: 'User registered successfully.',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
};
