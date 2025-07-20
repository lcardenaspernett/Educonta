// ===================================
// EDUCONTA - Script de Migración de Datos de Contabilidad
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAccountingData() {
  try {
    console.log('🚀 Iniciando migración de datos de contabilidad...');

    // Buscar una institución existente o crear una de prueba
    let institution = await prisma.institution.findFirst({
      where: { isActive: true }
    });

    if (!institution) {
      console.log('📝 Creando institución de prueba...');
      institution = await prisma.institution.create({
        data: {
          name: 'Institución Educativa Demo',
          nit: '900123456-7',
          address: 'Calle 123 #45-67',
          phone: '+57 1 234 5678',
          email: 'demo@educonta.com',
          city: 'Bogotá',
          department: 'Cundinamarca',
          country: 'Colombia',
          educationLevel: 'MIXTA',
          isActive: true
        }
      });
      console.log(`✅ Institución creada: ${institution.name} (ID: ${institution.id})`);
    } else {
      console.log(`✅ Usando institución existente: ${institution.name} (ID: ${institution.id})`);
    }

    // Crear plan de cuentas básico
    console.log('📊 Creando plan de cuentas...');
    
    const accounts = [
      {
        code: '1105',
        name: 'Caja',
        accountType: 'ASSET',
        level: 2,
        institutionId: institution.id
      },
      {
        code: '1110',
        name: 'Bancos',
        accountType: 'ASSET',
        level: 2,
        institutionId: institution.id
      },
      {
        code: '1305',
        name: 'Cuentas por Cobrar',
        accountType: 'ASSET',
        level: 2,
        institutionId: institution.id
      },
      {
        code: '2105',
        name: 'Proveedores',
        accountType: 'LIABILITY',
        level: 2,
        institutionId: institution.id
      },
      {
        code: '2205',
        name: 'Cuentas por Pagar',
        accountType: 'LIABILITY',
        level: 2,
        institutionId: institution.id
      },
      {
        code: '3105',
        name: 'Capital Social',
        accountType: 'EQUITY',
        level: 2,
        institutionId: institution.id
      },
      {
        code: '4135',
        name: 'Ingresos por Servicios Educativos',
        accountType: 'INCOME',
        level: 2,
        institutionId: institution.id
      },
      {
        code: '4205',
        name: 'Otros Ingresos',
        accountType: 'INCOME',
        level: 2,
        institutionId: institution.id
      },
      {
        code: '5105',
        name: 'Gastos Administrativos',
        accountType: 'EXPENSE',
        level: 2,
        institutionId: institution.id
      },
      {
        code: '5205',
        name: 'Gastos de Servicios Públicos',
        accountType: 'EXPENSE',
        level: 2,
        institutionId: institution.id
      }
    ];

    // Crear cuentas en la base de datos
    const createdAccounts = [];
    for (const accountData of accounts) {
      // Verificar si la cuenta ya existe
      const existingAccount = await prisma.account.findFirst({
        where: {
          code: accountData.code,
          institutionId: institution.id
        }
      });

      if (!existingAccount) {
        const account = await prisma.account.create({
          data: accountData
        });
        createdAccounts.push(account);
        console.log(`  ✅ Cuenta creada: ${account.code} - ${account.name}`);
      } else {
        createdAccounts.push(existingAccount);
        console.log(`  ⚠️  Cuenta ya existe: ${existingAccount.code} - ${existingAccount.name}`);
      }
    }

    // Crear transacciones de ejemplo
    console.log('💰 Creando transacciones de ejemplo...');
    
    const caja = createdAccounts.find(acc => acc.code === '1105');
    const bancos = createdAccounts.find(acc => acc.code === '1110');
    const ingresos = createdAccounts.find(acc => acc.code === '4135');
    const gastos = createdAccounts.find(acc => acc.code === '5105');
    const capital = createdAccounts.find(acc => acc.code === '3105');

    const transactions = [
      {
        date: new Date(),
        reference: 'FAC-001',
        description: 'Venta de servicios educativos - Matrícula estudiantes',
        amount: 500000,
        type: 'INCOME',
        status: 'APPROVED',
        debitAccountId: caja.id,
        creditAccountId: ingresos.id,
        institutionId: institution.id
      },
      {
        date: new Date(),
        reference: 'REC-001',
        description: 'Pago de servicios públicos - Energía eléctrica',
        amount: 150000,
        type: 'EXPENSE',
        status: 'APPROVED',
        debitAccountId: gastos.id,
        creditAccountId: caja.id,
        institutionId: institution.id
      },
      {
        date: new Date(Date.now() - 86400000), // Ayer
        reference: 'TRF-001',
        description: 'Transferencia de Caja a Bancos',
        amount: 200000,
        type: 'TRANSFER',
        status: 'APPROVED',
        debitAccountId: bancos.id,
        creditAccountId: caja.id,
        institutionId: institution.id
      },
      {
        date: new Date(Date.now() - 172800000), // Hace 2 días
        reference: 'CAP-001',
        description: 'Aporte inicial de capital',
        amount: 1000000,
        type: 'INCOME',
        status: 'APPROVED',
        debitAccountId: caja.id,
        creditAccountId: capital.id,
        institutionId: institution.id
      },
      {
        date: new Date(),
        reference: 'FAC-002',
        description: 'Venta de servicios educativos - Pensiones',
        amount: 750000,
        type: 'INCOME',
        status: 'PENDING',
        debitAccountId: caja.id,
        creditAccountId: ingresos.id,
        institutionId: institution.id
      }
    ];

    // Crear transacciones en la base de datos
    for (const transactionData of transactions) {
      // Verificar si la transacción ya existe
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          reference: transactionData.reference,
          institutionId: institution.id
        }
      });

      if (!existingTransaction) {
        const transaction = await prisma.transaction.create({
          data: transactionData
        });
        console.log(`  ✅ Transacción creada: ${transaction.reference} - $${transaction.amount.toLocaleString()}`);
      } else {
        console.log(`  ⚠️  Transacción ya existe: ${existingTransaction.reference}`);
      }
    }

    console.log('\n🎉 ¡Migración de datos completada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Institución: ${institution.name}`);
    console.log(`   - Cuentas creadas: ${accounts.length}`);
    console.log(`   - Transacciones creadas: ${transactions.length}`);
    console.log(`\n🔗 Ahora puedes usar los endpoints de la API con datos reales:`);
    console.log(`   - GET /api/accounting/accounts`);
    console.log(`   - GET /api/accounting/transactions`);
    console.log(`   - GET /api/accounting/stats`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  seedAccountingData()
    .then(() => {
      console.log('✅ Script ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { seedAccountingData };
