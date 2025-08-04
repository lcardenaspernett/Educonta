// ===================================
// EDUCONTA - Rutas de Instituciones - CORREGIDAS
// ===================================

const express = require('express');
const { body, param, query } = require('express-validator');
const jwt = require('jsonwebtoken');

const router = express.Router();

// ===================================
// RUTAS PÚBLICAS - SIN AUTENTICACIÓN
// ===================================

// IMPORTANTE: Esta ruta DEBE ir PRIMERO, antes de cualquier middleware
router.get('/public', async (req, res) => {
  try {
    console.log('🌐 PUBLIC INSTITUTIONS - Solicitando instituciones públicas');

    // Obtener instituciones activas (información básica para selección)
    const institutions = await req.prisma.institution.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        nit: true,
        city: true,
        department: true,
        educationLevel: true,
        logo: true,
        _count: {
          select: {
            students: true,
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ PUBLIC INSTITUTIONS - Encontradas ${institutions.length} instituciones activas`);

    res.json({
      success: true,
      data: institutions,
      total: institutions.length,
      message: `${institutions.length} instituciones disponibles`
    });

  } catch (error) {
    console.error('❌ PUBLIC INSTITUTIONS - Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener instituciones',
      message: error.message,
      data: []
    });
  }
});

// Health check para instituciones (también público)
router.get('/health', async (req, res) => {
  try {
    const count = await req.prisma.institution.count();
    res.json({
      success: true,
      service: 'institutions',
      total: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// ENDPOINTS TEMPORALES DE DIAGNÓSTICO (PÚBLICOS)
// ===================================

// GET /api/institutions/debug - Diagnóstico completo
router.get('/debug', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Iniciando diagnóstico...');

    const stats = {
      total: await req.prisma.institution.count(),
      active: await req.prisma.institution.count({ where: { isActive: true } }),
      inactive: await req.prisma.institution.count({ where: { isActive: false } }),
      nullActive: await req.prisma.institution.count({ where: { isActive: null } })
    };

    console.log('📊 DEBUG - Estadísticas:', stats);

    // Si se pasa el parámetro activate=true, activar todas las instituciones
    let updateResult = null;
    if (req.query.activate === 'true') {
      console.log('🔄 DEBUG - Activando instituciones...');

      updateResult = await req.prisma.institution.updateMany({
        where: {
          OR: [
            { isActive: false },
            { isActive: null }
          ]
        },
        data: {
          isActive: true
        }
      });

      console.log(`✅ DEBUG - ${updateResult.count} instituciones activadas`);
    }

    // Obtener muestra de instituciones con su estado
    const sample = await req.prisma.institution.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        nit: true,
        isActive: true,
        city: true,
        department: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('📄 DEBUG - Muestra:', sample);

    // Estadísticas finales (después de activar si se solicitó)
    const finalStats = {
      total: await req.prisma.institution.count(),
      active: await req.prisma.institution.count({ where: { isActive: true } }),
      inactive: await req.prisma.institution.count({ where: { isActive: false } }),
      nullActive: await req.prisma.institution.count({ where: { isActive: null } })
    };

    res.json({
      success: true,
      message: updateResult ?
        `Diagnóstico completado y ${updateResult.count} instituciones activadas` :
        'Diagnóstico completado',
      stats: finalStats,
      sample,
      activated: updateResult ? updateResult.count : 0,
      timestamp: new Date().toISOString(),
      instructions: 'Para activar instituciones, usa: ?activate=true'
    });

  } catch (error) {
    console.error('❌ DEBUG - Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// POST /api/institutions/activate-all - Activar todas las instituciones
router.post('/activate-all', async (req, res) => {
  try {
    console.log('🔄 ACTIVATE - Iniciando activación masiva...');

    // Estadísticas antes
    const before = {
      total: await req.prisma.institution.count(),
      active: await req.prisma.institution.count({ where: { isActive: true } }),
      inactive: await req.prisma.institution.count({ where: { isActive: false } }),
      nullActive: await req.prisma.institution.count({ where: { isActive: null } })
    };

    console.log('📊 ACTIVATE - Estado inicial:', before);

    // Activar todas las instituciones que no estén activas
    const updateResult = await req.prisma.institution.updateMany({
      where: {
        OR: [
          { isActive: false },
          { isActive: null }
        ]
      },
      data: {
        isActive: true
      }
    });

    console.log(`✅ ACTIVATE - ${updateResult.count} instituciones actualizadas`);

    // Estadísticas después
    const after = {
      total: await req.prisma.institution.count(),
      active: await req.prisma.institution.count({ where: { isActive: true } }),
      inactive: await req.prisma.institution.count({ where: { isActive: false } }),
      nullActive: await req.prisma.institution.count({ where: { isActive: null } })
    };

    console.log('📊 ACTIVATE - Estado final:', after);

    res.json({
      success: true,
      message: `${updateResult.count} instituciones activadas correctamente`,
      before,
      after,
      updated: updateResult.count
    });

  } catch (error) {
    console.error('❌ ACTIVATE - Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/institutions/test-public - Probar endpoint público sin filtros
router.get('/test-public', async (req, res) => {
  try {
    console.log('🧪 TEST - Probando instituciones sin filtro isActive...');

    // Obtener TODAS las instituciones sin filtro de isActive
    const allInstitutions = await req.prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        nit: true,
        city: true,
        department: true,
        educationLevel: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📋 TEST - ${allInstitutions.length} instituciones encontradas (sin filtro)`);

    res.json({
      success: true,
      data: allInstitutions,
      total: allInstitutions.length,
      message: `${allInstitutions.length} instituciones encontradas (todas, sin filtro isActive)`
    });

  } catch (error) {
    console.error('❌ TEST - Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// MIDDLEWARE DE AUTENTICACIÓN PARA RUTAS PROTEGIDAS
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
    .isLength({ min: 2, max: 150 })
    .withMessage('Nombre debe tener entre 2 y 150 caracteres'),

  body('nit')
    .notEmpty()
    .withMessage('NIT requerido')
    .custom((value) => {
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

const validateInstitutionUpdate = [
  param('id')
    .notEmpty()
    .withMessage('ID de institución requerido'),

  body('name')
    .optional()
    .isLength({ min: 2, max: 150 })
    .withMessage('Nombre debe tener entre 2 y 150 caracteres'),

  body('nit')
    .optional()
    .custom((value) => {
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
// IMPORTAR CONTROLADORES
// ===================================

const {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionStats,
  getInstitutionOptions
} = require('../controllers/institutionController');

// Aplicar autenticación a todas las rutas siguientes
router.use(authenticate);

// ===================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ===================================

// RUTAS ESPECIALES PRIMERO (sin parámetros)
router.get('/stats',
  requireSuperAdmin,
  getInstitutionStats
);

router.get('/options',
  requireSuperAdmin,
  getInstitutionOptions
);

// RUTA GENERAL (lista con filtros)
router.get('/',
  requireSuperAdmin,
  validateInstitutionQuery,
  getInstitutions
);

// RUTAS CON PARÁMETROS AL FINAL
router.get('/:id',
  requireSuperAdmin,
  validateInstitutionId,
  getInstitutionById
);

router.post('/',
  requireSuperAdmin,
  validateInstitutionCreate,
  createInstitution
);

router.put('/:id',
  requireSuperAdmin,
  validateInstitutionUpdate,
  updateInstitution
);

router.delete('/:id',
  requireSuperAdmin,
  validateInstitutionId,
  deleteInstitution
);

module.exports = router;