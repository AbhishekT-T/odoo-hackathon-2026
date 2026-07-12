const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes - no authentication required
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes - authentication required
router.get('/profile/:userId', authController.getProfile);

module.exports = router;
