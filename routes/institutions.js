// ===================================
// EDUCONTA - Rutas de Instituciones
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
// VALIDACIONES
// ===================================

const validateInstitutionCreate = [
  body('name')
    .notEmpty()
    .withMessage('Nombre de institución requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nombre debe tener entre 3 y 100 caracteres'),
    
  body('nit')
    .notEmpty()
    .withMessage('NIT requerido')
    .matches(/^[0-9]{8,12}-[0-9]$/)
    .withMessage('NIT debe tener formato válido (ej: 123456789-0)'),
    
  body('address')
    .notEmpty()
    .withMessage('Dirección requerida')
    .isLength({ min: 10, max: 200 })
    .withMessage('Dirección debe tener entre 10 y 200 caracteres'),
    
  body('phone')
    .notEmpty()
    .withMessage('Teléfono requerido')
    .matches(/^[\d\s\-\(\)\+]+$/)
    .withMessage('Teléfono inválido')
    .isLength({ min: 7, max: 20 })
    .withMessage('Teléfono debe tener entre 7 y 20 caracteres'),
    
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
    
  body('city')
    .notEmpty()
    .withMessage('Ciudad requerida')
    .isLength({ min: 2, max: 50 })
    .withMessage('Ciudad debe tener entre 2 y 50 caracteres'),
    
  body('department')
    .notEmpty()
    .withMessage('Departamento requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('Departamento debe tener entre 2 y 50 caracteres'),
    
  body('country')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('País debe tener entre 2 y 50 caracteres'),
    
  body('educationLevel')
    .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'MIXTA'])
    .withMessage('Nivel educativo inválido')
];

const validateInstitutionUpdate = [
  param('id')
    .isUUID()
    .withMessage('ID de institución inválido'),
    
  ...validateInstitutionCreate.map(validation => validation.optional()),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Estado activo debe ser verdadero o falso')
];

const validateInstitutionId = [
  param('id')
    .isUUID()
    .withMessage('ID de institución inválido')
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
    .isLength({ max: 100 })
    .withMessage('Búsqueda debe tener máximo 100 caracteres'),
    
  query('educationLevel')
    .optional()
    .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'MIXTA'])
    .withMessage('Nivel educativo inválido'),
    
  query('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Ciudad inválida'),
    
  query('department')
    .optional()
    .isLength({ max: 50 })
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