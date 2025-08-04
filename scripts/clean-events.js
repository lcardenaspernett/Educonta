// ===================================
// EDUCONTA - Limpiar Eventos
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanEvents(institutionId) {
    console.log('🎉 Limpiando eventos...\n');
    
    try {
        // Eliminar participaciones de eventos
        const deletedParticipations = await prisma.eventParticipation.deleteMany({
            where: {
                event: {
                    institutionId
                }
            }
        });
        console.log(`✅ Eliminadas ${deletedParticipations.count} participaciones`);
        
        // Eliminar transacciones de eventos
        const deletedEventTransactions = await prisma.eventTransaction.deleteMany({
            where: {
                event: {
                    institutionId
                }
            }
        });
        console.log(`✅ Eliminadas ${deletedEventTransactions.count} transacciones de eventos`);
        
        // Eliminar eventos
        const deletedEvents = await prisma.event.deleteMany({
            where: {
                institutionId
            }
        });
        console.log(`✅ Eliminados ${deletedEvents.count} eventos`);
        
        console.log('\n🎉 EVENTOS ELIMINADOS COMPLETAMENTE');
        console.log('=====================================');
        console.log('✅ Sistema limpio de eventos');
        
    } catch (error) {
        console.error('❌ Error limpiando eventos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const institutionId = process.argv[2];
    
    if (!institutionId) {
        console.log('❌ Uso: node clean-events.js <institutionId>');
        console.log('💡 Ejemplo: node clean-events.js cmdt7n66m00003t1jy17ay313');
        process.exit(1);
    }
    
    cleanEvents(institutionId);
}

module.exports = { cleanEvents };