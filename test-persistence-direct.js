const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPersistence() {
    console.log('🔍 Iniciando pruebas de persistencia directa...\n');
    
    let testStudentId = null;
    
    try {
        // 1. Crear estudiante
        console.log('1️⃣ Creando estudiante de prueba...');
        const newStudent = await prisma.student.create({
            data: {
                documento: 'TEST' + Date.now(),
                nombre: 'Test',
                apellido: 'Persistencia',
                email: 'test@persistencia.com',
                telefono: '1234567890',
                grado: '6',
                curso: 'A',
                genero: 'M',
                institutionId: 'cmdt7n66m00003t1jy17ay313'
            }
        });
        
        testStudentId = newStudent.id;
        console.log('✅ Estudiante creado:', {
            id: newStudent.id,
            nombre: `${newStudent.nombre} ${newStudent.apellido}`,
            documento: newStudent.documento
        });
        
        // 2. Verificar que existe
        console.log('\n2️⃣ Verificando que el estudiante existe...');
        const foundStudent = await prisma.student.findUnique({
            where: { id: testStudentId }
        });
        
        if (foundStudent) {
            console.log('✅ Estudiante encontrado en la base de datos');
        } else {
            console.log('❌ Estudiante NO encontrado en la base de datos');
            return;
        }
        
        // 3. Actualizar estudiante
        console.log('\n3️⃣ Actualizando estudiante...');
        const updatedStudent = await prisma.student.update({
            where: { id: testStudentId },
            data: {
                nombre: 'Test Actualizado',
                grado: '7'
            }
        });
        
        console.log('✅ Estudiante actualizado:', {
            id: updatedStudent.id,
            nombre: `${updatedStudent.nombre} ${updatedStudent.apellido}`,
            grado: updatedStudent.grado
        });
        
        // 4. Verificar actualización
        console.log('\n4️⃣ Verificando actualización...');
        const verifyUpdate = await prisma.student.findUnique({
            where: { id: testStudentId }
        });
        
        if (verifyUpdate && verifyUpdate.nombre === 'Test Actualizado') {
            console.log('✅ Actualización verificada correctamente');
        } else {
            console.log('❌ La actualización no se persistió correctamente');
        }
        
        // 5. Contar estudiantes
        console.log('\n5️⃣ Contando total de estudiantes...');
        const totalStudents = await prisma.student.count();
        console.log(`📊 Total de estudiantes en la base de datos: ${totalStudents}`);
        
        // 6. Eliminar estudiante de prueba
        console.log('\n6️⃣ Eliminando estudiante de prueba...');
        await prisma.student.delete({
            where: { id: testStudentId }
        });
        
        console.log('✅ Estudiante eliminado');
        
        // 7. Verificar eliminación
        console.log('\n7️⃣ Verificando eliminación...');
        const deletedStudent = await prisma.student.findUnique({
            where: { id: testStudentId }
        });
        
        if (!deletedStudent) {
            console.log('✅ Eliminación verificada correctamente');
        } else {
            console.log('❌ El estudiante no fue eliminado correctamente');
        }
        
        console.log('\n🎉 Todas las pruebas de persistencia completadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
        
        // Limpiar en caso de error
        if (testStudentId) {
            try {
                await prisma.student.delete({
                    where: { id: testStudentId }
                });
                console.log('🧹 Estudiante de prueba eliminado después del error');
            } catch (cleanupError) {
                console.error('❌ Error al limpiar:', cleanupError);
            }
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Función para verificar conexión a la base de datos
async function testConnection() {
    console.log('🔌 Verificando conexión a la base de datos...');
    
    try {
        await prisma.$connect();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Verificar que las tablas existen
        const institutions = await prisma.institution.count();
        console.log(`📊 Instituciones en la base de datos: ${institutions}`);
        
        const students = await prisma.student.count();
        console.log(`📊 Estudiantes en la base de datos: ${students}`);
        
        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        return false;
    }
}

// Ejecutar pruebas
async function main() {
    console.log('🚀 Iniciando diagnóstico de persistencia\n');
    
    const connected = await testConnection();
    
    if (connected) {
        console.log('\n' + '='.repeat(50));
        await testPersistence();
    } else {
        console.log('❌ No se puede continuar sin conexión a la base de datos');
    }
}

main().catch(console.error);