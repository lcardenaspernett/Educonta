// routes/financial.js
// ===================================
// EDUCONTA - Rutas Financieras
// ===================================

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { authenticate, requirePermission, applyTenantFilter } = require('../middleware/auth');

const router = express.Router();

// ===================================
// MIDDLEWARE DE AUTENTICACIÓN
// ===================================
router.use(authenticate);
router.use(applyTenantFilter);

// ===================================
// VALIDACIONES
// ===================================

const validateTransaction = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a 0'),
  
  body('description')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('La descripción debe tener entre 3 y 500 caracteres'),
  
  body('type')
    .isIn(['INCOME', 'EXPENSE', 'TRANSFER'])
    .withMessage('Tipo de transacción inválido'),
  
  body('categoryId')
    .optional()
    .isString()
    .withMessage('ID de categoría inválido'),
  
  body('debitAccountId')
    .isString()
    .withMessage('Cuenta de débito requerida'),
  
  body('creditAccountId')
    .isString()
    .withMessage('Cuenta de crédito requerida')
];

const validateInvoice = [
  body('studentId')
    .isString()
    .withMessage('ID de estudiante requerido'),
  
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a 0'),
  
  body('concept')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('El concepto debe tener entre 2 y 200 caracteres'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de vencimiento inválida')
];

// ===================================
// DASHBOARD FINANCIERO
// ===================================

router.get('/dashboard', 
  requirePermission('dashboard', 'read'),
  async (req, res, next) => {
    try {
      const institutionId = req.user.institutionId;
      
      // Obtener estadísticas del mes actual
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Ingresos del mes
      const monthlyIncome = await req.prisma.transaction.aggregate({
        where: {
          institutionId,
          type: 'INCOME',
          date: {
            gte: firstDay,
            lte: lastDay
          },
          status: 'APPROVED'
        },
        _sum: {
          amount: true
        }
      });

      // Gastos del mes
      const monthlyExpenses = await req.prisma.transaction.aggregate({
        where: {
          institutionId,
          type: 'EXPENSE',
          date: {
            gte: firstDay,
            lte: lastDay
          },
          status: 'APPROVED'
        },
        _sum: {
          amount: true
        }
      });

      // Facturas pendientes
      const pendingInvoices = await req.prisma.invoice.count({
        where: {
          institutionId,
          status: 'PENDING'
        }
      });

      // Cartera vencida
      const overdueInvoices = await req.prisma.invoice.aggregate({
        where: {
          institutionId,
          status: 'OVERDUE',
          dueDate: {
            lt: new Date()
          }
        },
        _sum: {
          total: true
        }
      });

      // Próximos vencimientos (7 días)
      const upcomingDue = await req.prisma.invoice.aggregate({
        where: {
          institutionId,
          status: 'PENDING',
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        },
        _sum: {
          total: true
        }
      });

      // Transacciones recientes
      const recentTransactions = await req.prisma.transaction.findMany({
        where: {
          institutionId
        },
        include: {
          debitAccount: { select: { name: true } },
          creditAccount: { select: { name: true } },
          category: { select: { name: true, color: true } }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });

      // Balance neto
      const totalIncome = monthlyIncome._sum.amount || 0;
      const totalExpenses = monthlyExpenses._sum.amount || 0;
      const netBalance = totalIncome - totalExpenses;

      res.json({
        success: true,
        data: {
          stats: {
            totalIncome,
            totalExpenses,
            netBalance,
            pendingInvoices,
            overdueAmount: overdueInvoices._sum.total || 0,
            upcomingDue: upcomingDue._sum.total || 0
          },
          recentTransactions,
          period: {
            start: firstDay,
            end: lastDay
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ===================================
// GESTIÓN DE TRANSACCIONES
// ===================================

// Registrar ingreso
router.post('/income',
  requirePermission('accounting', 'create'),
  validateTransaction,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const {
        amount,
        description,
        categoryId,
        reference,
        studentId
      } = req.body;

      const institutionId = req.user.institutionId;

      // Obtener cuentas por defecto para ingresos
      const cashAccount = await req.prisma.account.findFirst({
        where: {
          institutionId,
          code: '1105', // Caja
          isActive: true
        }
      });

      const incomeAccount = await req.prisma.account.findFirst({
        where: {
          institutionId,
          accountType: 'INCOME',
          isActive: true
        }
      });

      if (!cashAccount || !incomeAccount) {
        return res.status(400).json({
          success: false,
          error: 'Cuentas contables no configuradas'
        });
      }

      // Crear transacción de ingreso
      const transaction = await req.prisma.transaction.create({
        data: {
          date: new Date(),
          reference: reference || generateReference(),
          description,
          amount: parseFloat(amount),
          type: 'INCOME',
          status: 'APPROVED',
          debitAccountId: cashAccount.id,  // Débito a Caja
          creditAccountId: incomeAccount.id, // Crédito a Ingresos
          categoryId,
          institutionId
        },
        include: {
          debitAccount: true,
          creditAccount: true,
          category: true
        }
      });

      // Si está asociado a un estudiante, crear o actualizar pago
      if (studentId) {
        await processStudentPayment(req.prisma, studentId, amount, transaction.id);
      }

      // Registrar auditoría
      await req.prisma.auditLog.create({
        data: {
          action: 'CREATE_INCOME',
          tableName: 'transactions',
          recordId: transaction.id,
          newValues: { amount, description, type: 'INCOME' },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          institutionId,
          userId: req.user.id
        }
      });

      res.status(201).json({
        success: true,
        message: 'Ingreso registrado exitosamente',
        data: transaction
      });

    } catch (error) {
      next(error);
    }
  }
);

// Registrar gasto
router.post('/expense',
  requirePermission('accounting', 'create'),
  validateTransaction,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const {
        amount,
        description,
        categoryId,
        reference
      } = req.body;

      const institutionId = req.user.institutionId;

      // Obtener cuentas por defecto para gastos
      const expenseAccount = await req.prisma.account.findFirst({
        where: {
          institutionId,
          accountType: 'EXPENSE',
          isActive: true
        }
      });

      const cashAccount = await req.prisma.account.findFirst({
        where: {
          institutionId,
          code: '1105', // Caja
          isActive: true
        }
      });

      if (!expenseAccount || !cashAccount) {
        return res.status(400).json({
          success: false,
          error: 'Cuentas contables no configuradas'
        });
      }

      // Crear transacción de gasto
      const transaction = await req.prisma.transaction.create({
        data: {
          date: new Date(),
          reference: reference || generateReference(),
          description,
          amount: parseFloat(amount),
          type: 'EXPENSE',
          status: 'APPROVED',
          debitAccountId: expenseAccount.id,  // Débito a Gastos
          creditAccountId: cashAccount.id,    // Crédito a Caja
          categoryId,
          institutionId
        },
        include: {
          debitAccount: true,
          creditAccount: true,
          category: true
        }
      });

      // Registrar auditoría
      await req.prisma.auditLog.create({
        data: {
          action: 'CREATE_EXPENSE',
          tableName: 'transactions',
          recordId: transaction.id,
          newValues: { amount, description, type: 'EXPENSE' },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          institutionId,
          userId: req.user.id
        }
      });

      res.status(201).json({
        success: true,
        message: 'Gasto registrado exitosamente',
        data: transaction
      });

    } catch (error) {
      next(error);
    }
  }
);

// ===================================
// GESTIÓN DE FACTURAS
// ===================================

// Generar factura automática
router.post('/invoice',
  requirePermission('invoices', 'create'),
  validateInvoice,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const {
        studentId,
        amount,
        concept,
        dueDate,
        notes
      } = req.body;

      const institutionId = req.user.institutionId;

      // Verificar que el estudiante existe y pertenece a la institución
      const student = await req.prisma.student.findFirst({
        where: {
          id: studentId,
          institutionId
        }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Estudiante no encontrado'
        });
      }

      // Generar número de factura consecutivo
      const lastInvoice = await req.prisma.invoice.findFirst({
        where: { institutionId },
        orderBy: { invoiceNumber: 'desc' }
      });

      const nextNumber = lastInvoice 
        ? parseInt(lastInvoice.invoiceNumber) + 1 
        : 1;

      const invoiceNumber = nextNumber.toString().padStart(6, '0');

      // Calcular impuestos si aplica
      const subtotal = parseFloat(amount);
      const tax = 0; // Ajustar según configuración
      const total = subtotal + tax;

      // Crear factura
      const invoice = await req.prisma.invoice.create({
        data: {
          invoiceNumber,
          date: new Date(),
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          subtotal,
          tax,
          total,
          status: 'PENDING',
          notes: notes || concept,
          institutionId,
          studentId
        },
        include: {
          student: {
            select: {
              studentCode: true,
              firstName: true,
              lastName: true,
              parentEmail: true
            }
          }
        }
      });

      // Crear transacción contable automática
      const accountsReceivable = await req.prisma.account.findFirst({
        where: {
          institutionId,
          code: '1305', // Cuentas por Cobrar Estudiantes
          isActive: true
        }
      });

      const incomeAccount = await req.prisma.account.findFirst({
        where: {
          institutionId,
          accountType: 'INCOME',
          isActive: true
        }
      });

      if (accountsReceivable && incomeAccount) {
        await req.prisma.transaction.create({
          data: {
            date: new Date(),
            reference: `FAC-${invoiceNumber}`,
            description: `Factura ${invoiceNumber} - ${student.firstName} ${student.lastName}`,
            amount: total,
            type: 'INCOME',
            status: 'PENDING',
            debitAccountId: accountsReceivable.id,
            creditAccountId: incomeAccount.id,
            invoiceId: invoice.id,
            institutionId
          }
        });
      }

      // Enviar notificación por email (implementar según configuración)
      if (student.parentEmail) {
        await sendInvoiceNotification(student.parentEmail, invoice);
      }

      // Registrar auditoría
      await req.prisma.auditLog.create({
        data: {
          action: 'CREATE_INVOICE',
          tableName: 'invoices',
          recordId: invoice.id,
          newValues: { invoiceNumber, total, studentId },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          institutionId,
          userId: req.user.id
        }
      });

      res.status(201).json({
        success: true,
        message: 'Factura generada exitosamente',
        data: invoice
      });

    } catch (error) {
      next(error);
    }
  }
);

// Obtener lista de transacciones
router.get('/transactions',
  requirePermission('accounting', 'read'),
  async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        startDate,
        endDate,
        search
      } = req.query;

      const institutionId = req.user.institutionId;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Construir filtros
      const where = { institutionId };

      if (type) {
        where.type = type;
      }

      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Obtener transacciones
      const [transactions, totalCount] = await Promise.all([
        req.prisma.transaction.findMany({
          where,
          include: {
            debitAccount: { select: { name: true, code: true } },
            creditAccount: { select: { name: true, code: true } },
            category: { select: { name: true, color: true } }
          },
          orderBy: { date: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        req.prisma.transaction.count({ where })
      ]);

      res.json({
        success: true,
        data: transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          limit: parseInt(limit)
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ===================================
// FUNCIONES AUXILIARES
// ===================================

function generateReference() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${year}${month}${day}-${random}`;
}

async function processStudentPayment(prisma, studentId, amount, transactionId) {
  // Buscar asignaciones de pago pendientes para el estudiante
  const pendingAssignments = await prisma.paymentAssignment.findMany({
    where: {
      studentId,
      status: { in: ['PENDING', 'PARTIAL'] }
    },
    orderBy: { assignedDate: 'asc' }
  });

  let remainingAmount = parseFloat(amount);

  for (const assignment of pendingAssignments) {
    if (remainingAmount <= 0) break;

    const pendingAmount = assignment.amount - assignment.paidAmount;
    const paymentAmount = Math.min(remainingAmount, pendingAmount);

    await prisma.paymentAssignment.update({
      where: { id: assignment.id },
      data: {
        paidAmount: assignment.paidAmount + paymentAmount,
        status: (assignment.paidAmount + paymentAmount >= assignment.amount) ? 'PAID' : 'PARTIAL',
        paidDate: new Date()
      }
    });

    remainingAmount -= paymentAmount;
  }
}

async function sendInvoiceNotification(email, invoice) {
  // Implementar envío de email
  console.log(`📧 Enviando factura ${invoice.invoiceNumber} a ${email}`);
  // TODO: Integrar con servicio de email
}

module.exports = router;