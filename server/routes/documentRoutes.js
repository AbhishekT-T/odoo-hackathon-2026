const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateUser } = require('../middleware/auth');

// Require authentication for all document routes
router.use(authenticateUser);

router.get('/', documentController.getDocumentsByEntity);
router.post('/', documentController.createDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
