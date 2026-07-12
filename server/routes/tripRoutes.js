const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { validateTrip } = require('../validators/inputValidators');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);
router.post('/', requireRole(['Fleet Manager', 'Driver']), validateTrip, tripController.createTrip);
router.put('/:id', requireRole(['Fleet Manager', 'Driver']), validateTrip, tripController.updateTrip);

// Custom lifecycle transitions
router.post('/:id/dispatch', requireRole(['Fleet Manager']), tripController.dispatchTrip);
router.post('/:id/complete', requireRole(['Fleet Manager', 'Driver']), tripController.completeTrip);
router.post('/:id/cancel', requireRole(['Fleet Manager', 'Driver']), tripController.cancelTrip);

router.delete('/:id', requireRole(['Fleet Manager']), tripController.deleteTrip);

module.exports = router;
