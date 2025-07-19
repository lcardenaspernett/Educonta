// ===================================
// EDUCONTA - Middleware de Permisos
// ===================================

const { ForbiddenError, PermissionError } = require('./errorHandler');

/**
 * Middleware para verificar permisos de usuario
 * @param {string} module - Módulo a verificar (ej: 'accounting', 'students')
 * @param {string} action - Acción a verificar (ej: 'create', 'read', 'update', 'delete')
 */
const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // Si no hay usuario autenticado, rechazar
      if (!req.user) {
        return next(new ForbiddenError('Usuario no autenticado'));
      }

      const { role, institutionId } = req.user;

      // SUPER_ADMIN tiene acceso a todo
      if (role === 'SUPER_ADMIN') {
        return next();
      }

      // RECTOR tiene acceso completo a su institución
      if (role === 'RECTOR') {
        // Verificar que tenga institución asignada
        if (!institutionId) {
          return next(new PermissionError('Usuario sin institución asignada'));
        }
        return next();
      }

      // AUXILIARY_ACCOUNTANT tiene permisos específicos
      if (role === 'AUXILIARY_ACCOUNTANT') {
        // Verificar que tenga institución asignada
        if (!institutionId) {
          return next(new PermissionError('Usuario sin institución asignada'));
        }

        // Permisos específicos por módulo
        const permissions = {
          accounting: ['create', 'read', 'update'], // No puede eliminar
          students: ['read'], // Solo lectura
          institutions: ['read'], // Solo lectura
          dashboard: ['read']
        };

        const allowedActions = permissions[module];
        
        if (!allowedActions || !allowedActions.includes(action)) {
          return next(new PermissionError(`Sin permisos para ${action} en ${module}`));
        }

        return next();
      }

      // Si llegamos aquí, el rol no está reconocido
      return next(new PermissionError('Rol de usuario no reconocido'));

    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar si el usuario puede acceder a una institución específica
 * @param {string} institutionIdParam - Nombre del parámetro que contiene el ID de la institución
 */
const checkInstitutionAccess = (institutionIdParam = 'institutionId') => {
  return async (req, res, next) => {
    try {
      const { role, institutionId: userInstitutionId } = req.user;

      // SUPER_ADMIN puede acceder a cualquier institución
      if (role === 'SUPER_ADMIN') {
        return next();
      }

      // Obtener ID de institución del request (parámetro, query o body)
      const requestedInstitutionId = 
        req.params[institutionIdParam] || 
        req.query[institutionIdParam] || 
        req.body[institutionIdParam];

      // Si no se especifica institución, usar la del usuario
      if (!requestedInstitutionId) {
        return next();
      }

      // Verificar que el usuario pueda acceder a la institución solicitada
      if (userInstitutionId !== requestedInstitutionId) {
        return next(new ForbiddenError('Sin acceso a esta institución'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar si el usuario es SUPER_ADMIN
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return next(new ForbiddenError('Requiere permisos de Super Administrador'));
  }
  next();
};

/**
 * Middleware para verificar si el usuario es RECTOR o SUPER_ADMIN
 */
const requireRectorOrAdmin = (req, res, next) => {
  if (!req.user || !['RECTOR', 'SUPER_ADMIN'].includes(req.user.role)) {
    return next(new ForbiddenError('Requiere permisos de Rector o Super Administrador'));
  }
  next();
};

/**
 * Obtener permisos del usuario para un módulo específico
 * @param {Object} user - Usuario
 * @param {string} module - Módulo
 * @returns {Array} Array de acciones permitidas
 */
const getUserPermissions = (user, module) => {
  if (!user) return [];

  const { role } = user;

  // SUPER_ADMIN tiene todos los permisos
  if (role === 'SUPER_ADMIN') {
    return ['create', 'read', 'update', 'delete'];
  }

  // RECTOR tiene permisos completos en su institución
  if (role === 'RECTOR') {
    return ['create', 'read', 'update', 'delete'];
  }

  // AUXILIARY_ACCOUNTANT tiene permisos limitados
  if (role === 'AUXILIARY_ACCOUNTANT') {
    const permissions = {
      accounting: ['create', 'read', 'update'],
      students: ['read'],
      institutions: ['read'],
      dashboard: ['read']
    };

    return permissions[module] || [];
  }

  return [];
};

module.exports = {
  checkPermission,
  checkInstitutionAccess,
  requireSuperAdmin,
  requireRectorOrAdmin,
  getUserPermissions
};