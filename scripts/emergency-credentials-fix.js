#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function emergencyCredentialsFix() {
  try {
    console.log('🚨 ARREGLO DE EMERGENCIA - CREDENCIALES');
    console.log('=====================================');
    
    // Múltiples estrategias para asegurar que funcione
    
    // 1. Buscar institución por cualquier método posible
    console.log('🔍 Buscando institución Villas San Pablo...');
    
    const institutions = await prisma.institution.findMany({
      where: {
        OR: [
          { name: { contains: 'Villas', mode: 'insensitive' } },
          { name: { contains: 'San Pablo', mode: 'insensitive' } },
          { name: { contains: 'Villa', mode: 'insensitive' } },
          { nit: { in: ['901079125-0', '900123456-1', '900123456-7'] } },
          { email: { contains: 'villasanpablo', mode: 'insensitive' } },
          { email: { contains: 'villassanpablo', mode: 'insensitive' } }
        ]
      }
    });
    
    console.log(`📊 Instituciones encontradas: ${institutions.length}`);
    institutions.forEach(inst => {
      console.log(`  - ${inst.name} (${inst.nit})`);
    });
    
    let targetInstitution = institutions[0];
    
    if (!targetInstitution) {
      console.log('🏫 Creando institución de emergencia...');
      targetInstitution = await prisma.institution.create({
        data: {
          name: 'Institución Educativa Villas San Pablo',
          nit: '901079125-0',
          address: 'Dirección Principal',
          phone: '(1) 234-5678',
          email: 'info@villasanpablo.edu.co',
          city: 'Bogotá',
          department: 'Cundinamarca',
          country: 'Colombia',
          educationLevel: 'SECUNDARIA',
          isActive: true
        }
      });
    }
    
    console.log(`✅ Institución objetivo: ${targetInstitution.name}`);
    
    // 2. Crear/actualizar usuario de contabilidad con MÚLTIPLES VARIANTES
    const contabilidadEmails = [
      'contabilidad@villasanpablo.edu.co',
      'contabilidad@villassanpablo.edu.co', // Por si acaso
      'auxiliar@villasanpablo.edu.co',
      'contador@villasanpablo.edu.co'
    ];
    
    const passwords = ['Conta2024!', 'ContaVSP2024!', 'Auxiliar2024!'];
    
    console.log('👤 Creando usuarios de contabilidad múltiples...');
    
    for (let i = 0; i < contabilidadEmails.length; i++) {
      const email = contabilidadEmails[i];
      const password = passwords[i % passwords.length];
      
      try {
        // Eliminar si existe
        await prisma.user.deleteMany({
          where: { email }
        });
        
        // Crear nuevo
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName: 'Auxiliar',
            lastName: 'Contable',
            role: 'AUXILIARY_ACCOUNTANT',
            isActive: true,
            institutionId: targetInstitution.id
          }
        });
        
        // Verificar inmediatamente
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`${isValid ? '✅' : '❌'} ${email} - ${password} - ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
        
      } catch (error) {
        console.log(`⚠️  Error con ${email}:`, error.message);
      }
    }
    
    // 3. Crear usuario rector de respaldo
    try {
      await prisma.user.deleteMany({
        where: { email: 'rector@villasanpablo.edu.co' }
      });
      
      const rectorPassword = await bcrypt.hash('Rector2024!', 12);
      const rector = await prisma.user.create({
        data: {
          email: 'rector@villasanpablo.edu.co',
          password: rectorPassword,
          firstName: 'Director',
          lastName: 'Principal',
          role: 'RECTOR',
          isActive: true,
          institutionId: targetInstitution.id
        }
      });
      
      const isValid = await bcrypt.compare('Rector2024!', rector.password);
      console.log(`${isValid ? '✅' : '❌'} rector@villasanpablo.edu.co - Rector2024! - ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
      
    } catch (error) {
      console.log('⚠️  Error creando rector:', error.message);
    }
    
    // 4. Mostrar TODAS las credenciales disponibles
    console.log('\n🎯 TODAS LAS CREDENCIALES DISPONIBLES');
    console.log('===================================');
    
    const allUsers = await prisma.user.findMany({
      include: {
        institution: true
      }
    });
    
    for (const user of allUsers) {
      console.log(`📧 ${user.email}`);
      console.log(`👤 ${user.firstName} ${user.lastName}`);
      console.log(`🔑 Rol: ${user.role}`);
      console.log(`🏫 Institución: ${user.institution?.name || 'Sin institución'}`);
      console.log(`✅ Activo: ${user.isActive}`);
      console.log('---');
    }
    
    console.log('\n🔑 PASSWORDS PARA PROBAR:');
    console.log('========================');
    console.log('Para contabilidad@villasanpablo.edu.co:');
    console.log('  - Conta2024!');
    console.log('  - ContaVSP2024!');
    console.log('  - Auxiliar2024!');
    console.log('');
    console.log('Para rector@villasanpablo.edu.co:');
    console.log('  - Rector2024!');
    console.log('  - Rector123!');
    console.log('');
    console.log('Para admin@educonta.com:');
    console.log('  - Admin123!');
    
    console.log('\n🎉 ARREGLO DE EMERGENCIA COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error en arreglo de emergencia:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  emergencyCredentialsFix()
    .then(() => {
      console.log('✅ Script de emergencia completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { emergencyCredentialsFix };