// ===================================
// TEST - Verificar Estudiantes en Base de Datos
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStudentsDB() {
    try {
        console.log('🔍 Probando acceso directo a la base de datos...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        console.log('🏫 Institution ID:', institutionId);
        
        // Contar estudiantes
        const totalStudents = await prisma.student.count({
            where: {
                institutionId: institutionId
            }
        });
        
        console.log('👥 Total estudiantes encontrados:', totalStudents);
        
        if (totalStudents > 0) {
            // Obtener algunos estudiantes de muestra
            const sampleStudents = await prisma.student.findMany({
                where: {
                    institutionId: institutionId
                },
                take: 5,
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    documento: true,
                    grado: true,
                    curso: true,
                    estado: true
                }
            });
            
            console.log('📋 Muestra de estudiantes:');
            sampleStudents.forEach((student, index) => {
                console.log(`${index + 1}. ${student.nombre} ${student.apellido} - ${student.documento} - ${student.grado}°${student.curso}`);
            });
            
            // Verificar estructura de datos
            const firstStudent = await prisma.student.findFirst({
                where: {
                    institutionId: institutionId
                }
            });
            
            console.log('\n📊 Estructura del primer estudiante:');
            console.log(JSON.stringify(firstStudent, null, 2));
            
            // Estadísticas por grado
            const gradeStats = await prisma.student.groupBy({
                by: ['grado'],
                where: {
                    institutionId: institutionId
                },
                _count: {
                    id: true
                },
                orderBy: {
                    grado: 'asc'
                }
            });
            
            console.log('\n📈 Estadísticas por grado:');
            gradeStats.forEach(stat => {
                console.log(`   Grado ${stat.grado}: ${stat._count.id} estudiantes`);
            });
            
        } else {
            console.log('❌ No se encontraron estudiantes para esta institución');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testStudentsDB();