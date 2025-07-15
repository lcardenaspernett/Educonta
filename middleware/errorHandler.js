// ===================================
// EDUCONTA - Middleware de Manejo de Errores
// ===================================

const config = require('../config/config');

/**
 * Middleware principal de manejo de errores
 * Debe ir al final de todas las rutas
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('🚨 Error capturado:', {
    message: err.message,
    stack: config.isDevelopment() ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    institutionId: req.institution?.id,
    timestamp: new Date().toISOString()
  });

  // ===================================
  // ERRORES ESPECÍFICOS DE PRISMA
  // ===================================
  
  // Error de registro duplicado
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'campo';
    const message = getFieldMessage(field);
    error = createError(400, message);
  }
  
  // Error de clave foránea
  if (err.code === 'P2003') {
    error = createError(400, 'No se puede eliminar este registro porque está siendo utilizado por otros datos');
  }
  
  // Error de registro no encontrado
  if (err.code === 'P2025') {
    error = createError(404, 'El registro solicitado no existe o no tienes permisos para acceder a él');
  }
  
  // Error de conexión a base de datos
  if (err.code === 'P1001') {
    error = createError(503, 'Error de conexión a la base de datos. Intenta nuevamente en unos momentos');
  }

  // ===================================
  // ERRORES DE VALIDACIÓN
  // ===================================
  
  // Errores de express-validator
  if (err.name === 'ValidationError' || err.errors) {
    const message = extractValidationErrors(err);
    error = createError(400, message);
  }

  // ===================================
  // ERRORES DE JWT
  // ===================================
  
  if (err.name === 'JsonWebTokenError') {
    error = createError(401, 'Token de acceso inválido');
  }
  
  if (err.name === 'TokenExpiredError') {
    error = createError(401, 'Token de acceso expirado');
  }

  // ===================================
  // ERRORES DE MULTER (ARCHIVOS)
  // ===================================
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = createError(400, `El archivo es demasiado grande. Máximo permitido: ${config.UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = createError(400, 'Tipo de archivo no permitido');
  }

  // ===================================
  // ERRORES DE CAST (MongoDB style)
  // ===================================
  
  if (err.name === 'CastError') {
    error = createError(400, 'ID de recurso inválido');
  }

  // ===================================
  // ERRORES HTTP ESTÁNDAR
  // ===================================
  
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  // Estructura de respuesta
  const response = {
    success: false,
    error: {
      message: message,
      statusCode: statusCode,
      ...(config.isDevelopment() && {
        stack: err.stack,
        details: err
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Enviar respuesta
  res.status(statusCode).json(response);
};

/**
 * Manejo de errores asíncronos
 * Wrapper para controladores async
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Crear error personalizado
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Extraer mensajes de errores de validación
 */
const extractValidationErrors = (err) => {
  if (err.errors) {
    // Mongoose style validation errors
    const errors = Object.values(err.errors).map(error => error.message);
    return `Errores de validación: ${errors.join(', ')}`;
  }
  
  if (err.details) {
    // Joi style validation errors
    const errors = err.details.map(detail => detail.message);
    return `Errores de validación: ${errors.join(', ')}`;
  }
  
  return err.message || 'Error de validación';
};

/**
 * Obtener mensaje personalizado para campos duplicados
 */
const getFieldMessage = (field) => {
  const fieldMessages = {
    'email': 'Ya existe un usuario con este email',
    'nit': 'Ya existe una institución con este NIT',
    'studentCode': 'Ya existe un estudiante con este código',
    'documentNumber': 'Ya existe un estudiante con este número de documento',
    'invoiceNumber': 'Ya existe una factura con este número',
    'code': 'Ya existe un registro con este código'
  };
  
  return fieldMessages[field] || `Ya existe un registro con este ${field}`;
};

/**
 * Middleware para errores 404 (rutas no encontradas)
 */
const notFound = (req, res, next) => {
  const error = createError(404, `Ruta no encontrada: ${req.originalUrl}`);
  next(error);
};

/**
 * Errores específicos de negocio para Educonta
 */
class EducontaError extends Error {
  constructor(message, statusCode = 400, code = null) {
    super(message);
    this.name = 'EducontaError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Errores específicos para multi-tenant
 */
class TenantError extends Error {
  constructor(message, statusCode = 403) {
    super(message);
    this.name = 'TenantError';
    this.statusCode = statusCode;
  }
}

/**
 * Errores de permisos
 */
class PermissionError extends Error {
  constructor(message = 'No tienes permisos para realizar esta acción', statusCode = 403) {
    super(message);
    this.name = 'PermissionError';
    this.statusCode = statusCode;
  }
}

/**
 * Errores de autenticación
 */
class AuthError extends Error {
  constructor(message = 'No autorizado', statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Errores de validación de negocio
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
  }
}

/**
 * Manejar errores específicos de contabilidad
 */
class AccountingError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AccountingError';
    this.statusCode = statusCode;
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  createError,
  notFound,
  
  // Errores personalizados
  EducontaError,
  TenantError,
  PermissionError,
  AuthError,
  ValidationError,
  AccountingError
};