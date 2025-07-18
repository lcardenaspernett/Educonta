// ===================================
// EDUCONTA - Rutas de Instituciones - CORREGIDAS
// ===================================

const express = require('express');
const { body, param, query } = require('express-validator');
const jwt = require('jsonwebtoken');

const {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionStats,
  getInstitutionOptions
} = require('../controllers/institutionController');

const router = express.Router();

// ===================================
// MIDDLEWARE DE AUTENTICACIÓN
// ===================================

const { authenticate } = require('../middleware/auth');

// ===================================
// MIDDLEWARE DE PERMISOS - SOLO SUPER_ADMIN
// ===================================

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo Super Administradores pueden gestionar instituciones.'
    });
  }
  next();
};

// ===================================
// VALIDACIONES CORREGIDAS
// ===================================

const validateInstitutionCreate = [
  body('name')
    .notEmpty()
    .withMessage('Nombre de institución requerido')
    .isLength({ min: 2, max: 150 })
    .withMessage('Nombre debe tener entre 2 y 150 caracteres'),

  body('nit')
    .notEmpty()
    .withMessage('NIT requerido')
    .custom((value) => {
      // Validación más flexible para NIT
      if (!/^[0-9\-]+$/.test(value)) {
        throw new Error('NIT debe contener solo números y guiones');
      }
      return true;
    }),

  body('address')
    .notEmpty()
    .withMessage('Dirección requerida')
    .isLength({ min: 5, max: 300 })
    .withMessage('Dirección debe tener entre 5 y 300 caracteres'),

  body('phone')
    .optional()
    .isLength({ max: 25 })
    .withMessage('Teléfono muy largo'),

  body('email')
    .optional()
    .custom((value) => {
      if (value && !value.includes('@')) {
        throw new Error('Email debe contener @');
      }
      return true;
    }),

  body('city')
    .notEmpty()
    .withMessage('Ciudad requerida')
    .isLength({ min: 2, max: 100 })
    .withMessage('Ciudad debe tener entre 2 y 100 caracteres'),

  body('department')
    .notEmpty()
    .withMessage('Departamento requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('Departamento debe tener entre 2 y 100 caracteres'),

  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('País muy largo'),

  body('educationLevel')
    .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'TECNICA', 'MIXTA'])
    .withMessage('Nivel educativo inválido')
];

// VALIDACIONES MUY RELAJADAS PARA ACTUALIZACIÓN
const validateInstitutionUpdate = [
  param('id')
    .notEmpty()
    .withMessage('ID de institución requerido'),

  // Todos los campos opcionales con validaciones mínimas
  body('name')
    .optional()
    .isLength({ min: 2, max: 150 })
    .withMessage('Nombre debe tener entre 2 y 150 caracteres'),

  body('nit')
    .optional()
    .custom((value) => {
      // Muy permisivo para evitar errores
      if (value && value.length < 3) {
        throw new Error('NIT muy corto');
      }
      return true;
    }),

  body('address')
    .optional()
    .isLength({ min: 5, max: 300 })
    .withMessage('Dirección debe tener entre 5 y 300 caracteres'),

  body('phone')
    .optional()
    .isLength({ max: 25 })
    .withMessage('Teléfono muy largo'),

  body('email')
    .optional()
    .custom((value) => {
      if (value && value.trim() && !value.includes('@')) {
        throw new Error('Email debe contener @');
      }
      return true;
    }),

  body('city')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ciudad debe tener entre 2 y 100 caracteres'),

  body('department')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Departamento debe tener entre 2 y 100 caracteres'),

  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('País muy largo'),

  body('educationLevel')
    .optional()
    .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'TECNICA', 'MIXTA'])
    .withMessage('Nivel educativo inválido'),

  body('website')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Página web muy larga'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descripción muy larga'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Estado activo debe ser verdadero o falso')
];

const validateInstitutionId = [
  param('id')
    .notEmpty()
    .withMessage('ID de institución requerido')
];

const validateInstitutionQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),

  query('search')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Búsqueda muy larga'),

  query('educationLevel')
    .optional()
    .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'TECNICA', 'MIXTA'])
    .withMessage('Nivel educativo inválido'),

  query('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Ciudad inválida'),

  query('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Departamento inválido'),

  query('isActive')
    .optional()
    .isIn(['true', 'false', 'all'])
    .withMessage('Estado activo debe ser true, false o all'),

  query('sortBy')
    .optional()
    .isIn(['name', 'nit', 'city', 'educationLevel', 'createdAt'])
    .withMessage('Campo de ordenamiento inválido'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden debe ser asc o desc')
];

// ===================================
// RUTAS - ORDEN CORRECTO: ESPECIALES PRIMERO
// ===================================

// RUTAS ESPECIALES PRIMERO (sin parámetros) - MUY IMPORTANTE EL ORDEN
router.get('/stats',
  authenticate,
  requireSuperAdmin,
  getInstitutionStats
);

router.get('/options',
  authenticate,
  requireSuperAdmin,
  getInstitutionOptions
);

// RUTA GENERAL (lista con filtros)
router.get('/',
  authenticate,
  requireSuperAdmin,
  validateInstitutionQuery,
  getInstitutions
);

// RUTAS CON PARÁMETROS AL FINAL
router.get('/:id',
  authenticate,
  requireSuperAdmin,
  validateInstitutionId,
  getInstitutionById
);

router.post('/',
  authenticate,
  requireSuperAdmin,
  validateInstitutionCreate,
  createInstitution
);

router.put('/:id',
  authenticate,
  requireSuperAdmin,
  validateInstitutionUpdate,
  updateInstitution
);

router.delete('/:id',
  authenticate,
  requireSuperAdmin,
  validateInstitutionId,
  deleteInstitution
);

module.exports = router;