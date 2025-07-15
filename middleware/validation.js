// ===================================
// EDUCONTA - Middleware de Validación
// ===================================

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

// ===================================
// VALIDACIONES COMUNES
// ===================================

/**
 * Validaciones para nombres y apellidos
 */
const nameValidation = (field, fieldName = 'Nombre') => [
  body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${fieldName} debe tener entre 2 y 50 caracteres`)
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage(`${fieldName} solo puede contener letras y espacios`)
];

/**
 * Validación para emails
 */
const emailValidation = (field = 'email', required = true) => {
  const validation = body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido');
    
  return required ? validation : validation.optional();
};

/**
 * Validación para contraseñas seguras
 */
const passwordValidation = (field = 'password', required = true) => {
  const validation = body(field)
    .isLength({ min: 8, max: 100 })
    .withMessage('La contraseña debe tener entre 8 y 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial');
    
  return required ? validation : validation.optional();
};

/**
 * Validación para números de teléfono
 */
const phoneValidation = (field = 'phone', required = true) => {
  const validation = body(field)
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{7,20}$/)
    .withMessage('Número de teléfono inválido');
    
  return required ? validation : validation.optional();
};

/**
 * Validación para UUIDs
 */
const uuidValidation = (field) => [
  param(field)
    .isUUID()
    .withMessage(`${field} debe ser un ID válido`)
];

/**
 * Validación para montos monetarios
 */
const amountValidation = (field = 'amount', required = true) => {
  const validation = body(field)
    .isFloat({ min: 0, max: 999999999.99 })
    .withMessage('El monto debe ser un número válido entre 0 y 999,999,999.99');
    
  return required ? validation : validation.optional();
};

/**
 * Validación para fechas
 */
const dateValidation = (field, required = true, futureOnly = false) => {
  let validation = body(field)
    .isISO8601()
    .withMessage('Fecha inválida. Use formato ISO 8601 (YYYY-MM-DD)');
    
  if (futureOnly) {
    validation = validation.custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error('La fecha debe ser igual o posterior a hoy');
      }
      return true;
    });
  }
    
  return required ? validation : validation.optional();
};

// ===================================
// VALIDACIONES PARA INSTITUCIONES
// ===================================

const institutionValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('El nombre debe tener entre 3 y 100 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/)
      .withMessage('El nombre contiene caracteres no válidos'),

    body('nit')
      .trim()
      .matches(/^[0-9]{8,15}(-[0-9kK])?$/)
      .withMessage('NIT inválido. Formato: 123456789 o 123456789-0')
      .custom(async (value, { req }) => {
        // Verificar NIT único (se implementa en el controlador)
        return true;
      }),

    body('address')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('La dirección debe tener entre 10 y 200 caracteres'),

    phoneValidation('phone'),
    emailValidation('email'),

    body('city')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('La ciudad debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/)
      .withMessage('La ciudad contiene caracteres no válidos'),

    body('department')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El departamento debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/)
      .withMessage('El departamento contiene caracteres no válidos'),

    body('educationLevel')
      .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'MIXTA'])
      .withMessage('Nivel educativo inválido'),

    // Datos del rector
    ...nameValidation('rectorFirstName', 'Nombre del rector'),
    ...nameValidation('rectorLastName', 'Apellido del rector'),
    emailValidation('rectorEmail')
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    body('nit')
      .optional()
      .trim()
      .matches(/^[0-9]{8,15}(-[0-9kK])?$/)
      .withMessage('NIT inválido'),

    body('address')
      .optional()
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('La dirección debe tener entre 10 y 200 caracteres'),

    phoneValidation('phone', false),
    emailValidation('email', false),

    body('city')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('La ciudad debe tener entre 2 y 50 caracteres'),

    body('department')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El departamento debe tener entre 2 y 50 caracteres'),

    body('educationLevel')
      .optional()
      .isIn(['PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'SUPERIOR', 'MIXTA'])
      .withMessage('Nivel educativo inválido')
  ]
};

// ===================================
// VALIDACIONES PARA USUARIOS
// ===================================

const userValidation = {
  create: [
    ...nameValidation('firstName', 'Nombre'),
    ...nameValidation('lastName', 'Apellido'),
    emailValidation('email'),
    passwordValidation('password'),
    
    body('role')
      .isIn(['RECTOR', 'AUXILIARY_ACCOUNTANT'])
      .withMessage('Rol inválido'),

    body('institutionId')
      .optional()
      .isUUID()
      .withMessage('ID de institución inválido')
  ],

  update: [
    ...nameValidation('firstName', 'Nombre').map(v => v.optional()),
    ...nameValidation('lastName', 'Apellido').map(v => v.optional()),
    emailValidation('email', false),
    
    body('role')
      .optional()
      .isIn(['RECTOR', 'AUXILIARY_ACCOUNTANT'])
      .withMessage('Rol inválido'),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('Estado debe ser booleano')
  ],

  invite: [
    emailValidation('email'),
    
    body('role')
      .isIn(['RECTOR', 'AUXILIARY_ACCOUNTANT'])
      .withMessage('Rol inválido'),

    body('institutionId')
      .isUUID()
      .withMessage('ID de institución requerido')
  ]
};

// ===================================
// VALIDACIONES PARA ESTUDIANTES
// ===================================

const studentValidation = {
  create: [
    body('studentCode')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Código de estudiante debe tener entre 3 y 20 caracteres')
      .matches(/^[A-Z0-9\-]+$/)
      .withMessage('Código solo puede contener letras mayúsculas, números y guiones'),

    ...nameValidation('firstName', 'Nombre del estudiante'),
    ...nameValidation('lastName', 'Apellido del estudiante'),

    body('documentType')
      .isIn(['TI', 'CC', 'CE', 'PP', 'RC'])
      .withMessage('Tipo de documento inválido'),

    body('documentNumber')
      .trim()
      .isLength({ min: 6, max: 15 })
      .withMessage('Número de documento debe tener entre 6 y 15 caracteres')
      .isNumeric()
      .withMessage('Número de documento debe ser numérico'),

    body('grade')
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Grado es requerido'),

    body('section')
      .optional()
      .trim()
      .isLength({ max: 5 })
      .withMessage('Sección máximo 5 caracteres'),

    dateValidation('birthDate', false),

    body('parentName')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Nombre del padre/madre debe tener entre 3 y 100 caracteres'),

    phoneValidation('parentPhone', false),
    emailValidation('parentEmail', false),

    body('address')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Dirección máximo 200 caracteres')
  ],

  update: [
    body('studentCode')
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Código de estudiante debe tener entre 3 y 20 caracteres'),

    ...nameValidation('firstName', 'Nombre del estudiante').map(v => v.optional()),
    ...nameValidation('lastName', 'Apellido del estudiante').map(v => v.optional()),

    body('documentType')
      .optional()
      .isIn(['TI', 'CC', 'CE', 'PP', 'RC'])
      .withMessage('Tipo de documento inválido'),

    body('documentNumber')
      .optional()
      .trim()
      .isLength({ min: 6, max: 15 })
      .withMessage('Número de documento debe tener entre 6 y 15 caracteres'),

    body('grade')
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Grado es requerido'),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('Estado debe ser booleano')
  ],

  bulkImport: [
    body('replaceExisting')
      .optional()
      .isBoolean()
      .withMessage('Reemplazar existentes debe ser booleano'),

    body('validateOnly')
      .optional()
      .isBoolean()
      .withMessage('Solo validar debe ser booleano')
  ]
};

// ===================================
// VALIDACIONES PARA CONTABILIDAD
// ===================================

const accountValidation = {
  create: [
    body('code')
      .trim()
      .matches(/^[0-9]{1,10}$/)
      .withMessage('Código de cuenta debe ser numérico de hasta 10 dígitos'),

    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Nombre de cuenta debe tener entre 3 y 100 caracteres'),

    body('accountType')
      .isIn(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'])
      .withMessage('Tipo de cuenta inválido'),

    body('parentId')
      .optional()
      .isUUID()
      .withMessage('ID de cuenta padre inválido'),

    body('level')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Nivel de cuenta debe ser entre 1 y 5')
  ]
};

const transactionValidation = {
  create: [
    dateValidation('date'),

    body('reference')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Referencia es requerida (máximo 50 caracteres)'),

    body('description')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Descripción debe tener entre 3 y 200 caracteres'),

    amountValidation('amount'),

    body('type')
      .isIn(['INCOME', 'EXPENSE', 'TRANSFER'])
      .withMessage('Tipo de transacción inválido'),

    body('debitAccountId')
      .isUUID()
      .withMessage('Cuenta débito requerida'),

    body('creditAccountId')
      .isUUID()
      .withMessage('Cuenta crédito requerida'),

    body('categoryId')
      .optional()
      .isUUID()
      .withMessage('ID de categoría inválido')
  ]
};

// ===================================
// VALIDACIONES PARA EVENTOS DE PAGO
// ===================================

const paymentEventValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Nombre del evento debe tener entre 3 y 100 caracteres'),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Descripción máximo 500 caracteres'),

    amountValidation('amount'),

    dateValidation('dueDate', false, true),

    body('eventType')
      .isIn(['MATRICULA', 'MENSUALIDAD', 'RIFA', 'PRUEBA', 'GRADO', 'EXCURSION', 'UNIFORME', 'OTRO'])
      .withMessage('Tipo de evento inválido'),

    body('categoryId')
      .optional()
      .isUUID()
      .withMessage('ID de categoría inválido')
  ],

  assign: [
    body('studentIds')
      .isArray({ min: 1 })
      .withMessage('Debe seleccionar al menos un estudiante'),

    body('studentIds.*')
      .isUUID()
      .withMessage('ID de estudiante inválido'),

    body('customAmount')
      .optional()
      .isObject()
      .withMessage('Montos personalizados deben ser un objeto'),

    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de vencimiento inválida')
  ]
};

// ===================================
// VALIDACIONES PARA FACTURAS
// ===================================

const invoiceValidation = {
  create: [
    body('studentId')
      .isUUID()
      .withMessage('ID de estudiante requerido'),

    body('paymentAssignmentId')
      .optional()
      .isUUID()
      .withMessage('ID de asignación de pago inválido'),

    amountValidation('subtotal'),
    amountValidation('tax', false),
    amountValidation('total'),

    dateValidation('dueDate', false, true),

    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notas máximo 500 caracteres')
  ]
};

// ===================================
// VALIDACIONES PARA QUERY PARAMETERS
// ===================================

const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página debe ser un número positivo'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Límite debe ser entre 1 y 100')
  ],

  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Búsqueda máximo 100 caracteres')
  ],

  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio inválida'),

    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin inválida')
      .custom((value, { req }) => {
        if (req.query.startDate && value < req.query.startDate) {
          throw new Error('Fecha de fin debe ser posterior a fecha de inicio');
        }
        return true;
      })
  ]
};

// ===================================
// MIDDLEWARE DE VALIDACIÓN
// ===================================

/**
 * Middleware para procesar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return next(new ValidationError('Errores de validación', errorMessages));
  }

  next();
};

/**
 * Combinar validaciones con manejo de errores
 */
const validate = (validations) => {
  return [...validations, handleValidationErrors];
};

/**
 * Validación condicional
 */
const conditionalValidation = (condition, validations) => {
  return (req, res, next) => {
    if (condition(req)) {
      return validate(validations)(req, res, next);
    }
    next();
  };
};

/**
 * Sanitización de entrada
 */
const sanitizeInput = (req, res, next) => {
  // Sanitizar strings para prevenir XSS
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        } else {
          obj[key] = sanitizeValue(obj[key]);
        }
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

module.exports = {
  // Validaciones comunes
  nameValidation,
  emailValidation,
  passwordValidation,
  phoneValidation,
  uuidValidation,
  amountValidation,
  dateValidation,

  // Validaciones por módulo
  institutionValidation,
  userValidation,
  studentValidation,
  accountValidation,
  transactionValidation,
  paymentEventValidation,
  invoiceValidation,
  queryValidation,

  // Middlewares
  handleValidationErrors,
  validate,
  conditionalValidation,
  sanitizeInput
};