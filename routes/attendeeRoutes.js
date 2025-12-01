const express = require('express');
const AttendeeController = require('../controllers/attendeeController');
const router = express.Router();

router.get('/', AttendeeController.getAll);
router.get('/:id', AttendeeController.getById);
router.post('/', AttendeeController.create);
router.put('/:id', AttendeeController.update);
router.delete('/:id', AttendeeController.delete);

module.exports = router;