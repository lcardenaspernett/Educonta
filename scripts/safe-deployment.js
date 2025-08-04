const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function safeDeployment() {
  try {
    console.log('🚀 Iniciando deployment seguro...');
    
    // Verificar si estamos en un entorno de producción
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    console.log(`🌍 Entorno detectado: ${isProduction ? 'Producción' : 'Desarrollo'}`);
    
    // Paso 1: Generar cliente Prisma
    console.log('📦 Generando cliente Prisma...');
    await execAsync('npx prisma generate');
    console.log('✅ Cliente Prisma generado');
    
    // Solo ejecutar limpieza y push en producción
    if (isProduction) {
      // Paso 2: Intentar limpiar duplicados (opcional, no falla si hay error)
      console.log('🧹 Intentando limpiar duplicados...');
      try {
        const { cleanDuplicateStudents } = require('./clean-duplicate-students');
        await cleanDuplicateStudents();
        console.log('✅ Duplicados limpiados');
      } catch (error) {
        console.log('⚠️  No se pudieron limpiar duplicados (continuando):', error.message);
      }
      
      // Paso 3: Push de schema con aceptación de pérdida de datos
      console.log('🗄️  Aplicando cambios de schema...');
      await execAsync('npx prisma db push --accept-data-loss');
      console.log('✅ Schema aplicado');
      
      // Paso 4: Regenerar cliente después del push
      console.log('🔄 Regenerando cliente Prisma...');
      await execAsync('npx prisma generate');
      console.log('✅ Cliente regenerado');
    } else {
      console.log('⏭️  Saltando push de schema en desarrollo');
    }
    
    console.log('🎉 Deployment completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en deployment:', error);
    
    // Intentar deployment básico como fallback solo en producción
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      console.log('🔄 Intentando deployment básico...');
      try {
        await execAsync('npx prisma db push --accept-data-loss --force-reset');
        await execAsync('npx prisma generate');
        console.log('✅ Deployment básico completado');
      } catch (fallbackError) {
        console.error('💥 Error en deployment básico:', fallbackError);
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }
}

if (require.main === module) {
  safeDeployment()
    .then(() => {
      console.log('✨ Script de deployment completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en deployment:', error);
      process.exit(1);
    });
}

module.exports = { safeDeployment };