// ===================================
// EDUCONTA - Rutas de Contabilidad Mínimas (Test)
// ===================================

const express = require('express');
const router = express.Router();

// Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');

// ===================================
// RUTAS BÁSICAS DE PRUEBA
// ===================================

/**
 * GET /api/accounting/test
 * Endpoint de prueba básico
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Accounting routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/accounting/stats
 * Estadísticas completas con autenticación y validaciones
 */
router.get('/stats', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado o usar fallback
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Validar parámetros de entrada
    const period = req.query.period && ['day', 'week', 'month', 'year'].includes(req.query.period) ? req.query.period : 'month';
    const includeCharts = req.query.charts === 'true';
    
    // Calcular fechas según el período
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [
      totalAccounts,
      activeAccounts,
      totalTransactions,
      approvedTransactions,
      pendingTransactions,
      rejectedTransactions,
      recentTransactions,
      totalIncome,
      totalExpenses,
      accountsByType
    ] = await Promise.all([
      // Conteo de cuentas
      prisma.account.count({
        where: { institutionId }
      }),
      prisma.account.count({
        where: { institutionId, isActive: true }
      }),
      
      // Conteo de transacciones
      prisma.transaction.count({
        where: { institutionId }
      }),
      prisma.transaction.count({
        where: { institutionId, status: 'APPROVED' }
      }),
      prisma.transaction.count({
        where: { institutionId, status: 'PENDING' }
      }),
      prisma.transaction.count({
        where: { institutionId, status: 'REJECTED' }
      }),
      
      // Transacciones recientes
      prisma.transaction.findMany({
        where: {
          institutionId,
          date: {
            gte: startDate
          }
        },
        include: {
          debitAccount: {
            select: { code: true, name: true }
          },
          creditAccount: {
            select: { code: true, name: true }
          }
        },
        orderBy: { date: 'desc' },
        take: 5
      }),
      
      // Totales financieros
      prisma.transaction.aggregate({
        where: {
          institutionId,
          status: 'APPROVED',
          type: 'INCOME',
          date: {
            gte: startDate
          }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.transaction.aggregate({
        where: {
          institutionId,
          status: 'APPROVED',
          type: 'EXPENSE',
          date: {
            gte: startDate
          }
        },
        _sum: {
          amount: true
        }
      }),
      
      // Cuentas por tipo
      prisma.account.groupBy({
        by: ['accountType'],
        where: {
          institutionId,
          isActive: true
        },
        _count: {
          accountType: true
        }
      })
    ]);
    
    // Calcular métricas derivadas
    const incomeAmount = totalIncome._sum.amount || 0;
    const expenseAmount = totalExpenses._sum.amount || 0;
    const netIncome = incomeAmount - expenseAmount;
    const transactionApprovalRate = totalTransactions > 0 ? (approvedTransactions / totalTransactions * 100).toFixed(2) : 0;
    
    // Preparar datos para gráficos si se solicita
    let chartData = null;
    if (includeCharts) {
      chartData = {
        accountTypes: accountsByType.map(item => ({
          type: item.accountType,
          count: item._count.accountType
        })),
        transactionStatus: [
          { status: 'APPROVED', count: approvedTransactions },
          { status: 'PENDING', count: pendingTransactions },
          { status: 'REJECTED', count: rejectedTransactions }
        ]
      };
    }
    
    res.json({
      success: true,
      data: {
        // Resumen general
        summary: {
          totalAccounts,
          activeAccounts,
          inactiveAccounts: totalAccounts - activeAccounts,
          totalTransactions,
          approvedTransactions,
          pendingTransactions,
          rejectedTransactions,
          transactionApprovalRate: parseFloat(transactionApprovalRate)
        },
        
        // Métricas financieras
        financial: {
          totalIncome: incomeAmount,
          totalExpenses: expenseAmount,
          netIncome,
          period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        },
        
        // Transacciones recientes
        recentTransactions,
        
        // Distribución de cuentas por tipo
        accountDistribution: accountsByType,
        
        // Datos para gráficos (opcional)
        charts: chartData
      },
      message: `Complete stats for ${period} period working!`
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/accounting/accounts
 * Cuentas con autenticación, filtros y jerarquía
 */
router.get('/accounts', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado o usar fallback
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Validar y sanitizar parámetros de entrada
    const accountType = req.query.type && ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].includes(req.query.type) ? req.query.type : null;
    const isActive = req.query.active !== undefined ? req.query.active === 'true' : null;
    const search = req.query.search && typeof req.query.search === 'string' ? req.query.search.trim() : null;
    const includeBalance = req.query.includeBalance === 'true';
    
    // Construir filtros dinámicos
    const where = {
      institutionId: institutionId
    };
    
    if (accountType) {
      where.accountType = accountType;
    }
    
    if (isActive !== null) {
      where.isActive = isActive;
    }
    
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          code: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }
    
    // Obtener cuentas con información completa
    const accounts = await prisma.account.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            code: true,
            name: true,
            accountType: true,
            isActive: true
          },
          where: {
            isActive: true
          }
        },
        _count: {
          select: {
            debitTransactions: true,
            creditTransactions: true,
            children: true
          }
        }
      },
      orderBy: [
        { code: 'asc' },
        { name: 'asc' }
      ]
    });
    
    // Calcular balances si se solicita
    let accountsWithBalance = accounts;
    if (includeBalance) {
      accountsWithBalance = await Promise.all(
        accounts.map(async (account) => {
          // Calcular balance basado en transacciones
          const debitTotal = await prisma.transaction.aggregate({
            where: {
              debitAccountId: account.id,
              status: 'APPROVED'
            },
            _sum: {
              amount: true
            }
          });
          
          const creditTotal = await prisma.transaction.aggregate({
            where: {
              creditAccountId: account.id,
              status: 'APPROVED'
            },
            _sum: {
              amount: true
            }
          });
          
          const debitAmount = debitTotal._sum.amount || 0;
          const creditAmount = creditTotal._sum.amount || 0;
          
          // El balance depende del tipo de cuenta
          let balance = 0;
          if (['ASSET', 'EXPENSE'].includes(account.accountType)) {
            balance = debitAmount - creditAmount;
          } else {
            balance = creditAmount - debitAmount;
          }
          
          return {
            ...account,
            balance: balance,
            debitTotal: debitAmount,
            creditTotal: creditAmount
          };
        })
      );
    }
    
    res.json({
      success: true,
      data: accountsWithBalance,
      filters: {
        accountType,
        isActive,
        search,
        includeBalance
      },
      summary: {
        totalAccounts: accounts.length,
        activeAccounts: accounts.filter(a => a.isActive).length,
        inactiveAccounts: accounts.filter(a => !a.isActive).length
      },
      message: 'Accounts with filters and hierarchy working!'
    });
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/accounting/transactions
 * Transacciones con autenticación, paginación y filtros
 */
router.get('/transactions', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado o usar fallback
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Validar y sanitizar parámetros de entrada
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const status = req.query.status && ['PENDING', 'APPROVED', 'REJECTED'].includes(req.query.status) ? req.query.status : null;
    const type = req.query.type && ['INCOME', 'EXPENSE', 'TRANSFER'].includes(req.query.type) ? req.query.type : null;
    const accountId = req.query.accountId && typeof req.query.accountId === 'string' ? req.query.accountId.trim() : null;
    
    const skip = (page - 1) * limit;
    
    // Construir filtros dinámicos
    const where = {
      institutionId: institutionId
    };
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (accountId) {
      where.OR = [
        { debitAccountId: accountId },
        { creditAccountId: accountId }
      ];
    }
    
    // Obtener transacciones con paginación
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          debitAccount: {
            select: {
              id: true,
              code: true,
              name: true,
              accountType: true
            }
          },
          creditAccount: {
            select: {
              id: true,
              code: true,
              name: true,
              accountType: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        status,
        type,
        accountId
      },
      message: 'Transactions with pagination and filters working!'
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// CRUD OPERATIONS - CREATE
// ===================================

/**
 * POST /api/accounting/accounts
 * Crear nueva cuenta contable
 */
router.post('/accounts', authenticate, checkPermission('accounting', 'create'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId;
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }
    
    // Validar datos de entrada
    const { code, name, accountType, parentId, description, isActive = true } = req.body;
    
    // Validaciones básicas
    if (!code || !name || !accountType) {
      return res.status(400).json({
        success: false,
        error: 'Código, nombre y tipo de cuenta son requeridos'
      });
    }
    
    // Validar tipo de cuenta
    const validAccountTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
    if (!validAccountTypes.includes(accountType)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de cuenta inválido. Debe ser: ' + validAccountTypes.join(', ')
      });
    }
    
    // Verificar que el código no exista en la institución
    const existingAccount = await prisma.account.findFirst({
      where: {
        institutionId,
        code: code.trim()
      }
    });
    
    if (existingAccount) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una cuenta con este código en la institución'
      });
    }
    
    // Verificar cuenta padre si se proporciona
    let parentAccount = null;
    if (parentId) {
      parentAccount = await prisma.account.findFirst({
        where: {
          id: parentId,
          institutionId
        }
      });
      
      if (!parentAccount) {
        return res.status(404).json({
          success: false,
          error: 'Cuenta padre no encontrada'
        });
      }
      
      // Verificar que la cuenta padre sea del mismo tipo o compatible
      if (parentAccount.accountType !== accountType) {
        return res.status(400).json({
          success: false,
          error: 'La cuenta padre debe ser del mismo tipo'
        });
      }
    }
    
    // Crear la nueva cuenta
    const newAccount = await prisma.account.create({
      data: {
        code: code.trim(),
        name: name.trim(),
        accountType,
        description: description?.trim() || null,
        isActive: Boolean(isActive),
        institutionId,
        parentId: parentId || null
      },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        _count: {
          select: {
            children: true,
            debitTransactions: true,
            creditTransactions: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: newAccount,
      message: 'Cuenta creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/accounting/transactions
 * Crear nueva transacción contable
 */
router.post('/transactions', authenticate, checkPermission('accounting', 'create'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId;
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }
    
    // Validar datos de entrada
    const {
      date,
      reference,
      description,
      amount,
      type,
      status = 'PENDING',
      debitAccountId,
      creditAccountId,
      categoryId
    } = req.body;
    
    // Validaciones básicas
    if (!date || !description || !amount || !type || !debitAccountId || !creditAccountId) {
      return res.status(400).json({
        success: false,
        error: 'Fecha, descripción, monto, tipo, cuenta débito y cuenta crédito son requeridos'
      });
    }
    
    // Validar tipo de transacción
    const validTransactionTypes = ['INCOME', 'EXPENSE', 'TRANSFER'];
    if (!validTransactionTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de transacción inválido. Debe ser: ' + validTransactionTypes.join(', ')
      });
    }
    
    // Validar estado
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido. Debe ser: ' + validStatuses.join(', ')
      });
    }
    
    // Validar monto
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'El monto debe ser un número positivo'
      });
    }
    
    // Validar fecha
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Fecha inválida'
      });
    }
    
    // Verificar que las cuentas existan y pertenezcan a la institución
    const [debitAccount, creditAccount] = await Promise.all([
      prisma.account.findFirst({
        where: {
          id: debitAccountId,
          institutionId,
          isActive: true
        }
      }),
      prisma.account.findFirst({
        where: {
          id: creditAccountId,
          institutionId,
          isActive: true
        }
      })
    ]);
    
    if (!debitAccount) {
      return res.status(404).json({
        success: false,
        error: 'Cuenta débito no encontrada o inactiva'
      });
    }
    
    if (!creditAccount) {
      return res.status(404).json({
        success: false,
        error: 'Cuenta crédito no encontrada o inactiva'
      });
    }
    
    // Verificar que no sean la misma cuenta
    if (debitAccountId === creditAccountId) {
      return res.status(400).json({
        success: false,
        error: 'La cuenta débito y crédito no pueden ser la misma'
      });
    }
    
    // Verificar categoría si se proporciona
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          institutionId
        }
      });
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
      }
    }
    
    // Crear la nueva transacción
    const newTransaction = await prisma.transaction.create({
      data: {
        date: transactionDate,
        reference: reference?.trim() || null,
        description: description.trim(),
        amount: numericAmount,
        type,
        status,
        debitAccountId,
        creditAccountId,
        categoryId: categoryId || null,
        institutionId
      },
      include: {
        debitAccount: {
          select: {
            id: true,
            code: true,
            name: true,
            accountType: true
          }
        },
        creditAccount: {
          select: {
            id: true,
            code: true,
            name: true,
            accountType: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: newTransaction,
      message: 'Transacción creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// CRUD OPERATIONS - UPDATE
// ===================================

/**
 * PUT /api/accounting/accounts/:id
 * Actualizar cuenta contable existente
 */
router.put('/accounts/:id', authenticate, checkPermission('accounting', 'update'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId;
    const accountId = req.params.id;
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }
    
    // Verificar que la cuenta exista y pertenezca a la institución
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: accountId,
        institutionId
      }
    });
    
    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        error: 'Cuenta no encontrada'
      });
    }
    
    // Validar datos de entrada
    const { code, name, accountType, parentId, description, isActive } = req.body;
    
    // Preparar datos para actualizar (solo campos proporcionados)
    const updateData = {};
    
    if (code !== undefined) {
      if (!code.trim()) {
        return res.status(400).json({
          success: false,
          error: 'El código no puede estar vacío'
        });
      }
      
      // Verificar que el nuevo código no exista en otra cuenta
      const codeExists = await prisma.account.findFirst({
        where: {
          institutionId,
          code: code.trim(),
          id: { not: accountId }
        }
      });
      
      if (codeExists) {
        return res.status(409).json({
          success: false,
          error: 'Ya existe otra cuenta con este código'
        });
      }
      
      updateData.code = code.trim();
    }
    
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'El nombre no puede estar vacío'
        });
      }
      updateData.name = name.trim();
    }
    
    if (accountType !== undefined) {
      const validAccountTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
      if (!validAccountTypes.includes(accountType)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de cuenta inválido. Debe ser: ' + validAccountTypes.join(', ')
        });
      }
      updateData.accountType = accountType;
    }
    
    if (parentId !== undefined) {
      if (parentId === null) {
        updateData.parentId = null;
      } else {
        // Verificar que la cuenta padre exista
        const parentAccount = await prisma.account.findFirst({
          where: {
            id: parentId,
            institutionId
          }
        });
        
        if (!parentAccount) {
          return res.status(404).json({
            success: false,
            error: 'Cuenta padre no encontrada'
          });
        }
        
        // Verificar que no se cree un ciclo (la cuenta padre no puede ser descendiente)
        if (parentId === accountId) {
          return res.status(400).json({
            success: false,
            error: 'Una cuenta no puede ser padre de sí misma'
          });
        }
        
        updateData.parentId = parentId;
      }
    }
    
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
      
      // Si se desactiva la cuenta, verificar que no tenga transacciones pendientes
      if (!isActive) {
        const pendingTransactions = await prisma.transaction.count({
          where: {
            institutionId,
            status: 'PENDING',
            OR: [
              { debitAccountId: accountId },
              { creditAccountId: accountId }
            ]
          }
        });
        
        if (pendingTransactions > 0) {
          return res.status(400).json({
            success: false,
            error: 'No se puede desactivar una cuenta con transacciones pendientes'
          });
        }
      }
    }
    
    // Actualizar la cuenta
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            code: true,
            name: true,
            accountType: true,
            isActive: true
          }
        },
        _count: {
          select: {
            children: true,
            debitTransactions: true,
            creditTransactions: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: updatedAccount,
      message: 'Cuenta actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/accounting/transactions/:id
 * Actualizar transacción contable existente
 */
router.put('/transactions/:id', authenticate, checkPermission('accounting', 'update'), async (req, res) => {
  try {
   // Obtener institutionId del usuario autenticado o usar fallback
const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
const transactionId = req.params.id;
    
        
    // Verificar que la transacción exista y pertenezca a la institución
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        institutionId
      }
    });
    
    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada'
      });
    }
    
    // Permitir cambios de estado para aprobación/rechazo
    // Solo bloquear edición de datos si ya está aprobada y no es cambio de estado
    if (existingTransaction.status === 'APPROVED' && !req.body.status) {
      return res.status(400).json({
        success: false,
        error: 'No se pueden editar transacciones aprobadas (solo cambio de estado)'
      });
    }
    
    // Validar datos de entrada
    const {
      date,
      reference,
      description,
      amount,
      type,
      status,
      debitAccountId,
      creditAccountId,
      categoryId
    } = req.body;
    
    // Preparar datos para actualizar (solo campos proporcionados)
    const updateData = {};
    
    if (date !== undefined) {
      const transactionDate = new Date(date);
      if (isNaN(transactionDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Fecha inválida'
        });
      }
      updateData.date = transactionDate;
    }
    
    if (reference !== undefined) {
      updateData.reference = reference?.trim() || null;
    }
    
    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          error: 'La descripción no puede estar vacía'
        });
      }
      updateData.description = description.trim();
    }
    
    if (amount !== undefined) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'El monto debe ser un número positivo'
        });
      }
      updateData.amount = numericAmount;
    }
    
    if (type !== undefined) {
      const validTransactionTypes = ['INCOME', 'EXPENSE', 'TRANSFER'];
      if (!validTransactionTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de transacción inválido. Debe ser: ' + validTransactionTypes.join(', ')
        });
      }
      updateData.type = type;
    }
    
    if (status !== undefined) {
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido. Debe ser: ' + validStatuses.join(', ')
        });
      }
      updateData.status = status;
    }
    
    // Validar cuentas si se proporcionan
    if (debitAccountId !== undefined || creditAccountId !== undefined) {
      const newDebitAccountId = debitAccountId || existingTransaction.debitAccountId;
      const newCreditAccountId = creditAccountId || existingTransaction.creditAccountId;
      
      // Verificar que no sean la misma cuenta
      if (newDebitAccountId === newCreditAccountId) {
        return res.status(400).json({
          success: false,
          error: 'La cuenta débito y crédito no pueden ser la misma'
        });
      }
      
      // Verificar que las cuentas existan y estén activas
      const [debitAccount, creditAccount] = await Promise.all([
        prisma.account.findFirst({
          where: {
            id: newDebitAccountId,
            institutionId,
            isActive: true
          }
        }),
        prisma.account.findFirst({
          where: {
            id: newCreditAccountId,
            institutionId,
            isActive: true
          }
        })
      ]);
      
      if (!debitAccount) {
        return res.status(404).json({
          success: false,
          error: 'Cuenta débito no encontrada o inactiva'
        });
      }
      
      if (!creditAccount) {
        return res.status(404).json({
          success: false,
          error: 'Cuenta crédito no encontrada o inactiva'
        });
      }
      
      if (debitAccountId !== undefined) {
        updateData.debitAccountId = debitAccountId;
      }
      if (creditAccountId !== undefined) {
        updateData.creditAccountId = creditAccountId;
      }
    }
    
    if (categoryId !== undefined) {
      if (categoryId === null) {
        updateData.categoryId = null;
      } else {
        const category = await prisma.category.findFirst({
          where: {
            id: categoryId,
            institutionId
          }
        });
        
        if (!category) {
          return res.status(404).json({
            success: false,
            error: 'Categoría no encontrada'
          });
        }
        
        updateData.categoryId = categoryId;
      }
    }
    
    // Actualizar la transacción
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        debitAccount: {
          select: {
            id: true,
            code: true,
            name: true,
            accountType: true
          }
        },
        creditAccount: {
          select: {
            id: true,
            code: true,
            name: true,
            accountType: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: updatedTransaction,
      message: 'Transacción actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// CRUD OPERATIONS - DELETE
// ===================================

/**
 * DELETE /api/accounting/accounts/:id
 * Eliminar cuenta contable (soft delete)
 */
router.delete('/accounts/:id', authenticate, checkPermission('accounting', 'delete'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId;
    const accountId = req.params.id;
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }
    
    // Verificar que la cuenta exista y pertenezca a la institución
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: accountId,
        institutionId
      },
      include: {
        children: true,
        _count: {
          select: {
            debitTransactions: true,
            creditTransactions: true
          }
        }
      }
    });
    
    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        error: 'Cuenta no encontrada'
      });
    }
    
    // Verificar que no tenga transacciones asociadas
    const totalTransactions = existingAccount._count.debitTransactions + existingAccount._count.creditTransactions;
    if (totalTransactions > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar la cuenta. Tiene ${totalTransactions} transacciones asociadas. Desactívela en su lugar.`
      });
    }
    
    // Verificar que no tenga cuentas hijas
    if (existingAccount.children.length > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar la cuenta. Tiene ${existingAccount.children.length} cuentas hijas. Elimine o reasigne las cuentas hijas primero.`
      });
    }
    
    // Eliminar la cuenta (hard delete ya que no tiene dependencias)
    await prisma.account.delete({
      where: { id: accountId }
    });
    
    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/accounting/transactions/:id
 * Anular transacción contable
 */
router.delete('/transactions/:id', authenticate, checkPermission('accounting', 'delete'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId;
    const transactionId = req.params.id;
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }
    
    // Verificar que la transacción exista y pertenezca a la institución
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        institutionId
      }
    });
    
    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada'
      });
    }
    
    // Solo permitir anular transacciones pendientes o rechazadas
    if (existingTransaction.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: 'No se pueden eliminar transacciones aprobadas. Use una transacción de reverso en su lugar.'
      });
    }
    
    // Eliminar la transacción (hard delete para pendientes/rechazadas)
    await prisma.transaction.delete({
      where: { id: transactionId }
    });
    
    res.json({
      success: true,
      message: 'Transacción eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// VALIDACIÓN DE PARTIDA DOBLE
// ===================================

/**
 * GET /api/accounting/validate-double-entry
 * Validar que todas las transacciones cumplan con partida doble
 */
router.get('/validate-double-entry', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Validar parámetros de entrada
    const period = req.query.period && ['day', 'week', 'month', 'year', 'all'].includes(req.query.period) ? req.query.period : 'month';
    const includeDetails = req.query.details === 'true';
    
    // Calcular fechas según el período
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      dateFilter = {
        date: {
          gte: startDate
        }
      };
    }
    
    // Obtener todas las transacciones del período
    const transactions = await prisma.transaction.findMany({
      where: {
        institutionId,
        status: 'APPROVED',
        ...dateFilter
      },
      include: {
        debitAccount: {
          select: {
            id: true,
            code: true,
            name: true,
            accountType: true
          }
        },
        creditAccount: {
          select: {
            id: true,
            code: true,
            name: true,
            accountType: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Calcular totales por tipo de cuenta
    const accountTotals = {
      ASSET: { debit: 0, credit: 0 },
      LIABILITY: { debit: 0, credit: 0 },
      EQUITY: { debit: 0, credit: 0 },
      INCOME: { debit: 0, credit: 0 },
      EXPENSE: { debit: 0, credit: 0 }
    };
    
    let totalDebits = 0;
    let totalCredits = 0;
    const validationErrors = [];
    
    // Validar cada transacción y acumular totales
    transactions.forEach((transaction, index) => {
      const { amount, debitAccount, creditAccount } = transaction;
      
      // Validación 1: Verificar que débito y crédito sean diferentes
      if (debitAccount.id === creditAccount.id) {
        validationErrors.push({
          transactionId: transaction.id,
          error: 'La cuenta débito y crédito no pueden ser la misma',
          transaction: includeDetails ? transaction : undefined
        });
      }
      
      // Validación 2: Verificar que el monto sea positivo
      if (amount <= 0) {
        validationErrors.push({
          transactionId: transaction.id,
          error: 'El monto debe ser positivo',
          transaction: includeDetails ? transaction : undefined
        });
      }
      
      // Acumular totales por tipo de cuenta
      accountTotals[debitAccount.accountType].debit += amount;
      accountTotals[creditAccount.accountType].credit += amount;
      
      // Acumular totales generales
      totalDebits += amount;
      totalCredits += amount;
    });
    
    // Validación 3: Verificar que débitos = créditos
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01; // Tolerancia para decimales
    
    if (!isBalanced) {
      validationErrors.push({
        error: 'Los débitos totales no coinciden con los créditos totales',
        totalDebits,
        totalCredits,
        difference: totalDebits - totalCredits
      });
    }
    
    // Calcular ecuación contable: Activos = Pasivos + Patrimonio
    const assets = accountTotals.ASSET.debit - accountTotals.ASSET.credit;
    const liabilities = accountTotals.LIABILITY.credit - accountTotals.LIABILITY.debit;
    const equity = accountTotals.EQUITY.credit - accountTotals.EQUITY.debit;
    const income = accountTotals.INCOME.credit - accountTotals.INCOME.debit;
    const expenses = accountTotals.EXPENSE.debit - accountTotals.EXPENSE.credit;
    
    // Patrimonio neto (incluyendo resultados)
    const netEquity = equity + income - expenses;
    const equationBalance = Math.abs(assets - (liabilities + netEquity)) < 0.01;
    
    if (!equationBalance) {
      validationErrors.push({
        error: 'La ecuación contable no está balanceada: Activos ≠ Pasivos + Patrimonio',
        assets,
        liabilities,
        equity: netEquity,
        difference: assets - (liabilities + netEquity)
      });
    }
    
    // Preparar resumen de validación
    const validationSummary = {
      period,
      totalTransactions: transactions.length,
      totalDebits,
      totalCredits,
      isBalanced,
      equationBalance,
      validationErrors: validationErrors.length,
      accountingEquation: {
        assets,
        liabilities,
        equity: netEquity,
        income,
        expenses,
        isValid: equationBalance
      },
      accountTotals
    };
    
    res.json({
      success: true,
      data: {
        summary: validationSummary,
        errors: validationErrors,
        isValid: validationErrors.length === 0,
        message: validationErrors.length === 0 
          ? 'Todas las transacciones cumplen con partida doble' 
          : `Se encontraron ${validationErrors.length} errores de validación`
      }
    });
    
  } catch (error) {
    console.error('Error validating double entry:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/accounting/validate-transaction
 * Validar una transacción específica antes de crearla
 */
router.post('/validate-transaction', authenticate, checkPermission('accounting', 'create'), async (req, res) => {
  try {
    const institutionId = req.user?.institutionId;
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }
    
    const { debitAccountId, creditAccountId, amount, type } = req.body;
    
    if (!debitAccountId || !creditAccountId || !amount || !type) {
      return res.status(400).json({
        success: false,
        error: 'Cuenta débito, cuenta crédito, monto y tipo son requeridos'
      });
    }
    
    const validationErrors = [];
    const warnings = [];
    
    // Validar que las cuentas existan
    const [debitAccount, creditAccount] = await Promise.all([
      prisma.account.findFirst({
        where: { id: debitAccountId, institutionId, isActive: true }
      }),
      prisma.account.findFirst({
        where: { id: creditAccountId, institutionId, isActive: true }
      })
    ]);
    
    if (!debitAccount) {
      validationErrors.push('Cuenta débito no encontrada o inactiva');
    }
    
    if (!creditAccount) {
      validationErrors.push('Cuenta crédito no encontrada o inactiva');
    }
    
    if (debitAccount && creditAccount) {
      // Validar que no sean la misma cuenta
      if (debitAccountId === creditAccountId) {
        validationErrors.push('La cuenta débito y crédito no pueden ser la misma');
      }
      
      // Validar lógica contable según el tipo de transacción
      const debitType = debitAccount.accountType;
      const creditType = creditAccount.accountType;
      
      switch (type) {
        case 'INCOME':
          // Ingresos: Débito en Activo/Banco, Crédito en Ingresos
          if (!['ASSET'].includes(debitType)) {
            warnings.push('Para ingresos, se recomienda debitar una cuenta de Activo');
          }
          if (!['INCOME'].includes(creditType)) {
            warnings.push('Para ingresos, se recomienda acreditar una cuenta de Ingresos');
          }
          break;
          
        case 'EXPENSE':
          // Gastos: Débito en Gastos, Crédito en Activo/Banco
          if (!['EXPENSE'].includes(debitType)) {
            warnings.push('Para gastos, se recomienda debitar una cuenta de Gastos');
          }
          if (!['ASSET'].includes(creditType)) {
            warnings.push('Para gastos, se recomienda acreditar una cuenta de Activo');
          }
          break;
          
        case 'TRANSFER':
          // Transferencias: Entre cuentas del mismo tipo generalmente
          if (debitType !== creditType && !(['ASSET', 'LIABILITY'].includes(debitType) && ['ASSET', 'LIABILITY'].includes(creditType))) {
            warnings.push('Las transferencias generalmente se realizan entre cuentas del mismo tipo o entre Activos y Pasivos');
          }
          break;
      }
    }
    
    // Validar monto
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      validationErrors.push('El monto debe ser un número positivo');
    }
    
    const isValid = validationErrors.length === 0;
    
    res.json({
      success: true,
      data: {
        isValid,
        validationErrors,
        warnings,
        recommendation: isValid ? 'La transacción es válida para partida doble' : 'Corrija los errores antes de crear la transacción',
        accounts: {
          debit: debitAccount ? {
            id: debitAccount.id,
            code: debitAccount.code,
            name: debitAccount.name,
            type: debitAccount.accountType
          } : null,
          credit: creditAccount ? {
            id: creditAccount.id,
            code: creditAccount.code,
            name: creditAccount.name,
            type: creditAccount.accountType
          } : null
        }
      }
    });
    
  } catch (error) {
    console.error('Error validating transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// REPORTES FINANCIEROS
// ===================================

/**
 * GET /api/accounting/balance-sheet
 * Generar Balance General (Estado de Situación Financiera)
 */
router.get('/balance-sheet', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Validar parámetros de entrada
    const asOfDate = req.query.date ? new Date(req.query.date) : new Date();
    const includeZeroBalances = req.query.includeZero === 'true';
    const format = req.query.format || 'detailed'; // detailed, summary
    
    if (isNaN(asOfDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Fecha inválida'
      });
    }
    
    // Obtener todas las cuentas activas
    const accounts = await prisma.account.findMany({
      where: {
        institutionId,
        isActive: true
      },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });
    
    // Calcular saldos para cada cuenta hasta la fecha especificada
    const accountBalances = await Promise.all(
      accounts.map(async (account) => {
        // Obtener transacciones aprobadas hasta la fecha
        const [debitTransactions, creditTransactions] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              debitAccountId: account.id,
              status: 'APPROVED',
              date: {
                lte: asOfDate
              }
            },
            _sum: {
              amount: true
            }
          }),
          prisma.transaction.aggregate({
            where: {
              creditAccountId: account.id,
              status: 'APPROVED',
              date: {
                lte: asOfDate
              }
            },
            _sum: {
              amount: true
            }
          })
        ]);
        
        const debitTotal = debitTransactions._sum.amount || 0;
        const creditTotal = creditTransactions._sum.amount || 0;
        
        // Calcular saldo según el tipo de cuenta
        let balance = 0;
        if (['ASSET', 'EXPENSE'].includes(account.accountType)) {
          balance = debitTotal - creditTotal;
        } else {
          balance = creditTotal - debitTotal;
        }
        
        return {
          ...account,
          debitTotal,
          creditTotal,
          balance
        };
      })
    );
    
    // Filtrar cuentas con saldo cero si no se requieren
    const filteredAccounts = includeZeroBalances 
      ? accountBalances 
      : accountBalances.filter(account => Math.abs(account.balance) > 0.01);
    
    // Organizar por tipo de cuenta
    const balanceSheet = {
      assets: {
        accounts: filteredAccounts.filter(acc => acc.accountType === 'ASSET'),
        total: 0
      },
      liabilities: {
        accounts: filteredAccounts.filter(acc => acc.accountType === 'LIABILITY'),
        total: 0
      },
      equity: {
        accounts: filteredAccounts.filter(acc => acc.accountType === 'EQUITY'),
        total: 0
      }
    };
    
    // Calcular totales
    balanceSheet.assets.total = balanceSheet.assets.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    balanceSheet.liabilities.total = balanceSheet.liabilities.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    balanceSheet.equity.total = balanceSheet.equity.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    // Calcular resultado del ejercicio (ingresos - gastos)
    const incomeAccounts = filteredAccounts.filter(acc => acc.accountType === 'INCOME');
    const expenseAccounts = filteredAccounts.filter(acc => acc.accountType === 'EXPENSE');
    
    const totalIncome = incomeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const netIncome = totalIncome - totalExpenses;
    
    // Agregar resultado del ejercicio al patrimonio
    balanceSheet.equity.total += netIncome;
    
    // Verificar ecuación contable
    const totalAssets = balanceSheet.assets.total;
    const totalLiabilitiesAndEquity = balanceSheet.liabilities.total + balanceSheet.equity.total;
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;
    
    // Preparar resumen
    const summary = {
      asOfDate: asOfDate.toISOString(),
      totalAssets,
      totalLiabilities: balanceSheet.liabilities.total,
      totalEquity: balanceSheet.equity.total - netIncome, // Patrimonio sin resultado
      netIncome,
      totalLiabilitiesAndEquity,
      isBalanced,
      format
    };
    
    // Formato de respuesta según el tipo solicitado
    let responseData;
    if (format === 'summary') {
      responseData = {
        summary,
        totals: {
          assets: balanceSheet.assets.total,
          liabilities: balanceSheet.liabilities.total,
          equity: balanceSheet.equity.total
        }
      };
    } else {
      responseData = {
        summary,
        balanceSheet,
        netIncome: {
          totalIncome,
          totalExpenses,
          netIncome
        }
      };
    }
    
    res.json({
      success: true,
      data: responseData,
      message: `Balance General generado al ${asOfDate.toLocaleDateString()}`
    });
    
  } catch (error) {
    console.error('Error generating balance sheet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/accounting/income-statement
 * Generar Estado de Resultados (Estado de Ganancias y Pérdidas)
 */
router.get('/income-statement', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Validar parámetros de entrada
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const includeZeroBalances = req.query.includeZero === 'true';
    const format = req.query.format || 'detailed'; // detailed, summary
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Fechas inválidas'
      });
    }
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        error: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }
    
    // Obtener cuentas de ingresos y gastos
    const accounts = await prisma.account.findMany({
      where: {
        institutionId,
        isActive: true,
        accountType: {
          in: ['INCOME', 'EXPENSE']
        }
      },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });
    
    // Calcular movimientos para cada cuenta en el período
    const accountMovements = await Promise.all(
      accounts.map(async (account) => {
        // Obtener transacciones aprobadas en el período
        const [debitTransactions, creditTransactions] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              debitAccountId: account.id,
              status: 'APPROVED',
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            _sum: {
              amount: true
            }
          }),
          prisma.transaction.aggregate({
            where: {
              creditAccountId: account.id,
              status: 'APPROVED',
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            _sum: {
              amount: true
            }
          })
        ]);
        
        const debitTotal = debitTransactions._sum.amount || 0;
        const creditTotal = creditTransactions._sum.amount || 0;
        
        // Para estado de resultados: Ingresos (crédito) - Gastos (débito)
        let periodMovement = 0;
        if (account.accountType === 'INCOME') {
          periodMovement = creditTotal - debitTotal;
        } else if (account.accountType === 'EXPENSE') {
          periodMovement = debitTotal - creditTotal;
        }
        
        return {
          ...account,
          debitTotal,
          creditTotal,
          periodMovement
        };
      })
    );
    
    // Filtrar cuentas con movimiento cero si no se requieren
    const filteredAccounts = includeZeroBalances 
      ? accountMovements 
      : accountMovements.filter(account => Math.abs(account.periodMovement) > 0.01);
    
    // Organizar por tipo
    const incomeStatement = {
      income: {
        accounts: filteredAccounts.filter(acc => acc.accountType === 'INCOME'),
        total: 0
      },
      expenses: {
        accounts: filteredAccounts.filter(acc => acc.accountType === 'EXPENSE'),
        total: 0
      }
    };
    
    // Calcular totales
    incomeStatement.income.total = incomeStatement.income.accounts.reduce((sum, acc) => sum + acc.periodMovement, 0);
    incomeStatement.expenses.total = incomeStatement.expenses.accounts.reduce((sum, acc) => sum + acc.periodMovement, 0);
    
    // Calcular resultado neto
    const grossIncome = incomeStatement.income.total;
    const totalExpenses = incomeStatement.expenses.total;
    const netIncome = grossIncome - totalExpenses;
    
    // Calcular márgenes y ratios
    const grossMargin = grossIncome > 0 ? ((grossIncome - totalExpenses) / grossIncome * 100) : 0;
    const expenseRatio = grossIncome > 0 ? (totalExpenses / grossIncome * 100) : 0;
    
    // Preparar resumen
    const summary = {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      },
      grossIncome,
      totalExpenses,
      netIncome,
      grossMargin: parseFloat(grossMargin.toFixed(2)),
      expenseRatio: parseFloat(expenseRatio.toFixed(2)),
      format
    };
    
    // Formato de respuesta según el tipo solicitado
    let responseData;
    if (format === 'summary') {
      responseData = {
        summary,
        totals: {
          income: grossIncome,
          expenses: totalExpenses,
          netIncome
        }
      };
    } else {
      responseData = {
        summary,
        incomeStatement,
        analysis: {
          topIncomeAccounts: incomeStatement.income.accounts
            .sort((a, b) => b.periodMovement - a.periodMovement)
            .slice(0, 5),
          topExpenseAccounts: incomeStatement.expenses.accounts
            .sort((a, b) => b.periodMovement - a.periodMovement)
            .slice(0, 5)
        }
      };
    }
    
    res.json({
      success: true,
      data: responseData,
      message: `Estado de Resultados generado del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}`
    });
    
  } catch (error) {
    console.error('Error generating income statement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// EXPORTACIÓN DE REPORTES
// ===================================

/**
 * GET /api/accounting/export/balance-sheet
 * Exportar Balance General a PDF o Excel
 */
router.get('/export/balance-sheet', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Validar parámetros de entrada
    const format = req.query.format || 'pdf'; // pdf, excel
    const asOfDate = req.query.date ? new Date(req.query.date) : new Date();
    const includeZeroBalances = req.query.includeZero === 'true';
    const companyName = req.query.company || 'Educonta';
    
    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Formato debe ser pdf o excel'
      });
    }
    
    if (isNaN(asOfDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Fecha inválida'
      });
    }
    
    // Obtener datos del balance general (reutilizar lógica existente)
    const accounts = await prisma.account.findMany({
      where: {
        institutionId,
        isActive: true
      },
      orderBy: {
        code: 'asc'
      }
    });
    
    // Calcular saldos
    const accountBalances = await Promise.all(
      accounts.map(async (account) => {
        const [debitTransactions, creditTransactions] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              debitAccountId: account.id,
              status: 'APPROVED',
              date: { lte: asOfDate }
            },
            _sum: { amount: true }
          }),
          prisma.transaction.aggregate({
            where: {
              creditAccountId: account.id,
              status: 'APPROVED',
              date: { lte: asOfDate }
            },
            _sum: { amount: true }
          })
        ]);
        
        const debitTotal = debitTransactions._sum.amount || 0;
        const creditTotal = creditTransactions._sum.amount || 0;
        
        let balance = 0;
        if (['ASSET', 'EXPENSE'].includes(account.accountType)) {
          balance = debitTotal - creditTotal;
        } else {
          balance = creditTotal - debitTotal;
        }
        
        return { ...account, balance };
      })
    );
    
    // Filtrar cuentas
    const filteredAccounts = includeZeroBalances 
      ? accountBalances 
      : accountBalances.filter(account => Math.abs(account.balance) > 0.01);
    
    // Organizar datos
    const balanceSheet = {
      assets: filteredAccounts.filter(acc => acc.accountType === 'ASSET'),
      liabilities: filteredAccounts.filter(acc => acc.accountType === 'LIABILITY'),
      equity: filteredAccounts.filter(acc => acc.accountType === 'EQUITY')
    };
    
    const totals = {
      assets: balanceSheet.assets.reduce((sum, acc) => sum + acc.balance, 0),
      liabilities: balanceSheet.liabilities.reduce((sum, acc) => sum + acc.balance, 0),
      equity: balanceSheet.equity.reduce((sum, acc) => sum + acc.balance, 0)
    };
    
    // Calcular resultado del ejercicio
    const incomeAccounts = filteredAccounts.filter(acc => acc.accountType === 'INCOME');
    const expenseAccounts = filteredAccounts.filter(acc => acc.accountType === 'EXPENSE');
    const netIncome = incomeAccounts.reduce((sum, acc) => sum + acc.balance, 0) - 
                     expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    totals.equity += netIncome;
    
    if (format === 'pdf') {
      // Generar PDF
      const pdfContent = generateBalanceSheetPDF({
        companyName,
        asOfDate,
        balanceSheet,
        totals,
        netIncome
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="balance-sheet-${asOfDate.toISOString().split('T')[0]}.pdf"`);
      res.send(pdfContent);
      
    } else if (format === 'excel') {
      // Generar Excel
      const excelContent = generateBalanceSheetExcel({
        companyName,
        asOfDate,
        balanceSheet,
        totals,
        netIncome
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="balance-sheet-${asOfDate.toISOString().split('T')[0]}.xlsx"`);
      res.send(excelContent);
    }
    
  } catch (error) {
    console.error('Error exporting balance sheet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/accounting/export/income-statement
 * Exportar Estado de Resultados a PDF o Excel
 */
router.get('/export/income-statement', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Validar parámetros de entrada
    const format = req.query.format || 'pdf'; // pdf, excel
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const includeZeroBalances = req.query.includeZero === 'true';
    const companyName = req.query.company || 'Educonta';
    
    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Formato debe ser pdf o excel'
      });
    }
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return res.status(400).json({
        success: false,
        error: 'Fechas inválidas'
      });
    }
    
    // Obtener cuentas de ingresos y gastos
    const accounts = await prisma.account.findMany({
      where: {
        institutionId,
        isActive: true,
        accountType: { in: ['INCOME', 'EXPENSE'] }
      },
      orderBy: { code: 'asc' }
    });
    
    // Calcular movimientos del período
    const accountMovements = await Promise.all(
      accounts.map(async (account) => {
        const [debitTransactions, creditTransactions] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              debitAccountId: account.id,
              status: 'APPROVED',
              date: { gte: startDate, lte: endDate }
            },
            _sum: { amount: true }
          }),
          prisma.transaction.aggregate({
            where: {
              creditAccountId: account.id,
              status: 'APPROVED',
              date: { gte: startDate, lte: endDate }
            },
            _sum: { amount: true }
          })
        ]);
        
        const debitTotal = debitTransactions._sum.amount || 0;
        const creditTotal = creditTransactions._sum.amount || 0;
        
        let periodMovement = 0;
        if (account.accountType === 'INCOME') {
          periodMovement = creditTotal - debitTotal;
        } else if (account.accountType === 'EXPENSE') {
          periodMovement = debitTotal - creditTotal;
        }
        
        return { ...account, periodMovement };
      })
    );
    
    // Filtrar cuentas
    const filteredAccounts = includeZeroBalances 
      ? accountMovements 
      : accountMovements.filter(account => Math.abs(account.periodMovement) > 0.01);
    
    // Organizar datos
    const incomeStatement = {
      income: filteredAccounts.filter(acc => acc.accountType === 'INCOME'),
      expenses: filteredAccounts.filter(acc => acc.accountType === 'EXPENSE')
    };
    
    const totals = {
      income: incomeStatement.income.reduce((sum, acc) => sum + acc.periodMovement, 0),
      expenses: incomeStatement.expenses.reduce((sum, acc) => sum + acc.periodMovement, 0)
    };
    
    const netIncome = totals.income - totals.expenses;
    const grossMargin = totals.income > 0 ? ((netIncome / totals.income) * 100) : 0;
    
    if (format === 'pdf') {
      // Generar PDF
      const pdfContent = generateIncomeStatementPDF({
        companyName,
        startDate,
        endDate,
        incomeStatement,
        totals,
        netIncome,
        grossMargin
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="income-statement-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.pdf"`);
      res.send(pdfContent);
      
    } else if (format === 'excel') {
      // Generar Excel
      const excelContent = generateIncomeStatementExcel({
        companyName,
        startDate,
        endDate,
        incomeStatement,
        totals,
        netIncome,
        grossMargin
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="income-statement-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.xlsx"`);
      res.send(excelContent);
    }
    
  } catch (error) {
    console.error('Error exporting income statement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// FUNCIONES AUXILIARES DE EXPORTACIÓN
// ===================================

/**
 * Generar PDF del Balance General
 */
function generateBalanceSheetPDF(data) {
  // Simulación de generación PDF (en implementación real usaría librerías como puppeteer o pdfkit)
  const { companyName, asOfDate, balanceSheet, totals, netIncome } = data;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Balance General - ${companyName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; }
        .report-title { font-size: 18px; margin: 10px 0; }
        .date { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .amount { text-align: right; }
        .total-row { font-weight: bold; border-top: 2px solid #333; }
        .section-header { background-color: #e9e9e9; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${companyName}</div>
        <div class="report-title">BALANCE GENERAL</div>
        <div class="date">Al ${new Date(asOfDate).toLocaleDateString()}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Cuenta</th>
            <th>Código</th>
            <th class="amount">Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr class="section-header">
            <td colspan="3">ACTIVOS</td>
          </tr>
          ${balanceSheet.assets.map(acc => `
            <tr>
              <td>${acc.name}</td>
              <td>${acc.code}</td>
              <td class="amount">$${acc.balance.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL ACTIVOS</td>
            <td class="amount">$${totals.assets.toLocaleString()}</td>
          </tr>
          
          <tr class="section-header">
            <td colspan="3">PASIVOS</td>
          </tr>
          ${balanceSheet.liabilities.map(acc => `
            <tr>
              <td>${acc.name}</td>
              <td>${acc.code}</td>
              <td class="amount">$${acc.balance.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL PASIVOS</td>
            <td class="amount">$${totals.liabilities.toLocaleString()}</td>
          </tr>
          
          <tr class="section-header">
            <td colspan="3">PATRIMONIO</td>
          </tr>
          ${balanceSheet.equity.map(acc => `
            <tr>
              <td>${acc.name}</td>
              <td>${acc.code}</td>
              <td class="amount">$${acc.balance.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr>
            <td>Resultado del Ejercicio</td>
            <td>-</td>
            <td class="amount">$${netIncome.toLocaleString()}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2">TOTAL PATRIMONIO</td>
            <td class="amount">$${totals.equity.toLocaleString()}</td>
          </tr>
          
          <tr class="total-row" style="border-top: 3px double #333;">
            <td colspan="2">TOTAL PASIVOS + PATRIMONIO</td>
            <td class="amount">$${(totals.liabilities + totals.equity).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 30px; font-size: 12px; color: #666;">
        Generado el ${new Date().toLocaleString()} por Educonta
      </div>
    </body>
    </html>
  `;
  
  // En implementación real, convertir HTML a PDF
  return Buffer.from(htmlContent, 'utf8');
}

/**
 * Generar Excel del Balance General
 */
function generateBalanceSheetExcel(data) {
  // Simulación de generación Excel (en implementación real usaría librerías como exceljs)
  const { companyName, asOfDate, balanceSheet, totals, netIncome } = data;
  
  const csvContent = [
    `${companyName},,,`,
    `BALANCE GENERAL,,,`,
    `Al ${new Date(asOfDate).toLocaleDateString()},,,`,
    `,,`,
    `Cuenta,Código,Saldo,`,
    `,,`,
    `ACTIVOS,,,`,
    ...balanceSheet.assets.map(acc => `${acc.name},${acc.code},${acc.balance},`),
    `TOTAL ACTIVOS,,${totals.assets},`,
    `,,`,
    `PASIVOS,,,`,
    ...balanceSheet.liabilities.map(acc => `${acc.name},${acc.code},${acc.balance},`),
    `TOTAL PASIVOS,,${totals.liabilities},`,
    `,,`,
    `PATRIMONIO,,,`,
    ...balanceSheet.equity.map(acc => `${acc.name},${acc.code},${acc.balance},`),
    `Resultado del Ejercicio,-,${netIncome},`,
    `TOTAL PATRIMONIO,,${totals.equity},`,
    `,,`,
    `TOTAL PASIVOS + PATRIMONIO,,${totals.liabilities + totals.equity},`
  ].join('\n');
  
  return Buffer.from(csvContent, 'utf8');
}

/**
 * Generar PDF del Estado de Resultados
 */
function generateIncomeStatementPDF(data) {
  // Simulación similar al Balance General
  const { companyName, startDate, endDate, incomeStatement, totals, netIncome, grossMargin } = data;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Estado de Resultados - ${companyName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; }
        .report-title { font-size: 18px; margin: 10px 0; }
        .date { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .amount { text-align: right; }
        .total-row { font-weight: bold; border-top: 2px solid #333; }
        .section-header { background-color: #e9e9e9; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${companyName}</div>
        <div class="report-title">ESTADO DE RESULTADOS</div>
        <div class="date">Del ${new Date(startDate).toLocaleDateString()} al ${new Date(endDate).toLocaleDateString()}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Cuenta</th>
            <th>Código</th>
            <th class="amount">Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr class="section-header">
            <td colspan="3">INGRESOS</td>
          </tr>
          ${incomeStatement.income.map(acc => `
            <tr>
              <td>${acc.name}</td>
              <td>${acc.code}</td>
              <td class="amount">$${acc.periodMovement.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL INGRESOS</td>
            <td class="amount">$${totals.income.toLocaleString()}</td>
          </tr>
          
          <tr class="section-header">
            <td colspan="3">GASTOS</td>
          </tr>
          ${incomeStatement.expenses.map(acc => `
            <tr>
              <td>${acc.name}</td>
              <td>${acc.code}</td>
              <td class="amount">$${acc.periodMovement.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL GASTOS</td>
            <td class="amount">$${totals.expenses.toLocaleString()}</td>
          </tr>
          
          <tr class="total-row" style="border-top: 3px double #333;">
            <td colspan="2">RESULTADO NETO</td>
            <td class="amount">$${netIncome.toLocaleString()}</td>
          </tr>
          
          <tr>
            <td colspan="2">Margen Bruto (%)</td>
            <td class="amount">${grossMargin.toFixed(2)}%</td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 30px; font-size: 12px; color: #666;">
        Generado el ${new Date().toLocaleString()} por Educonta
      </div>
    </body>
    </html>
  `;
  
  return Buffer.from(htmlContent, 'utf8');
}

/**
 * Generar Excel del Estado de Resultados
 */
function generateIncomeStatementExcel(data) {
  // Simulación similar al Balance General
  const { companyName, startDate, endDate, incomeStatement, totals, netIncome, grossMargin } = data;
  
  const csvContent = [
    `${companyName},,,`,
    `ESTADO DE RESULTADOS,,,`,
    `Del ${new Date(startDate).toLocaleDateString()} al ${new Date(endDate).toLocaleDateString()},,,`,
    `,,`,
    `Cuenta,Código,Monto,`,
    `,,`,
    `INGRESOS,,,`,
    ...incomeStatement.income.map(acc => `${acc.name},${acc.code},${acc.periodMovement},`),
    `TOTAL INGRESOS,,${totals.income},`,
    `,,`,
    `GASTOS,,,`,
    ...incomeStatement.expenses.map(acc => `${acc.name},${acc.code},${acc.periodMovement},`),
    `TOTAL GASTOS,,${totals.expenses},`,
    `,,`,
    `RESULTADO NETO,,${netIncome},`,
    `Margen Bruto (%),,${grossMargin.toFixed(2)}%,`
  ].join('\n');
  
  return Buffer.from(csvContent, 'utf8');
}

// ===================================
// DASHBOARD Y KPIs
// ===================================

/**
 * GET /api/accounting/dashboard/kpis
 * Obtener KPIs principales del dashboard
 */
router.get('/dashboard/kpis', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Parámetros de fecha (por defecto año actual)
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : new Date();
    
    // Validar fechas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(asOfDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Fechas inválidas'
      });
    }
    
    // Obtener todas las cuentas activas
    const accounts = await prisma.account.findMany({
      where: {
        institutionId,
        isActive: true
      }
    });
    
    // Calcular KPIs en paralelo
    const [incomeData, expenseData, assetData, liabilityData, equityData] = await Promise.all([
      // Ingresos del período
      calculateAccountTypeMovements(accounts.filter(acc => acc.accountType === 'INCOME'), startDate, endDate, 'INCOME'),
      // Gastos del período
      calculateAccountTypeMovements(accounts.filter(acc => acc.accountType === 'EXPENSE'), startDate, endDate, 'EXPENSE'),
      // Activos al corte
      calculateAccountTypeBalances(accounts.filter(acc => acc.accountType === 'ASSET'), asOfDate, 'ASSET'),
      // Pasivos al corte
      calculateAccountTypeBalances(accounts.filter(acc => acc.accountType === 'LIABILITY'), asOfDate, 'LIABILITY'),
      // Patrimonio al corte
      calculateAccountTypeBalances(accounts.filter(acc => acc.accountType === 'EQUITY'), asOfDate, 'EQUITY')
    ]);
    
    // Calcular resultado neto del período
    const netIncome = incomeData.total - expenseData.total;
    
    // Calcular ratios financieros
    const grossMargin = incomeData.total > 0 ? ((netIncome / incomeData.total) * 100) : 0;
    const expenseRatio = incomeData.total > 0 ? ((expenseData.total / incomeData.total) * 100) : 0;
    const debtToEquityRatio = equityData.total > 0 ? (liabilityData.total / equityData.total) : 0;
    const currentRatio = liabilityData.total > 0 ? (assetData.total / liabilityData.total) : 0;
    
    // Obtener efectivo disponible (cuentas de caja y bancos)
    const cashAccounts = accounts.filter(acc => 
      acc.accountType === 'ASSET' && 
      (acc.code.startsWith('11') || acc.name.toLowerCase().includes('caja') || acc.name.toLowerCase().includes('banco'))
    );
    
    const cashData = await calculateAccountTypeBalances(cashAccounts, asOfDate, 'ASSET');
    
    // Preparar respuesta con KPIs
    const kpis = {
      // KPIs de período
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalIncome: incomeData.total,
        totalExpenses: expenseData.total,
        netIncome: netIncome,
        grossMargin: parseFloat(grossMargin.toFixed(2)),
        expenseRatio: parseFloat(expenseRatio.toFixed(2))
      },
      
      // KPIs de posición financiera
      position: {
        asOfDate: asOfDate.toISOString(),
        totalAssets: assetData.total,
        totalLiabilities: liabilityData.total,
        totalEquity: equityData.total + netIncome, // Incluir resultado del ejercicio
        cashAndEquivalents: cashData.total,
        debtToEquityRatio: parseFloat(debtToEquityRatio.toFixed(2)),
        currentRatio: parseFloat(currentRatio.toFixed(2))
      },
      
      // Análisis de cuentas principales
      topAccounts: {
        income: incomeData.accounts.slice(0, 5),
        expenses: expenseData.accounts.slice(0, 5),
        assets: assetData.accounts.slice(0, 5),
        liabilities: liabilityData.accounts.slice(0, 5)
      },
      
      // Métricas de salud financiera
      healthMetrics: {
        profitability: netIncome > 0 ? 'positive' : 'negative',
        liquidity: cashData.total > (expenseData.total / 12) ? 'good' : 'low', // Más de un mes de gastos
        leverage: debtToEquityRatio < 1 ? 'conservative' : debtToEquityRatio < 2 ? 'moderate' : 'high',
        efficiency: expenseRatio < 80 ? 'efficient' : 'needs_improvement'
      }
    };
    
    res.json({
      success: true,
      data: kpis
    });
    
  } catch (error) {
    console.error('Error getting dashboard KPIs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/accounting/dashboard/charts
 * Obtener datos para gráficos del dashboard
 */
router.get('/dashboard/charts', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    // Parámetros de fecha
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(endDate.getFullYear(), 0, 1);
    const chartType = req.query.type || 'monthly'; // monthly, quarterly, yearly
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return res.status(400).json({
        success: false,
        error: 'Fechas inválidas'
      });
    }
    
    // Generar períodos según el tipo de gráfico
    const periods = generatePeriods(startDate, endDate, chartType);
    
    // Obtener cuentas de ingresos y gastos
    const incomeAccounts = await prisma.account.findMany({
      where: {
        institutionId,
        isActive: true,
        accountType: 'INCOME'
      }
    });
    
    const expenseAccounts = await prisma.account.findMany({
      where: {
        institutionId,
        isActive: true,
        accountType: 'EXPENSE'
      }
    });
    
    // Calcular datos por período
    const chartData = await Promise.all(
      periods.map(async (period) => {
        const [incomeMovements, expenseMovements] = await Promise.all([
          calculateAccountTypeMovements(incomeAccounts, period.start, period.end, 'INCOME'),
          calculateAccountTypeMovements(expenseAccounts, period.start, period.end, 'EXPENSE')
        ]);
        
        return {
          period: period.label,
          startDate: period.start.toISOString(),
          endDate: period.end.toISOString(),
          income: incomeMovements.total,
          expenses: expenseMovements.total,
          netIncome: incomeMovements.total - expenseMovements.total
        };
      })
    );
    
    // Obtener distribución por tipo de cuenta (para gráfico de torta)
    const accounts = await prisma.account.findMany({
      where: {
        institutionId,
        isActive: true
      }
    });
    
    const distributionData = await Promise.all([
      calculateAccountTypeBalances(accounts.filter(acc => acc.accountType === 'ASSET'), endDate, 'ASSET'),
      calculateAccountTypeBalances(accounts.filter(acc => acc.accountType === 'LIABILITY'), endDate, 'LIABILITY'),
      calculateAccountTypeBalances(accounts.filter(acc => acc.accountType === 'EQUITY'), endDate, 'EQUITY')
    ]);
    
    const distribution = {
      assets: distributionData[0].total,
      liabilities: distributionData[1].total,
      equity: distributionData[2].total
    };
    
    res.json({
      success: true,
      data: {
        timeline: chartData,
        distribution: distribution,
        periods: periods.map(p => p.label)
      }
    });
    
  } catch (error) {
    console.error('Error getting dashboard charts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/accounting/dashboard/trends
 * Obtener tendencias y comparaciones
 */
router.get('/dashboard/trends', authenticate, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    // Obtener institutionId del usuario autenticado
    const institutionId = req.user?.institutionId || 'cmd3z16yp0002w6heeiym4ex6';
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Períodos de comparación
    const currentPeriod = {
      start: new Date(currentYear, 0, 1), // Inicio del año actual
      end: currentDate
    };
    
    const previousPeriod = {
      start: new Date(currentYear - 1, 0, 1), // Inicio del año anterior
      end: new Date(currentYear - 1, currentMonth, currentDate.getDate()) // Misma fecha año anterior
    };
    
    const currentMonthPeriod = {
      start: new Date(currentYear, currentMonth, 1),
      end: currentDate
    };
    
    const previousMonthPeriod = {
      start: new Date(currentYear, currentMonth - 1, 1),
      end: new Date(currentYear, currentMonth, 0) // Último día del mes anterior
    };
    
    // Obtener cuentas
    const incomeAccounts = await prisma.account.findMany({
      where: { institutionId, isActive: true, accountType: 'INCOME' }
    });
    
    const expenseAccounts = await prisma.account.findMany({
      where: { institutionId, isActive: true, accountType: 'EXPENSE' }
    });
    
    // Calcular métricas para comparación
    const [currentYearData, previousYearData, currentMonthData, previousMonthData] = await Promise.all([
      Promise.all([
        calculateAccountTypeMovements(incomeAccounts, currentPeriod.start, currentPeriod.end, 'INCOME'),
        calculateAccountTypeMovements(expenseAccounts, currentPeriod.start, currentPeriod.end, 'EXPENSE')
      ]),
      Promise.all([
        calculateAccountTypeMovements(incomeAccounts, previousPeriod.start, previousPeriod.end, 'INCOME'),
        calculateAccountTypeMovements(expenseAccounts, previousPeriod.start, previousPeriod.end, 'EXPENSE')
      ]),
      Promise.all([
        calculateAccountTypeMovements(incomeAccounts, currentMonthPeriod.start, currentMonthPeriod.end, 'INCOME'),
        calculateAccountTypeMovements(expenseAccounts, currentMonthPeriod.start, currentMonthPeriod.end, 'EXPENSE')
      ]),
      Promise.all([
        calculateAccountTypeMovements(incomeAccounts, previousMonthPeriod.start, previousMonthPeriod.end, 'INCOME'),
        calculateAccountTypeMovements(expenseAccounts, previousMonthPeriod.start, previousMonthPeriod.end, 'EXPENSE')
      ])
    ]);
    
    // Calcular variaciones
    const yearOverYear = {
      income: {
        current: currentYearData[0].total,
        previous: previousYearData[0].total,
        change: previousYearData[0].total > 0 ? 
          ((currentYearData[0].total - previousYearData[0].total) / previousYearData[0].total * 100) : 0
      },
      expenses: {
        current: currentYearData[1].total,
        previous: previousYearData[1].total,
        change: previousYearData[1].total > 0 ? 
          ((currentYearData[1].total - previousYearData[1].total) / previousYearData[1].total * 100) : 0
      },
      netIncome: {
        current: currentYearData[0].total - currentYearData[1].total,
        previous: previousYearData[0].total - previousYearData[1].total
      }
    };
    
    yearOverYear.netIncome.change = yearOverYear.netIncome.previous !== 0 ? 
      ((yearOverYear.netIncome.current - yearOverYear.netIncome.previous) / Math.abs(yearOverYear.netIncome.previous) * 100) : 0;
    
    const monthOverMonth = {
      income: {
        current: currentMonthData[0].total,
        previous: previousMonthData[0].total,
        change: previousMonthData[0].total > 0 ? 
          ((currentMonthData[0].total - previousMonthData[0].total) / previousMonthData[0].total * 100) : 0
      },
      expenses: {
        current: currentMonthData[1].total,
        previous: previousMonthData[1].total,
        change: previousMonthData[1].total > 0 ? 
          ((currentMonthData[1].total - previousMonthData[1].total) / previousMonthData[1].total * 100) : 0
      },
      netIncome: {
        current: currentMonthData[0].total - currentMonthData[1].total,
        previous: previousMonthData[0].total - previousMonthData[1].total
      }
    };
    
    monthOverMonth.netIncome.change = monthOverMonth.netIncome.previous !== 0 ? 
      ((monthOverMonth.netIncome.current - monthOverMonth.netIncome.previous) / Math.abs(monthOverMonth.netIncome.previous) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        yearOverYear,
        monthOverMonth,
        periods: {
          currentYear: `${currentYear}`,
          previousYear: `${currentYear - 1}`,
          currentMonth: currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          previousMonth: new Date(currentYear, currentMonth - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting dashboard trends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================
// FUNCIONES AUXILIARES PARA DASHBOARD
// ===================================

/**
 * Calcular movimientos de cuentas por tipo en un período
 */
async function calculateAccountTypeMovements(accounts, startDate, endDate, accountType) {
  const accountsWithMovements = await Promise.all(
    accounts.map(async (account) => {
      const [debitTransactions, creditTransactions] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            debitAccountId: account.id,
            status: 'APPROVED',
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            creditAccountId: account.id,
            status: 'APPROVED',
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        })
      ]);
      
      const debitTotal = debitTransactions._sum.amount || 0;
      const creditTotal = creditTransactions._sum.amount || 0;
      
      let movement = 0;
      if (accountType === 'INCOME') {
        movement = creditTotal - debitTotal;
      } else if (accountType === 'EXPENSE') {
        movement = debitTotal - creditTotal;
      }
      
      return {
        id: account.id,
        code: account.code,
        name: account.name,
        movement: movement
      };
    })
  );
  
  // Filtrar y ordenar por movimiento
  const filteredAccounts = accountsWithMovements
    .filter(acc => Math.abs(acc.movement) > 0.01)
    .sort((a, b) => Math.abs(b.movement) - Math.abs(a.movement));
  
  const total = filteredAccounts.reduce((sum, acc) => sum + acc.movement, 0);
  
  return {
    accounts: filteredAccounts,
    total: total
  };
}

/**
 * Calcular saldos de cuentas por tipo a una fecha
 */
async function calculateAccountTypeBalances(accounts, asOfDate, accountType) {
  const accountsWithBalances = await Promise.all(
    accounts.map(async (account) => {
      const [debitTransactions, creditTransactions] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            debitAccountId: account.id,
            status: 'APPROVED',
            date: { lte: asOfDate }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            creditAccountId: account.id,
            status: 'APPROVED',
            date: { lte: asOfDate }
          },
          _sum: { amount: true }
        })
      ]);
      
      const debitTotal = debitTransactions._sum.amount || 0;
      const creditTotal = creditTransactions._sum.amount || 0;
      
      let balance = 0;
      if (['ASSET', 'EXPENSE'].includes(accountType)) {
        balance = debitTotal - creditTotal;
      } else {
        balance = creditTotal - debitTotal;
      }
      
      return {
        id: account.id,
        code: account.code,
        name: account.name,
        balance: balance
      };
    })
  );
  
  // Filtrar y ordenar por saldo
  const filteredAccounts = accountsWithBalances
    .filter(acc => Math.abs(acc.balance) > 0.01)
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  
  const total = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  return {
    accounts: filteredAccounts,
    total: total
  };
}

/**
 * Generar períodos para gráficos
 */
function generatePeriods(startDate, endDate, type) {
  const periods = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    let periodEnd;
    let label;
    
    if (type === 'monthly') {
      periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      label = current.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    } else if (type === 'quarterly') {
      const quarter = Math.floor(current.getMonth() / 3);
      periodEnd = new Date(current.getFullYear(), (quarter + 1) * 3, 0);
      label = `Q${quarter + 1} ${current.getFullYear()}`;
    } else if (type === 'yearly') {
      periodEnd = new Date(current.getFullYear(), 11, 31);
      label = current.getFullYear().toString();
    }
    
    if (periodEnd > endDate) {
      periodEnd = new Date(endDate);
    }
    
    periods.push({
      start: new Date(current),
      end: periodEnd,
      label: label
    });
    
    if (type === 'monthly') {
      current.setMonth(current.getMonth() + 1);
    } else if (type === 'quarterly') {
      current.setMonth(current.getMonth() + 3);
    } else if (type === 'yearly') {
      current.setFullYear(current.getFullYear() + 1);
    }
  }
  
  return periods;
}

module.exports = router;
