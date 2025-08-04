// ===================================
// CARGA DIRECTA DE ESTUDIANTES DESDE BASE DE DATOS
// ===================================

// Este script se ejecuta en el servidor y expone los datos al frontend
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function loadStudentsToFile() {
    try {
        console.log('🔄 Cargando estudiantes desde base de datos...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        const studentsFromDB = await prisma.student.findMany({
            where: {
                institutionId: institutionId
            },
            orderBy: [
                { grado: 'asc' },
                { curso: 'asc' },
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });

        console.log('📊 Estudiantes encontrados:', studentsFromDB.length);

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

        // Crear archivo JavaScript que el frontend puede cargar
        const jsContent = `
// Datos de estudiantes generados automáticamente
window.STUDENTS_DATA = ${JSON.stringify(students, null, 2)};
console.log('📦 Datos de estudiantes cargados:', window.STUDENTS_DATA.length);
`;

        const filePath = path.join(__dirname, 'js', 'students-data.js');
        fs.writeFileSync(filePath, jsContent);
        
        console.log('✅ Archivo de datos creado:', filePath);
        console.log('📊 Total estudiantes exportados:', students.length);
        
        // Estadísticas por grado
        const gradeStats = {};
        students.forEach(student => {
            const grade = student.grade;
            gradeStats[grade] = (gradeStats[grade] || 0) + 1;
        });
        
        console.log('\n📈 Distribución por grado:');
        Object.keys(gradeStats).sort().forEach(grade => {
            console.log(`   Grado ${grade}: ${gradeStats[grade]} estudiantes`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

loadStudentsToFile();