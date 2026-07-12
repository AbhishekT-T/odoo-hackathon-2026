const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/kpis', dashboardController.getDashboardKPIs);

module.exports = router;
