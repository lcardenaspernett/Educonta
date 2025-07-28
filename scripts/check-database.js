// scripts/check-database.js
// ===================================
// EDUCONTA - Script para consultar base de datos
// ===================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 EDUCONTA - REVISIÓN DE BASE DE DATOS');
    console.log('=====================================\n');

    // 1. Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a base de datos exitosa\n');

    // 2. Contar registros totales
    const [
      institutionsCount,
      usersCount,
      studentsCount,
      accountsCount,
      transactionsCount,
      invoicesCount
    ] = await Promise.all([
      prisma.institution.count(),
      prisma.user.count(),
      prisma.student.count(),
      prisma.account.count(),
      prisma.transaction.count(),
      prisma.invoice.count()
    ]);

    console.log('📊 RESUMEN GENERAL:');
    console.log('==================');
    console.log(`📍 Instituciones: ${institutionsCount}`);
    console.log(`👥 Usuarios: ${usersCount}`);
    console.log(`🎓 Estudiantes: ${studentsCount}`);
    console.log(`💰 Cuentas Contables: ${accountsCount}`);
    console.log(`📋 Transacciones: ${transactionsCount}`);
    console.log(`🧾 Facturas: ${invoicesCount}\n`);

    // 3. Mostrar instituciones
    console.log('🏫 INSTITUCIONES REGISTRADAS:');
    console.log('============================');
    
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        nit: true,
        city: true,
        department: true,
        educationLevel: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            students: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (institutions.length === 0) {
      console.log('❌ No hay instituciones registradas');
    } else {
      institutions.forEach((inst, index) => {
        console.log(`\n${index + 1}. ${inst.name}`);
        console.log(`   📧 ID: ${inst.id}`);
        console.log(`   🆔 NIT: ${inst.nit}`);
        console.log(`   📍 Ubicación: ${inst.city}, ${inst.department}`);
        console.log(`   🎓 Nivel: ${inst.educationLevel}`);
        console.log(`   ✅ Estado: ${inst.isActive ? 'Activa' : 'Inactiva'}`);
        console.log(`   👥 Usuarios: ${inst._count.users}`);
        console.log(`   🎓 Estudiantes: ${inst._count.students}`);
        console.log(`   📅 Creada: ${inst.createdAt.toLocaleDateString()}`);
      });
    }

    // 4. Mostrar usuarios por institución
    console.log('\n\n👥 USUARIOS POR INSTITUCIÓN:');
    console.log('============================');

    for (const institution of institutions) {
      const users = await prisma.user.findMany({
        where: { institutionId: institution.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true
        },
        orderBy: { role: 'asc' }
      });

      console.log(`\n🏫 ${institution.name}:`);
      if (users.length === 0) {
        console.log('   ❌ Sin usuarios registrados');
      } else {
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
          console.log(`      📧 Email: ${user.email}`);
          console.log(`      🔑 Rol: ${user.role}`);
          console.log(`      ✅ Estado: ${user.isActive ? 'Activo' : 'Inactivo'}`);
          console.log(`      🕐 Último Login: ${user.lastLogin ? user.lastLogin.toLocaleString() : 'Nunca'}`);
          console.log(`      📅 Creado: ${user.createdAt.toLocaleDateString()}`);
        });
      }
    }

    // 5. Mostrar usuarios super admin
    console.log('\n\n👑 SUPER ADMINISTRADORES:');
    console.log('========================');

    const superAdmins = await prisma.user.findMany({
      where: { 
        role: 'SUPER_ADMIN',
        institutionId: null 
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    if (superAdmins.length === 0) {
      console.log('❌ No hay super administradores registrados');
    } else {
      superAdmins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   ✅ Estado: ${admin.isActive ? 'Activo' : 'Inactivo'}`);
        console.log(`   🕐 Último Login: ${admin.lastLogin ? admin.lastLogin.toLocaleString() : 'Nunca'}`);
        console.log(`   📅 Creado: ${admin.createdAt.toLocaleDateString()}`);
      });
    }

    // 6. Verificar estructura contable
    console.log('\n\n💰 ESTRUCTURA CONTABLE:');
    console.log('======================');

    for (const institution of institutions) {
      const accounts = await prisma.account.findMany({
        where: { institutionId: institution.id },
        select: {
          code: true,
          name: true,
          accountType: true,
          level: true
        },
        orderBy: { code: 'asc' },
        take: 5
      });

      console.log(`\n🏫 ${institution.name}:`);
      if (accounts.length === 0) {
        console.log('   ❌ Sin plan de cuentas configurado');
      } else {
        console.log(`   ✅ ${accounts.length}+ cuentas configuradas`);
        accounts.forEach(account => {
          console.log(`   ${account.code} - ${account.name} (${account.accountType})`);
        });
        if (accounts.length >= 5) {
          const totalAccounts = await prisma.account.count({
            where: { institutionId: institution.id }
          });
          console.log(`   ... y ${totalAccounts - 5} cuentas más`);
        }
      }
    }

    // 7. Verificar datos de prueba
    console.log('\n\n🧪 DATOS DE PRUEBA:');
    console.log('==================');

    const testStudents = await prisma.student.count();
    const testTransactions = await prisma.transaction.count();
    const testInvoices = await prisma.invoice.count();

    console.log(`🎓 Estudiantes de prueba: ${testStudents}`);
    console.log(`📋 Transacciones de prueba: ${testTransactions}`);
    console.log(`🧾 Facturas de prueba: ${testInvoices}`);

    // 8. Credenciales de acceso
    console.log('\n\n🔐 CREDENCIALES DE ACCESO:');
    console.log('=========================');

    console.log('\n👑 SUPER ADMINISTRADOR:');
    if (superAdmins.length > 0) {
      const mainAdmin = superAdmins[0];
      console.log(`   📧 Email: ${mainAdmin.email}`);
      console.log(`   🔑 Password: Admin123! (por defecto)`);
      console.log(`   🌐 URL: http://localhost:3000/select-institution`);
    } else {
      console.log('   ❌ No configurado - ejecutar seed');
    }

    if (institutions.length > 0) {
      console.log('\n🏫 ACCESO POR INSTITUCIÓN:');
      for (const institution of institutions) {
        const institutionUsers = await prisma.user.findMany({
          where: { institutionId: institution.id },
          select: {
            email: true,
            role: true
          },
          take: 3
        });

        console.log(`\n   ${institution.name}:`);
        if (institutionUsers.length > 0) {
          institutionUsers.forEach(user => {
            const defaultPassword = user.role === 'RECTOR' ? 'Rector123!' : 'Conta123!';
            console.log(`   📧 ${user.email} (${user.role})`);
            console.log(`   🔑 Password: ${defaultPassword} (por defecto)`);
          });
        } else {
          console.log('   ❌ Sin usuarios - crear desde super admin');
        }
      }
    }

    console.log('\n\n🚀 PRÓXIMOS PASOS RECOMENDADOS:');
    console.log('==============================');

    if (institutionsCount === 0) {
      console.log('1. ⚠️  Ejecutar seed: npx prisma db seed');
      console.log('2. 🏫 Crear instituciones desde super admin');
      console.log('3. 👥 Crear usuarios para cada institución');
    } else if (usersCount <= 1) {
      console.log('1. 👥 Crear usuarios rector y auxiliar contable');
      console.log('2. 🎓 Importar estudiantes');
      console.log('3. 💰 Configurar eventos de pago');
    } else {
      console.log('1. ✅ Sistema configurado correctamente');
      console.log('2. 🎓 Agregar más estudiantes si es necesario');
      console.log('3. 📊 Comenzar a usar el sistema');
    }

    console.log('\n🌐 URLs del sistema:');
    console.log('   🏠 Inicio: http://localhost:3000');
    console.log('   🏫 Selector: http://localhost:3000/select-institution');
    console.log('   🔐 Login: http://localhost:3000/login');
    console.log('   📊 Health: http://localhost:3000/api/health');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkDatabase();
}

module.exports = { checkDatabase };