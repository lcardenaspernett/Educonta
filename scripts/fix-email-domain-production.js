#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixEmailDomainProduction() {
  try {
    console.log('🔧 Corrigiendo dominio de emails en producción...');
    
    // 1. Buscar usuarios con el dominio incorrecto
    const usersWithWrongDomain = await prisma.user.findMany({
      where: {
        email: {
          contains: '@villassanpablo.edu.co' // Con doble 's'
        }
      }
    });
    
    console.log(`📧 Usuarios encontrados con dominio incorrecto: ${usersWithWrongDomain.length}`);
    
    for (const user of usersWithWrongDomain) {
      const oldEmail = user.email;
      const newEmail = oldEmail.replace('@villassanpablo.edu.co', '@villasanpablo.edu.co');
      
      console.log(`🔄 Corrigiendo: ${oldEmail} → ${newEmail}`);
      
      // Verificar si ya existe un usuario con el email correcto
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail }
      });
      
      if (existingUser) {
        console.log(`⚠️  Ya existe usuario con email ${newEmail}, eliminando duplicado...`);
        await prisma.user.delete({
          where: { id: user.id }
        });
      } else {
        // Actualizar el email
        await prisma.user.update({
          where: { id: user.id },
          data: { email: newEmail }
        });
        console.log(`✅ Email actualizado: ${newEmail}`);
      }
    }
    
    // 2. Verificar y crear el usuario de contabilidad con el email correcto
    const contabilidadUser = await prisma.user.findUnique({
      where: { email: 'contabilidad@villasanpablo.edu.co' }
    });
    
    if (!contabilidadUser) {
      console.log('👤 Creando usuario de contabilidad con email correcto...');
      
      // Buscar la institución Villas San Pablo
      const institution = await prisma.institution.findFirst({
        where: {
          OR: [
            { name: { contains: 'Villas de San Pablo', mode: 'insensitive' } },
            { name: { contains: 'Villas San Pablo', mode: 'insensitive' } },
            { nit: '901079125-0' }
          ]
        }
      });
      
      if (institution) {
        const hashedPassword = await bcrypt.hash('ContaVSP2024!', 12);
        
        await prisma.user.create({
          data: {
            email: 'contabilidad@villasanpablo.edu.co',
            password: hashedPassword,
            firstName: 'Auxiliar',
            lastName: 'Contable',
            role: 'AUXILIARY_ACCOUNTANT',
            isActive: true,
            institutionId: institution.id
          }
        });
        
        console.log('✅ Usuario de contabilidad creado con email correcto');
      } else {
        console.log('❌ No se encontró la institución Villas San Pablo');
      }
    } else {
      console.log('✅ Usuario de contabilidad ya existe con email correcto');
    }
    
    // 3. Eliminar usuarios con emails incorrectos que puedan quedar
    const remainingWrongUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: '@villassanpablo.edu.co' // Con doble 's'
        }
      }
    });
    
    for (const user of remainingWrongUsers) {
      console.log(`🗑️  Eliminando usuario con email incorrecto: ${user.email}`);
      await prisma.user.delete({
        where: { id: user.id }
      });
    }
    
    // 4. Mostrar resumen final
    console.log('\n🎯 CREDENCIALES CORREGIDAS:');
    console.log('================================');
    
    const finalUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: '@villasanpablo.edu.co' // Con una sola 's'
        }
      },
      include: {
        institution: true
      }
    });
    
    for (const user of finalUsers) {
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`🔑 Rol: ${user.role}`);
      console.log(`🏫 Institución: ${user.institution?.name}`);
      console.log('--------------------------------');
    }
    
    console.log('\n✅ Corrección de dominio completada');
    
  } catch (error) {
    console.error('❌ Error corrigiendo dominio:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixEmailDomainProduction()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { fixEmailDomainProduction };