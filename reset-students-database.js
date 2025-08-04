// ===================================
// RESETEAR BASE DE DATOS DE ESTUDIANTES
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetStudentsDatabase() {
    try {
        console.log('🔄 Reseteando base de datos de estudiantes...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // 1. Eliminar todos los estudiantes actuales
        console.log('\n🗑️ Eliminando estudiantes existentes...');
        const deleteResult = await prisma.student.deleteMany({
            where: { institutionId }
        });
        console.log(`   ✅ ${deleteResult.count} estudiantes eliminados`);
        
        // 2. Crear estudiantes de ejemplo con distribución correcta
        console.log('\n👥 Creando nuevos estudiantes con distribución correcta...');
        
        // Distribución por grado (6° a 11°) y curso (01, 02, 03)
        const gradeDistribution = {
            '6': { total: 200, courses: ['01', '02'] },    // 6° Sexto - 2 cursos
            '7': { total: 220, courses: ['01', '02'] },    // 7° Séptimo - 2 cursos  
            '8': { total: 240, courses: ['01', '02', '03'] }, // 8° Octavo - 3 cursos
            '9': { total: 250, courses: ['01', '02', '03'] }, // 9° Noveno - 3 cursos
            '10': { total: 220, courses: ['01', '02'] },   // 10° Décimo - 2 cursos
            '11': { total: 210, courses: ['01', '02'] }    // 11° Undécimo - 2 cursos
        };
        
        let totalCreated = 0;
        let studentCounter = 1;
        
        // Nombres y apellidos de ejemplo
        const nombres = [
            'JUAN CARLOS', 'MARÍA ALEJANDRA', 'CARLOS ANDRÉS', 'ANA SOFÍA', 'LUIS FERNANDO',
            'VALENTINA', 'DIEGO ALEJANDRO', 'CAMILA', 'SEBASTIÁN', 'ISABELLA', 'MATEO',
            'SOFIA', 'SANTIAGO', 'VALERIA', 'NICOLÁS', 'GABRIELA', 'ALEJANDRO', 'DANIELA',
            'ANDRÉS FELIPE', 'PAULA ANDREA', 'DAVID', 'NATALIA', 'MIGUEL ÁNGEL', 'CAROLINA',
            'JOSÉ LUIS', 'ANDREA', 'KEVIN', 'LAURA', 'BRYAN', 'JESSICA', 'OSCAR', 'PAOLA',
            'CRISTIAN', 'YULIANA', 'JHON', 'TATIANA', 'EDWIN', 'LEIDY', 'ALEXANDER', 'JENNY'
        ];
        
        const apellidos = [
            'GARCÍA LÓPEZ', 'RODRÍGUEZ MARTÍNEZ', 'GONZÁLEZ PÉREZ', 'FERNÁNDEZ SÁNCHEZ',
            'LÓPEZ GÓMEZ', 'MARTÍNEZ DÍAZ', 'SÁNCHEZ RUIZ', 'PÉREZ HERNÁNDEZ',
            'GÓMEZ JIMÉNEZ', 'MARTÍN ÁLVAREZ', 'JIMÉNEZ MORENO', 'RUIZ MUÑOZ',
            'HERNÁNDEZ ALONSO', 'DÍAZ ROMERO', 'MORENO GUTIÉRREZ', 'MUÑOZ NAVARRO',
            'ÁLVAREZ TORRES', 'ROMERO GIL', 'GUTIÉRREZ VÁZQUEZ', 'NAVARRO SERRANO',
            'TORRES BLANCO', 'GIL SUÁREZ', 'VÁZQUEZ CASTRO', 'SERRANO ORTEGA',
            'BLANCO DELGADO', 'SUÁREZ ORTIZ', 'CASTRO MARÍN', 'ORTEGA RUBIO',
            'DELGADO MOLINA', 'ORTIZ MORALES', 'MARÍN IGLESIAS', 'RUBIO MEDINA'
        ];
        
        for (const [grado, config] of Object.entries(gradeDistribution)) {
            console.log(`\n📚 Creando estudiantes para grado ${grado}°:`);
            
            const studentsPerCourse = Math.floor(config.total / config.courses.length);
            const remainder = config.total % config.courses.length;
            
            for (let courseIndex = 0; courseIndex < config.courses.length; courseIndex++) {
                const curso = config.courses[courseIndex];
                let studentsInThisCourse = studentsPerCourse;
                
                // Distribuir el resto en los primeros cursos
                if (courseIndex < remainder) {
                    studentsInThisCourse++;
                }
                
                console.log(`   📝 Curso ${curso}: ${studentsInThisCourse} estudiantes`);
                
                for (let i = 0; i < studentsInThisCourse; i++) {
                    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
                    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
                    const documento = `100${String(studentCounter).padStart(7, '0')}`;
                    
                    await prisma.student.create({
                        data: {
                            documento: documento,
                            nombre: nombre,
                            apellido: apellido,
                            email: `${nombre.toLowerCase().replace(' ', '.')}@villasanpablo.edu.co`,
                            telefono: `+57 30${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
                            grado: grado,
                            curso: curso,
                            genero: Math.random() > 0.5 ? 'M' : 'F',
                            fechaNacimiento: new Date(2008 - parseInt(grado) + 6, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                            direccion: `Calle ${Math.floor(Math.random() * 200) + 1} #${Math.floor(Math.random() * 50)}-${Math.floor(Math.random() * 99)}`,
                            acudienteNombre: `Acudiente de ${nombre}`,
                            acudienteTelefono: `+57 31${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
                            acudienteEmail: `acudiente.${nombre.toLowerCase().replace(' ', '.')}@email.com`,
                            estado: 'activo',
                            institutionId: institutionId
                        }
                    });
                    
                    studentCounter++;
                    totalCreated++;
                }
            }
        }
        
        console.log(`\n✅ Total de estudiantes creados: ${totalCreated}`);
        
        // 3. Verificar la distribución final
        console.log('\n📊 Verificando distribución final...');
        const finalDistribution = await prisma.student.groupBy({
            by: ['grado', 'curso'],
            where: { institutionId },
            _count: { id: true },
            orderBy: [
                { grado: 'asc' },
                { curso: 'asc' }
            ]
        });
        
        console.log('\n📈 DISTRIBUCIÓN FINAL:');
        console.log('======================');
        finalDistribution.forEach(item => {
            const gradeNames = {
                '6': 'Sexto',
                '7': 'Séptimo',
                '8': 'Octavo', 
                '9': 'Noveno',
                '10': 'Décimo',
                '11': 'Undécimo'
            };
            console.log(`   ${item.grado}° (${gradeNames[item.grado]}) - Curso ${item.curso}: ${item._count.id} estudiantes`);
        });
        
        // 4. Regenerar archivo de datos para el frontend
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
// Datos de estudiantes generados automáticamente (grados 6° a 11°, cursos 01-03)
window.STUDENTS_DATA = ${JSON.stringify(students, null, 2)};
console.log('📦 Datos de estudiantes cargados (nueva distribución):', window.STUDENTS_DATA.length);
`;

        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'public', 'js', 'students-data.js');
        fs.writeFileSync(filePath, jsContent);
        
        console.log('✅ Archivo de datos actualizado:', filePath);
        
        console.log('\n🎉 ¡RESET COMPLETADO!');
        console.log('=====================');
        console.log('✅ Base de datos limpiada y recargada');
        console.log('✅ Grados: 6° a 11° (Sexto a Undécimo)');
        console.log('✅ Cursos: 01, 02, 03 (formato numérico)');
        console.log('✅ Distribución equilibrada por curso');
        console.log('✅ Archivo de frontend actualizado');
        console.log('\n💡 Recarga la página de estudiantes para ver los cambios');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetStudentsDatabase();