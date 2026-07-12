const express = require('express');
const router = express.Router();
const fuelLogController = require('../controllers/fuelLogController');
const { validateFuelLog } = require('../validators/inputValidators');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', fuelLogController.getAllFuelLogs);
router.get('/summary', fuelLogController.getFuelSummary);
router.get('/:id', fuelLogController.getFuelLogById);
router.post('/', requireRole(['Fleet Manager', 'Financial Analyst', 'Driver']), validateFuelLog, fuelLogController.createFuelLog);
router.put('/:id', requireRole(['Fleet Manager', 'Financial Analyst']), validateFuelLog, fuelLogController.updateFuelLog);
router.delete('/:id', requireRole(['Fleet Manager', 'Financial Analyst']), fuelLogController.deleteFuelLog);

module.exports = router;
