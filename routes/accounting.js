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

module.exports = router;
