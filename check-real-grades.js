// ===================================
// VERIFICAR GRADOS REALES EN BASE DE DATOS
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRealGrades() {
    try {
        console.log('🔍 Verificando grados reales en la base de datos...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // Obtener todos los valores únicos de grado
        const uniqueGrades = await prisma.student.findMany({
            where: { institutionId },
            select: { grado: true },
            distinct: ['grado']
        });
        
        console.log('\n📊 GRADOS ENCONTRADOS EN LA BASE DE DATOS:');
        console.log('==========================================');
        uniqueGrades.forEach((item, index) => {
            console.log(`   ${index + 1}. "${item.grado}"`);
        });
        
        // Obtener estadísticas por grado
        const gradeStats = await prisma.student.groupBy({
            by: ['grado'],
            where: { institutionId },
            _count: { id: true },
            orderBy: { grado: 'asc' }
        });
        
        console.log('\n📈 ESTADÍSTICAS POR GRADO:');
        console.log('==========================================');
        gradeStats.forEach(stat => {
            console.log(`   "${stat.grado}": ${stat._count.id} estudiantes`);
        });
        
        // Muestra de estudiantes por grado
        console.log('\n👥 MUESTRA DE ESTUDIANTES POR GRADO:');
        console.log('==========================================');
        
        for (const gradeItem of uniqueGrades) {
            const sampleStudents = await prisma.student.findMany({
                where: { 
                    institutionId,
                    grado: gradeItem.grado 
                },
                select: {
                    nombre: true,
                    apellido: true,
                    grado: true,
                    curso: true
                },
                take: 3
            });
            
            console.log(`\n🎓 Grado "${gradeItem.grado}":`);
            sampleStudents.forEach((student, index) => {
                console.log(`   ${index + 1}. ${student.nombre} ${student.apellido} - ${student.grado} ${student.curso}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRealGrades();