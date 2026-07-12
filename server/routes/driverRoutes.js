const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { validateDriver } = require('../validators/inputValidators');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', requireRole(['Fleet Manager', 'Safety Officer']), validateDriver, driverController.createDriver);
router.put('/:id', requireRole(['Fleet Manager', 'Safety Officer']), validateDriver, driverController.updateDriver);
router.delete('/:id', requireRole(['Fleet Manager', 'Safety Officer']), driverController.deleteDriver);

module.exports = router;
