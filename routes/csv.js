const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

// Ruta para descargar plantilla CSV
router.get('/template', csvController.downloadTemplate);

// Ruta para importar estudiantes desde CSV
router.post('/import/:institutionId', csvController.uploadCSV, csvController.importStudents);

// Ruta para obtener estadísticas de importación
router.get('/stats/:institutionId', csvController.getImportStats);

module.exports = router;