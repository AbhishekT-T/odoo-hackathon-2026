const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

// Per-vehicle analytics: fuel, maintenance, efficiency, ROI
router.get('/analytics', requireRole(['Fleet Manager', 'Financial Analyst', 'Safety Officer']), reportsController.getReportsData);

// Fleet-wide grand total summary
router.get('/fleet-summary', requireRole(['Fleet Manager', 'Financial Analyst', 'Safety Officer']), reportsController.getFleetSummary);

module.exports = router;
