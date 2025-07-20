// ===================================
// EDUCONTA - Rutas de Contabilidad Simples
// ===================================

const express = require('express');
const router = express.Router();

// ===================================
// FUNCIONES AUXILIARES
// ===================================

// Almacenamiento en memoria para transacciones (simulando base de datos)
let sampleTransactions = [
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
    description: 'Transferencia de Caja a Bancos',
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

/**
 * Función para actualizar el estado de una transacción
 */
function updateTransactionStatus(transactionId, newStatus) {
  console.log('🔄 Actualizando estado de transacción:', { transactionId, newStatus });
  
  const transaction = sampleTransactions.find(t => t.id === transactionId);
  if (transaction) {
    transaction.status = newStatus;
    transaction.updatedAt = new Date().toISOString();
    console.log('✅ Estado actualizado:', transaction);
    return transaction;
  } else {
    console.log('❌ Transacción no encontrada:', transactionId);
    return null;
  }
}

/**
 * Calcular balances de cuentas padre basándose en sus hijas
 */
function calculateParentBalances(accounts) {
  // Crear una copia de las cuentas para no modificar el original
  const accountsCopy = JSON.parse(JSON.stringify(accounts));
  
  // Crear un mapa para acceso rápido por ID
  const accountMap = new Map();
  accountsCopy.forEach(account => {
    accountMap.set(account.id, account);
  });
  
  // Calcular balances de cuentas padre
  accountsCopy.forEach(account => {
    if (account.parentId === null && account.balance === 0) {
      // Es una cuenta padre, calcular balance sumando hijas
      const childrenBalance = accountsCopy
        .filter(child => child.parentId === account.id)
        .reduce((sum, child) => sum + (child.balance || 0), 0);
      
      account.balance = childrenBalance;
    }
  });
  
  return accountsCopy;
}

// ===================================
// RUTAS SIMPLES SIN MIDDLEWARE
// ===================================

/**
 * GET /api/accounting-simple/test
 * Endpoint de prueba
 */
router.get('/test', (req, res) => {
  console.log('🔧 TEST route hit!');
  res.json({
    success: true,
    message: 'Accounting simple routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * Obtener datos de cuentas de ejemplo (función auxiliar)
 */
function getSampleAccounts() {
  return [
    // ACTIVOS - Nivel 1
    {
      id: 'asset-1',
      code: '1100',
      name: 'Disponible',
      accountType: 'ASSET',
      level: 1,
      parentId: null,
      balance: 0,
      isActive: true,
      children: [],
      _count: { debitTransactions: 13, creditTransactions: 5 }
    },
    {
      id: '1',
      code: '1105',
      name: 'Caja',
      accountType: 'ASSET',
      level: 2,
      parentId: 'asset-1',
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
      parentId: 'asset-1',
      balance: 2500000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 8, creditTransactions: 3 }
    },
    {
      id: 'asset-2',
      code: '1200',
      name: 'Inversiones',
      accountType: 'ASSET',
      level: 1,
      parentId: null,
      balance: 0,
      isActive: true,
      children: [],
      _count: { debitTransactions: 3, creditTransactions: 1 }
    },
    {
      id: 'asset-3',
      code: '1205',
      name: 'Inversiones Temporales',
      accountType: 'ASSET',
      level: 2,
      parentId: 'asset-2',
      balance: 1200000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 3, creditTransactions: 1 }
    },
    // PASIVOS - Nivel 1
    {
      id: 'liability-1',
      code: '2100',
      name: 'Obligaciones Financieras',
      accountType: 'LIABILITY',
      level: 1,
      parentId: null,
      balance: 0,
      isActive: true,
      children: [],
      _count: { debitTransactions: 2, creditTransactions: 8 }
    },
    {
      id: '3',
      code: '2105',
      name: 'Proveedores',
      accountType: 'LIABILITY',
      level: 2,
      parentId: 'liability-1',
      balance: 800000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 2, creditTransactions: 6 }
    },
    {
      id: 'liability-2',
      code: '2110',
      name: 'Acreedores Varios',
      accountType: 'LIABILITY',
      level: 2,
      parentId: 'liability-1',
      balance: 700000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 0, creditTransactions: 2 }
    },
    // PATRIMONIO - Nivel 1
    {
      id: 'equity-1',
      code: '3100',
      name: 'Capital Social',
      accountType: 'EQUITY',
      level: 1,
      parentId: null,
      balance: 0,
      isActive: true,
      children: [],
      _count: { debitTransactions: 0, creditTransactions: 2 }
    },
    {
      id: '4',
      code: '3105',
      name: 'Capital Suscrito y Pagado',
      accountType: 'EQUITY',
      level: 2,
      parentId: 'equity-1',
      balance: 1000000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 0, creditTransactions: 1 }
    },
    {
      id: 'equity-2',
      code: '3110',
      name: 'Reservas',
      accountType: 'EQUITY',
      level: 2,
      parentId: 'equity-1',
      balance: 1000000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 0, creditTransactions: 1 }
    },
    // INGRESOS - Nivel 1
    {
      id: 'income-1',
      code: '4100',
      name: 'Ingresos Operacionales',
      accountType: 'INCOME',
      level: 1,
      parentId: null,
      balance: 0,
      isActive: true,
      children: [],
      _count: { debitTransactions: 1, creditTransactions: 15 }
    },
    {
      id: '5',
      code: '4135',
      name: 'Ingresos por Servicios Educativos',
      accountType: 'INCOME',
      level: 2,
      parentId: 'income-1',
      balance: 1500000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 1, creditTransactions: 10 }
    },
    {
      id: 'income-2',
      code: '4140',
      name: 'Otros Ingresos Operacionales',
      accountType: 'INCOME',
      level: 2,
      parentId: 'income-1',
      balance: 1000000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 0, creditTransactions: 5 }
    },
    // GASTOS - Nivel 1
    {
      id: 'expense-1',
      code: '5100',
      name: 'Gastos Operacionales',
      accountType: 'EXPENSE',
      level: 1,
      parentId: null,
      balance: 0,
      isActive: true,
      children: [],
      _count: { debitTransactions: 12, creditTransactions: 0 }
    },
    {
      id: '6',
      code: '5105',
      name: 'Gastos Administrativos',
      accountType: 'EXPENSE',
      level: 2,
      parentId: 'expense-1',
      balance: 300000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 4, creditTransactions: 0 }
    },
    {
      id: 'expense-2',
      code: '5110',
      name: 'Gastos de Ventas',
      accountType: 'EXPENSE',
      level: 2,
      parentId: 'expense-1',
      balance: 200000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 3, creditTransactions: 0 }
    },
    {
      id: 'expense-3',
      code: '5115',
      name: 'Gastos Financieros',
      accountType: 'EXPENSE',
      level: 2,
      parentId: 'expense-1',
      balance: 300000,
      isActive: true,
      children: [],
      _count: { debitTransactions: 5, creditTransactions: 0 }
    }
  ];
}

/**
 * GET /api/accounting-simple/stats
 * Estadísticas de contabilidad (calculadas dinámicamente)
 */
router.get('/stats', (req, res) => {
  console.log('🔧 STATS route hit!');
  
  // Obtener las mismas cuentas que se usan en /accounts
  const sampleAccounts = getSampleAccounts();
  const accountsWithCalculatedBalances = calculateParentBalances(sampleAccounts);
  
  // Calcular estadísticas dinámicamente
  const totalAccounts = accountsWithCalculatedBalances.length;
  const activeAccounts = accountsWithCalculatedBalances.filter(acc => acc.isActive).length;
  
  // Contar por tipo
  const accountsByType = {};
  accountsWithCalculatedBalances.forEach(account => {
    accountsByType[account.accountType] = (accountsByType[account.accountType] || 0) + 1;
  });
  
  // Calcular balance total (solo cuentas hijas)
  const totalBalance = accountsWithCalculatedBalances
    .filter(account => account.parentId) // Solo cuentas hijas
    .filter(account => account.accountType === 'ASSET')
    .reduce((sum, account) => sum + (account.balance || 0), 0);
  
  res.json({
    success: true,
    data: {
      totalAccounts: totalAccounts,
      activeAccounts: activeAccounts,
      totalTransactions: 3, // Número real de transacciones de ejemplo
      pendingTransactions: 1, // Número real de transacciones pendientes
      totalBalance: totalBalance,
      accountsByType: accountsByType,
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
        { date: new Date(), count: 3, amount: 850000 }
      ]
    }
  });
});

/**
 * GET /api/accounting-simple/accounts
 * Plan de cuentas
 */
router.get('/accounts', (req, res) => {
  console.log('🔧 ACCOUNTS route hit!');
  
  // Usar la MISMA fuente de datos que /stats para evitar inconsistencias
  const sampleAccounts = getSampleAccounts();
  
  // Calcular balances de cuentas padre dinámicamente
  const accountsWithCalculatedBalances = calculateParentBalances(sampleAccounts);

  res.json({
    success: true,
    data: accountsWithCalculatedBalances,
    tree: accountsWithCalculatedBalances,
    summary: {
      total: sampleAccounts.length,
      byType: {
        ASSET: 5,
        LIABILITY: 3,
        EQUITY: 3,
        INCOME: 3,
        EXPENSE: 4
      },
      byInstitution: null
    }
  });
});

/**
 * GET /api/accounting-simple/transactions
 * Transacciones
 */
router.get('/transactions', (req, res) => {
  console.log('🔧 TRANSACTIONS route hit!');
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
      description: 'Transferencia de Caja a Bancos',
      amount: 200000,
      type: 'TRANSFER',
      status: 'APPROVED',
      debitAccountId: '2', // Bancos (DÉBITO - Aumenta)
      creditAccountId: '1', // Caja (CRÉDITO - Disminuye)
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

/**
 * POST /api/accounting-simple/transactions
 * Crear nueva transacción
 */
router.post('/transactions', (req, res) => {
  console.log('🔧 CREATE TRANSACTION route hit!');
  const { date, reference, description, amount, type, debitAccountId, creditAccountId } = req.body;
  
  // Simular creación de transacción
  const newTransaction = {
    id: Date.now().toString(),
    date: date,
    reference: reference,
    description: description,
    amount: parseFloat(amount),
    type: type,
    status: 'PENDING',
    debitAccountId: debitAccountId,
    creditAccountId: creditAccountId,
    debitAccount: {
      id: debitAccountId,
      code: '1105', // Simplificado para demo
      name: 'Cuenta Débito',
      accountType: 'ASSET'
    },
    creditAccount: {
      id: creditAccountId,
      code: '4135', // Simplificado para demo
      name: 'Cuenta Crédito',
      accountType: 'INCOME'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    message: 'Transacción creada exitosamente',
    data: newTransaction
  });
});

/**
 * PUT /api/accounting-simple/transactions/:id
 * Actualizar transacción
 */
router.put('/transactions/:id', (req, res) => {
  console.log('🔧 UPDATE TRANSACTION route hit!');
  const { id } = req.params;
  const { date, reference, description, amount, type, debitAccountId, creditAccountId } = req.body;
  
  // Simular actualización de transacción
  const updatedTransaction = {
    id: id,
    date: date,
    reference: reference,
    description: description,
    amount: parseFloat(amount),
    type: type,
    status: 'PENDING',
    debitAccountId: debitAccountId,
    creditAccountId: creditAccountId,
    debitAccount: {
      id: debitAccountId,
      code: '1105',
      name: 'Cuenta Débito',
      accountType: 'ASSET'
    },
    creditAccount: {
      id: creditAccountId,
      code: '4135',
      name: 'Cuenta Crédito',
      accountType: 'INCOME'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Transacción actualizada exitosamente',
    data: updatedTransaction
  });
});

/**
 * PUT /api/accounting-simple/transactions/:id/approve
 * Aprobar transacción
 */
router.put('/transactions/:id/approve', (req, res) => {
  console.log('🔧 APPROVE TRANSACTION route hit!');
  const { id } = req.params;
  
  // Actualizar el estado en los datos de ejemplo
  updateTransactionStatus(id, 'APPROVED');
  
  const approvedTransaction = {
    id: id,
    status: 'APPROVED',
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Transacción aprobada exitosamente',
    data: approvedTransaction
  });
});

/**
 * PUT /api/accounting-simple/transactions/:id/reject
 * Rechazar transacción
 */
router.put('/transactions/:id/reject', (req, res) => {
  console.log('🔧 REJECT TRANSACTION route hit!');
  const { id } = req.params;
  
  // Simular rechazo de transacción
  const rejectedTransaction = {
    id: id,
    status: 'REJECTED',
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Transacción rechazada exitosamente',
    data: rejectedTransaction
  });
});

/**
 * DELETE /api/accounting-simple/transactions/:id
 * Eliminar transacción
 */
router.delete('/transactions/:id', (req, res) => {
  console.log('🔧 DELETE TRANSACTION route hit!');
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Transacción eliminada exitosamente'
  });
});

/**
 * POST /api/accounting-simple/accounts
 * Crear nueva cuenta
 */
router.post('/accounts', (req, res) => {
  console.log('🔧 CREATE ACCOUNT route hit!');
  const { code, name, accountType, parentId, level, initialBalance, description } = req.body;
  
  // Simular creación de cuenta
  const newAccount = {
    id: Date.now().toString(),
    code: code,
    name: name,
    accountType: accountType,
    level: level || 1,
    parentId: parentId || null,
    balance: parseFloat(initialBalance || 0),
    isActive: true,
    children: [],
    _count: { debitTransactions: 0, creditTransactions: 0 },
    description: description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    message: 'Cuenta creada exitosamente',
    data: newAccount
  });
});

/**
 * GET /api/accounting-simple/reports/balance-sheet
 * Balance General
 */
router.get('/reports/balance-sheet', (req, res) => {
  console.log('🔧 BALANCE SHEET route hit!');
  const { date } = req.query;
  
  // Datos de ejemplo para el balance general
  const balanceSheetData = {
    date: date || new Date().toISOString(),
    assets: [
      { code: '1105', name: 'Caja', balance: 500000 },
      { code: '1110', name: 'Bancos', balance: 2500000 },
      { code: '1205', name: 'Inversiones Temporales', balance: 1200000 }
    ],
    liabilities: [
      { code: '2105', name: 'Proveedores', balance: 800000 },
      { code: '2110', name: 'Acreedores Varios', balance: 700000 }
    ],
    equity: [
      { code: '3105', name: 'Capital Suscrito y Pagado', balance: 1000000 },
      { code: '3110', name: 'Reservas', balance: 1000000 }
    ],
    totalAssets: 4200000,
    totalLiabilities: 1500000,
    totalEquity: 2000000,
    retainedEarnings: 700000 // Diferencia para cuadrar el balance
  };

  res.json({
    success: true,
    data: balanceSheetData
  });
});

/**
 * GET /api/accounting-simple/reports/income-statement
 * Estado de Resultados
 */
router.get('/reports/income-statement', (req, res) => {
  console.log('🔧 INCOME STATEMENT route hit!');
  const { date, startDate, endDate } = req.query;
  
  // Datos de ejemplo para el estado de resultados
  const incomeStatementData = {
    period: {
      startDate: startDate || new Date(new Date().getFullYear(), 0, 1).toISOString(),
      endDate: endDate || date || new Date().toISOString()
    },
    income: [
      { code: '4135', name: 'Ingresos por Servicios Educativos', balance: 1500000 },
      { code: '4140', name: 'Otros Ingresos Operacionales', balance: 1000000 }
    ],
    expenses: [
      { code: '5105', name: 'Gastos Administrativos', balance: 300000 },
      { code: '5110', name: 'Gastos de Ventas', balance: 200000 },
      { code: '5115', name: 'Gastos Financieros', balance: 300000 }
    ],
    totalIncome: 2500000,
    totalExpenses: 800000,
    netIncome: 1700000,
    grossMargin: 2500000, // En este caso igual a ingresos totales
    operatingIncome: 2200000 // Ingresos - gastos operacionales
  };

  res.json({
    success: true,
    data: incomeStatementData
  });
});

module.exports = router;