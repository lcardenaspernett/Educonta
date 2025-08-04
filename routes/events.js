const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

// Rutas para eventos
router.get('/:institutionId', eventsController.getEvents);
router.post('/:institutionId', eventsController.createEvent);
router.put('/:eventId', eventsController.updateEvent);
router.delete('/:eventId', eventsController.deleteEvent);

// Rutas para participantes
router.get('/:eventId/participants', eventsController.getEventParticipants);
router.post('/:eventId/participants', eventsController.addParticipants);

// Rutas para pagos
router.post('/:eventId/participants/:studentId/payment', eventsController.registerPayment);

// Rutas para estadísticas
router.get('/:institutionId/stats', eventsController.getEventStats);

module.exports = router;