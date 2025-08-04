#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function renderDeploymentStrategy() {
  try {
    console.log('🚀 Estrategia de deployment para Render iniciada...');
    
    // Paso 1: Remover temporalmente la restricción única
    console.log('🔧 Removiendo restricción única temporalmente...');
    await execAsync('node scripts/temp-remove-unique-constraint.js');
    
    // Paso 2: Generar cliente Prisma
    console.log('📦 Generando cliente Prisma...');
    await execAsync('npx prisma generate');
    
    // Paso 3: Aplicar schema sin restricción
    console.log('🗄️ Aplicando schema sin restricción única...');
    await execAsync('npx prisma db push');
    
    // Paso 4: Limpiar duplicados
    console.log('🧹 Limpiando duplicados...');
    try {
      const { cleanDuplicateStudents } = require('./clean-duplicate-students');
      await cleanDuplicateStudents();
      console.log('✅ Duplicados limpiados');
    } catch (error) {
      console.log('⚠️ Error limpiando duplicados:', error.message);
    }
    
    // Paso 5: Restaurar restricción única
    console.log('🔄 Restaurando restricción única...');
    await execAsync('node scripts/restore-unique-constraint.js');
    
    // Paso 6: Aplicar schema con restricción
    console.log('🗄️ Aplicando schema final con restricción...');
    await execAsync('npx prisma db push');
    
    // Paso 7: Regenerar cliente final
    console.log('🔄 Regenerando cliente Prisma final...');
    await execAsync('npx prisma generate');
    
    console.log('🎉 Deployment completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en deployment:', error);
    
    // Intentar restaurar el schema en caso de error
    try {
      console.log('🔄 Restaurando schema por error...');
      await execAsync('node scripts/restore-unique-constraint.js');
    } catch (restoreError) {
      console.error('💥 Error restaurando schema:', restoreError);
    }
    
    throw error;
  }
}

if (require.main === module) {
  renderDeploymentStrategy()
    .then(() => {
      console.log('✨ Estrategia de deployment completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en deployment:', error);
      process.exit(1);
    });
}

module.exports = { renderDeploymentStrategy };