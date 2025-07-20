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
router.get('/test', (_req, res) => {
  res.json({
    success: true,
    message: 'Accounting routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/accounting/test-stats
 * Endpoint de prueba para estadísticas sin autenticación
 */
router.get('/test-stats', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Stats endpoint working!',
      data: {
        totalAccounts: 15,
        activeAccounts: 15,
        totalTransactions: 25,
        pendingTransactions: 3,
        totalBalance: 1250000,
        accountsByType: {
          ASSET: 5,
          LIABILITY: 3,
          EQUITY: 2,
          INCOME: 3,
          EXPENSE: 2
        },
        recentTransactions: [
          {
            id: '1',
            reference: 'FAC-001',
            description: 'Venta de servicios',
            amount: 500000,
            date: new Date().toISOString()
          }
        ],
        transactionsByMonth: [
          { date: new Date(), count: 10, amount: 1000000 }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/accounting/test-accounts
 * Endpoint de prueba para cuentas sin autenticación
 */
router.get('/test-accounts', async (req, res) => {
  try {
    const sampleAccounts = [
      {
        id: '1',
        code: '1105',
        name: 'Caja',
        accountType: 'ASSET',
        level: 2,
        parentId: null,
        balance: 500000,
        isActive: true,
        children: []
      },
      {
        id: '2',
        code: '1110',
        name: 'Bancos',
        accountType: 'ASSET',
        level: 2,
        parentId: null,
        balance: 2500000,
        isActive: true,
        children: []
      },
      {
        id: '3',
        code: '2105',
        name: 'Proveedores',
        accountType: 'LIABILITY',
        level: 2,
        parentId: null,
        balance: 800000,
        isActive: true,
        children: []
      },
      {
        id: '4',
        code: '3105',
        name: 'Capital Social',
        accountType: 'EQUITY',
        level: 2,
        parentId: null,
        balance: 1000000,
        isActive: true,
        children: []
      },
      {
        id: '5',
        code: '4135',
        name: 'Ingresos por Servicios',
        accountType: 'INCOME',
        level: 2,
        parentId: null,
        balance: 1500000,
        isActive: true,
        children: []
      },
      {
        id: '6',
        code: '5105',
        name: 'Gastos Administrativos',
        accountType: 'EXPENSE',
        level: 2,
        parentId: null,
        balance: 300000,
        isActive: true,
        children: []
      }
    ];

    res.json({
      success: true,
      message: 'Accounts endpoint working!',
      data: sampleAccounts,
      tree: sampleAccounts,
      summary: {
        total: sampleAccounts.length,
        byType: {
          ASSET: 2,
          LIABILITY: 1,
          EQUITY: 1,
          INCOME: 1,
          EXPENSE: 1
        },
        byInstitution: null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/accounting/test-transactions
 * Endpoint de prueba para transacciones sin autenticación
 */
router.get('/test-transactions', async (req, res) => {
  try {
    const sampleTransactions = [
      {
        id: '1',
        date: new Date().toISOString(),
        reference: 'FAC-001',
        description: 'Venta de servicios educativos',
        amount: 500000,
        type: 'INCOME',
        status: 'APPROVED',
        debitAccountId: '1',
        creditAccountId: '5',
        debitAccount: {
          id: '1',
          code: '1105',
          name: 'Caja',
          accountType: 'ASSET'
        },
        creditAccount: {
          id: '5',
          code: '4135',
          name: 'Ingresos por Servicios',
          accountType: 'INCOME'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        date: new Date().toISOString(),
        reference: 'REC-001',
        description: 'Pago de servicios públicos',
        amount: 150000,
        type: 'EXPENSE',
        status: 'PENDING',
        debitAccountId: '6',
        creditAccountId: '1',
        debitAccount: {
          id: '6',
          code: '5105',
          name: 'Gastos Administrativos',
          accountType: 'EXPENSE'
        },
        creditAccount: {
          id: '1',
          code: '1105',
          name: 'Caja',
          accountType: 'ASSET'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: sampleTransactions,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: sampleTransactions.length,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// ESTADÍSTICAS
// ===================================

/**
 * GET /api/accounting/stats
 * Obtener estadísticas de contabilidad (SIN AUTH TEMPORALMENTE)
 */
router.get('/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalAccounts: 15,
        activeAccounts: 15,
        totalTransactions: 25,
        pendingTransactions: 3,
        totalBalance: 1250000,
        accountsByType: {
          ASSET: 5,
          LIABILITY: 3,
          EQUITY: 2,
          INCOME: 3,
          EXPENSE: 2
        },
        recentTransactions: [
          {
            id: '1',
            reference: 'FAC-001',
            description: 'Venta de servicios',
            amount: 500000,
            date: new Date().toISOString()
          }
        ],
        transactionsByMonth: [
          { date: new Date(), count: 10, amount: 1000000 }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// PLAN DE CUENTAS
// ===================================

/**
 * GET /api/accounting/accounts
 * Obtener plan de cuentas (SIN AUTH TEMPORALMENTE)
 */
router.get('/accounts', async (req, res) => {
  try {
    const sampleAccounts = [
      {
        id: '1',
        code: '1105',
        name: 'Caja',
        accountType: 'ASSET',
        level: 2,
        parentId: null,
        balance: 500000,
        isActive: true,
        children: [],
        _count: { debitTransactions: 5, creditTransactions: 2 }
      },
      {
        id: '2',
        code: '1110',
        name: 'Bancos',
        accountType: 'ASSET',
        level: 2,
        parentId: null,
        balance: 2500000,
        isActive: true,
        children: [],
        _count: { debitTransactions: 8, creditTransactions: 3 }
      },
      {
        id: '3',
        code: '2105',
        name: 'Proveedores',
        accountType: 'LIABILITY',
        level: 2,
        parentId: null,
        balance: 800000,
        isActive: true,
        children: [],
        _count: { debitTransactions: 2, creditTransactions: 6 }
      },
      {
        id: '4',
        code: '3105',
        name: 'Capital Social',
        accountType: 'EQUITY',
        level: 2,
        parentId: null,
        balance: 1000000,
        isActive: true,
        children: [],
        _count: { debitTransactions: 0, creditTransactions: 1 }
      },
      {
        id: '5',
        code: '4135',
        name: 'Ingresos por Servicios',
        accountType: 'INCOME',
        level: 2,
        parentId: null,
        balance: 1500000,
        isActive: true,
        children: [],
        _count: { debitTransactions: 1, creditTransactions: 10 }
      },
      {
        id: '6',
        code: '5105',
        name: 'Gastos Administrativos',
        accountType: 'EXPENSE',
        level: 2,
        parentId: null,
        balance: 300000,
        isActive: true,
        children: [],
        _count: { debitTransactions: 4, creditTransactions: 0 }
      }
    ];

    res.json({
      success: true,
      data: sampleAccounts,
      tree: sampleAccounts,
      summary: {
        total: sampleAccounts.length,
        byType: {
          ASSET: 2,
          LIABILITY: 1,
          EQUITY: 1,
          INCOME: 1,
          EXPENSE: 1
        },
        byInstitution: null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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
 * Obtener transacciones (SIN AUTH TEMPORALMENTE)
 */
router.get('/transactions', async (req, res) => {
  try {
    const sampleTransactions = [
      {
        id: '1',
        date: new Date().toISOString(),
        reference: 'FAC-001',
        description: 'Venta de servicios educativos',
        amount: 500000,
        type: 'INCOME',
        status: 'APPROVED',
        debitAccountId: '1',
        creditAccountId: '5',
        debitAccount: {
          id: '1',
          code: '1105',
          name: 'Caja',
          accountType: 'ASSET'
        },
        creditAccount: {
          id: '5',
          code: '4135',
          name: 'Ingresos por Servicios',
          accountType: 'INCOME'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        date: new Date().toISOString(),
        reference: 'REC-001',
        description: 'Pago de servicios públicos',
        amount: 150000,
        type: 'EXPENSE',
        status: 'PENDING',
        debitAccountId: '6',
        creditAccountId: '1',
        debitAccount: {
          id: '6',
          code: '5105',
          name: 'Gastos Administrativos',
          accountType: 'EXPENSE'
        },
        creditAccount: {
          id: '1',
          code: '1105',
          name: 'Caja',
          accountType: 'ASSET'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        reference: 'TRF-001',
        description: 'Transferencia entre cuentas',
        amount: 200000,
        type: 'TRANSFER',
        status: 'APPROVED',
        debitAccountId: '2',
        creditAccountId: '1',
        debitAccount: {
          id: '2',
          code: '1110',
          name: 'Bancos',
          accountType: 'ASSET'
        },
        creditAccount: {
          id: '1',
          code: '1105',
          name: 'Caja',
          accountType: 'ASSET'
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: sampleTransactions,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: sampleTransactions.length,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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

// ===================================
// RUTAS DE DESARROLLO (SIN MIDDLEWARE)
// ===================================

/**
 * GET /api/accounting/dev-stats
 * Estadísticas sin middleware para desarrollo
 */
router.get('/dev-stats', (req, res) => {
  console.log('🔧 DEV-STATS route hit!');
  res.json({
    success: true,
    data: {
      totalAccounts: 15,
      activeAccounts: 15,
      totalTransactions: 25,
      pendingTransactions: 3,
      totalBalance: 1250000,
      accountsByType: {
        ASSET: 5,
        LIABILITY: 3,
        EQUITY: 2,
        INCOME: 3,
        EXPENSE: 2
      },
      recentTransactions: [
        {
          id: '1',
          reference: 'FAC-001',
          description: 'Venta de servicios',
          amount: 500000,
          date: new Date().toISOString()
        }
      ],
      transactionsByMonth: [
        { date: new Date(), count: 10, amount: 1000000 }
      ]
    }
  });
});

/**
 * GET /api/accounting/dev-accounts
 * Cuentas sin middleware para desarrollo
 */
router.get('/dev-accounts', (req, res) => {
  const sampleAccounts = [
    {
      id: '1',
      code: '1105',
      name: 'Caja',
      accountType: 'ASSET',
      level: 2,
      parentId: null,
      balance: 500000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 5, creditTransactions: 2 }
    },
    {
      id: '2',
      code: '1110',
      name: 'Bancos',
      accountType: 'ASSET',
      level: 2,
      parentId: null,
      balance: 2500000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 8, creditTransactions: 3 }
    },
    {
      id: '3',
      code: '2105',
      name: 'Proveedores',
      accountType: 'LIABILITY',
      level: 2,
      parentId: null,
      balance: 800000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 2, creditTransactions: 6 }
    },
    {
      id: '4',
      code: '3105',
      name: 'Capital Social',
      accountType: 'EQUITY',
      level: 2,
      parentId: null,
      balance: 1000000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 0, creditTransactions: 1 }
    },
    {
      id: '5',
      code: '4135',
      name: 'Ingresos por Servicios',
      accountType: 'INCOME',
      level: 2,
      parentId: null,
      balance: 1500000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 1, creditTransactions: 10 }
    },
    {
      id: '6',
      code: '5105',
      name: 'Gastos Administrativos',
      accountType: 'EXPENSE',
      level: 2,
      parentId: null,
      balance: 300000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 4, creditTransactions: 0 }
    }
  ];

  res.json({
    success: true,
    data: sampleAccounts,
    tree: sampleAccounts,
    summary: {
      total: sampleAccounts.length,
      byType: {
        ASSET: 2,
        LIABILITY: 1,
        EQUITY: 1,
        INCOME: 1,
        EXPENSE: 1
      },
      byInstitution: null
    }
  });
});

/**
 * GET /api/accounting/dev-transactions
 * Transacciones sin middleware para desarrollo
 */
router.get('/dev-transactions', (req, res) => {
  const sampleTransactions = [
    {
      id: '1',
      date: new Date().toISOString(),
      reference: 'FAC-001',
      description: 'Venta de servicios educativos',
      amount: 500000,
      type: 'INCOME',
      status: 'APPROVED',
      debitAccountId: '1',
      creditAccountId: '5',
      debitAccount: {
        id: '1',
        code: '1105',
        name: 'Caja',
        accountType: 'ASSET'
      },
      creditAccount: {
        id: '5',
        code: '4135',
        name: 'Ingresos por Servicios',
        accountType: 'INCOME'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      date: new Date().toISOString(),
      reference: 'REC-001',
      description: 'Pago de servicios públicos',
      amount: 150000,
      type: 'EXPENSE',
      status: 'PENDING',
      debitAccountId: '6',
      creditAccountId: '1',
      debitAccount: {
        id: '6',
        code: '5105',
        name: 'Gastos Administrativos',
        accountType: 'EXPENSE'
      },
      creditAccount: {
        id: '1',
        code: '1105',
        name: 'Caja',
        accountType: 'ASSET'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      date: new Date(Date.now() - 86400000).toISOString(),
      reference: 'TRF-001',
      description: 'Transferencia entre cuentas',
      amount: 200000,
      type: 'TRANSFER',
      status: 'APPROVED',
      debitAccountId: '2',
      creditAccountId: '1',
      debitAccount: {
        id: '2',
        code: '1110',
        name: 'Bancos',
        accountType: 'ASSET'
      },
      creditAccount: {
        id: '1',
        code: '1105',
        name: 'Caja',
        accountType: 'ASSET'
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  res.json({
    success: true,
    data: sampleTransactions,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: sampleTransactions.length,
      limit: 20,
      hasNextPage: false,
      hasPrevPage: false
    }
  });
});

module.exports = router;