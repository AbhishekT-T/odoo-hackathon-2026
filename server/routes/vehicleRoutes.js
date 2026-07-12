const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { validateVehicle } = require('../validators/inputValidators');
const { authenticateUser, requireRole } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authenticateUser);

router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', requireRole(['Fleet Manager']), validateVehicle, vehicleController.createVehicle);
router.put('/:id', requireRole(['Fleet Manager']), validateVehicle, vehicleController.updateVehicle);
router.delete('/:id', requireRole(['Fleet Manager']), vehicleController.deleteVehicle);

module.exports = router;
