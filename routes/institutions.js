// ===================================
// EDUCONTA - Rutas de Instituciones
// ===================================

const express = require('express');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middlewares
const { authenticate, requireSuperAdmin, requireRector, requireAdmin } = require('../middleware/auth');
const { validateTenantAccess, validateInstitutionSwitch } = require('../middleware/tenant');
const { asyncHandler } = require('../middleware/errorHandler');

// Controladores
const institutionController = require('../controllers/institutionController');

const router = express.Router();

// ===================================
// CONFIGURACIÓN DE MULTER PARA LOGOS
// ===================================

// Asegurar que el directorio existe
const logoDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logoDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el logo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `logo-${req.params.institutionId}-${uniqueSuffix}${extension}`);
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF)'));
    }
  }
});

// ===================================
// VALIDACIONES
// ===================================

// Validación para crear institución
const createInstitutionValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),

  body('nit')
    .trim()
    .matches(/^[0-9]{8,15}(-[0-9kK])?$/)
    .withMessage('NIT inválido. Formato: 123456789 o 123456789-0'),

  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('La dirección debe tener entre 10 y 200 caracteres'),

  body('phone')
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{7,20}$/)
    .withMessage('Número de teléfono inválido'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email de la institución inválido'),

  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ciudad debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/)
    .withMessage('La ciudad contiene caracteres no válidos'),

  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El departamento debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/)
    .withMessage('El departamento contiene caracteres no válidos'),

  body('educationLevel')
    .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'MIXTA'])
    .withMessage('Nivel educativo inválido'),

  // Datos del rector
  body('rectorFirstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre del rector debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre del rector solo puede contener letras'),

  body('rectorLastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido del rector debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido del rector solo puede contener letras'),

  body('rectorEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email del rector inválido')
];

// Validación para actualizar institución
const updateInstitutionValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('nit')
    .optional()
    .trim()
    .matches(/^[0-9]{8,15}(-[0-9kK])?$/)
    .withMessage('NIT inválido'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('La dirección debe tener entre 10 y 200 caracteres'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{7,20}$/)
    .withMessage('Número de teléfono inválido'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ciudad debe tener entre 2 y 50 caracteres'),

  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El departamento debe tener entre 2 y 50 caracteres'),

  body('educationLevel')
    .optional()
    .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'MIXTA'])
    .withMessage('Nivel educativo inválido')
];

// Validación de parámetros
const institutionIdValidation = [
  param('institutionId')
    .isUUID()
    .withMessage('ID de institución inválido')
];

// Validación de query parameters
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser entre 1 y 100'),

  query('educationLevel')
    .optional()
    .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'MIXTA'])
    .withMessage('Nivel educativo inválido'),

  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Estado debe ser true o false'),

  query('sortBy')
    .optional()
    .isIn(['name', 'nit', 'city', 'createdAt', 'educationLevel'])
    .withMessage('Campo de ordenamiento inválido'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden debe ser asc o desc')
];

// ===================================
// RUTAS PARA SUPER_ADMIN
// ===================================

/**
 * @route   POST /api/institutions
 * @desc    Crear nueva institución
 * @access  Super Admin
 */
router.post('/',
  authenticate,
  requireSuperAdmin,
  createInstitutionValidation,
  asyncHandler(institutionController.createInstitution)
);

/**
 * @route   GET /api/institutions
 * @desc    Obtener todas las instituciones
 * @access  Super Admin
 */
router.get('/',
  authenticate,
  requireSuperAdmin,
  queryValidation,
  asyncHandler(institutionController.getAllInstitutions)
);

/**
 * @route   PUT /api/institutions/:institutionId/status
 * @desc    Cambiar estado de institución (activar/desactivar)
 * @access  Super Admin
 */
router.put('/:institutionId/status',
  authenticate,
  requireSuperAdmin,
  institutionIdValidation,
  body('isActive').isBoolean().withMessage('Estado debe ser booleano'),
  asyncHandler(institutionController.toggleInstitutionStatus)
);

// ===================================
// RUTAS PARA ADMIN Y SUPER_ADMIN
// ===================================

/**
 * @route   GET /api/institutions/:institutionId
 * @desc    Obtener institución por ID
 * @access  Super Admin, Rector (su institución)
 */
router.get('/:institutionId',
  authenticate,
  institutionIdValidation,
  validateTenantAccess,
  asyncHandler(institutionController.getInstitutionById)
);

/**
 * @route   PUT /api/institutions/:institutionId
 * @desc    Actualizar institución
 * @access  Super Admin, Rector (su institución)
 */
router.put('/:institutionId',
  authenticate,
  requireRector,
  institutionIdValidation,
  validateTenantAccess,
  updateInstitutionValidation,
  asyncHandler(institutionController.updateInstitution)
);

/**
 * @route   POST /api/institutions/:institutionId/logo
 * @desc    Subir logo de institución
 * @access  Super Admin, Rector (su institución)
 */
router.post('/:institutionId/logo',
  authenticate,
  requireRector,
  institutionIdValidation,
  validateTenantAccess,
  logoUpload.single('logo'),
  asyncHandler(institutionController.uploadLogo)
);

/**
 * @route   GET /api/institutions/:institutionId/dashboard
 * @desc    Obtener estadísticas del dashboard de la institución
 * @access  Super Admin, Rector, Auxiliary Accountant (su institución)
 */
router.get('/:institutionId/dashboard',
  authenticate,
  requireAdmin,
  institutionIdValidation,
  validateTenantAccess,
  asyncHandler(institutionController.getInstitutionDashboard)
);

// ===================================
// RUTAS DE GESTIÓN DE CONTEXTO (SUPER_ADMIN)
// ===================================

/**
 * @route   POST /api/institutions/:institutionId/switch
 * @desc    Cambiar contexto a institución específica
 * @access  Super Admin
 */
router.post('/:institutionId/switch',
  authenticate,
  requireSuperAdmin,
  institutionIdValidation,
  validateInstitutionSwitch,
  (req, res) => {
    res.json({
      success: true,
      message: 'Contexto cambiado exitosamente',
      institution: {
        id: req.switchInstitution.id,
        name: req.switchInstitution.name,
        nit: req.switchInstitution.nit,
        educationLevel: req.switchInstitution.educationLevel
      }
    });
  }
);

// ===================================
// RUTAS DE INFORMACIÓN PÚBLICA
// ===================================

/**
 * @route   GET /api/institutions/public/levels
 * @desc    Obtener niveles educativos disponibles
 * @access  Public
 */
router.get('/public/levels', (req, res) => {
  res.json({
    success: true,
    educationLevels: [
      { value: 'PREESCOLAR', label: 'Preescolar' },
      { value: 'PRIMARIA', label: 'Primaria' },
      { value: 'SECUNDARIA', label: 'Secundaria' },
      { value: 'MEDIA', label: 'Media' },
      { value: 'SUPERIOR', label: 'Superior' },
      { value: 'MIXTA', label: 'Mixta' }
    ]
  });
});

/**
 * @route   GET /api/institutions/public/departments
 * @desc    Obtener departamentos de Colombia
 * @access  Public
 */
router.get('/public/departments', (req, res) => {
  const colombianDepartments = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
    'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
    'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
    'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
    'Vaupés', 'Vichada'
  ];

  res.json({
    success: true,
    departments: colombianDepartments.map(dept => ({
      value: dept,
      label: dept
    }))
  });
});

// ===================================
// RUTAS DE ESTADÍSTICAS (SUPER_ADMIN)
// ===================================

/**
 * @route   GET /api/institutions/stats/summary
 * @desc    Obtener resumen estadístico de todas las instituciones
 * @access  Super Admin
 */
router.get('/stats/summary',
  authenticate,
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const [
        totalInstitutions,
        activeInstitutions,
        totalStudents,
        totalUsers,
        totalRevenue
      ] = await Promise.all([
        req.prisma.institution.count(),
        req.prisma.institution.count({ where: { isActive: true } }),
        req.prisma.student.count(),
        req.prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
        req.prisma.transaction.aggregate({
          where: { type: 'INCOME', status: 'APPROVED' },
          _sum: { amount: true }
        })
      ]);

      // Estadísticas por nivel educativo
      const institutionsByLevel = await req.prisma.institution.groupBy({
        by: ['educationLevel'],
        _count: { educationLevel: true },
        where: { isActive: true }
      });

      res.json({
        success: true,
        summary: {
          institutions: {
            total: totalInstitutions,
            active: activeInstitutions,
            byLevel: institutionsByLevel.map(level => ({
              level: level.educationLevel,
              count: level._count.educationLevel
            }))
          },
          students: totalStudents,
          users: totalUsers,
          totalRevenue: totalRevenue._sum.amount || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================
// MIDDLEWARE DE MANEJO DE ERRORES ESPECÍFICO
// ===================================

// Manejo de errores de Multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo de archivo inesperado.'
      });
    }
  }
  
  if (error.message && error.message.includes('Solo se permiten archivos de imagen')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  next(error);
});

module.exports = router;