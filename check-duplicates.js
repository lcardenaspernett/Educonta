// ===================================
// VERIFICAR Y LIMPIAR DUPLICADOS
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
    try {
        console.log('🔍 Verificando duplicados en la base de datos...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // Contar total de estudiantes
        const totalStudents = await prisma.student.count({
            where: { institutionId }
        });
        
        console.log(`📊 Total de estudiantes: ${totalStudents}`);
        
        // Buscar duplicados por documento
        const duplicatesByDocument = await prisma.student.groupBy({
            by: ['documento'],
            where: { institutionId },
            _count: { id: true },
            having: {
                id: {
                    _count: {
                        gt: 1
                    }
                }
            }
        });
        
        console.log(`🔍 Documentos duplicados encontrados: ${duplicatesByDocument.length}`);
        
        if (duplicatesByDocument.length > 0) {
            console.log('\n📋 DOCUMENTOS DUPLICADOS:');
            for (const duplicate of duplicatesByDocument) {
                console.log(`   Documento "${duplicate.documento}": ${duplicate._count.id} registros`);
                
                // Mostrar los registros duplicados
                const duplicateRecords = await prisma.student.findMany({
                    where: {
                        institutionId,
                        documento: duplicate.documento
                    },
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        grado: true,
                        curso: true,
                        createdAt: true
                    }
                });
                
                duplicateRecords.forEach((record, index) => {
                    console.log(`     ${index + 1}. ${record.nombre} ${record.apellido} - ${record.grado}°${record.curso} (ID: ${record.id})`);
                });
            }
            
            console.log('\n⚠️ Se encontraron duplicados. ¿Deseas eliminar los duplicados?');
            console.log('💡 Descomenta la línea "await removeDuplicates()" al final del archivo para proceder.');
        } else {
            console.log('✅ No se encontraron duplicados por documento');
        }
        
        // Verificar distribución por grado
        const gradeDistribution = await prisma.student.groupBy({
            by: ['grado'],
            where: { institutionId },
            _count: { id: true },
            orderBy: { grado: 'asc' }
        });
        
        console.log('\n📈 DISTRIBUCIÓN POR GRADO:');
        gradeDistribution.forEach(grade => {
            console.log(`   Grado ${grade.grado}: ${grade._count.id} estudiantes`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function removeDuplicates() {
    try {
        console.log('🧹 Eliminando duplicados...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // Encontrar duplicados
        const duplicatesByDocument = await prisma.student.groupBy({
            by: ['documento'],
            where: { institutionId },
            _count: { id: true },
            having: {
                id: {
                    _count: {
                        gt: 1
                    }
                }
            }
        });
        
        let removedCount = 0;
        
        for (const duplicate of duplicatesByDocument) {
            // Obtener todos los registros con este documento
            const duplicateRecords = await prisma.student.findMany({
                where: {
                    institutionId,
                    documento: duplicate.documento
                },
                orderBy: { createdAt: 'asc' } // Mantener el más antiguo
            });
            
            // Eliminar todos excepto el primero
            for (let i = 1; i < duplicateRecords.length; i++) {
                await prisma.student.delete({
                    where: { id: duplicateRecords[i].id }
                });
                removedCount++;
                console.log(`   ❌ Eliminado: ${duplicateRecords[i].nombre} ${duplicateRecords[i].apellido} (ID: ${duplicateRecords[i].id})`);
            }
        }
        
        console.log(`\n✅ Duplicados eliminados: ${removedCount}`);
        
        // Verificar resultado
        const finalCount = await prisma.student.count({
            where: { institutionId }
        });
        
        console.log(`📊 Total de estudiantes después de limpieza: ${finalCount}`);
        
    } catch (error) {
        console.error('❌ Error eliminando duplicados:', error);
    }
}

checkDuplicates();

// Descomenta la siguiente línea si quieres eliminar duplicados:
// removeDuplicates();