#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function diagnoseLoginProblem() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA DE LOGIN');
    console.log('==============================================');
    
    // 1. Verificar conexión a base de datos
    console.log('1. 🗄️ Verificando conexión a base de datos...');
    try {
      await prisma.$connect();
      console.log('   ✅ Conexión exitosa');
    } catch (error) {
      console.log('   ❌ Error de conexión:', error.message);
      return;
    }
    
    // 2. Contar registros
    console.log('\n2. 📊 Contando registros...');
    const usersCount = await prisma.user.count();
    const institutionsCount = await prisma.institution.count();
    console.log(`   👥 Usuarios: ${usersCount}`);
    console.log(`   🏫 Instituciones: ${institutionsCount}`);
    
    // 3. Listar todas las instituciones
    console.log('\n3. 🏫 Instituciones existentes:');
    const institutions = await prisma.institution.findMany();
    institutions.forEach((inst, index) => {
      console.log(`   ${index + 1}. ${inst.name}`);
      console.log(`      📋 ID: ${inst.id}`);
      console.log(`      📋 NIT: ${inst.nit}`);
      console.log(`      📋 Email: ${inst.email}`);
      console.log(`      ✅ Activa: ${inst.isActive}`);
      console.log('      ---');
    });
    
    // 4. Listar todos los usuarios con detalles
    console.log('\n4. 👥 Usuarios existentes:');
    const users = await prisma.user.findMany({
      include: {
        institution: true
      }
    });
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email}`);
      console.log(`      👤 Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`      🔑 Rol: ${user.role}`);
      console.log(`      ✅ Activo: ${user.isActive}`);
      console.log(`      🏫 Institución ID: ${user.institutionId || 'NULL'}`);
      console.log(`      🏫 Institución: ${user.institution?.name || 'Sin institución'}`);
      console.log(`      🔒 Password hash: ${user.password ? 'EXISTS' : 'NULL'}`);
      console.log(`      📅 Creado: ${user.createdAt}`);
      console.log('      ---');
    });
    
    // 5. Probar credenciales específicas
    console.log('\n5. 🧪 Probando credenciales específicas:');
    
    const testCredentials = [
      { email: 'auxiliar@villasanpablo.edu.co', password: 'Auxiliar123!' },
      { email: 'rector@villasanpablo.edu.co', password: 'Rector123!' },
      { email: 'contabilidad@villasanpablo.edu.co', password: 'ContaVSP2024!' },
      { email: 'admin@educonta.com', password: 'Admin123!' }
    ];
    
    for (const cred of testCredentials) {
      console.log(`\n   🔐 Probando: ${cred.email} / ${cred.password}`);
      
      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email: cred.email.toLowerCase() },
        include: { institution: true }
      });
      
      if (!user) {
        console.log('      ❌ Usuario no encontrado');
        continue;
      }
      
      console.log('      ✅ Usuario encontrado');
      console.log(`      👤 Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`      🔑 Rol: ${user.role}`);
      console.log(`      ✅ Activo: ${user.isActive}`);
      console.log(`      🏫 Institución: ${user.institution?.name || 'Sin institución'}`);
      
      // Probar password
      try {
        const isPasswordValid = await bcrypt.compare(cred.password, user.password);
        console.log(`      🔓 Password: ${isPasswordValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
        
        if (!isPasswordValid) {
          // Probar passwords alternativos
          const altPasswords = ['Conta2024!', 'ContaVSP2024!', 'Auxiliar2024!', 'Rector2024!'];
          for (const altPass of altPasswords) {
            const altValid = await bcrypt.compare(altPass, user.password);
            if (altValid) {
              console.log(`      🔓 Password alternativo válido: ${altPass}`);
              break;
            }
          }
        }
        
        // Simular proceso de login completo
        if (isPasswordValid && user.isActive) {
          console.log('      🎯 LOGIN SIMULADO: ✅ EXITOSO');
          
          // Verificar institución si es necesario
          if (user.role !== 'SUPER_ADMIN' && user.institutionId) {
            const institution = await prisma.institution.findUnique({
              where: { id: user.institutionId }
            });
            
            if (institution && institution.isActive) {
              console.log('      🏫 Institución válida para login');
            } else {
              console.log('      ❌ Institución inválida o inactiva');
            }
          }
        } else {
          console.log('      🎯 LOGIN SIMULADO: ❌ FALLARÍA');
        }
        
      } catch (error) {
        console.log(`      💥 Error verificando password: ${error.message}`);
      }
    }
    
    // 6. Verificar schema de User
    console.log('\n6. 📋 Verificando schema de User...');
    try {
      // Intentar crear un usuario de prueba para verificar campos
      const testUser = {
        email: 'test@test.com',
        password: await bcrypt.hash('test123', 10),
        firstName: 'Test',
        lastName: 'User',
        role: 'AUXILIARY_ACCOUNTANT',
        isActive: true
      };
      
      console.log('   📝 Campos requeridos para User:');
      console.log('      - email ✅');
      console.log('      - password ✅');
      console.log('      - firstName ✅');
      console.log('      - lastName ✅');
      console.log('      - role ✅');
      console.log('      - isActive ✅');
      
    } catch (error) {
      console.log(`   ❌ Error verificando schema: ${error.message}`);
    }
    
    // 7. Resumen y recomendaciones
    console.log('\n7. 📋 RESUMEN Y RECOMENDACIONES:');
    console.log('================================');
    
    if (usersCount === 0) {
      console.log('❌ PROBLEMA: No hay usuarios en el sistema');
      console.log('💡 SOLUCIÓN: Ejecutar script de creación de usuarios');
    } else {
      console.log(`✅ Hay ${usersCount} usuarios en el sistema`);
    }
    
    if (institutionsCount === 0) {
      console.log('❌ PROBLEMA: No hay instituciones en el sistema');
      console.log('💡 SOLUCIÓN: Ejecutar script de creación de instituciones');
    } else {
      console.log(`✅ Hay ${institutionsCount} instituciones en el sistema`);
    }
    
    const activeUsers = users.filter(u => u.isActive);
    console.log(`👥 Usuarios activos: ${activeUsers.length}/${usersCount}`);
    
    const usersWithInstitution = users.filter(u => u.institutionId);
    console.log(`🏫 Usuarios con institución: ${usersWithInstitution.length}/${usersCount}`);
    
    console.log('\n🎯 PRÓXIMOS PASOS RECOMENDADOS:');
    if (usersCount === 0 || institutionsCount === 0) {
      console.log('1. Ejecutar reset completo de credenciales');
      console.log('2. Verificar que los scripts usen firstName/lastName en lugar de name');
      console.log('3. Verificar que los roles sean AUXILIARY_ACCOUNTANT en lugar de AUXILIAR_CONTABLE');
    } else {
      console.log('1. Verificar passwords de usuarios existentes');
      console.log('2. Probar login con credenciales encontradas');
    }
    
  } catch (error) {
    console.error('💥 Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  diagnoseLoginProblem()
    .then(() => {
      console.log('\n✅ Diagnóstico completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseLoginProblem };