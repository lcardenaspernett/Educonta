#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function forceUpdateCredentials() {
  try {
    console.log('🚨 FORZANDO ACTUALIZACIÓN DE CREDENCIALES');
    console.log('=========================================');
    
    // 1. Buscar institución Villas San Pablo
    const institution = await prisma.institution.findFirst({
      where: {
        OR: [
          { name: { contains: 'Villas', mode: 'insensitive' } },
          { name: { contains: 'San Pablo', mode: 'insensitive' } }
        ]
      }
    });
    
    if (!institution) {
      console.log('❌ No se encontró institución Villas San Pablo');
      return;
    }
    
    console.log(`✅ Institución encontrada: ${institution.name} (${institution.id})`);
    
    // 2. FORZAR actualización de credenciales específicas
    const credentialsToUpdate = [
      {
        email: 'auxiliar@villasanpablo.edu.co',
        password: 'Auxiliar123!',
        firstName: 'Auxiliar',
        lastName: 'Contable',
        role: 'AUXILIARY_ACCOUNTANT'
      },
      {
        email: 'contabilidad@villasanpablo.edu.co',
        password: 'ContaVSP2024!',
        firstName: 'Auxiliar',
        lastName: 'Contable',
        role: 'AUXILIARY_ACCOUNTANT'
      },
      {
        email: 'rector@villasanpablo.edu.co',
        password: 'Rector123!',
        firstName: 'Rector',
        lastName: 'Principal',
        role: 'RECTOR'
      }
    ];
    
    for (const cred of credentialsToUpdate) {
      console.log(`\n🔄 Procesando: ${cred.email}`);
      
      // Eliminar si existe
      const existing = await prisma.user.findUnique({
        where: { email: cred.email }
      });
      
      if (existing) {
        console.log('   🗑️  Eliminando usuario existente...');
        await prisma.user.delete({
          where: { email: cred.email }
        });
      }
      
      // Crear nuevo con password hasheado
      console.log('   👤 Creando usuario nuevo...');
      const hashedPassword = await bcrypt.hash(cred.password, 12);
      
      const newUser = await prisma.user.create({
        data: {
          email: cred.email,
          password: hashedPassword,
          firstName: cred.firstName,
          lastName: cred.lastName,
          role: cred.role,
          isActive: true,
          institutionId: institution.id
        }
      });
      
      // Verificar inmediatamente
      const isValid = await bcrypt.compare(cred.password, newUser.password);
      console.log(`   🔓 Verificación: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
      console.log(`   ✅ Usuario creado: ${newUser.email}`);
    }
    
    // 3. Verificar super admin
    console.log('\n🔐 Verificando super admin...');
    let superAdmin = await prisma.user.findUnique({
      where: { email: 'admin@educonta.com' }
    });
    
    if (!superAdmin) {
      console.log('   👤 Creando super admin...');
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      
      superAdmin = await prisma.user.create({
        data: {
          email: 'admin@educonta.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Administrador',
          role: 'SUPER_ADMIN',
          isActive: true
        }
      });
    }
    
    const adminValid = await bcrypt.compare('Admin123!', superAdmin.password);
    console.log(`   🔓 Super admin válido: ${adminValid ? '✅ SÍ' : '❌ NO'}`);
    
    // 4. Mostrar resumen final
    console.log('\n📋 CREDENCIALES ACTUALIZADAS:');
    console.log('=============================');
    
    const allUsers = await prisma.user.findMany({
      include: { institution: true }
    });
    
    for (const user of allUsers) {
      console.log(`📧 ${user.email}`);
      console.log(`👤 ${user.firstName} ${user.lastName}`);
      console.log(`🔑 ${user.role}`);
      console.log(`🏫 ${user.institution?.name || 'Sin institución'}`);
      console.log(`✅ ${user.isActive ? 'Activo' : 'Inactivo'}`);
      console.log('---');
    }
    
    console.log('\n🎯 CREDENCIALES PARA PROBAR:');
    console.log('============================');
    console.log('📧 auxiliar@villasanpablo.edu.co');
    console.log('🔑 Auxiliar123!');
    console.log('');
    console.log('📧 contabilidad@villasanpablo.edu.co');
    console.log('🔑 ContaVSP2024!');
    console.log('');
    console.log('📧 rector@villasanpablo.edu.co');
    console.log('🔑 Rector123!');
    console.log('');
    console.log('📧 admin@educonta.com');
    console.log('🔑 Admin123!');
    
    console.log('\n🎉 ACTUALIZACIÓN FORZADA COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error en actualización forzada:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  forceUpdateCredentials()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { forceUpdateCredentials };