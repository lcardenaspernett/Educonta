// ===================================
// EDUCONTA - Rutas de Contabilidad
// ===================================

const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

// Middleware
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');

// Controlador
const {
  getAccounts,
  getAccountById,
  createAccount,
  getTransactions,
  createTransaction,
  getBalanceSheet,
  getStats
} = require('../controllers/accountingController');

// ===================================
// PRUEBA (SIN AUTH)
// ===================================

/**
 * GET /api/accounting/test
 * Endpoint de prueba sin autenticación
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Accounting routes are working!',
    timestamp: new Date().toISOString()
  });
});

// ===================================
// ESTADÍSTICAS
// ===================================

/**
 * GET /api/accounting/stats
 * Obtener estadísticas de contabilidad
 */
router.get('/stats',
  auth,
  checkPermission('accounting', 'read'),
  getStats
);

// ===================================
// PLAN DE CUENTAS
// ===================================

/**
 * GET /api/accounting/accounts
 * Obtener plan de cuentas
 */
router.get('/accounts',
  auth,
  checkPermission('accounting', 'read'),
  getAccounts
);

/**
 * GET /api/accounting/accounts/:id
 * Obtener cuenta por ID
 */
router.get('/accounts/:id',
  auth,
  checkPermission('accounting', 'read'),
  getAccountById
);

/**
 * POST /api/accounting/accounts
 * Crear nueva cuenta
 */
router.post('/accounts',
  auth,
  checkPermission('accounting', 'create'),
  [
    body('code')
      .notEmpty()
      .withMessage('Código de cuenta es requerido')
      .isLength({ min: 1, max: 10 })
      .withMessage('Código debe tener entre 1 y 10 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('Código debe contener solo números'),

    body('name')
      .notEmpty()
      .withMessage('Nombre de cuenta es requerido')
      .isLength({ min: 3, max: 100 })
      .withMessage('Nombre debe tener entre 3 y 100 caracteres'),

    body('accountType')
      .isIn(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'])
      .withMessage('Tipo de cuenta inválido'),

    body('parentId')
      .optional()
      .isString()
      .withMessage('ID de cuenta padre debe ser una cadena'),

    body('level')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Nivel debe ser entre 1 y 5')
  ],
  createAccount
);

// ===================================
// TRANSACCIONES
// ===================================

/**
 * GET /api/accounting/transactions
 * Obtener transacciones
 */
router.get('/transactions',
  auth,
  checkPermission('accounting', 'read'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página debe ser un número positivo'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Límite debe ser entre 1 y 100'),

    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe ser válida'),

    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe ser válida')
  ],
  getTransactions
);

/**
 * POST /api/accounting/transactions
 * Crear nueva transacción
 */
router.post('/transactions',
  auth,
  checkPermission('accounting', 'create'),
  [
    body('date')
      .isISO8601()
      .withMessage('Fecha debe ser válida'),

    body('reference')
      .notEmpty()
      .withMessage('Referencia es requerida')
      .isLength({ min: 1, max: 50 })
      .withMessage('Referencia debe tener entre 1 y 50 caracteres'),

    body('description')
      .notEmpty()
      .withMessage('Descripción es requerida')
      .isLength({ min: 5, max: 200 })
      .withMessage('Descripción debe tener entre 5 y 200 caracteres'),

    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Monto debe ser mayor a 0'),

    body('type')
      .isIn(['INCOME', 'EXPENSE', 'TRANSFER'])
      .withMessage('Tipo de transacción inválido'),

    body('debitAccountId')
      .notEmpty()
      .withMessage('Cuenta débito es requerida'),

    body('creditAccountId')
      .notEmpty()
      .withMessage('Cuenta crédito es requerida')
  ],
  createTransaction
);

// ===================================
// REPORTES
// ===================================

/**
 * GET /api/accounting/balance-sheet
 * Obtener balance general
 */
router.get('/balance-sheet',
  auth,
  checkPermission('accounting', 'read'),
  [
    query('date')
      .optional()
      .isISO8601()
      .withMessage('Fecha debe ser válida')
  ],
  getBalanceSheet
);

module.exports = router;