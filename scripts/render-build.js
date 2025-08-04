#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function renderBuild() {
  try {
    console.log('🎯 Iniciando build para Render...');
    
    // Paso 1: Instalar dependencias (ya hecho por Render)
    console.log('📦 Dependencias ya instaladas por Render');
    
    // Paso 2: Generar cliente Prisma
    console.log('🔧 Generando cliente Prisma...');
    await execAsync('npx prisma generate');
    console.log('✅ Cliente Prisma generado');
    
    // Paso 3: Limpiar duplicados antes del push
    console.log('🧹 Limpiando datos duplicados...');
    try {
      const { cleanDuplicateStudents } = require('./clean-duplicate-students');
      await cleanDuplicateStudents();
      console.log('✅ Duplicados limpiados exitosamente');
    } catch (error) {
      console.log('⚠️  Error limpiando duplicados (continuando):', error.message);
      // Continuar sin fallar
    }
    
    // Paso 4: Push de schema con flag de aceptar pérdida de datos
    console.log('🗄️  Aplicando schema a la base de datos...');
    await execAsync('npx prisma db push --accept-data-loss');
    console.log('✅ Schema aplicado exitosamente');
    
    // Paso 5: Regenerar cliente después del push
    console.log('🔄 Regenerando cliente Prisma final...');
    await execAsync('npx prisma generate');
    console.log('✅ Cliente final generado');
    
    console.log('🎉 Build completado exitosamente para Render!');
    
  } catch (error) {
    console.error('❌ Error en build:', error);
    
    // Fallback: intentar con force-reset
    console.log('🔄 Intentando fallback con force-reset...');
    try {
      await execAsync('npx prisma db push --accept-data-loss --force-reset');
      await execAsync('npx prisma generate');
      console.log('✅ Fallback completado exitosamente');
    } catch (fallbackError) {
      console.error('💥 Error crítico en fallback:', fallbackError);
      process.exit(1);
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  renderBuild()
    .then(() => {
      console.log('✨ Script de build para Render completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { renderBuild };