// ===================================
// EDUCONTA - Controlador de Instituciones
// ===================================

const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;
const { 
  EducontaError, 
  ValidationError, 
  PermissionError,
  TenantError 
} = require('../middleware/errorHandler');
const { generateInvitationToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const config = require('../config/config');

/**
 * Crear nueva institución (solo SUPER_ADMIN)
 */
const createInstitution = async (req, res, next) => {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de institución inválidos'));
    }

    const {
      name,
      nit,
      address,
      phone,
      email,
      city,
      department,
      educationLevel,
      rectorFirstName,
      rectorLastName,
      rectorEmail
    } = req.body;

    // Verificar que no existe una institución con el mismo NIT
    const existingInstitution = await req.prisma.institution.findUnique({
      where: { nit }
    });

    if (existingInstitution) {
      return next(new ValidationError('Ya existe una institución con este NIT'));
    }

    // Verificar que no existe usuario con el email del rector
    const existingUser = await req.prisma.user.findUnique({
      where: { email: rectorEmail.toLowerCase() }
    });

    if (existingUser) {
      return next(new ValidationError('Ya existe un usuario con el email del rector'));
    }

    // Crear institución
    const institution = await req.prisma.institution.create({
      data: {
        name: name.trim(),
        nit: nit.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.toLowerCase(),
        city: city.trim(),
        department: department.trim(),
        educationLevel,
        isActive: true
      }
    });

    // Crear plan de cuentas básico para la institución
    await createBasicAccountPlan(req.prisma, institution.id);

    // Crear categorías básicas
    await createBasicCategories(req.prisma, institution.id);

    // Generar token de invitación para el rector
    const invitationToken = generateInvitationToken(
      rectorEmail.toLowerCase(),
      'RECTOR',
      institution.id,
      req.user.id
    );

    // Crear URL de registro
    const registrationUrl = `${config.getAppUrl()}/register?token=${invitationToken}`;

    // Enviar email de invitación al rector
    try {
      await sendEmail({
        to: rectorEmail,
        template: 'user-invitation',
        data: {
          email: rectorEmail,
          institutionName: institution.name,
          roleName: 'Rector',
          invitedByName: `${req.user.firstName} ${req.user.lastName}`,
          registrationUrl
        }
      });
    } catch (emailError) {
      console.error('Error enviando email de invitación:', emailError);
      // No fallar la creación si el email no se puede enviar
    }

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        tableName: 'institutions',
        recordId: institution.id,
        newValues: { name, nit, educationLevel },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId: institution.id,
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Institución creada exitosamente',
      institution: {
        id: institution.id,
        name: institution.name,
        nit: institution.nit,
        email: institution.email,
        educationLevel: institution.educationLevel,
        isActive: institution.isActive,
        createdAt: institution.createdAt
      },
      invitationSent: true,
      rectorEmail
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todas las instituciones (solo SUPER_ADMIN)
 */
const getAllInstitutions = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      educationLevel = '',
      isActive = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nit: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (educationLevel) {
      where.educationLevel = educationLevel;
    }
    
    if (isActive !== '') {
      where.isActive = isActive === 'true';
    }

    // Obtener instituciones con conteos
    const [institutions, total] = await Promise.all([
      req.prisma.institution.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: parseInt(limit),
        include: {
          _count: {
            select: {
              users: true,
              students: true,
              transactions: true,
              invoices: true
            }
          }
        }
      }),
      req.prisma.institution.count({ where })
    ]);

    // Calcular estadísticas adicionales para cada institución
    const institutionsWithStats = await Promise.all(
      institutions.map(async (institution) => {
        const [totalRevenue, monthlyRevenue] = await Promise.all([
          req.prisma.transaction.aggregate({
            where: {
              institutionId: institution.id,
              type: 'INCOME',
              status: 'APPROVED'
            },
            _sum: { amount: true }
          }),
          req.prisma.transaction.aggregate({
            where: {
              institutionId: institution.id,
              type: 'INCOME',
              status: 'APPROVED',
              date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            },
            _sum: { amount: true }
          })
        ]);

        return {
          ...institution,
          stats: {
            users: institution._count.users,
            students: institution._count.students,
            transactions: institution._count.transactions,
            invoices: institution._count.invoices,
            totalRevenue: totalRevenue._sum.amount || 0,
            monthlyRevenue: monthlyRevenue._sum.amount || 0
          }
        };
      })
    );

    res.json({
      success: true,
      institutions: institutionsWithStats.map(institution => ({
        id: institution.id,
        name: institution.name,
        nit: institution.nit,
        email: institution.email,
        city: institution.city,
        department: institution.department,
        educationLevel: institution.educationLevel,
        isActive: institution.isActive,
        createdAt: institution.createdAt,
        stats: institution.stats
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener institución por ID
 */
const getInstitutionById = async (req, res, next) => {
  try {
    const { institutionId } = req.params;

    const institution = await req.prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true
          }
        },
        _count: {
          select: {
            students: true,
            accounts: true,
            transactions: true,
            invoices: true
          }
        }
      }
    });

    if (!institution) {
      return next(new TenantError('Institución no encontrada'));
    }

    // Verificar acceso (SUPER_ADMIN o usuario de la institución)
    if (req.user.role !== 'SUPER_ADMIN' && req.user.institutionId !== institutionId) {
      return next(new PermissionError('Sin acceso a esta institución'));
    }

    // Obtener estadísticas detalladas
    const [financialStats, recentActivity] = await Promise.all([
      getInstitutionFinancialStats(req.prisma, institutionId),
      getRecentActivity(req.prisma, institutionId)
    ]);

    res.json({
      success: true,
      institution: {
        ...institution,
        financialStats,
        recentActivity
      }
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de actualización inválidos'));
    }

    const { institutionId } = req.params;
    const updateData = req.body;

    // Verificar acceso
    if (req.user.role !== 'SUPER_ADMIN' && req.user.institutionId !== institutionId) {
      return next(new PermissionError('Sin acceso para actualizar esta institución'));
    }

    // Si se está actualizando el NIT, verificar que no exista
    if (updateData.nit) {
      const existingInstitution = await req.prisma.institution.findFirst({
        where: {
          nit: updateData.nit,
          id: { not: institutionId }
        }
      });

      if (existingInstitution) {
        return next(new ValidationError('Ya existe una institución con este NIT'));
      }
    }

    // Obtener datos anteriores para auditoría
    const oldInstitution = await req.prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!oldInstitution) {
      return next(new TenantError('Institución no encontrada'));
    }

    // Actualizar institución
    const updatedInstitution = await req.prisma.institution.update({
      where: { id: institutionId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'institutions',
        recordId: institutionId,
        oldValues: oldInstitution,
        newValues: updateData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Institución actualizada exitosamente',
      institution: updatedInstitution
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Cambiar estado de institución (activar/desactivar)
 */
const toggleInstitutionStatus = async (req, res, next) => {
  try {
    const { institutionId } = req.params;
    const { isActive } = req.body;

    // Solo SUPER_ADMIN puede cambiar estados
    if (req.user.role !== 'SUPER_ADMIN') {
      return next(new PermissionError('Solo SUPER_ADMIN puede cambiar el estado de instituciones'));
    }

    const institution = await req.prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!institution) {
      return next(new TenantError('Institución no encontrada'));
    }

    // Actualizar estado
    const updatedInstitution = await req.prisma.institution.update({
      where: { id: institutionId },
      data: { 
        isActive,
        updatedAt: new Date()
      }
    });

    // Si se desactiva, también desactivar usuarios
    if (!isActive) {
      await req.prisma.user.updateMany({
        where: { institutionId },
        data: { isActive: false }
      });
    }

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
        tableName: 'institutions',
        recordId: institutionId,
        oldValues: { isActive: institution.isActive },
        newValues: { isActive },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: `Institución ${isActive ? 'activada' : 'desactivada'} exitosamente`,
      institution: updatedInstitution
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Subir logo de institución
 */
const uploadLogo = async (req, res, next) => {
  try {
    const { institutionId } = req.params;

    // Verificar acceso
    if (req.user.role !== 'SUPER_ADMIN' && req.user.institutionId !== institutionId) {
      return next(new PermissionError('Sin acceso para actualizar esta institución'));
    }

    if (!req.file) {
      return next(new ValidationError('Archivo de logo requerido'));
    }

    // Verificar que sea una imagen
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return next(new ValidationError('Solo se permiten archivos de imagen (JPG, PNG, GIF)'));
    }

    const logoPath = `/uploads/logos/${req.file.filename}`;

    // Actualizar institución con la nueva ruta del logo
    const updatedInstitution = await req.prisma.institution.update({
      where: { id: institutionId },
      data: { 
        logo: logoPath,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Logo actualizado exitosamente',
      logoUrl: logoPath,
      institution: updatedInstitution
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas del dashboard para una institución
 */
const getInstitutionDashboard = async (req, res, next) => {
  try {
    const { institutionId } = req.params;

    // Verificar acceso
    if (req.user.role !== 'SUPER_ADMIN' && req.user.institutionId !== institutionId) {
      return next(new PermissionError('Sin acceso a esta institución'));
    }

    const [
      studentsCount,
      activeStudentsCount,
      usersCount,
      currentMonthRevenue,
      currentMonthExpenses,
      pendingInvoicesCount,
      overdueInvoicesCount,
      recentTransactions
    ] = await Promise.all([
      req.prisma.student.count({ where: { institutionId } }),
      req.prisma.student.count({ where: { institutionId, isActive: true } }),
      req.prisma.user.count({ where: { institutionId, isActive: true } }),
      getCurrentMonthRevenue(req.prisma, institutionId),
      getCurrentMonthExpenses(req.prisma, institutionId),
      getPendingInvoicesCount(req.prisma, institutionId),
      getOverdueInvoicesCount(req.prisma, institutionId),
      getRecentTransactions(req.prisma, institutionId, 5)
    ]);

    res.json({
      success: true,
      dashboard: {
        students: {
          total: studentsCount,
          active: activeStudentsCount
        },
        users: {
          active: usersCount
        },
        financial: {
          currentMonthRevenue,
          currentMonthExpenses,
          pendingInvoices: pendingInvoicesCount,
          overdueInvoices: overdueInvoicesCount
        },
        recentTransactions
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Crear plan de cuentas básico para nueva institución
 */
const createBasicAccountPlan = async (prisma, institutionId) => {
  const basicAccounts = [
    // ACTIVOS
    { code: '1', name: 'ACTIVOS', accountType: 'ASSET', level: 1 },
    { code: '11', name: 'ACTIVO CORRIENTE', accountType: 'ASSET', level: 2, parentCode: '1' },
    { code: '1105', name: 'CAJA', accountType: 'ASSET', level: 3, parentCode: '11' },
    { code: '1110', name: 'BANCOS', accountType: 'ASSET', level: 3, parentCode: '11' },
    { code: '1305', name: 'CUENTAS POR COBRAR', accountType: 'ASSET', level: 3, parentCode: '11' },
    
    // PASIVOS
    { code: '2', name: 'PASIVOS', accountType: 'LIABILITY', level: 1 },
    { code: '24', name: 'CUENTAS POR PAGAR', accountType: 'LIABILITY', level: 2, parentCode: '2' },
    
    // PATRIMONIO
    { code: '3', name: 'PATRIMONIO', accountType: 'EQUITY', level: 1 },
    { code: '31', name: 'CAPITAL SOCIAL', accountType: 'EQUITY', level: 2, parentCode: '3' },
    
    // INGRESOS
    { code: '4', name: 'INGRESOS', accountType: 'INCOME', level: 1 },
    { code: '41', name: 'INGRESOS OPERACIONALES', accountType: 'INCOME', level: 2, parentCode: '4' },
    { code: '4135', name: 'MATRÍCULAS', accountType: 'INCOME', level: 3, parentCode: '41' },
    { code: '4140', name: 'MENSUALIDADES', accountType: 'INCOME', level: 3, parentCode: '41' },
    
    // GASTOS
    { code: '5', name: 'GASTOS', accountType: 'EXPENSE', level: 1 },
    { code: '51', name: 'GASTOS OPERACIONALES', accountType: 'EXPENSE', level: 2, parentCode: '5' },
    { code: '5105', name: 'GASTOS DE PERSONAL', accountType: 'EXPENSE', level: 3, parentCode: '51' },
    { code: '5110', name: 'SERVICIOS PÚBLICOS', accountType: 'EXPENSE', level: 3, parentCode: '51' }
  ];

  // Crear cuentas con relaciones jerárquicas
  const createdAccounts = new Map();

  for (const account of basicAccounts) {
    const parentId = account.parentCode ? createdAccounts.get(account.parentCode) : null;
    
    const createdAccount = await prisma.account.create({
      data: {
        code: account.code,
        name: account.name,
        accountType: account.accountType,
        level: account.level,
        parentId,
        institutionId,
        isActive: true
      }
    });

    createdAccounts.set(account.code, createdAccount.id);
  }
};

/**
 * Crear categorías básicas para nueva institución
 */
const createBasicCategories = async (prisma, institutionId) => {
  const basicCategories = [
    { name: 'Matrículas', type: 'INCOME', color: '#10b981' },
    { name: 'Mensualidades', type: 'INCOME', color: '#3b82f6' },
    { name: 'Eventos Especiales', type: 'EVENT', color: '#8b5cf6' },
    { name: 'Nómina', type: 'EXPENSE', color: '#ef4444' },
    { name: 'Servicios Públicos', type: 'EXPENSE', color: '#f59e0b' },
    { name: 'Mantenimiento', type: 'EXPENSE', color: '#6b7280' }
  ];

  for (const category of basicCategories) {
    await prisma.category.create({
      data: {
        ...category,
        institutionId,
        isActive: true
      }
    });
  }
};

/**
 * Funciones auxiliares para estadísticas
 */
const getInstitutionFinancialStats = async (prisma, institutionId) => {
  const currentMonth = new Date();
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  
  const [totalRevenue, totalExpenses, monthlyRevenue, monthlyExpenses] = await Promise.all([
    prisma.transaction.aggregate({
      where: { institutionId, type: 'INCOME', status: 'APPROVED' },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { institutionId, type: 'EXPENSE', status: 'APPROVED' },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { 
        institutionId, 
        type: 'INCOME', 
        status: 'APPROVED',
        date: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { 
        institutionId, 
        type: 'EXPENSE', 
        status: 'APPROVED',
        date: { gte: startOfMonth }
      },
      _sum: { amount: true }
    })
  ]);

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    totalExpenses: totalExpenses._sum.amount || 0,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    monthlyExpenses: monthlyExpenses._sum.amount || 0,
    netIncome: (totalRevenue._sum.amount || 0) - (totalExpenses._sum.amount || 0)
  };
};

const getCurrentMonthRevenue = async (prisma, institutionId) => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  
  const result = await prisma.transaction.aggregate({
    where: {
      institutionId,
      type: 'INCOME',
      status: 'APPROVED',
      date: { gte: startOfMonth }
    },
    _sum: { amount: true }
  });

  return result._sum.amount || 0;
};

const getCurrentMonthExpenses = async (prisma, institutionId) => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  
  const result = await prisma.transaction.aggregate({
    where: {
      institutionId,
      type: 'EXPENSE',
      status: 'APPROVED',
      date: { gte: startOfMonth }
    },
    _sum: { amount: true }
  });

  return result._sum.amount || 0;
};

const getPendingInvoicesCount = async (prisma, institutionId) => {
  return await prisma.invoice.count({
    where: {
      institutionId,
      status: 'PENDING'
    }
  });
};

const getOverdueInvoicesCount = async (prisma, institutionId) => {
  return await prisma.invoice.count({
    where: {
      institutionId,
      status: 'OVERDUE'
    }
  });
};

const getRecentTransactions = async (prisma, institutionId, limit = 5) => {
  return await prisma.transaction.findMany({
    where: { institutionId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      date: true,
      description: true,
      amount: true,
      type: true,
      status: true
    }
  });
};

const getRecentActivity = async (prisma, institutionId) => {
  return await prisma.auditLog.findMany({
    where: { institutionId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });
};

module.exports = {
  createInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
  toggleInstitutionStatus,
  uploadLogo,
  getInstitutionDashboard
};