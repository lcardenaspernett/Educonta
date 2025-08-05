#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testContabilidadLogin() {
  try {
    console.log('🧪 Probando login de contabilidad...');
    
    // 1. Buscar usuario y institución
    const user = await prisma.user.findUnique({
      where: { email: 'contabilidad@villasanpablo.edu.co' },
      include: { institution: true }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Nombre: ${user.firstName} ${user.lastName}`);
    console.log(`🔑 Rol: ${user.role}`);
    console.log(`✅ Activo: ${user.isActive}`);
    console.log(`🏫 Institución: ${user.institution?.name}`);
    console.log(`🏫 Institución ID: ${user.institutionId}`);
    console.log(`🏫 Institución Activa: ${user.institution?.isActive}`);
    
    // 2. Verificar password
    const passwordTest = await bcrypt.compare('ContaVSP2024!', user.password);
    console.log(`🔓 Password válido: ${passwordTest ? '✅ SÍ' : '❌ NO'}`);
    
    // 3. Simular el proceso de login completo
    console.log('\n🔄 Simulando proceso de login...');
    
    const email = 'contabilidad@villasanpablo.edu.co';
    const password = 'ContaVSP2024!';
    const institutionId = user.institutionId;
    
    // Paso 1: Buscar usuario
    const loginUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { institution: true }
    });
    
    if (!loginUser) {
      console.log('❌ FALLO: Usuario no encontrado');
      return;
    }
    console.log('✅ PASO 1: Usuario encontrado');
    
    // Paso 2: Verificar que esté activo
    if (!loginUser.isActive) {
      console.log('❌ FALLO: Usuario inactivo');
      return;
    }
    console.log('✅ PASO 2: Usuario activo');
    
    // Paso 3: Verificar institución
    if (institutionId && loginUser.role !== 'SUPER_ADMIN') {
      if (!loginUser.institutionId || loginUser.institutionId !== institutionId) {
        console.log('❌ FALLO: Sin permisos para la institución');
        return;
      }
    }
    console.log('✅ PASO 3: Permisos de institución válidos');
    
    // Paso 4: Verificar password
    const isPasswordValid = await bcrypt.compare(password, loginUser.password);
    if (!isPasswordValid) {
      console.log('❌ FALLO: Password inválido');
      return;
    }
    console.log('✅ PASO 4: Password válido');
    
    // Paso 5: Actualizar último login
    await prisma.user.update({
      where: { id: loginUser.id },
      data: { lastLogin: new Date() }
    });
    console.log('✅ PASO 5: Último login actualizado');
    
    console.log('\n🎉 LOGIN EXITOSO!');
    console.log('================');
    console.log('Las credenciales funcionan correctamente:');
    console.log('📧 Email: contabilidad@villasanpablo.edu.co');
    console.log('🔑 Password: ContaVSP2024!');
    console.log('🏫 Institución: Villas de San Pablo');
    console.log('🎯 Rol: AUXILIARY_ACCOUNTANT');
    
    // 6. Información para el frontend
    console.log('\n📋 DATOS PARA EL FRONTEND:');
    console.log('==========================');
    console.log(`User ID: ${loginUser.id}`);
    console.log(`Institution ID: ${loginUser.institutionId}`);
    console.log(`Role: ${loginUser.role}`);
    console.log(`Institution Name: ${loginUser.institution?.name}`);
    console.log(`Institution NIT: ${loginUser.institution?.nit}`);
    
  } catch (error) {
    console.error('❌ Error en test de login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testContabilidadLogin()
    .then(() => {
      console.log('\n✅ Test completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { testContabilidadLogin };