// ===================================
// EDUCONTA - Rutas de Estudiantes
// ===================================

const express = require('express');
const { body, param, query } = require('express-validator');
const jwt = require('jsonwebtoken');

const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentStats,
    getStudentOptions
} = require('../controllers/studentController');

const router = express.Router();

// ===================================
// MIDDLEWARE DE AUTENTICACIÓN
// ===================================

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Token requerido' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'educonta-fallback-secret-key');

        const user = await req.prisma.user.findUnique({
            where: { id: decoded.userId, isActive: true },
            include: { institution: true }
        });

        if (!user) {
            return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
        }

        req.user = user;
        req.institution = user.institution;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token inválido' });
    }
};

// ===================================
// MIDDLEWARE DE PERMISOS
// ===================================

const checkPermission = (module, action) => {
    return async (req, res, next) => {
        try {
            // Super Admin tiene todos los permisos
            if (req.user.role === 'SUPER_ADMIN') {
                return next();
            }

            // Verificar que el usuario tenga institución (excepto SUPER_ADMIN)
            if (!req.user.institutionId) {
                return res.status(403).json({
                    success: false,
                    error: 'Usuario sin institución asignada'
                });
            }

            // Por ahora, permitir acceso a RECTOR y AUXILIARY_ACCOUNTANT
            // TODO: Implementar sistema de permisos granular más adelante
            if (req.user.role === 'RECTOR' || req.user.role === 'AUXILIARY_ACCOUNTANT') {
                return next();
            }

            return res.status(403).json({
                success: false,
                error: 'Sin permisos para esta acción'
            });

        } catch (error) {
            console.error('Error verificando permisos:', error);
            return res.status(500).json({
                success: false,
                error: 'Error verificando permisos'
            });
        }
    };
};

// ===================================
// VALIDACIONES
// ===================================

const validateStudentCreate = [
    body('studentCode')
        .notEmpty()
        .withMessage('Código de estudiante requerido')
        .isLength({ min: 3, max: 20 })
        .withMessage('Código debe tener entre 3 y 20 caracteres')
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Código solo puede contener letras mayúsculas y números'),

    body('firstName')
        .notEmpty()
        .withMessage('Nombre requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('Nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Nombre solo puede contener letras y espacios'),

    body('lastName')
        .notEmpty()
        .withMessage('Apellido requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('Apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Apellido solo puede contener letras y espacios'),

    body('documentType')
        .isIn(['TI', 'CC', 'CE', 'PP', 'RC'])
        .withMessage('Tipo de documento inválido'),

    body('documentNumber')
        .notEmpty()
        .withMessage('Número de documento requerido')
        .isLength({ min: 5, max: 20 })
        .withMessage('Número de documento debe tener entre 5 y 20 caracteres')
        .matches(/^[0-9A-Z\-]+$/)
        .withMessage('Número de documento inválido'),

    body('grade')
        .notEmpty()
        .withMessage('Grado requerido')
        .isLength({ min: 1, max: 20 })
        .withMessage('Grado debe tener máximo 20 caracteres'),

    body('section')
        .optional()
        .isLength({ max: 10 })
        .withMessage('Sección debe tener máximo 10 caracteres'),

    body('birthDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de nacimiento inválida')
        .custom((value) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (age < 3 || age > 25) {
                throw new Error('Edad debe estar entre 3 y 25 años');
            }
            return true;
        }),

    body('parentName')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Nombre del padre debe tener máximo 100 caracteres'),

    body('parentPhone')
        .optional()
        .matches(/^[\d\s\-\(\)\+]+$/)
        .withMessage('Teléfono del padre inválido')
        .isLength({ max: 20 })
        .withMessage('Teléfono debe tener máximo 20 caracteres'),

    body('parentEmail')
        .optional()
        .isEmail()
        .withMessage('Email del padre inválido')
        .normalizeEmail(),

    body('address')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Dirección debe tener máximo 200 caracteres')
];

const validateStudentUpdate = [
    param('id')
        .notEmpty()
        .withMessage('ID de estudiante requerido'),

    ...validateStudentCreate.map(validation => validation.optional()),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('Estado activo debe ser verdadero o falso')
];

const validateStudentId = [
    param('id')
        .notEmpty()
        .withMessage('ID de estudiante requerido')
];

const validateStudentQuery = [
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

    query('grade')
        .optional()
        .isLength({ max: 20 })
        .withMessage('Grado inválido'),

    query('section')
        .optional()
        .isLength({ max: 10 })
        .withMessage('Sección inválida'),

    query('isActive')
        .optional()
        .isIn(['true', 'false', 'all'])
        .withMessage('Estado activo debe ser true, false o all'),

    query('sortBy')
        .optional()
        .isIn(['firstName', 'lastName', 'studentCode', 'grade', 'enrollmentDate', 'createdAt'])
        .withMessage('Campo de ordenamiento inválido'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Orden debe ser asc o desc')
];

// ===================================
// RUTAS
// ===================================

// GET /api/students - Listar estudiantes con filtros y paginación
router.get('/',
    authenticate,
    checkPermission('students', 'read'),
    validateStudentQuery,
    getStudents
);

// GET /api/students/stats - Estadísticas de estudiantes
router.get('/stats',
    authenticate,
    checkPermission('students', 'read'),
    getStudentStats
);

// GET /api/students/options - Opciones para formularios
router.get('/options',
    authenticate,
    checkPermission('students', 'read'),
    getStudentOptions
);

// GET /api/students/:id - Obtener estudiante por ID
router.get('/:id',
    authenticate,
    checkPermission('students', 'read'),
    validateStudentId,
    getStudentById
);

// POST /api/students - Crear nuevo estudiante
router.post('/',
    authenticate,
    checkPermission('students', 'create'),
    validateStudentCreate,
    createStudent
);

// PUT /api/students/:id - Actualizar estudiante
router.put('/:id',
    authenticate,
    checkPermission('students', 'update'),
    validateStudentUpdate,
    updateStudent
);

// DELETE /api/students/:id - Eliminar estudiante
router.delete('/:id',
    authenticate,
    checkPermission('students', 'delete'),
    validateStudentId,
    deleteStudent
);

module.exports = router;