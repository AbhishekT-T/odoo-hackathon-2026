const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/analytics', requireRole(['Fleet Manager', 'Financial Analyst', 'Safety Officer']), reportsController.getReportsData);

module.exports = router;
