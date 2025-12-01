const express = require('express');
const LocationController = require('../controllers/locationController');
const router = express.Router();

router.get('/', LocationController.getAll);
router.get('/:id', LocationController.getById);
router.post('/', LocationController.create);
router.put('/:id', LocationController.update);
router.delete('/:id', LocationController.delete);

module.exports = router;