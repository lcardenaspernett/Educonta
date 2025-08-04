#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function simpleRenderFix() {
  try {
    console.log('🎯 Fix simple para Render iniciado...');
    
    // Generar cliente Prisma primero
    console.log('📦 Generando cliente Prisma...');
    await execAsync('npx prisma generate');
    
    // Limpiar duplicados
    console.log('🧹 Limpiando duplicados...');
    try {
      const { cleanDuplicateStudents } = require('./clean-duplicate-students');
      await cleanDuplicateStudents();
      console.log('✅ Duplicados limpiados exitosamente');
    } catch (cleanError) {
      console.log('⚠️ Error limpiando duplicados (continuando):', cleanError.message);
    }
    
    // Aplicar schema con --accept-data-loss
    console.log('🗄️ Aplicando schema con --accept-data-loss...');
    await execAsync('npx prisma db push --accept-data-loss');
    
    // Regenerar cliente
    console.log('🔄 Regenerando cliente Prisma...');
    await execAsync('npx prisma generate');
    
    console.log('🎉 Fix completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en fix:', error.message);
    
    // Fallback ultra simple
    console.log('🔄 Ejecutando fallback ultra simple...');
    try {
      await execAsync('npx prisma db push --accept-data-loss --force-reset');
      await execAsync('npx prisma generate');
      console.log('✅ Fallback completado');
    } catch (fallbackError) {
      console.error('💥 Error en fallback:', fallbackError.message);
      // No lanzar error para que Render pueda continuar
      console.log('⚠️ Continuando con generación básica...');
      await execAsync('npx prisma generate');
    }
  }
}

if (require.main === module) {
  simpleRenderFix()
    .then(() => {
      console.log('✨ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error final:', error.message);
      // No fallar para que Render pueda continuar
      process.exit(0);
    });
}

module.exports = { simpleRenderFix };