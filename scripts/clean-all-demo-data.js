// ===================================
// SCRIPT PARA LIMPIAR TODOS LOS DATOS SIMULADOS
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAllDemoData(institutionId) {
    console.log('🧹 Limpiando TODOS los datos simulados y demo...\n');

    try {
        // 1. Limpiar todas las transacciones
        console.log('💸 Eliminando TODAS las transacciones...');
        const deletedTransactions = await prisma.transaction.deleteMany({
            where: { institutionId }
        });
        console.log(`✅ Eliminadas ${deletedTransactions.count} transacciones`);

        // 2. Limpiar todas las facturas
        console.log('📄 Eliminando TODAS las facturas...');
        const deletedInvoices = await prisma.invoice.deleteMany({
            where: { institutionId }
        });
        console.log(`✅ Eliminadas ${deletedInvoices.count} facturas`);

        // 3. Limpiar todas las transacciones de eventos
        console.log('🎉 Eliminando TODAS las transacciones de eventos...');
        const deletedEventTransactions = await prisma.eventTransaction.deleteMany({
            where: {
                event: { institutionId }
            }
        });
        console.log(`✅ Eliminadas ${deletedEventTransactions.count} transacciones de eventos`);

        // 4. Limpiar todas las participaciones de eventos
        console.log('👥 Eliminando TODAS las participaciones de eventos...');
        const deletedParticipations = await prisma.eventParticipation.deleteMany({
            where: {
                event: { institutionId }
            }
        });
        console.log(`✅ Eliminadas ${deletedParticipations.count} participaciones`);

        // 5. Resetear montos recaudados de eventos a 0
        console.log('🎯 Reseteando montos recaudados de eventos...');
        const updatedEvents = await prisma.event.updateMany({
            where: { institutionId },
            data: {
                montoRecaudado: 0,
                boletasVendidas: 0
            }
        });
        console.log(`✅ Reseteados ${updatedEvents.count} eventos`);

        // 6. Limpiar asignaciones de pago (a través de la relación con estudiantes)
        console.log('📋 Eliminando asignaciones de pago...');
        const deletedAssignments = await prisma.paymentAssignment.deleteMany({
            where: {
                student: { institutionId }
            }
        });
        console.log(`✅ Eliminadas ${deletedAssignments.count} asignaciones`);

        // 7. Limpiar eventos de pago
        console.log('💰 Eliminando eventos de pago...');
        const deletedPaymentEvents = await prisma.paymentEvent.deleteMany({
            where: { institutionId }
        });
        console.log(`✅ Eliminados ${deletedPaymentEvents.count} eventos de pago`);

        // 8. Limpiar logs de auditoría
        console.log('📋 Eliminando logs de auditoría...');
        const deletedLogs = await prisma.auditLog.deleteMany({
            where: { institutionId }
        });
        console.log(`✅ Eliminados ${deletedLogs.count} logs`);

        // 9. Verificar estudiantes (solo mostrar, no eliminar los reales)
        const studentsCount = await prisma.student.count({
            where: { institutionId }
        });
        console.log(`📚 Estudiantes en la institución: ${studentsCount}`);

        // 10. Verificar cuentas
        const accountsCount = await prisma.account.count({
            where: { institutionId }
        });
        console.log(`💼 Cuentas en la institución: ${accountsCount}`);

        console.log('\n🎉 LIMPIEZA COMPLETA TERMINADA');
        console.log('=====================================');
        console.log('✅ Sistema limpio y listo para datos reales');
        console.log('📊 Solo quedan los estudiantes reales cargados');
        console.log('💰 Listo para configurar saldos iniciales');

        return {
            transactions: deletedTransactions.count,
            invoices: deletedInvoices.count,
            eventTransactions: deletedEventTransactions.count,
            participations: deletedParticipations.count,
            assignments: deletedAssignments.count,
            paymentEvents: deletedPaymentEvents.count,
            auditLogs: deletedLogs.count,
            students: studentsCount,
            accounts: accountsCount
        };

    } catch (error) {
        console.error('❌ Error limpiando datos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Función para uso desde línea de comandos
async function main() {
    const institutionId = process.argv[2] || 'cmdt7n66m00003t1jy17ay313';
    
    try {
        await cleanAllDemoData(institutionId);
        console.log('✅ Proceso completado exitosamente');
    } catch (error) {
        console.error('❌ Error en el proceso:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { cleanAllDemoData };