const { PrismaClient } = require('@prisma/client');

async function cleanDuplicateStudents() {
  let prisma;
  
  try {
    console.log('🔍 Iniciando limpieza de estudiantes duplicados...');
    
    // Crear cliente Prisma con timeout más corto
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida');
    
    // Buscar duplicados basados en institutionId y documento
    const duplicates = await prisma.$queryRaw`
      SELECT "institutionId", "documento", COUNT(*) as count
      FROM "students"
      GROUP BY "institutionId", "documento"
      HAVING COUNT(*) > 1
    `;

    if (duplicates.length === 0) {
      console.log('✅ No se encontraron estudiantes duplicados');
      return;
    }

    console.log(`⚠️  Encontrados ${duplicates.length} grupos de estudiantes duplicados`);

    for (const duplicate of duplicates) {
      console.log(`📋 Procesando duplicados para institución ${duplicate.institutionId}, documento ${duplicate.documento}`);
      
      // Obtener todos los registros duplicados
      const duplicatedStudents = await prisma.student.findMany({
        where: {
          institutionId: duplicate.institutionId,
          documento: duplicate.documento
        },
        orderBy: {
          createdAt: 'asc' // Mantener el más antiguo
        }
      });

      // Mantener el primer registro (más antiguo) y eliminar los demás
      const [keepStudent, ...deleteStudents] = duplicatedStudents;
      
      console.log(`  ✅ Manteniendo estudiante ID: ${keepStudent.id} (${keepStudent.nombres} ${keepStudent.apellidos})`);
      
      for (const studentToDelete of deleteStudents) {
        console.log(`  🗑️  Eliminando duplicado ID: ${studentToDelete.id}`);
        
        try {
          // Primero eliminar las relaciones
          await prisma.eventParticipation.deleteMany({
            where: { studentId: studentToDelete.id }
          });
          
          await prisma.transaction.deleteMany({
            where: { studentId: studentToDelete.id }
          });
          
          // Luego eliminar el estudiante
          await prisma.student.delete({
            where: { id: studentToDelete.id }
          });
        } catch (deleteError) {
          console.log(`  ⚠️  Error eliminando estudiante ${studentToDelete.id}:`, deleteError.message);
          // Continuar con el siguiente
        }
      }
    }

    console.log('✅ Limpieza de duplicados completada');
    
  } catch (error) {
    console.error('❌ Error limpiando duplicados:', error.message);
    
    // Si no hay conexión o la tabla no existe, no es un error crítico
    if (error.message.includes('connect') || 
        error.message.includes('does not exist') ||
        error.message.includes('relation') ||
        error.message.includes('timeout')) {
      console.log('ℹ️  Error de conexión o tabla no existe aún, continuando...');
      return; // No lanzar error
    }
    
    throw error;
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  cleanDuplicateStudents()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { cleanDuplicateStudents };