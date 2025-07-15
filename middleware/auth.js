// ===================================
// EDUCONTA - Middleware de Autenticación
// ===================================

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { AuthError, TenantError, PermissionError } = require('./errorHandler');

/**
 * Middleware principal de autenticación
 * Verifica JWT y carga datos del usuario
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Token de acceso requerido');
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Buscar usuario en base de datos
    const user = await req.prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isActive: true 
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            nit: true,
            isActive: true
          }
        },
        permissions: true
      }
    });

    if (!user) {
      throw new AuthError('Usuario no encontrado o inactivo');
    }

    // Verificar institución activa (excepto SUPER_ADMIN)
    if (user.role !== 'SUPER_ADMIN' && (!user.institution || !user.institution.isActive)) {
      throw new AuthError('Institución inactiva');
    }

    // Actualizar último login
    await req.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Agregar usuario y institución al request
    req.user = user;
    req.institution = user.institution;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthError('Token inválido'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthError('Token expirado'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero carga usuario si existe
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    const user = await req.prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isActive: true 
      },
      include: {
        institution: true,
        permissions: true
      }
    });

    if (user) {
      req.user = user;
      req.institution = user.institution;
    }
    
    next();
  } catch (error) {
    // En autenticación opcional, ignoramos errores de token
    next();
  }
};

/**
 * Middleware para verificar roles específicos
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthError('Autenticación requerida'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new PermissionError(`Rol requerido: ${roles.join(' o ')}`));
    }

    next();
  };
};

/**
 * Middleware para SUPER_ADMIN únicamente
 */
const requireSuperAdmin = requireRole('SUPER_ADMIN');

/**
 * Middleware para RECTOR o SUPER_ADMIN
 */
const requireRector = requireRole('SUPER_ADMIN', 'RECTOR');

/**
 * Middleware para cualquier rol administrativo
 */
const requireAdmin = requireRole('SUPER_ADMIN', 'RECTOR', 'AUXILIARY_ACCOUNTANT');

/**
 * Middleware para verificar permisos específicos en módulos
 */
const requirePermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthError('Autenticación requerida'));
    }

    // SUPER_ADMIN tiene todos los permisos
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Verificar permisos específicos
    const hasPermission = req.user.permissions.some(permission => 
      permission.module === module && 
      permission.actions.includes(action)
    );

    if (!hasPermission) {
      return next(new PermissionError(`Sin permisos para ${action} en ${module}`));
    }

    next();
  };
};

/**
 * Middleware para verificar acceso a institución específica
 * Usado en rutas que requieren institutionId en params
 */
const requireInstitutionAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AuthError('Autenticación requerida'));
    }

    // SUPER_ADMIN puede acceder a cualquier institución
    if (req.user.role === 'SUPER_ADMIN') {
      // Cargar institución desde parámetros si existe
      if (req.params.institutionId) {
        const institution = await req.prisma.institution.findUnique({
          where: { id: req.params.institutionId }
        });
        
        if (!institution) {
          return next(new TenantError('Institución no encontrada'));
        }
        
        req.targetInstitution = institution;
      }
      return next();
    }

    // Otros usuarios solo pueden acceder a su institución
    const institutionId = req.params.institutionId || req.body.institutionId || req.query.institutionId;
    
    if (institutionId && institutionId !== req.user.institutionId) {
      return next(new TenantError('Sin acceso a esta institución'));
    }

    req.targetInstitution = req.institution;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para filtrar datos por institución automáticamente
 * Añade filtro de institución a las queries
 */
const applyTenantFilter = (req, res, next) => {
  if (!req.user) {
    return next(new AuthError('Autenticación requerida'));
  }

  // SUPER_ADMIN puede ver todo si no especifica institución
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Para otros usuarios, forzar filtro por su institución
  req.tenantFilter = {
    institutionId: req.user.institutionId
  };

  next();
};

/**
 * Middleware para verificar propiedad de recursos
 * Verifica que el recurso pertenezca a la institución del usuario
 */
const requireResourceOwnership = (resourceType, idField = 'id') => {
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
        return next(new Error(`ID de ${resourceType} requerido`));
      }

      // Verificar que el recurso pertenece a la institución del usuario
      const resource = await req.prisma[resourceType].findFirst({
        where: {
          id: resourceId,
          institutionId: req.user.institutionId
        }
      });

      if (!resource) {
        return next(new TenantError(`${resourceType} no encontrado o sin acceso`));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para validar token de header personalizado
 * Para APIs específicas o integraciones
 */
const validateApiToken = (req, res, next) => {
  const apiToken = req.header('X-API-Token');
  
  if (!apiToken) {
    return next(new AuthError('Token de API requerido'));
  }

  // Aquí puedes implementar validación de tokens de API específicos
  // Por ahora, validamos que exista
  if (apiToken !== config.API_TOKEN && config.API_TOKEN) {
    return next(new AuthError('Token de API inválido'));
  }

  next();
};

/**
 * Generar JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
    issuer: config.APP_NAME,
    audience: config.APP_URL
  });
};

/**
 * Generar refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh'
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRE,
    issuer: config.APP_NAME,
    audience: config.APP_URL
  });
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireSuperAdmin,
  requireRector,
  requireAdmin,
  requirePermission,
  requireInstitutionAccess,
  applyTenantFilter,
  requireResourceOwnership,
  validateApiToken,
  generateToken,
  generateRefreshToken
};