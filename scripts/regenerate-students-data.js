// ===================================
// REGENERAR ARCHIVO DE DATOS ESTÁTICO
// ===================================

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function regenerateStudentsData() {
    try {
        console.log('🔄 Regenerando archivo de datos estático desde base de datos...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // Obtener estudiantes actualizados desde la base de datos
        const studentsFromDB = await prisma.student.findMany({
            where: { institutionId },
            orderBy: [
                { grado: 'asc' },
                { curso: 'asc' },
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });

        console.log(`📊 ${studentsFromDB.length} estudiantes encontrados en base de datos`);

        // Transformar datos al formato del frontend
        const students = studentsFromDB.map(student => ({
            id: student.id,
            firstName: student.nombre || '',
            lastName: student.apellido || '',
            fullName: `${student.nombre || ''} ${student.apellido || ''}`.trim(),
            documentType: 'TI',
            document: student.documento || '',
            email: student.email || `${(student.nombre || '').toLowerCase().replace(/\s+/g, '.')}@villasanpablo.edu.co`,
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

        // Crear contenido del archivo JavaScript
        const jsContent = `
// Datos de estudiantes actualizados desde base de datos
// Generado automáticamente el: ${new Date().toLocaleString()}
// Total de estudiantes: ${students.length}

window.STUDENTS_DATA = ${JSON.stringify(students, null, 2)};

console.log('📦 Datos de estudiantes cargados:', window.STUDENTS_DATA.length);
console.log('🕒 Última actualización:', '${new Date().toLocaleString()}');
`;

        // Escribir archivo
        const filePath = path.join(__dirname, '..', 'public', 'js', 'students-data.js');
        fs.writeFileSync(filePath, jsContent);
        
        console.log('✅ Archivo de datos estático regenerado exitosamente');
        console.log(`📁 Ubicación: ${filePath}`);
        console.log(`📊 Estudiantes incluidos: ${students.length}`);
        console.log(`🕒 Fecha de generación: ${new Date().toLocaleString()}`);
        
        // Mostrar algunos ejemplos
        console.log('\n📋 Primeros 3 estudiantes:');
        students.slice(0, 3).forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.fullName} (${student.grade}° - ${student.course})`);
        });
        
        console.log('\n🎉 ¡Archivo regenerado! Ahora los datos estáticos están sincronizados con la base de datos.');
        
    } catch (error) {
        console.error('❌ Error regenerando archivo de datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    regenerateStudentsData();
}

module.exports = { regenerateStudentsData };