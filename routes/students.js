// ===================================
// EDUCONTA - Rutas de Estudiantes
// ===================================

const express = require('express');
const { body, param, query } = require('express-validator');
const jwt = require('jsonwebtoken');

const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentStats
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

// Ruta de prueba sin autenticación
router.get('/test/:institutionId', async (req, res) => {
    try {
        console.log('🧪 Ruta de prueba llamada para institución:', req.params.institutionId);
        res.json({
            success: true,
            message: 'Ruta de prueba funcionando',
            institutionId: req.params.institutionId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/students/:institutionId - Listar estudiantes de una institución
router.get('/:institutionId',
    getStudents
);

// GET /api/students/:institutionId/filters - Obtener filtros dinámicos
router.get('/:institutionId/filters', async (req, res) => {
    try {
        const { institutionId } = req.params;
        
        console.log('🔧 Obteniendo filtros para institución:', institutionId);
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Obtener grados únicos
        const uniqueGrades = await prisma.student.findMany({
            where: { institutionId },
            select: { grado: true },
            distinct: ['grado']
        });
        
        // Obtener cursos únicos
        const uniqueCourses = await prisma.student.findMany({
            where: { institutionId },
            select: { curso: true },
            distinct: ['curso']
        });
        
        const gradeNames = {
            '6': 'Sexto',
            '7': 'Séptimo',
            '8': 'Octavo',
            '9': 'Noveno',
            '10': 'Décimo',
            '11': 'Undécimo'
        };
        
        const grades = uniqueGrades
            .map(g => g.grado)
            .filter(Boolean)
            .sort()
            .map(grade => ({
                value: grade,
                label: `${grade}° (${gradeNames[grade] || `Grado ${grade}`})`
            }));
            
        const courses = uniqueCourses
            .map(c => c.curso)
            .filter(Boolean)
            .sort()
            .map(course => ({
                value: course,
                label: `Curso ${course}`
            }));
        
        console.log('✅ Filtros obtenidos:', { grades: grades.length, courses: courses.length });
        
        await prisma.$disconnect();
        
        res.json({
            success: true,
            grades: grades,
            courses: courses,
            stats: {
                totalGrades: grades.length,
                totalCourses: courses.length
            }
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo filtros:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// GET /api/students/:institutionId/stats - Estadísticas de estudiantes
router.get('/:institutionId/stats',
    getStudentStats
);

// GET /api/students/student/:studentId - Obtener estudiante por ID
router.get('/student/:studentId',
    getStudent
);

// POST /api/students/:institutionId - Crear nuevo estudiante
router.post('/:institutionId',
    createStudent
);

// PUT /api/students/student/:studentId - Actualizar estudiante
router.put('/student/:studentId',
    updateStudent
);

// DELETE /api/students/student/:studentId - Eliminar estudiante
router.delete('/student/:studentId',
    deleteStudent
);

module.exports = router;