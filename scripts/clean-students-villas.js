// ===================================
// SCRIPT PARA LIMPIAR ESTUDIANTES CARGADOS INCORRECTAMENTE
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanStudentsVillas(institutionId) {
    console.log('🧹 Limpiando estudiantes cargados incorrectamente...');

    try {
        // Eliminar todos los estudiantes de la institución
        const deletedStudents = await prisma.student.deleteMany({
            where: { institutionId }
        });

        console.log(`✅ Eliminados ${deletedStudents.count} estudiantes`);

        // También limpiar participaciones de eventos relacionadas
        const deletedParticipations = await prisma.eventParticipation.deleteMany({
            where: {
                event: {
                    institutionId
                }
            }
        });

        console.log(`✅ Eliminadas ${deletedParticipations.count} participaciones de eventos`);

        console.log('🚀 Listo para cargar datos correctos');

    } catch (error) {
        console.error('❌ Error limpiando estudiantes:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const institutionId = process.argv[2] || 'cmdt7n66m00003t1jy17ay313';
    
    cleanStudentsVillas(institutionId)
        .then(() => {
            console.log('✅ Limpieza completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

module.exports = { cleanStudentsVillas };