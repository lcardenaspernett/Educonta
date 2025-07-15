// ===================================
// EDUCONTA - Middleware Multi-Tenant
// ===================================

const { TenantError, AuthError } = require('./errorHandler');

/**
 * Middleware principal multi-tenant
 * Asegura aislamiento completo de datos por institución
 */
const enforceTenant = (req, res, next) => {
  if (!req.user) {
    return next(new AuthError('Autenticación requerida para acceso multi-tenant'));
  }

  // SUPER_ADMIN puede trabajar sin restricciones de tenant
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Otros usuarios deben tener institución asignada
  if (!req.user.institutionId) {
    return next(new TenantError('Usuario sin institución asignada'));
  }

  // Verificar que la institución esté activa
  if (!req.institution || !req.institution.isActive) {
    return next(new TenantError('Institución inactiva o no encontrada'));
  }

  // Agregar filtro automático de tenant a todas las consultas
  req.tenantId = req.user.institutionId;
  
  next();
};

/**
 * Middleware para verificar acceso específico a institución
 * Usado cuando se pasa institutionId en la URL o body
 */
const validateTenantAccess = async (req, res, next) => {
  try {
    const requestedInstitutionId = 
      req.params.institutionId || 
      req.body.institutionId || 
      req.query.institutionId ||
      req.headers['x-institution-id'];

    if (!req.user) {
      return next(new AuthError('Autenticación requerida'));
    }

    // SUPER_ADMIN puede acceder a cualquier institución
    if (req.user.role === 'SUPER_ADMIN') {
      if (requestedInstitutionId) {
        // Verificar que la institución existe
        const institution = await req.prisma.institution.findUnique({
          where: { id: requestedInstitutionId }
        });

        if (!institution) {
          return next(new TenantError('Institución no encontrada'));
        }

        req.targetInstitution = institution;
        req.tenantId = institution.id;
      }
      return next();
    }

    // Para otros usuarios, verificar acceso a su propia institución
    if (requestedInstitutionId) {
      if (requestedInstitutionId !== req.user.institutionId) {
        return next(new TenantError('Sin acceso a la institución solicitada'));
      }
    }

    req.targetInstitution = req.institution;
    req.tenantId = req.user.institutionId;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para inyectar filtro de tenant en consultas Prisma
 * Modifica automáticamente las consultas para incluir institutionId
 */
const injectTenantFilter = (req, res, next) => {
  if (!req.user) {
    return next(new AuthError('Autenticación requerida'));
  }

  // SUPER_ADMIN puede omitir filtros si no especifica institución
  if (req.user.role === 'SUPER_ADMIN' && !req.tenantId) {
    return next();
  }

  const tenantId = req.tenantId || req.user.institutionId;

  if (!tenantId) {
    return next(new TenantError('ID de institución requerido'));
  }

  // Crear proxy para interceptar consultas Prisma
  const originalPrisma = req.prisma;
  
  req.prisma = new Proxy(originalPrisma, {
    get(target, prop) {
      const originalMethod = target[prop];
      
      // Lista de modelos que requieren filtro de tenant
      const tenantModels = [
        'student', 'account', 'transaction', 'paymentEvent', 
        'invoice', 'category', 'auditLog', 'paymentAssignment'
      ];

      if (tenantModels.includes(prop) && typeof originalMethod === 'object') {
        return new Proxy(originalMethod, {
          get(modelTarget, methodName) {
            const method = modelTarget[methodName];
            
            if (typeof method === 'function') {
              // Interceptar métodos de consulta
              if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate'].includes(methodName)) {
                return function(args = {}) {
                  // Inyectar filtro de institución
                  args.where = {
                    ...args.where,
                    institutionId: tenantId
                  };
                  return method.call(this, args);
                };
              }
              
              // Interceptar métodos de creación
              if (['create', 'createMany'].includes(methodName)) {
                return function(args = {}) {
                  if (methodName === 'create') {
                    args.data = {
                      ...args.data,
                      institutionId: tenantId
                    };
                  } else if (methodName === 'createMany') {
                    if (Array.isArray(args.data)) {
                      args.data = args.data.map(item => ({
                        ...item,
                        institutionId: tenantId
                      }));
                    }
                  }
                  return method.call(this, args);
                };
              }
              
              // Interceptar métodos de actualización
              if (['update', 'updateMany', 'upsert'].includes(methodName)) {
                return function(args = {}) {
                  args.where = {
                    ...args.where,
                    institutionId: tenantId
                  };
                  return method.call(this, args);
                };
              }
              
              // Interceptar métodos de eliminación
              if (['delete', 'deleteMany'].includes(methodName)) {
                return function(args = {}) {
                  args.where = {
                    ...args.where,
                    institutionId: tenantId
                  };
                  return method.call(this, args);
                };
              }
            }
            
            return method;
          }
        });
      }
      
      return originalMethod;
    }
  });

  next();
};

/**
 * Middleware para validar que los datos pertenecen al tenant correcto
 * Usado en operaciones de actualización/eliminación
 */
const validateTenantOwnership = (model, idField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AuthError('Autenticación requerida'));
      }

      // SUPER_ADMIN puede acceder a todo
      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      const resourceId = req.params[idField];
      
      if (!resourceId) {
        return next(new TenantError(`ID de ${model} requerido`));
      }

      // Verificar propiedad del recurso
      const resource = await req.prisma[model].findFirst({
        where: {
          id: resourceId,
          institutionId: req.user.institutionId
        }
      });

      if (!resource) {
        return next(new TenantError(`${model} no encontrado o sin acceso`));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para extraer tenant desde header personalizado
 * Útil para APIs externas o integraciones
 */
const extractTenantFromHeader = async (req, res, next) => {
  try {
    const tenantId = req.headers['x-institution-id'];
    
    if (!tenantId) {
      return next();
    }

    // Verificar que la institución existe
    const institution = await req.prisma.institution.findUnique({
      where: { 
        id: tenantId,
        isActive: true 
      }
    });

    if (!institution) {
      return next(new TenantError('Institución no encontrada o inactiva'));
    }

    req.headerInstitution = institution;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar cambio de institución (solo SUPER_ADMIN)
 * Usado cuando se cambia de contexto institucional
 */
const validateInstitutionSwitch = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      return next(new TenantError('Solo SUPER_ADMIN puede cambiar de institución'));
    }

    const newInstitutionId = req.body.institutionId || req.params.institutionId;
    
    if (!newInstitutionId) {
      return next(new TenantError('ID de institución requerido'));
    }

    // Verificar que la institución existe
    const institution = await req.prisma.institution.findUnique({
      where: { id: newInstitutionId }
    });

    if (!institution) {
      return next(new TenantError('Institución no encontrada'));
    }

    req.switchInstitution = institution;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Crear contexto de tenant para operaciones específicas
 */
const createTenantContext = (institutionId) => {
  return {
    institutionId,
    filter: { institutionId },
    data: { institutionId }
  };
};

/**
 * Obtener datos de resumen por institución (para SUPER_ADMIN)
 */
const getInstitutionSummary = async (prisma, institutionId) => {
  const [
    studentsCount,
    usersCount,
    accountsCount,
    transactionsCount,
    invoicesCount
  ] = await Promise.all([
    prisma.student.count({ where: { institutionId } }),
    prisma.user.count({ where: { institutionId } }),
    prisma.account.count({ where: { institutionId } }),
    prisma.transaction.count({ where: { institutionId } }),
    prisma.invoice.count({ where: { institutionId } })
  ]);

  return {
    students: studentsCount,
    users: usersCount,
    accounts: accountsCount,
    transactions: transactionsCount,
    invoices: invoicesCount
  };
};

/**
 * Middleware para log de auditoría multi-tenant
 */
const auditTenantAction = (action, tableName) => {
  return async (req, res, next) => {
    // Capturar respuesta original
    const originalSend = res.send;
    
    res.send = function(data) {
      // Solo auditar operaciones exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Crear log de auditoría async (no bloquear respuesta)
        setImmediate(async () => {
          try {
            if (req.user && req.tenantId) {
              await req.prisma.auditLog.create({
                data: {
                  action,
                  tableName,
                  recordId: req.params.id || req.body.id || 'bulk',
                  oldValues: req.resource || null,
                  newValues: req.body || null,
                  ipAddress: req.ip,
                  userAgent: req.get('User-Agent'),
                  institutionId: req.tenantId,
                  userId: req.user.id
                }
              });
            }
          } catch (error) {
            console.error('Error en auditoría:', error);
          }
        });
      }
      
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  enforceTenant,
  validateTenantAccess,
  injectTenantFilter,
  validateTenantOwnership,
  extractTenantFromHeader,
  validateInstitutionSwitch,
  createTenantContext,
  getInstitutionSummary,
  auditTenantAction
};