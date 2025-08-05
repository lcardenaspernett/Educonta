#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function diagnoseCredentials() {
  try {
    console.log('🔍 Diagnosticando credenciales...');
    
    // 1. Verificar usuarios existentes
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        password: true,
        institutionId: true,
        createdAt: true
      }
    });
    
    console.log(`\n👥 Usuarios encontrados: ${users.length}`);
    console.log('================================');
    
    for (const user of users) {
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 FirstName: ${user.firstName || 'NULL'}`);
      console.log(`👤 LastName: ${user.lastName || 'NULL'}`);
      console.log(`👤 Full Name: ${user.firstName} ${user.lastName}`);
      console.log(`🔑 Role: ${user.role}`);
      console.log(`✅ Active: ${user.isActive}`);
      console.log(`🏫 Institution: ${user.institutionId || 'NULL'}`);
      console.log(`🔒 Password Hash: ${user.password ? 'EXISTS' : 'NULL'}`);
      console.log(`📅 Created: ${user.createdAt}`);
      
      // Verificar si el password está hasheado correctamente
      if (user.password) {
        const isHashedCorrectly = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        console.log(`🔐 Hash Format: ${isHashedCorrectly ? 'CORRECT' : 'INCORRECT'}`);
        
        // Probar password para admin
        if (user.email === 'admin@educonta.com') {
          try {
            const isValid = await bcrypt.compare('Admin123!', user.password);
            console.log(`🔓 Password Test: ${isValid ? 'VALID' : 'INVALID'}`);
          } catch (error) {
            console.log(`🔓 Password Test: ERROR - ${error.message}`);
          }
        }
      }
      
      console.log('--------------------------------');
    }
    
    // 2. Verificar instituciones
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        nit: true,
        isActive: true
      }
    });
    
    console.log(`\n🏫 Instituciones encontradas: ${institutions.length}`);
    console.log('================================');
    
    for (const institution of institutions) {
      console.log(`🏫 ${institution.name} (${institution.nit})`);
      console.log(`📋 ID: ${institution.id}`);
      console.log(`✅ Active: ${institution.isActive}`);
      console.log('--------------------------------');
    }
    
    // 3. Verificar schema del modelo User
    console.log('\n📋 Verificando schema User...');
    try {
      const userFields = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `;
      
      console.log('Campos en tabla users:');
      userFields.forEach(field => {
        console.log(`  - ${field.column_name}: ${field.data_type} (${field.is_nullable === 'YES' ? 'nullable' : 'required'})`);
      });
    } catch (error) {
      console.log('Error verificando schema:', error.message);
    }
    
    console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  diagnoseCredentials()
    .then(() => {
      console.log('✅ Diagnóstico completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseCredentials };