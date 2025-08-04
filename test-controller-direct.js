// ===================================
// TEST - Probar Controlador Directamente
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simular el controlador de estudiantes
async function testController() {
    try {
        console.log('🔍 Probando controlador de estudiantes directamente...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        console.log('🏫 Institution ID:', institutionId);
        
        console.log('📡 Obteniendo estudiantes de la base de datos...');
        
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

        console.log('📊 Estudiantes encontrados en DB:', studentsFromDB.length);

        // Transformar datos para que coincidan con el formato esperado por el frontend
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

        console.log('✅ Estudiantes transformados:', students.length);

        if (students.length > 0) {
            console.log('\n📋 Primer estudiante transformado:');
            const first = students[0];
            console.log('   ID:', first.id);
            console.log('   Nombre completo:', first.fullName);
            console.log('   Documento:', first.document);
            console.log('   Grado:', first.grade);
            console.log('   Curso:', first.course);
            console.log('   Estado:', first.status);
            
            console.log('\n📈 Estadísticas por grado:');
            const gradeStats = {};
            students.forEach(student => {
                const grade = student.grade;
                gradeStats[grade] = (gradeStats[grade] || 0) + 1;
            });
            
            Object.keys(gradeStats).sort().forEach(grade => {
                console.log(`   Grado ${grade}: ${gradeStats[grade]} estudiantes`);
            });
        }

        // Simular respuesta de la API
        const apiResponse = {
            success: true,
            students: students
        };

        console.log('\n🎯 Respuesta simulada de la API:');
        console.log('   success:', apiResponse.success);
        console.log('   students.length:', apiResponse.students.length);
        
        return apiResponse;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return {
            success: false,
            message: 'Error obteniendo estudiantes',
            error: error.message
        };
    } finally {
        await prisma.$disconnect();
    }
}

testController();