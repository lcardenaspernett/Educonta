const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFeriaGil() {
    try {
        console.log('🔍 Buscando a FERIA GIL ANGY LORENA...');
        
        // Buscar por nombre
        const studentByName = await prisma.student.findFirst({
            where: {
                OR: [
                    { nombre: { contains: 'FERIA' } },
                    { apellido: { contains: 'FERIA' } },
                    { nombre: { contains: 'ANGY' } },
                    { apellido: { contains: 'ANGY' } }
                ]
            }
        });
        
        if (studentByName) {
            console.log('✅ Estudiante encontrado por nombre:');
            console.log(`   ID: ${studentByName.id}`);
            console.log(`   Nombre: ${studentByName.nombre}`);
            console.log(`   Apellido: ${studentByName.apellido}`);
            console.log(`   Documento: ${studentByName.documento}`);
            console.log(`   Email: ${studentByName.email}`);
            console.log(`   Teléfono: ${studentByName.telefono}`);
            console.log(`   Creado: ${studentByName.createdAt}`);
            console.log(`   Actualizado: ${studentByName.updatedAt}`);
            
            // Verificar si fue actualizado recientemente
            const timeDiff = new Date() - new Date(studentByName.updatedAt);
            const minutesAgo = Math.floor(timeDiff / (1000 * 60));
            
            if (minutesAgo < 60) {
                console.log(`🆕 Actualizado hace ${minutesAgo} minutos`);
            } else {
                console.log(`📅 Actualizado hace más de una hora`);
            }
            
        } else {
            console.log('❌ No se encontró el estudiante por nombre');
        }
        
        // También buscar por documento si conocemos el documento
        console.log('\n🔍 Buscando por documento 1048872859...');
        const studentByDoc = await prisma.student.findFirst({
            where: {
                documento: '1048872859'
            }
        });
        
        if (studentByDoc) {
            console.log('✅ Estudiante encontrado por documento:');
            console.log(`   Nombre completo: ${studentByDoc.nombre} ${studentByDoc.apellido}`);
            console.log(`   Email actual: ${studentByDoc.email}`);
            console.log(`   Última actualización: ${studentByDoc.updatedAt}`);
        } else {
            console.log('❌ No se encontró el estudiante por documento');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkFeriaGil();