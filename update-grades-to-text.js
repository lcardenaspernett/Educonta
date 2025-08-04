// ===================================
// ACTUALIZAR GRADOS A FORMATO DE TEXTO
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateGradesToText() {
    try {
        console.log('🔄 Actualizando grados de formato numérico a texto...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // Mapeo de grados numéricos a texto
        const gradeMapping = {
            '01': '6°',
            '02': '7°', 
            '03': '8°',
            '04': '9°',
            '05': '10°',
            '06': '11°',
            '07': '12°'
        };
        
        // También podemos usar el formato completo en texto si prefieres
        const gradeTextMapping = {
            '01': 'sexto',
            '02': 'séptimo',
            '03': 'octavo', 
            '04': 'noveno',
            '05': 'décimo',
            '06': 'undécimo',
            '07': 'duodécimo'
        };
        
        console.log('\n📋 MAPEO DE GRADOS:');
        console.log('==========================================');
        Object.entries(gradeMapping).forEach(([old, newGrade]) => {
            console.log(`   "${old}" → "${newGrade}" (${gradeTextMapping[old]})`);
        });
        
        console.log('\n❓ ¿Qué formato prefieres?');
        console.log('   1. Numérico: 6°, 7°, 8°, 9°, 10°, 11°, 12°');
        console.log('   2. Texto: sexto, séptimo, octavo, noveno, décimo, undécimo, duodécimo');
        
        // Por ahora voy a usar el formato numérico, pero puedes cambiar a gradeTextMapping
        const selectedMapping = gradeMapping; // Cambiar a gradeTextMapping si prefieres texto
        
        console.log('\n🔄 Iniciando actualización...');
        
        let totalUpdated = 0;
        
        for (const [oldGrade, newGrade] of Object.entries(selectedMapping)) {
            const result = await prisma.student.updateMany({
                where: {
                    institutionId: institutionId,
                    grado: oldGrade
                },
                data: {
                    grado: newGrade
                }
            });
            
            console.log(`   ✅ "${oldGrade}" → "${newGrade}": ${result.count} estudiantes actualizados`);
            totalUpdated += result.count;
        }
        
        console.log(`\n🎉 ¡Actualización completada!`);
        console.log(`📊 Total de estudiantes actualizados: ${totalUpdated}`);
        
        // Verificar los cambios
        console.log('\n🔍 Verificando cambios...');
        const updatedGrades = await prisma.student.groupBy({
            by: ['grado'],
            where: { institutionId },
            _count: { id: true },
            orderBy: { grado: 'asc' }
        });
        
        console.log('\n📈 GRADOS DESPUÉS DE LA ACTUALIZACIÓN:');
        console.log('==========================================');
        updatedGrades.forEach(stat => {
            console.log(`   "${stat.grado}": ${stat._count.id} estudiantes`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Preguntar antes de ejecutar
console.log('⚠️  ADVERTENCIA: Este script modificará los grados en la base de datos.');
console.log('📝 Revisa el código y descomenta la línea de abajo para ejecutar:');
console.log('');
console.log('// updateGradesToText();');
console.log('');
console.log('💡 Opciones disponibles:');
console.log('   - Formato numérico: 6°, 7°, 8°, etc.');
console.log('   - Formato texto: sexto, séptimo, octavo, etc.');

// Descomenta la siguiente línea para ejecutar:
// updateGradesToText();