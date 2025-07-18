// ===================================
// EDUCONTA - Middleware de Manejo de Errores
// ===================================

/**
 * Clases de errores personalizados
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto con recurso existente') {
    super(message, 409, 'CONFLICT');
  }
}

class AuthError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403, 'FORBIDDEN');
  }
}

class TenantError extends AppError {
  constructor(message = 'Error de tenant/institución') {
    super(message, 403, 'TENANT_ERROR');
  }
}

class PermissionError extends AppError {
  constructor(message = 'Permisos insuficientes') {
    super(message, 403, 'PERMISSION_ERROR');
  }
}

/**
 * Middleware de manejo de errores global
 */
const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;

  // Log del error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    institutionId: req.user?.institutionId
  });

  // Error de validación de Prisma
  if (error.code === 'P2002') {
    const message = 'Recurso duplicado. Ya existe un registro con estos datos únicos.';
    err = new ConflictError(message);
  }

  // Error de registro no encontrado en Prisma
  if (error.code === 'P2025') {
    const message = 'Registro no encontrado';
    err = new NotFoundError(message);
  }

  // Error de conexión a base de datos
  if (error.code === 'P1001') {
    const message = 'No se puede conectar a la base de datos';
    err = new AppError(message, 503, 'DATABASE_CONNECTION_ERROR');
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    err = new AuthError(message);
  }

  if (error.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    err = new AuthError(message);
  }

  // Error de validación de express-validator
  if (error.type === 'entity.parse.failed') {
    const message = 'JSON inválido en el cuerpo de la petición';
    err = new ValidationError(message);
  }

  // Respuesta de error
  const response = {
    success: false,
    error: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_ERROR'
  };

  // Agregar detalles en errores de validación
  if (err instanceof ValidationError && err.details) {
    response.details = err.details;
  }

  // En desarrollo, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(err.statusCode || 500).json(response);
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
  next(error);
};

/**
 * Wrapper para funciones async que maneja errores automáticamente
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthError,
  ForbiddenError,
  TenantError,
  PermissionError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};