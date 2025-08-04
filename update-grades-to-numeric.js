// ===================================
// ACTUALIZAR GRADOS A FORMATO NUMÉRICO
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateGradesToNumeric() {
    try {
        console.log('🔄 Actualizando grados a formato numérico...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // Primero verificar los grados actuales
        const currentGrades = await prisma.student.findMany({
            where: { institutionId },
            select: { grado: true },
            distinct: ['grado']
        });
        
        console.log('\n📊 GRADOS ACTUALES:');
        currentGrades.forEach(grade => {
            console.log(`   - "${grade.grado}"`);
        });
        
        // Mapeo de grados de texto a numérico
        const gradeMapping = {
            'primero': '1',
            'segundo': '2', 
            'tercero': '3',
            'cuarto': '4',
            'quinto': '5',
            'sexto': '6',
            'septimo': '7',
            'séptimo': '7',
            'octavo': '8',
            'noveno': '9',
            'decimo': '10',
            'décimo': '10',
            'undecimo': '11',
            'undécimo': '11',
            'once': '11',
            // También manejar casos que ya estén en formato numérico
            '01': '1',
            '02': '2',
            '03': '3',
            '04': '4',
            '05': '5',
            '06': '6',
            '07': '7',
            '08': '8',
            '09': '9',
            '10': '10',
            '11': '11',
            '1': '1',
            '2': '2',
            '3': '3',
            '4': '4',
            '5': '5',
            '6': '6',
            '7': '7',
            '8': '8',
            '9': '9'
        };
        
        console.log('\n🔄 Iniciando actualización...');
        
        let updatedCount = 0;
        let errorCount = 0;
        
        // Procesar cada grado único
        for (const gradeItem of currentGrades) {
            const currentGrade = gradeItem.grado.toLowerCase().trim();
            const numericGrade = gradeMapping[currentGrade];
            
            if (numericGrade) {
                console.log(`📝 Actualizando "${gradeItem.grado}" → "${numericGrade}"`);
                
                try {
                    const result = await prisma.student.updateMany({
                        where: {
                            institutionId: institutionId,
                            grado: gradeItem.grado
                        },
                        data: {
                            grado: numericGrade
                        }
                    });
                    
                    console.log(`   ✅ ${result.count} estudiantes actualizados`);
                    updatedCount += result.count;
                    
                } catch (error) {
                    console.error(`   ❌ Error actualizando grado "${gradeItem.grado}":`, error.message);
                    errorCount++;
                }
            } else {
                console.log(`   ⚠️ No se encontró mapeo para "${gradeItem.grado}"`);
                errorCount++;
            }
        }
        
        console.log('\n📊 RESUMEN DE ACTUALIZACIÓN:');
        console.log('============================');
        console.log(`✅ Estudiantes actualizados: ${updatedCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        
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
        updatedGrades.forEach(stat => {
            console.log(`   Grado ${stat.grado}: ${stat._count.id} estudiantes`);
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
// Datos de estudiantes generados automáticamente (con grados numéricos)
window.STUDENTS_DATA = ${JSON.stringify(students, null, 2)};
console.log('📦 Datos de estudiantes cargados (grados numéricos):', window.STUDENTS_DATA.length);
`;

        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'public', 'js', 'students-data.js');
        fs.writeFileSync(filePath, jsContent);
        
        console.log('✅ Archivo de datos actualizado:', filePath);
        
        console.log('\n🎉 ¡ACTUALIZACIÓN COMPLETADA!');
        console.log('=============================');
        console.log('Los grados ahora están en formato numérico (1, 2, 3, etc.)');
        console.log('El archivo de datos del frontend ha sido actualizado');
        console.log('Recarga la página de estudiantes para ver los cambios');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateGradesToNumeric();