#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function wrappedPrismaDbPush() {
  try {
    console.log('🎯 Wrapper de Prisma DB Push ejecutándose...');
    
    // Limpiar duplicados primero
    console.log('🧹 Limpiando duplicados antes del push...');
    try {
      await execAsync('node scripts/clean-duplicate-students.js');
      console.log('✅ Duplicados limpiados');
    } catch (error) {
      console.log('⚠️  Error limpiando duplicados (continuando):', error.message);
    }
    
    // Ejecutar prisma db push con --accept-data-loss
    console.log('🗄️  Ejecutando prisma db push --accept-data-loss...');
    await execAsync('npx prisma db push --accept-data-loss');
    console.log('✅ Schema aplicado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en wrapper:', error);
    
    // Fallback
    console.log('🔄 Intentando fallback...');
    try {
      await execAsync('npx prisma db push --accept-data-loss --force-reset');
      console.log('✅ Fallback exitoso');
    } catch (fallbackError) {
      console.error('💥 Error en fallback:', fallbackError);
      process.exit(1);
    }
  }
}

wrappedPrismaDbPush();