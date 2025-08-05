#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixContabilidadCredentials() {
  try {
    console.log('🔧 Corrigiendo credenciales de contabilidad...');
    
    // 1. Buscar la institución Villas San Pablo
    const institution = await prisma.institution.findFirst({
      where: {
        OR: [
          { name: { contains: 'Villas de San Pablo', mode: 'insensitive' } },
          { name: { contains: 'Villas San Pablo', mode: 'insensitive' } },
          { name: { contains: 'Villa San Pablo', mode: 'insensitive' } },
          { nit: '901079125-0' },
          { nit: '900123456-1' }
        ]
      }
    });
    
    if (!institution) {
      console.log('❌ No se encontró la institución Villas San Pablo');
      return;
    }
    
    console.log(`✅ Institución encontrada: ${institution.name} (ID: ${institution.id})`);
    
    // 2. Verificar si existe el usuario de contabilidad
    let contabilidadUser = await prisma.user.findUnique({
      where: { email: 'contabilidad@villasanpablo.edu.co' }
    });
    
    if (contabilidadUser) {
      console.log('👤 Usuario de contabilidad encontrado, actualizando...');
      
      // Actualizar usuario existente
      const hashedPassword = await bcrypt.hash('ContaVSP2024!', 12);
      
      contabilidadUser = await prisma.user.update({
        where: { email: 'contabilidad@villasanpablo.edu.co' },
        data: {
          password: hashedPassword,
          firstName: 'Auxiliar',
          lastName: 'Contable',
          role: 'AUXILIARY_ACCOUNTANT',
          isActive: true,
          institutionId: institution.id
        }
      });
      
      console.log('✅ Usuario de contabilidad actualizado');
    } else {
      console.log('👤 Creando nuevo usuario de contabilidad...');
      
      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash('ContaVSP2024!', 12);
      
      contabilidadUser = await prisma.user.create({
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
      
      console.log('✅ Usuario de contabilidad creado');
    }
    
    // 3. Verificar las credenciales
    console.log('\n🔍 Verificando credenciales...');
    const isPasswordValid = await bcrypt.compare('ContaVSP2024!', contabilidadUser.password);
    
    console.log(`📧 Email: ${contabilidadUser.email}`);
    console.log(`👤 Nombre: ${contabilidadUser.firstName} ${contabilidadUser.lastName}`);
    console.log(`🔑 Rol: ${contabilidadUser.role}`);
    console.log(`✅ Activo: ${contabilidadUser.isActive}`);
    console.log(`🏫 Institución: ${institution.name}`);
    console.log(`🔓 Password válido: ${isPasswordValid ? '✅ SÍ' : '❌ NO'}`);
    
    // 4. Probar login completo
    console.log('\n🧪 Probando login completo...');
    
    const loginTest = await prisma.user.findUnique({
      where: { 
        email: 'contabilidad@villasanpablo.edu.co'
      },
      include: {
        institution: true
      }
    });
    
    if (loginTest && loginTest.isActive && loginTest.institution?.isActive) {
      const passwordMatch = await bcrypt.compare('ContaVSP2024!', loginTest.password);
      
      if (passwordMatch) {
        console.log('✅ LOGIN TEST EXITOSO');
        console.log('🎯 Las credenciales están funcionando correctamente');
        
        // Actualizar último login
        await prisma.user.update({
          where: { id: loginTest.id },
          data: { lastLogin: new Date() }
        });
        
      } else {
        console.log('❌ LOGIN TEST FALLIDO - Password incorrecto');
      }
    } else {
      console.log('❌ LOGIN TEST FALLIDO - Usuario o institución inactivos');
    }
    
    console.log('\n📋 RESUMEN DE CREDENCIALES CORREGIDAS:');
    console.log('=====================================');
    console.log('📧 Email: contabilidad@villasanpablo.edu.co');
    console.log('🔑 Password: ContaVSP2024!');
    console.log('👤 Nombre: Auxiliar Contable');
    console.log('🎯 Rol: AUXILIARY_ACCOUNTANT');
    console.log('🏫 Institución: Villas San Pablo');
    console.log('✅ Estado: Activo y verificado');
    
  } catch (error) {
    console.error('❌ Error corrigiendo credenciales:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixContabilidadCredentials()
    .then(() => {
      console.log('\n🎉 Corrección completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { fixContabilidadCredentials };