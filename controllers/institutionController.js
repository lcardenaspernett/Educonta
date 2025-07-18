// ===================================
// EDUCONTA - Controlador de Instituciones
// ===================================

const { validationResult } = require('express-validator');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');

/**
 * Obtener lista de instituciones con filtros y paginación
 */
const getInstitutions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      educationLevel = '',
      city = '',
      department = '',
      isActive = 'true',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    const where = {};

    // Filtro por estado activo
    if (isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    // Filtro por nivel educativo
    if (educationLevel) {
      where.educationLevel = educationLevel;
    }

    // Filtro por ciudad
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Filtro por departamento
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    // Búsqueda por texto
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nit: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Configurar ordenamiento
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Calcular paginación
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    // Ejecutar consultas
    const [institutions, totalCount] = await Promise.all([
      req.prisma.institution.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          name: true,
          nit: true,
          address: true,
          phone: true,
          email: true,
          city: true,
          department: true,
          country: true,
          educationLevel: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              students: true,
              users: true
            }
          }
        }
      }),
      req.prisma.institution.count({ where })
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / take);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: institutions,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: take,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener una institución por ID
 */
const getInstitutionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const institution = await req.prisma.institution.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            lastLogin: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        students: {
          select: {
            id: true,
            studentCode: true,
            firstName: true,
            lastName: true,
            grade: true,
            isActive: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            students: true,
            users: true,
            accounts: true,
            categories: true
          }
        }
      }
    });

    if (!institution) {
      return next(new NotFoundError('Institución no encontrada'));
    }

    res.json({
      success: true,
      data: institution
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva institución con configuración automática
 */
const createInstitution = async (req, res, next) => {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de institución inválidos', errors.array()));
    }

    const {
      name,
      nit,
      address,
      phone,
      email,
      city,
      department,
      country = 'Colombia',
      educationLevel
    } = req.body;

    // Verificar que no exista institución con el mismo NIT
    const existingByNit = await req.prisma.institution.findUnique({
      where: { nit }
    });

    if (existingByNit) {
      return next(new ConflictError('Ya existe una institución con este NIT'));
    }

    // Crear institución
    const institution = await req.prisma.institution.create({
      data: {
        name,
        nit,
        address,
        phone,
        email,
        city,
        department,
        country,
        educationLevel,
        isActive: true
      }
    });

    // Configuración automática: Crear plan de cuentas básico
    await createBasicAccountPlan(req.prisma, institution.id, educationLevel);

    // Configuración automática: Crear categorías básicas
    await createBasicCategories(req.prisma, institution.id);

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        tableName: 'institutions',
        recordId: institution.id,
        newValues: {
          name,
          nit,
          educationLevel,
          city
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId: institution.id,
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Institución creada exitosamente con configuración automática',
      data: institution
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar institución
 */
const updateInstitution = async (req, res, next) => {
  try {
    console.log('🔧 UPDATE INSTITUTION - Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('🔧 UPDATE INSTITUTION - ID:', req.params.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación detallados:', JSON.stringify(errors.array(), null, 2));
      console.log('📝 Datos recibidos completos:', JSON.stringify(req.body, null, 2));
      
      // Enviar respuesta más detallada para debug
      return res.status(400).json({
        success: false,
        error: 'Datos de institución inválidos',
        details: errors.array(),
        receivedData: req.body
      });
    }

    const { id } = req.params;
    const {
      name,
      nit,
      address,
      phone,
      email,
      city,
      department,
      country,
      educationLevel,
      isActive
    } = req.body;

    // Verificar que la institución existe
    const existingInstitution = await req.prisma.institution.findUnique({
      where: { id }
    });

    if (!existingInstitution) {
      return next(new NotFoundError('Institución no encontrada'));
    }

    // Verificar unicidad de NIT (si cambió)
    if (nit && nit !== existingInstitution.nit) {
      const existingByNit = await req.prisma.institution.findUnique({
        where: { nit }
      });

      if (existingByNit) {
        return next(new ConflictError('Ya existe una institución con este NIT'));
      }
    }

    // Actualizar institución
    const updatedInstitution = await req.prisma.institution.update({
      where: { id },
      data: {
        name,
        nit,
        address,
        phone,
        email,
        city,
        department,
        country,
        educationLevel,
        isActive: isActive !== undefined ? isActive : existingInstitution.isActive
      }
    });

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'institutions',
        recordId: id,
        oldValues: {
          name: existingInstitution.name,
          nit: existingInstitution.nit,
          educationLevel: existingInstitution.educationLevel
        },
        newValues: {
          name,
          nit,
          educationLevel
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId: id,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Institución actualizada exitosamente',
      data: updatedInstitution
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar institución (soft delete)
 */
const deleteInstitution = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que la institución existe
    const institution = await req.prisma.institution.findUnique({
      where: { id }
    });

    if (!institution) {
      return next(new NotFoundError('Institución no encontrada'));
    }

    // Verificar si tiene usuarios o estudiantes asociados
    const [usersCount, studentsCount] = await Promise.all([
      req.prisma.user.count({
        where: { institutionId: id }
      }),
      req.prisma.student.count({
        where: { institutionId: id }
      })
    ]);

    if (usersCount > 0 || studentsCount > 0) {
      // Solo desactivar si tiene registros asociados
      const updatedInstitution = await req.prisma.institution.update({
        where: { id },
        data: { isActive: false }
      });

      // Registrar auditoría
      await req.prisma.auditLog.create({
        data: {
          action: 'DEACTIVATE',
          tableName: 'institutions',
          recordId: id,
          oldValues: { isActive: true },
          newValues: { isActive: false },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          institutionId: id,
          userId: req.user.id
        }
      });

      return res.json({
        success: true,
        message: 'Institución desactivada exitosamente (tiene registros asociados)',
        data: updatedInstitution
      });
    }

    // Eliminar completamente si no tiene registros asociados
    await req.prisma.institution.delete({
      where: { id }
    });

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        tableName: 'institutions',
        recordId: id,
        oldValues: {
          name: institution.name,
          nit: institution.nit
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId: id,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Institución eliminada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de instituciones
 */
const getInstitutionStats = async (req, res, next) => {
  try {
    const [
      totalInstitutions,
      activeInstitutions,
      inactiveInstitutions,
      institutionsWithStudents,
      institutionsWithUsers,
      recentInstitutions,
      levelStats
    ] = await Promise.all([
      // Total de instituciones
      req.prisma.institution.count(),
      
      // Instituciones activas
      req.prisma.institution.count({
        where: { isActive: true }
      }),
      
      // Instituciones inactivas
      req.prisma.institution.count({
        where: { isActive: false }
      }),
      
      // Instituciones con estudiantes
      req.prisma.institution.count({
        where: {
          isActive: true,
          students: {
            some: {}
          }
        }
      }),
      
      // Instituciones con usuarios
      req.prisma.institution.count({
        where: {
          isActive: true,
          users: {
            some: {}
          }
        }
      }),
      
      // Instituciones recientes (últimos 30 días)
      req.prisma.institution.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Estadísticas por nivel educativo
      req.prisma.institution.groupBy({
        by: ['educationLevel'],
        where: { isActive: true },
        _count: { educationLevel: true },
        orderBy: { educationLevel: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalInstitutions,
        active: activeInstitutions,
        inactive: inactiveInstitutions,
        withStudents: institutionsWithStudents,
        withUsers: institutionsWithUsers,
        recentInstitutions: recentInstitutions,
        byEducationLevel: levelStats.map(stat => ({
          level: stat.educationLevel,
          count: stat._count.educationLevel
        }))
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener opciones para formularios
 */
const getInstitutionOptions = async (req, res, next) => {
  try {
    const [cities, departments] = await Promise.all([
      // Ciudades únicas
      req.prisma.institution.findMany({
        where: { isActive: true },
        select: { city: true },
        distinct: ['city'],
        orderBy: { city: 'asc' }
      }),
      
      // Departamentos únicos
      req.prisma.institution.findMany({
        where: { isActive: true },
        select: { department: true },
        distinct: ['department'],
        orderBy: { department: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        cities: cities.map(c => c.city),
        departments: departments.map(d => d.department),
        educationLevels: [
          { value: 'PREESCOLAR', label: 'Preescolar' },
          { value: 'PRIMARIA', label: 'Primaria' },
          { value: 'SECUNDARIA', label: 'Secundaria' },
          { value: 'MEDIA', label: 'Media' },
          { value: 'SUPERIOR', label: 'Superior' },
          { value: 'MIXTA', label: 'Mixta' }
        ],
        countries: ['Colombia', 'Venezuela', 'Ecuador', 'Perú', 'Panamá']
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Crear plan de cuentas básico según nivel educativo
 */
async function createBasicAccountPlan(prisma, institutionId, educationLevel) {
  const accounts = [
    // ACTIVOS
    { code: '1', name: 'ACTIVOS', accountType: 'ASSET', level: 1, parent: null },
    { code: '11', name: 'ACTIVO CORRIENTE', accountType: 'ASSET', level: 2, parent: '1' },
    { code: '1105', name: 'CAJA', accountType: 'ASSET', level: 3, parent: '11' },
    { code: '1110', name: 'BANCOS', accountType: 'ASSET', level: 3, parent: '11' },
    { code: '1305', name: 'CUENTAS POR COBRAR ESTUDIANTES', accountType: 'ASSET', level: 3, parent: '11' },
    
    // PASIVOS
    { code: '2', name: 'PASIVOS', accountType: 'LIABILITY', level: 1, parent: null },
    { code: '24', name: 'CUENTAS POR PAGAR', accountType: 'LIABILITY', level: 2, parent: '2' },
    { code: '2405', name: 'PROVEEDORES', accountType: 'LIABILITY', level: 3, parent: '24' },
    
    // PATRIMONIO
    { code: '3', name: 'PATRIMONIO', accountType: 'EQUITY', level: 1, parent: null },
    { code: '31', name: 'CAPITAL SOCIAL', accountType: 'EQUITY', level: 2, parent: '3' },
    
    // INGRESOS
    { code: '4', name: 'INGRESOS', accountType: 'INCOME', level: 1, parent: null },
    { code: '41', name: 'INGRESOS OPERACIONALES', accountType: 'INCOME', level: 2, parent: '4' },
    { code: '4135', name: 'MATRÍCULAS', accountType: 'INCOME', level: 3, parent: '41' },
    { code: '4140', name: 'MENSUALIDADES', accountType: 'INCOME', level: 3, parent: '41' },
    { code: '4145', name: 'OTROS INGRESOS ACADÉMICOS', accountType: 'INCOME', level: 3, parent: '41' },
    
    // GASTOS
    { code: '5', name: 'GASTOS', accountType: 'EXPENSE', level: 1, parent: null },
    { code: '51', name: 'GASTOS OPERACIONALES', accountType: 'EXPENSE', level: 2, parent: '5' },
    { code: '5105', name: 'GASTOS DE PERSONAL', accountType: 'EXPENSE', level: 3, parent: '51' },
    { code: '5110', name: 'SERVICIOS PÚBLICOS', accountType: 'EXPENSE', level: 3, parent: '51' },
    { code: '5115', name: 'MANTENIMIENTO Y REPARACIONES', accountType: 'EXPENSE', level: 3, parent: '51' }
  ];

  // Agregar cuentas específicas según nivel educativo
  if (educationLevel === 'SUPERIOR') {
    accounts.push(
      { code: '4150', name: 'INSCRIPCIONES', accountType: 'INCOME', level: 3, parent: '41' },
      { code: '4155', name: 'CERTIFICACIONES', accountType: 'INCOME', level: 3, parent: '41' }
    );
  }

  const createdAccounts = new Map();

  for (const accountData of accounts) {
    const parentId = accountData.parent ? createdAccounts.get(accountData.parent) : null;
    
    const account = await prisma.account.create({
      data: {
        code: accountData.code,
        name: accountData.name,
        accountType: accountData.accountType,
        level: accountData.level,
        parentId,
        institutionId,
        isActive: true
      }
    });

    createdAccounts.set(accountData.code, account.id);
  }

  console.log(`✅ Plan de cuentas creado para institución ${institutionId}: ${accounts.length} cuentas`);
}

/**
 * Crear categorías básicas
 */
async function createBasicCategories(prisma, institutionId) {
  const categories = [
    { name: 'Matrículas', description: 'Ingresos por matrículas de estudiantes', type: 'INCOME', color: '#10b981' },
    { name: 'Mensualidades', description: 'Ingresos por mensualidades', type: 'INCOME', color: '#3b82f6' },
    { name: 'Eventos Especiales', description: 'Rifas, grados, excursiones', type: 'EVENT', color: '#8b5cf6' },
    { name: 'Pruebas Académicas', description: 'Exámenes, evaluaciones', type: 'EVENT', color: '#06b6d4' },
    { name: 'Uniformes y Materiales', description: 'Venta de uniformes y útiles', type: 'EVENT', color: '#84cc16' },
    { name: 'Nómina', description: 'Gastos de personal', type: 'EXPENSE', color: '#ef4444' },
    { name: 'Servicios Públicos', description: 'Agua, luz, gas, internet', type: 'EXPENSE', color: '#f59e0b' },
    { name: 'Mantenimiento', description: 'Reparaciones y mantenimiento', type: 'EXPENSE', color: '#6b7280' }
  ];

  for (const categoryData of categories) {
    await prisma.category.create({
      data: {
        ...categoryData,
        institutionId,
        isActive: true
      }
    });
  }

  console.log(`✅ Categorías creadas para institución ${institutionId}: ${categories.length} categorías`);
}

module.exports = {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionStats,
  getInstitutionOptions
};