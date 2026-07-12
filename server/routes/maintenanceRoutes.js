const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { validateMaintenance } = require('../validators/inputValidators');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', maintenanceController.getAllMaintenances);
router.get('/:id', maintenanceController.getMaintenanceById);
router.post('/', requireRole(['Fleet Manager']), validateMaintenance, maintenanceController.createMaintenance);
router.put('/:id', requireRole(['Fleet Manager']), validateMaintenance, maintenanceController.updateMaintenance);
router.delete('/:id', requireRole(['Fleet Manager']), maintenanceController.deleteMaintenance);

module.exports = router;
