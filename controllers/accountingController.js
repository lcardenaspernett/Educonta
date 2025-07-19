// ===================================
// EDUCONTA - Controlador de Contabilidad
// ===================================

const { validationResult } = require('express-validator');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');

/**
 * Helper para obtener la institución del usuario
 */
const getInstitutionId = async (req) => {
  if (req.user.role === 'SUPER_ADMIN') {
    // Super Admin puede especificar institución o ver todas
    return req.query.institutionId || null;
  } else {
    return req.user.institutionId;
  }
};

/**
 * Obtener plan de cuentas
 */
const getAccounts = async (req, res, next) => {
  try {
    const institutionId = await getInstitutionId(req);
    
    if (!institutionId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }

    let whereClause = {};
    
    if (institutionId) {
      whereClause.institutionId = institutionId;
    } else if (req.user.role === 'SUPER_ADMIN') {
      // Super Admin sin filtro ve todas las cuentas
      whereClause = {};
    }

    const accounts = await req.prisma.account.findMany({
      where: {
        ...whereClause,
        isActive: true
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true
          }
        },
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
            accountType: true
          }
        },
        _count: {
          select: {
            debitTransactions: true,
            creditTransactions: true
          }
        }
      },
      orderBy: [
        { code: 'asc' }
      ]
    });

    // Organizar cuentas por jerarquía
    const accountTree = buildAccountTree(accounts);

    res.json({
      success: true,
      data: accounts,
      tree: accountTree,
      summary: {
        total: accounts.length,
        byType: getAccountsByType(accounts),
        byInstitution: req.user.role === 'SUPER_ADMIN' ? getAccountsByInstitution(accounts) : null
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener cuenta por ID
 */
const getAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institutionId = await getInstitutionId(req);

    let whereClause = { id };
    
    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    const account = await req.prisma.account.findFirst({
      where: whereClause,
      include: {
        institution: {
          select: {
            id: true,
            name: true
          }
        },
        parent: true,
        children: true,
        debitTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            creditAccount: {
              select: { code: true, name: true }
            }
          }
        },
        creditTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            debitAccount: {
              select: { code: true, name: true }
            }
          }
        }
      }
    });

    if (!account) {
      return next(new NotFoundError('Cuenta no encontrada'));
    }

    // Calcular balance de la cuenta
    const balance = await calculateAccountBalance(req.prisma, account.id);

    res.json({
      success: true,
      data: {
        ...account,
        balance
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva cuenta
 */
const createAccount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de cuenta inválidos', errors.array()));
    }

    const {
      code,
      name,
      accountType,
      parentId,
      level
    } = req.body;

    const institutionId = await getInstitutionId(req);
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Debe especificar una institución'
      });
    }

    // Verificar que no exista cuenta con el mismo código
    const existingAccount = await req.prisma.account.findUnique({
      where: {
        institutionId_code: {
          institutionId,
          code
        }
      }
    });

    if (existingAccount) {
      return next(new ConflictError('Ya existe una cuenta con este código'));
    }

    // Verificar cuenta padre si se especifica
    if (parentId) {
      const parentAccount = await req.prisma.account.findFirst({
        where: {
          id: parentId,
          institutionId
        }
      });

      if (!parentAccount) {
        return next(new NotFoundError('Cuenta padre no encontrada'));
      }
    }

    const account = await req.prisma.account.create({
      data: {
        code,
        name,
        accountType,
        parentId,
        level: level || 1,
        institutionId,
        isActive: true
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true
          }
        },
        parent: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente',
      data: account
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener transacciones
 */
const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      accountId,
      type,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    const institutionId = await getInstitutionId(req);
    
    if (!institutionId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }

    // Construir filtros
    let whereClause = {};

    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    if (accountId) {
      whereClause.OR = [
        { debitAccountId: accountId },
        { creditAccountId: accountId }
      ];
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    if (search) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Paginación
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [transactions, totalCount] = await Promise.all([
      req.prisma.transaction.findMany({
        where: whereClause,
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
          institution: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      req.prisma.transaction.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Crear transacción
 */
const createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de transacción inválidos', errors.array()));
    }

    const {
      date,
      reference,
      description,
      amount,
      type,
      debitAccountId,
      creditAccountId
    } = req.body;

    const institutionId = await getInstitutionId(req);
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Debe especificar una institución'
      });
    }

    // Verificar que las cuentas existan y pertenezcan a la institución
    const [debitAccount, creditAccount] = await Promise.all([
      req.prisma.account.findFirst({
        where: { id: debitAccountId, institutionId }
      }),
      req.prisma.account.findFirst({
        where: { id: creditAccountId, institutionId }
      })
    ]);

    if (!debitAccount) {
      return next(new NotFoundError('Cuenta débito no encontrada'));
    }

    if (!creditAccount) {
      return next(new NotFoundError('Cuenta crédito no encontrada'));
    }

    const transaction = await req.prisma.transaction.create({
      data: {
        date: new Date(date),
        reference,
        description,
        amount: parseFloat(amount),
        type,
        debitAccountId,
        creditAccountId,
        institutionId,
        status: 'APPROVED' // Por defecto aprobada
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
        institution: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Transacción creada exitosamente',
      data: transaction
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de contabilidad
 */
const getStats = async (req, res, next) => {
  try {
    const institutionId = await getInstitutionId(req);
    
    if (!institutionId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }

    let whereClause = {};
    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    // Obtener estadísticas en paralelo
    const [
      totalAccounts,
      totalTransactions,
      totalBalance,
      recentTransactions
    ] = await Promise.all([
      // Total de cuentas activas
      req.prisma.account.count({
        where: {
          ...whereClause,
          isActive: true
        }
      }),
      
      // Total de transacciones aprobadas
      req.prisma.transaction.count({
        where: {
          ...whereClause,
          status: 'APPROVED'
        }
      }),
      
      // Balance total (suma de todas las transacciones)
      req.prisma.transaction.aggregate({
        where: {
          ...whereClause,
          status: 'APPROVED'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Transacciones recientes
      req.prisma.transaction.findMany({
        where: {
          ...whereClause,
          status: 'APPROVED'
        },
        include: {
          debitAccount: {
            select: { code: true, name: true }
          },
          creditAccount: {
            select: { code: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Calcular estadísticas por tipo de cuenta
    const accountsByType = await req.prisma.account.groupBy({
      by: ['accountType'],
      where: {
        ...whereClause,
        isActive: true
      },
      _count: {
        accountType: true
      }
    });

    // Transacciones por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactionsByMonth = await req.prisma.transaction.groupBy({
      by: ['date'],
      where: {
        ...whereClause,
        status: 'APPROVED',
        date: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });

    // Calcular transacciones pendientes
    const pendingTransactions = await req.prisma.transaction.count({
      where: {
        ...whereClause,
        status: 'PENDING'
      }
    });

    res.json({
      success: true,
      data: {
        totalAccounts,
        activeAccounts: totalAccounts, // Todas las cuentas son activas por defecto
        totalTransactions,
        pendingTransactions,
        totalBalance: parseFloat(totalBalance._sum.amount || 0),
        accountsByType: accountsByType.reduce((acc, item) => {
          acc[item.accountType] = item._count.accountType;
          return acc;
        }, {}),
        recentTransactions,
        transactionsByMonth: transactionsByMonth.map(item => ({
          date: item.date,
          count: item._count.id,
          amount: parseFloat(item._sum.amount || 0)
        }))
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener balance general
 */
const getBalanceSheet = async (req, res, next) => {
  try {
    const institutionId = await getInstitutionId(req);
    const { date } = req.query;
    
    if (!institutionId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }

    const balanceDate = date ? new Date(date) : new Date();

    let whereClause = { isActive: true };
    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    const accounts = await req.prisma.account.findMany({
      where: whereClause,
      include: {
        institution: {
          select: { id: true, name: true }
        }
      },
      orderBy: { code: 'asc' }
    });

    // Calcular balances para cada cuenta
    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const balance = await calculateAccountBalance(req.prisma, account.id, balanceDate);
        return {
          ...account,
          balance
        };
      })
    );

    // Organizar por tipo de cuenta
    const balanceSheet = {
      assets: accountsWithBalance.filter(acc => acc.accountType === 'ASSET'),
      liabilities: accountsWithBalance.filter(acc => acc.accountType === 'LIABILITY'),
      equity: accountsWithBalance.filter(acc => acc.accountType === 'EQUITY'),
      income: accountsWithBalance.filter(acc => acc.accountType === 'INCOME'),
      expenses: accountsWithBalance.filter(acc => acc.accountType === 'EXPENSE')
    };

    // Calcular totales
    const totals = {
      assets: balanceSheet.assets.reduce((sum, acc) => sum + parseFloat(acc.balance), 0),
      liabilities: balanceSheet.liabilities.reduce((sum, acc) => sum + parseFloat(acc.balance), 0),
      equity: balanceSheet.equity.reduce((sum, acc) => sum + parseFloat(acc.balance), 0),
      income: balanceSheet.income.reduce((sum, acc) => sum + parseFloat(acc.balance), 0),
      expenses: balanceSheet.expenses.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)
    };

    res.json({
      success: true,
      data: balanceSheet,
      totals,
      date: balanceDate,
      institution: institutionId ? accounts[0]?.institution : null
    });

  } catch (error) {
    next(error);
  }
};

// ===================================
// FUNCIONES AUXILIARES
// ===================================

function buildAccountTree(accounts) {
  const accountMap = new Map();
  const rootAccounts = [];

  // Crear mapa de cuentas
  accounts.forEach(account => {
    accountMap.set(account.id, { ...account, children: [] });
  });

  // Construir árbol
  accounts.forEach(account => {
    if (account.parentId) {
      const parent = accountMap.get(account.parentId);
      if (parent) {
        parent.children.push(accountMap.get(account.id));
      }
    } else {
      rootAccounts.push(accountMap.get(account.id));
    }
  });

  return rootAccounts;
}

function getAccountsByType(accounts) {
  const byType = {};
  accounts.forEach(account => {
    byType[account.accountType] = (byType[account.accountType] || 0) + 1;
  });
  return byType;
}

function getAccountsByInstitution(accounts) {
  const byInstitution = {};
  accounts.forEach(account => {
    const instName = account.institution?.name || 'Sin institución';
    byInstitution[instName] = (byInstitution[instName] || 0) + 1;
  });
  return byInstitution;
}

async function calculateAccountBalance(prisma, accountId, date = new Date()) {
  const [debitSum, creditSum] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        debitAccountId: accountId,
        date: { lte: date },
        status: 'APPROVED'
      },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: {
        creditAccountId: accountId,
        date: { lte: date },
        status: 'APPROVED'
      },
      _sum: { amount: true }
    })
  ]);

  const debits = parseFloat(debitSum._sum.amount || 0);
  const credits = parseFloat(creditSum._sum.amount || 0);

  return debits - credits;
}

/**
 * Actualizar cuenta
 */
const updateAccount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de cuenta inválidos', errors.array()));
    }

    const { id } = req.params;
    const { code, name, accountType, parentId, level } = req.body;
    const institutionId = await getInstitutionId(req);
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Debe especificar una institución'
      });
    }

    // Verificar que la cuenta existe
    const existingAccount = await req.prisma.account.findFirst({
      where: { id, institutionId }
    });

    if (!existingAccount) {
      return next(new NotFoundError('Cuenta no encontrada'));
    }

    // Verificar código único si cambió
    if (code !== existingAccount.code) {
      const codeExists = await req.prisma.account.findUnique({
        where: {
          institutionId_code: {
            institutionId,
            code
          }
        }
      });

      if (codeExists) {
        return next(new ConflictError('Ya existe una cuenta con este código'));
      }
    }

    // Verificar cuenta padre si se especifica
    if (parentId && parentId !== existingAccount.parentId) {
      const parentAccount = await req.prisma.account.findFirst({
        where: { id: parentId, institutionId }
      });

      if (!parentAccount) {
        return next(new NotFoundError('Cuenta padre no encontrada'));
      }
    }

    const account = await req.prisma.account.update({
      where: { id },
      data: {
        code,
        name,
        accountType,
        parentId,
        level: level || existingAccount.level
      },
      include: {
        institution: {
          select: { id: true, name: true }
        },
        parent: {
          select: { id: true, code: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Cuenta actualizada exitosamente',
      data: account
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar cuenta
 */
const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institutionId = await getInstitutionId(req);

    // Verificar que la cuenta existe
    const account = await req.prisma.account.findFirst({
      where: { id, institutionId },
      include: {
        children: true,
        debitTransactions: true,
        creditTransactions: true
      }
    });

    if (!account) {
      return next(new NotFoundError('Cuenta no encontrada'));
    }

    // Verificar que no tenga cuentas hijas
    if (account.children.length > 0) {
      return next(new ConflictError('No se puede eliminar una cuenta que tiene subcuentas'));
    }

    // Verificar que no tenga transacciones
    if (account.debitTransactions.length > 0 || account.creditTransactions.length > 0) {
      return next(new ConflictError('No se puede eliminar una cuenta que tiene transacciones'));
    }

    await req.prisma.account.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener transacción por ID
 */
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institutionId = await getInstitutionId(req);

    let whereClause = { id };
    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    const transaction = await req.prisma.transaction.findFirst({
      where: whereClause,
      include: {
        debitAccount: {
          select: { id: true, code: true, name: true, accountType: true }
        },
        creditAccount: {
          select: { id: true, code: true, name: true, accountType: true }
        },
        institution: {
          select: { id: true, name: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    if (!transaction) {
      return next(new NotFoundError('Transacción no encontrada'));
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar transacción
 */
const updateTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de transacción inválidos', errors.array()));
    }

    const { id } = req.params;
    const { date, reference, description, amount, type, debitAccountId, creditAccountId } = req.body;
    const institutionId = await getInstitutionId(req);
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Debe especificar una institución'
      });
    }

    // Verificar que la transacción existe
    const existingTransaction = await req.prisma.transaction.findFirst({
      where: { id, institutionId }
    });

    if (!existingTransaction) {
      return next(new NotFoundError('Transacción no encontrada'));
    }

    // Solo se pueden editar transacciones pendientes
    if (existingTransaction.status !== 'PENDING') {
      return next(new ConflictError('Solo se pueden editar transacciones pendientes'));
    }

    // Verificar cuentas
    const [debitAccount, creditAccount] = await Promise.all([
      req.prisma.account.findFirst({
        where: { id: debitAccountId, institutionId }
      }),
      req.prisma.account.findFirst({
        where: { id: creditAccountId, institutionId }
      })
    ]);

    if (!debitAccount) {
      return next(new NotFoundError('Cuenta débito no encontrada'));
    }

    if (!creditAccount) {
      return next(new NotFoundError('Cuenta crédito no encontrada'));
    }

    const transaction = await req.prisma.transaction.update({
      where: { id },
      data: {
        date: new Date(date),
        reference,
        description,
        amount: parseFloat(amount),
        type,
        debitAccountId,
        creditAccountId
      },
      include: {
        debitAccount: {
          select: { id: true, code: true, name: true, accountType: true }
        },
        creditAccount: {
          select: { id: true, code: true, name: true, accountType: true }
        },
        institution: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Transacción actualizada exitosamente',
      data: transaction
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar transacción
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institutionId = await getInstitutionId(req);

    const transaction = await req.prisma.transaction.findFirst({
      where: { id, institutionId }
    });

    if (!transaction) {
      return next(new NotFoundError('Transacción no encontrada'));
    }

    // Solo se pueden eliminar transacciones pendientes
    if (transaction.status !== 'PENDING') {
      return next(new ConflictError('Solo se pueden eliminar transacciones pendientes'));
    }

    await req.prisma.transaction.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Transacción eliminada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Aprobar transacción
 */
const approveTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institutionId = await getInstitutionId(req);

    const transaction = await req.prisma.transaction.findFirst({
      where: { id, institutionId }
    });

    if (!transaction) {
      return next(new NotFoundError('Transacción no encontrada'));
    }

    if (transaction.status !== 'PENDING') {
      return next(new ConflictError('Solo se pueden aprobar transacciones pendientes'));
    }

    const updatedTransaction = await req.prisma.transaction.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        debitAccount: {
          select: { id: true, code: true, name: true, accountType: true }
        },
        creditAccount: {
          select: { id: true, code: true, name: true, accountType: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Transacción aprobada exitosamente',
      data: updatedTransaction
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Rechazar transacción
 */
const rejectTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institutionId = await getInstitutionId(req);

    const transaction = await req.prisma.transaction.findFirst({
      where: { id, institutionId }
    });

    if (!transaction) {
      return next(new NotFoundError('Transacción no encontrada'));
    }

    if (transaction.status !== 'PENDING') {
      return next(new ConflictError('Solo se pueden rechazar transacciones pendientes'));
    }

    const updatedTransaction = await req.prisma.transaction.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        debitAccount: {
          select: { id: true, code: true, name: true, accountType: true }
        },
        creditAccount: {
          select: { id: true, code: true, name: true, accountType: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Transacción rechazada exitosamente',
      data: updatedTransaction
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Estado de resultados
 */
const getIncomeStatement = async (req, res, next) => {
  try {
    const institutionId = await getInstitutionId(req);
    const { startDate, endDate } = req.query;
    
    if (!institutionId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    let whereClause = { isActive: true };
    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    // Obtener cuentas de ingresos y gastos
    const accounts = await req.prisma.account.findMany({
      where: {
        ...whereClause,
        accountType: { in: ['INCOME', 'EXPENSE'] }
      },
      include: {
        institution: {
          select: { id: true, name: true }
        }
      },
      orderBy: { code: 'asc' }
    });

    // Calcular balances para el período
    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const balance = await calculateAccountBalanceForPeriod(req.prisma, account.id, start, end);
        return {
          ...account,
          balance
        };
      })
    );

    const incomeStatement = {
      income: accountsWithBalance.filter(acc => acc.accountType === 'INCOME'),
      expenses: accountsWithBalance.filter(acc => acc.accountType === 'EXPENSE')
    };

    const totals = {
      income: incomeStatement.income.reduce((sum, acc) => sum + parseFloat(acc.balance), 0),
      expenses: incomeStatement.expenses.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)
    };

    totals.netIncome = totals.income - totals.expenses;

    res.json({
      success: true,
      data: incomeStatement,
      totals,
      period: { startDate: start, endDate: end },
      institution: institutionId ? accounts[0]?.institution : null
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Balance de comprobación
 */
const getTrialBalance = async (req, res, next) => {
  try {
    const institutionId = await getInstitutionId(req);
    const { date } = req.query;
    
    if (!institutionId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin institución asignada'
      });
    }

    const balanceDate = date ? new Date(date) : new Date();

    let whereClause = { isActive: true };
    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    const accounts = await req.prisma.account.findMany({
      where: whereClause,
      include: {
        institution: {
          select: { id: true, name: true }
        }
      },
      orderBy: { code: 'asc' }
    });

    // Calcular débitos y créditos para cada cuenta
    const trialBalance = await Promise.all(
      accounts.map(async (account) => {
        const [debitSum, creditSum] = await Promise.all([
          req.prisma.transaction.aggregate({
            where: {
              debitAccountId: account.id,
              date: { lte: balanceDate },
              status: 'APPROVED'
            },
            _sum: { amount: true }
          }),
          req.prisma.transaction.aggregate({
            where: {
              creditAccountId: account.id,
              date: { lte: balanceDate },
              status: 'APPROVED'
            },
            _sum: { amount: true }
          })
        ]);

        const debits = parseFloat(debitSum._sum.amount || 0);
        const credits = parseFloat(creditSum._sum.amount || 0);
        const balance = debits - credits;

        return {
          ...account,
          debits,
          credits,
          balance
        };
      })
    );

    // Calcular totales
    const totals = {
      debits: trialBalance.reduce((sum, acc) => sum + acc.debits, 0),
      credits: trialBalance.reduce((sum, acc) => sum + acc.credits, 0)
    };

    res.json({
      success: true,
      data: trialBalance,
      totals,
      date: balanceDate,
      institution: institutionId ? accounts[0]?.institution : null
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Libro mayor de cuenta
 */
const getAccountLedger = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const institutionId = await getInstitutionId(req);

    let whereClause = { id };
    if (institutionId) {
      whereClause.institutionId = institutionId;
    }

    const account = await req.prisma.account.findFirst({
      where: whereClause,
      include: {
        institution: {
          select: { id: true, name: true }
        }
      }
    });

    if (!account) {
      return next(new NotFoundError('Cuenta no encontrada'));
    }

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Obtener todas las transacciones de la cuenta
    const transactions = await req.prisma.transaction.findMany({
      where: {
        OR: [
          { debitAccountId: id },
          { creditAccountId: id }
        ],
        date: {
          gte: start,
          lte: end
        },
        status: 'APPROVED'
      },
      include: {
        debitAccount: {
          select: { id: true, code: true, name: true }
        },
        creditAccount: {
          select: { id: true, code: true, name: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calcular balance inicial
    const initialBalance = await calculateAccountBalance(req.prisma, id, start);

    // Procesar transacciones para el libro mayor
    let runningBalance = initialBalance;
    const ledgerEntries = transactions.map(transaction => {
      const isDebit = transaction.debitAccountId === id;
      const amount = parseFloat(transaction.amount);
      
      if (isDebit) {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }

      return {
        ...transaction,
        isDebit,
        debitAmount: isDebit ? amount : 0,
        creditAmount: isDebit ? 0 : amount,
        balance: runningBalance,
        counterAccount: isDebit ? transaction.creditAccount : transaction.debitAccount
      };
    });

    res.json({
      success: true,
      data: {
        account,
        initialBalance,
        finalBalance: runningBalance,
        entries: ledgerEntries
      },
      period: { startDate: start, endDate: end }
    });

  } catch (error) {
    next(error);
  }
};

// Función auxiliar para calcular balance en un período
async function calculateAccountBalanceForPeriod(prisma, accountId, startDate, endDate) {
  const [debitSum, creditSum] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        debitAccountId: accountId,
        date: { gte: startDate, lte: endDate },
        status: 'APPROVED'
      },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: {
        creditAccountId: accountId,
        date: { gte: startDate, lte: endDate },
        status: 'APPROVED'
      },
      _sum: { amount: true }
    })
  ]);

  const debits = parseFloat(debitSum._sum.amount || 0);
  const credits = parseFloat(creditSum._sum.amount || 0);

  return debits - credits;
}

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction,
  rejectTransaction,
  getBalanceSheet,
  getStats,
  getIncomeStatement,
  getTrialBalance,
  getAccountLedger
};