// ===================================
// CORREGIR GRADOS A FORMATO DE SECUNDARIA (6° a 11°)
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixGradesToSecondary() {
    try {
        console.log('🔄 Corrigiendo grados a formato de secundaria (6° a 11°)...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // Verificar grados actuales
        const currentGrades = await prisma.student.groupBy({
            by: ['grado'],
            where: { institutionId },
            _count: { id: true },
            orderBy: { grado: 'asc' }
        });
        
        console.log('\n📊 GRADOS ACTUALES:');
        currentGrades.forEach(grade => {
            console.log(`   Grado "${grade.grado}": ${grade._count.id} estudiantes`);
        });
        
        // Mapeo correcto: los grados 1-7 en la BD corresponden a 6°-11° + 12°
        const gradeMapping = {
            '1': '6',   // Sexto
            '2': '7',   // Séptimo  
            '3': '8',   // Octavo
            '4': '9',   // Noveno
            '5': '10',  // Décimo
            '6': '11',  // Undécimo
            '7': '12'   // Duodécimo (si existe)
        };
        
        console.log('\n🔄 MAPEO DE GRADOS:');
        console.log('==================');
        Object.entries(gradeMapping).forEach(([old, newGrade]) => {
            const gradeNames = {
                '6': 'Sexto',
                '7': 'Séptimo', 
                '8': 'Octavo',
                '9': 'Noveno',
                '10': 'Décimo',
                '11': 'Undécimo',
                '12': 'Duodécimo'
            };
            console.log(`   "${old}" → "${newGrade}" (${gradeNames[newGrade]})`);
        });
        
        console.log('\n🔄 Iniciando actualización...');
        
        let updatedCount = 0;
        
        for (const [oldGrade, newGrade] of Object.entries(gradeMapping)) {
            const result = await prisma.student.updateMany({
                where: {
                    institutionId: institutionId,
                    grado: oldGrade
                },
                data: {
                    grado: newGrade
                }
            });
            
            if (result.count > 0) {
                console.log(`   ✅ Grado ${oldGrade} → ${newGrade}: ${result.count} estudiantes actualizados`);
                updatedCount += result.count;
            }
        }
        
        console.log(`\n📊 Total de estudiantes actualizados: ${updatedCount}`);
        
        // Verificar el resultado
        console.log('\n🔍 Verificando resultado...');
        const updatedGrades = await prisma.student.groupBy({
            by: ['grado'],
            where: { institutionId },
            _count: { id: true },
            orderBy: { grado: 'asc' }
        });
        
        console.log('\n📈 GRADOS DESPUÉS DE LA ACTUALIZACIÓN:');
        console.log('=====================================');
        const gradeNames = {
            '6': 'Sexto',
            '7': 'Séptimo', 
            '8': 'Octavo',
            '9': 'Noveno',
            '10': 'Décimo',
            '11': 'Undécimo',
            '12': 'Duodécimo'
        };
        
        updatedGrades.forEach(stat => {
            const gradeName = gradeNames[stat.grado] || `Grado ${stat.grado}`;
            console.log(`   ${stat.grado}° (${gradeName}): ${stat._count.id} estudiantes`);
        });
        
        // Regenerar archivo de datos para el frontend
        console.log('\n🔄 Regenerando archivo de datos para el frontend...');
        
        const studentsFromDB = await prisma.student.findMany({
            where: { institutionId },
            orderBy: [
                { grado: 'asc' },
                { curso: 'asc' },
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });

        // Transformar datos
        const students = studentsFromDB.map(student => ({
            id: student.id,
            firstName: student.nombre || '',
            lastName: student.apellido || '',
            fullName: `${student.nombre || ''} ${student.apellido || ''}`.trim(),
            documentType: 'TI',
            document: student.documento || '',
            email: student.email || `${(student.nombre || '').toLowerCase().replace(' ', '.')}@estudiante.edu.co`,
            phone: student.telefono || '+57 300 000 0000',
            grade: student.grado || '',
            course: student.curso || '',
            status: student.estado === 'activo' ? 'ACTIVE' : 'INACTIVE',
            enrollmentDate: student.createdAt || new Date().toISOString(),
            birthDate: student.fechaNacimiento || new Date('2008-01-01').toISOString(),
            guardian: {
                name: student.acudienteNombre || 'Acudiente',
                phone: student.acudienteTelefono || '+57 300 000 0000',
                email: student.acudienteEmail || 'acudiente@email.com'
            },
            address: student.direccion || 'Dirección pendiente',
            events: [],
            totalDebt: 0,
            totalPaid: 0,
            createdAt: student.createdAt || new Date().toISOString()
        }));

        // Crear archivo JavaScript actualizado
        const jsContent = `
// Datos de estudiantes generados automáticamente (grados de secundaria 6° a 11°)
window.STUDENTS_DATA = ${JSON.stringify(students, null, 2)};
console.log('📦 Datos de estudiantes cargados (secundaria):', window.STUDENTS_DATA.length);
`;

        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'public', 'js', 'students-data.js');
        fs.writeFileSync(filePath, jsContent);
        
        console.log('✅ Archivo de datos actualizado:', filePath);
        
        console.log('\n🎉 ¡CORRECCIÓN COMPLETADA!');
        console.log('==========================');
        console.log('Los grados ahora están correctamente mapeados:');
        console.log('6° (Sexto), 7° (Séptimo), 8° (Octavo), 9° (Noveno), 10° (Décimo), 11° (Undécimo)');
        console.log('El archivo de datos del frontend ha sido actualizado');
        console.log('Recarga la página de estudiantes para ver los cambios');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixGradesToSecondary();