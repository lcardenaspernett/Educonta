const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDuplicateStudents() {
  try {
    console.log('🔍 Buscando estudiantes duplicados...');
    
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
      }
    }

    console.log('✅ Limpieza de duplicados completada');
    
  } catch (error) {
    console.error('❌ Error limpiando duplicados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
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