// ===================================
// EDUCONTA - Script de Datos de Prueba para Contabilidad
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAccountingTestData() {
  try {
    console.log('🔄 Creando datos de prueba para contabilidad...');

    // Obtener la primera institución disponible
    const institution = await prisma.institution.findFirst();
    if (!institution) {
      throw new Error('No hay instituciones disponibles. Ejecuta primero el seed principal.');
    }

    console.log(`📍 Usando institución: ${institution.name}`);

    // Plan de cuentas básico
    const accounts = [
      // ACTIVOS (Nivel 1)
      { code: '1', name: 'ACTIVOS', type: 'ASSET', level: 1, parent: null },
      { code: '11', name: 'ACTIVO CORRIENTE', type: 'ASSET', level: 2, parent: '1' },
      { code: '1105', name: 'CAJA', type: 'ASSET', level: 3, parent: '11' },
      { code: '1110', name: 'BANCOS', type: 'ASSET', level: 3, parent: '11' },
      { code: '1305', name: 'CLIENTES', type: 'ASSET', level: 3, parent: '11' },
      
      // PASIVOS (Nivel 1)
      { code: '2', name: 'PASIVOS', type: 'LIABILITY', level: 1, parent: null },
      { code: '21', name: 'PASIVO CORRIENTE', type: 'LIABILITY', level: 2, parent: '2' },
      { code: '2105', name: 'PROVEEDORES', type: 'LIABILITY', level: 3, parent: '21' },
      { code: '2365', name: 'RETENCIONES POR PAGAR', type: 'LIABILITY', level: 3, parent: '21' },
      
      // PATRIMONIO (Nivel 1)
      { code: '3', name: 'PATRIMONIO', type: 'EQUITY', level: 1, parent: null },
      { code: '31', name: 'CAPITAL SOCIAL', type: 'EQUITY', level: 2, parent: '3' },
      { code: '3105', name: 'CAPITAL SUSCRITO Y PAGADO', type: 'EQUITY', level: 3, parent: '31' },
      
      // INGRESOS (Nivel 1)
      { code: '4', name: 'INGRESOS', type: 'INCOME', level: 1, parent: null },
      { code: '41', name: 'INGRESOS OPERACIONALES', type: 'INCOME', level: 2, parent: '4' },
      { code: '4135', name: 'SERVICIOS EDUCATIVOS', type: 'INCOME', level: 3, parent: '41' },
      { code: '4175', name: 'OTROS INGRESOS', type: 'INCOME', level: 3, parent: '41' },
      
      // GASTOS (Nivel 1)
      { code: '5', name: 'GASTOS', type: 'EXPENSE', level: 1, parent: null },
      { code: '51', name: 'GASTOS OPERACIONALES', type: 'EXPENSE', level: 2, parent: '5' },
      { code: '5105', name: 'GASTOS DE PERSONAL', type: 'EXPENSE', level: 3, parent: '51' },
      { code: '5115', name: 'GASTOS GENERALES', type: 'EXPENSE', level: 3, parent: '51' }
    ];

    // Crear cuentas con jerarquía
    const createdAccounts = {};
    
    for (const accountData of accounts) {
      const parentId = accountData.parent ? createdAccounts[accountData.parent]?.id : null;
      
      // Verificar si la cuenta ya existe
      let account = await prisma.account.findUnique({
        where: {
          institutionId_code: {
            institutionId: institution.id,
            code: accountData.code
          }
        }
      });

      if (!account) {
        account = await prisma.account.create({
          data: {
            code: accountData.code,
            name: accountData.name,
            accountType: accountData.type,
            level: accountData.level,
            parentId,
            institutionId: institution.id,
            isActive: true
          }
        });
        console.log(`✅ Cuenta creada: ${account.code} - ${account.name}`);
      } else {
        console.log(`ℹ️ Cuenta ya existe: ${account.code} - ${account.name}`);
      }
      
      createdAccounts[accountData.code] = account;
    }

    // Crear transacciones de ejemplo
    const transactions = [
      {
        date: new Date('2024-01-15'),
        reference: 'COMP-001',
        description: 'Pago de matrícula estudiante Juan Pérez',
        amount: 500000,
        type: 'INCOME',
        debitAccount: '1105', // CAJA
        creditAccount: '4135' // SERVICIOS EDUCATIVOS
      },
      {
        date: new Date('2024-01-16'),
        reference: 'COMP-002',
        description: 'Depósito en banco',
        amount: 400000,
        type: 'TRANSFER',
        debitAccount: '1110', // BANCOS
        creditAccount: '1105' // CAJA
      },
      {
        date: new Date('2024-01-17'),
        reference: 'COMP-003',
        description: 'Pago salario docente',
        amount: 2500000,
        type: 'EXPENSE',
        debitAccount: '5105', // GASTOS DE PERSONAL
        creditAccount: '1110' // BANCOS
      },
      {
        date: new Date('2024-01-18'),
        reference: 'COMP-004',
        description: 'Compra de materiales educativos',
        amount: 150000,
        type: 'EXPENSE',
        debitAccount: '5115', // GASTOS GENERALES
        creditAccount: '2105' // PROVEEDORES
      },
      {
        date: new Date('2024-01-19'),
        reference: 'COMP-005',
        description: 'Pago de mensualidad estudiante María García',
        amount: 300000,
        type: 'INCOME',
        debitAccount: '1105', // CAJA
        creditAccount: '4135' // SERVICIOS EDUCATIVOS
      }
    ];

    for (const transactionData of transactions) {
      const debitAccount = createdAccounts[transactionData.debitAccount];
      const creditAccount = createdAccounts[transactionData.creditAccount];

      if (!debitAccount || !creditAccount) {
        console.log(`⚠️ Saltando transacción ${transactionData.reference} - cuentas no encontradas`);
        continue;
      }

      const transaction = await prisma.transaction.create({
        data: {
          date: transactionData.date,
          reference: transactionData.reference,
          description: transactionData.description,
          amount: transactionData.amount,
          type: transactionData.type,
          debitAccountId: debitAccount.id,
          creditAccountId: creditAccount.id,
          institutionId: institution.id,
          status: 'APPROVED'
        }
      });

      console.log(`✅ Transacción creada: ${transaction.reference} - ${transaction.description}`);
    }

    console.log('🎉 Datos de prueba de contabilidad creados exitosamente!');
    console.log(`📊 Cuentas creadas: ${Object.keys(createdAccounts).length}`);
    console.log(`💰 Transacciones creadas: ${transactions.length}`);

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAccountingTestData();
}

module.exports = { createAccountingTestData };