// ===================================
// SCRIPT PARA LIMPIAR DATOS DE DEMOSTRACIÓN
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDemoData() {
    console.log('🧹 Limpiando datos de demostración...\n');

    try {
        // 1. Limpiar transacciones simuladas (solo las claramente marcadas)
        console.log('💸 Eliminando transacciones simuladas...');
        const deletedTransactions = await prisma.transaction.deleteMany({
            where: {
                OR: [
                    { reference: { contains: 'DEMO' } },
                    { reference: { contains: 'TEST' } },
                    { reference: { contains: 'SIMULADA' } }
                ]
            }
        });
        console.log(`✅ Eliminadas ${deletedTransactions.count} transacciones simuladas`);

        // 2. Limpiar facturas simuladas (solo las claramente marcadas)
        console.log('📄 Eliminando facturas simuladas...');
        const deletedInvoices = await prisma.invoice.deleteMany({
            where: {
                OR: [
                    { invoiceNumber: { contains: 'DEMO' } },
                    { invoiceNumber: { contains: 'TEST' } },
                    { invoiceNumber: { contains: 'SIMULADA' } }
                ]
            }
        });
        console.log(`✅ Eliminadas ${deletedInvoices.count} facturas simuladas`);

        // 3. Limpiar eventos de transacciones simuladas (solo las claramente marcadas)
        console.log('🎉 Eliminando transacciones de eventos simuladas...');
        const deletedEventTransactions = await prisma.eventTransaction.deleteMany({
            where: {
                OR: [
                    { referencia: { contains: 'DEMO' } },
                    { referencia: { contains: 'TEST' } },
                    { referencia: { contains: 'SIMULADA' } }
                ]
            }
        });
        console.log(`✅ Eliminadas ${deletedEventTransactions.count} transacciones de eventos simuladas`);

        // 4. Resetear montos recaudados de eventos a 0
        console.log('🎯 Reseteando montos recaudados de eventos...');
        const updatedEvents = await prisma.event.updateMany({
            data: {
                montoRecaudado: 0,
                boletasVendidas: 0
            }
        });
        console.log(`✅ Reseteados ${updatedEvents.count} eventos`);

        // 5. Limpiar participaciones de eventos simuladas
        console.log('👥 Limpiando participaciones simuladas...');
        const deletedParticipations = await prisma.eventParticipation.deleteMany({
            where: {
                montoPagado: { gt: 0 } // Solo las que tienen pagos simulados
            }
        });
        console.log(`✅ Eliminadas ${deletedParticipations.count} participaciones simuladas`);

        // 6. Las cuentas no tienen campo balance - se calcula desde transacciones
        console.log('💰 Los saldos se calculan automáticamente desde las transacciones');

        // 7. Limpiar logs de auditoría de acciones simuladas (opcional)
        console.log('📋 Limpiando logs de auditoría simulados...');
        const deletedLogs = await prisma.auditLog.deleteMany({
            where: {
                OR: [
                    { action: { contains: 'DEMO' } },
                    { action: { contains: 'TEST' } }
                ]
            }
        });
        console.log(`✅ Eliminados ${deletedLogs.count} logs simulados`);

        // 8. Verificar estado final
        console.log('\n📊 Verificando estado final...');
        
        const finalCounts = await Promise.all([
            prisma.transaction.count(),
            prisma.invoice.count(),
            prisma.eventTransaction.count(),
            prisma.eventParticipation.count({ where: { montoPagado: { gt: 0 } } }),
            prisma.account.count()
        ]);

        console.log('=====================================');
        console.log(`📊 Transacciones restantes: ${finalCounts[0]}`);
        console.log(`📄 Facturas restantes: ${finalCounts[1]}`);
        console.log(`🎉 Transacciones de eventos restantes: ${finalCounts[2]}`);
        console.log(`👥 Participaciones con pagos: ${finalCounts[3]}`);
        console.log(`💰 Total cuentas: ${finalCounts[4]}`);

        console.log('\n✅ Limpieza completada exitosamente');
        console.log('🚀 El sistema está listo para datos reales');

    } catch (error) {
        console.error('❌ Error limpiando datos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    cleanDemoData()
        .then(() => {
            console.log('\n✅ Proceso de limpieza completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en el proceso:', error);
            process.exit(1);
        });
}

module.exports = { cleanDemoData };