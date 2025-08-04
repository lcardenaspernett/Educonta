const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRecentUpdates() {
    try {
        console.log('🔍 Verificando actualizaciones recientes...');
        
        const recentStudents = await prisma.student.findMany({
            take: 10,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                documento: true,
                createdAt: true,
                updatedAt: true
            }
        });
        
        console.log('\n📊 Últimos 10 estudiantes por fecha de actualización:');
        recentStudents.forEach((student, index) => {
            const isRecent = new Date() - new Date(student.updatedAt) < 3600000; // Menos de 1 hora
            const indicator = isRecent ? '🆕' : '📅';
            console.log(`${index + 1}. ${indicator} ${student.nombre} ${student.apellido}`);
            console.log(`   Documento: ${student.documento}`);
            console.log(`   Creado: ${student.createdAt.toLocaleString()}`);
            console.log(`   Actualizado: ${student.updatedAt.toLocaleString()}`);
            console.log('');
        });
        
        // Verificar si hay estudiantes actualizados recientemente
        const recentlyUpdated = recentStudents.filter(s => 
            new Date() - new Date(s.updatedAt) < 3600000
        );
        
        if (recentlyUpdated.length > 0) {
            console.log(`✅ ${recentlyUpdated.length} estudiantes actualizados en la última hora`);
        } else {
            console.log('⚠️ No hay estudiantes actualizados recientemente');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRecentUpdates();