// ===================================
// ANÁLISIS DE FILTROS - Grados y Cursos
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeFilters() {
    try {
        console.log('🔍 Analizando datos reales para filtros...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // Obtener todos los valores únicos de grado
        const uniqueGrades = await prisma.student.findMany({
            where: { institutionId },
            select: { grado: true },
            distinct: ['grado']
        });
        
        // Obtener todos los valores únicos de curso
        const uniqueCourses = await prisma.student.findMany({
            where: { institutionId },
            select: { curso: true },
            distinct: ['curso']
        });
        
        console.log('\n📊 VALORES ÚNICOS ENCONTRADOS:');
        console.log('=====================================');
        
        console.log('\n🎓 GRADOS:');
        uniqueGrades.forEach(item => {
            console.log(`   - "${item.grado}"`);
        });
        
        console.log('\n📚 CURSOS:');
        uniqueCourses.forEach(item => {
            console.log(`   - "${item.curso}"`);
        });
        
        // Obtener combinaciones grado-curso
        const gradeCourseCombo = await prisma.student.groupBy({
            by: ['grado', 'curso'],
            where: { institutionId },
            _count: { id: true },
            orderBy: [
                { grado: 'asc' },
                { curso: 'asc' }
            ]
        });
        
        console.log('\n🔗 COMBINACIONES GRADO-CURSO:');
        console.log('=====================================');
        gradeCourseCombo.forEach(combo => {
            console.log(`   ${combo.grado}° ${combo.curso} - ${combo._count.id} estudiantes`);
        });
        
        // Muestra de estudiantes para ver el formato exacto
        const sampleStudents = await prisma.student.findMany({
            where: { institutionId },
            select: {
                nombre: true,
                apellido: true,
                grado: true,
                curso: true
            },
            take: 10
        });
        
        console.log('\n👥 MUESTRA DE ESTUDIANTES:');
        console.log('=====================================');
        sampleStudents.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.nombre} ${student.apellido} - Grado: "${student.grado}" Curso: "${student.curso}"`);
        });
        
        // Generar opciones para los filtros
        console.log('\n⚙️ OPCIONES PARA FILTROS HTML:');
        console.log('=====================================');
        
        console.log('\n📝 Opciones de Grado:');
        const sortedGrades = uniqueGrades.map(g => g.grado).sort();
        sortedGrades.forEach(grade => {
            // Convertir formato si es necesario
            let displayGrade = grade;
            let numericGrade = grade;
            
            // Si el grado viene como "01", "02", etc., convertir a número
            if (grade.match(/^\d+$/)) {
                numericGrade = parseInt(grade);
                displayGrade = `${numericGrade}°`;
            }
            
            console.log(`   <option value="${grade}">${displayGrade} Grado</option>`);
        });
        
        console.log('\n📝 Opciones de Curso:');
        const sortedCourses = uniqueCourses.map(c => c.curso).sort();
        sortedCourses.forEach(course => {
            console.log(`   <option value="${course}">Curso ${course}</option>`);
        });
        
        console.log('\n🎯 RECOMENDACIÓN PARA FORMATO:');
        console.log('=====================================');
        
        // Analizar si necesitamos conversión
        const needsConversion = sortedGrades.some(grade => grade.match(/^\d+$/));
        
        if (needsConversion) {
            console.log('✅ Los grados están en formato numérico (01, 02, etc.)');
            console.log('💡 Recomendación: Mostrar como "1°", "2°", etc. en la interfaz');
            console.log('🔧 Pero usar los valores originales ("01", "02") para filtrar');
        } else {
            console.log('ℹ️ Los grados ya están en formato texto');
        }
        
        console.log('\n🔄 FORMATO SUGERIDO PARA DISPLAY:');
        gradeCourseCombo.forEach(combo => {
            const displayGrade = parseInt(combo.grado);
            console.log(`   ${displayGrade}°-${combo.curso} (${combo._count.id} estudiantes)`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeFilters();