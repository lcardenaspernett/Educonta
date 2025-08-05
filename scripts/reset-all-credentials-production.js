#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAllCredentialsProduction() {
  try {
    console.log('🔄 RESET COMPLETO DE CREDENCIALES EN PRODUCCIÓN');
    console.log('================================================');
    
    // 1. ELIMINAR TODOS LOS USUARIOS EXISTENTES (excepto super admin)
    console.log('🗑️  Eliminando usuarios existentes...');
    
    await prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@educonta.com'
        }
      }
    });
    
    console.log('✅ Usuarios eliminados');
    
    // 2. BUSCAR O CREAR INSTITUCIÓN VILLAS SAN PABLO
    console.log('🏫 Configurando institución Villas San Pablo...');
    
    let institution = await prisma.institution.findFirst({
      where: {
        OR: [
          { name: { contains: 'Villas', mode: 'insensitive' } },
          { name: { contains: 'San Pablo', mode: 'insensitive' } },
          { nit: '901079125-0' },
          { nit: '900123456-1' }
        ]
      }
    });
    
    if (!institution) {
      console.log('🏫 Creando institución Villas San Pablo...');
      institution = await prisma.institution.create({
        data: {
          name: 'Institución Educativa Distrital Villas de San Pablo',
          nit: '901079125-0',
          address: 'Carrera 45 # 67-89, Barrio Villas San Pablo',
          phone: '(5) 987-6543',
          email: 'info@villasanpablo.edu.co',
          city: 'Barranquilla',
          department: 'Atlántico',
          country: 'Colombia',
          educationLevel: 'SECUNDARIA',
          isActive: true
        }
      });
      console.log('✅ Institución creada');
    } else {
      console.log('✅ Institución encontrada:', institution.name);
    }
    
    // 3. CREAR CREDENCIALES FRESCAS Y VERIFICADAS
    console.log('👤 Creando usuarios con credenciales frescas...');
    
    // Usuario Rector
    const rectorPassword = await bcrypt.hash('Rector2024!', 12);
    const rector = await prisma.user.create({
      data: {
        email: 'rector@villasanpablo.edu.co',
        password: rectorPassword,
        firstName: 'Director',
        lastName: 'Villas San Pablo',
        role: 'RECTOR',
        isActive: true,
        institutionId: institution.id
      }
    });
    
    // Usuario Contabilidad
    const contaPassword = await bcrypt.hash('Conta2024!', 12);
    const contabilidad = await prisma.user.create({
      data: {
        email: 'contabilidad@villasanpablo.edu.co',
        password: contaPassword,
        firstName: 'Auxiliar',
        lastName: 'Contable',
        role: 'AUXILIARY_ACCOUNTANT',
        isActive: true,
        institutionId: institution.id
      }
    });
    
    // Usuario Auxiliar (backup)
    const auxiliarPassword = await bcrypt.hash('Auxiliar2024!', 12);
    const auxiliar = await prisma.user.create({
      data: {
        email: 'auxiliar@villasanpablo.edu.co',
        password: auxiliarPassword,
        firstName: 'Auxiliar',
        lastName: 'Administrativo',
        role: 'AUXILIARY_ACCOUNTANT',
        isActive: true,
        institutionId: institution.id
      }
    });
    
    console.log('✅ Usuarios creados exitosamente');
    
    // 4. VERIFICAR CREDENCIALES INMEDIATAMENTE
    console.log('🧪 Verificando credenciales creadas...');
    
    const testUsers = [
      { email: 'rector@villasanpablo.edu.co', password: 'Rector2024!', user: rector },
      { email: 'contabilidad@villasanpablo.edu.co', password: 'Conta2024!', user: contabilidad },
      { email: 'auxiliar@villasanpablo.edu.co', password: 'Auxiliar2024!', user: auxiliar }
    ];
    
    for (const test of testUsers) {
      const isValid = await bcrypt.compare(test.password, test.user.password);
      console.log(`${isValid ? '✅' : '❌'} ${test.email} - Password: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
    }
    
    // 5. MOSTRAR CREDENCIALES FINALES
    console.log('\n🎯 CREDENCIALES DEFINITIVAS - COPIABLES');
    console.log('=====================================');
    console.log('');
    console.log('🔐 SUPER ADMIN (Global):');
    console.log('📧 Email: admin@educonta.com');
    console.log('🔑 Password: Admin123!');
    console.log('');
    console.log('👨‍💼 RECTOR (Villas San Pablo):');
    console.log('📧 Email: rector@villasanpablo.edu.co');
    console.log('🔑 Password: Rector2024!');
    console.log('');
    console.log('💰 CONTABILIDAD (Villas San Pablo):');
    console.log('📧 Email: contabilidad@villasanpablo.edu.co');
    console.log('🔑 Password: Conta2024!');
    console.log('');
    console.log('🔧 AUXILIAR (Villas San Pablo - Backup):');
    console.log('📧 Email: auxiliar@villasanpablo.edu.co');
    console.log('🔑 Password: Auxiliar2024!');
    console.log('');
    console.log('🏫 INSTITUCIÓN:');
    console.log(`📋 Nombre: ${institution.name}`);
    console.log(`📋 ID: ${institution.id}`);
    console.log(`📋 NIT: ${institution.nit}`);
    console.log('=====================================');
    
    // 6. CREAR ARCHIVO DE CREDENCIALES
    const fs = require('fs');
    const credentialsFile = `
# CREDENCIALES EDUCONTA - PRODUCCIÓN
# Generadas: ${new Date().toISOString()}

## Super Admin (Global)
Email: admin@educonta.com
Password: Admin123!

## Rector (Villas San Pablo)
Email: rector@villasanpablo.edu.co
Password: Rector2024!

## Contabilidad (Villas San Pablo) - PRINCIPAL
Email: contabilidad@villasanpablo.edu.co
Password: Conta2024!

## Auxiliar (Villas San Pablo) - Backup
Email: auxiliar@villasanpablo.edu.co
Password: Auxiliar2024!

## Institución
Nombre: ${institution.name}
ID: ${institution.id}
NIT: ${institution.nit}
`;
    
    fs.writeFileSync('CREDENCIALES_PRODUCCION.txt', credentialsFile);
    console.log('📄 Archivo CREDENCIALES_PRODUCCION.txt creado');
    
    console.log('\n🎉 RESET COMPLETO EXITOSO');
    
  } catch (error) {
    console.error('❌ Error en reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  resetAllCredentialsProduction()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { resetAllCredentialsProduction };