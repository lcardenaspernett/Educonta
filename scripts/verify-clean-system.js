// ===================================
// EDUCONTA - Verificar Sistema Limpio
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCleanSystem(institutionId) {
    console.log('🔍 Verificando estado del sistema...\n');
    
    try {
        // Verificar institución
        const institution = await prisma.institution.findUnique({
            where: { id: institutionId }
        });
        
        if (!institution) {
            console.log('❌ Institución no encontrada');
            return;
        }
        
        console.log(`🏫 Institución: ${institution.name}`);
        
        // Contar elementos
        const counts = await Promise.all([
            prisma.student.count({ where: { institutionId } }),
            prisma.account.count({ where: { institutionId } }),
            prisma.transaction.count({ where: { institutionId } }),
            prisma.invoice.count({ where: { institutionId } }),
            prisma.event.count({ where: { institutionId } }),
            prisma.eventParticipation.count({ 
                where: { event: { institutionId } } 
            }),
            prisma.category.count({ where: { institutionId } })
        ]);
        
        const [students, accounts, transactions, invoices, events, participations, categories] = counts;
        
        console.log('\n📊 ESTADO ACTUAL DEL SISTEMA:');
        console.log('=====================================');
        console.log(`👥 Estudiantes: ${students}`);
        console.log(`💼 Cuentas: ${accounts}`);
        console.log(`💰 Transacciones: ${transactions}`);
        console.log(`📄 Facturas: ${invoices}`);
        console.log(`🎉 Eventos: ${events}`);
        console.log(`👤 Participaciones: ${participations}`);
        console.log(`📋 Categorías: ${categories}`);
        
        // Verificar balance total
        if (transactions > 0) {
            const balanceResult = await prisma.transaction.aggregate({
                where: { 
                    institutionId,
                    status: 'APPROVED'
                },
                _sum: { amount: true }
            });
            
            console.log(`💵 Balance total: $${(balanceResult._sum.amount || 0).toLocaleString()}`);
        }
        
        console.log('\n🎯 ESTADO DEL SISTEMA:');
        console.log('=====================================');
        
        if (transactions === 0 && invoices === 0 && events === 0) {
            console.log('✅ Sistema limpio - Sin datos de prueba');
            console.log('✅ Listo para datos reales');
            console.log('💡 El modal de configuración inicial se mostrará automáticamente');
        } else {
            console.log('⚠️  Sistema contiene datos:');
            if (transactions > 0) console.log(`   - ${transactions} transacciones`);
            if (invoices > 0) console.log(`   - ${invoices} facturas`);
            if (events > 0) console.log(`   - ${events} eventos`);
        }
        
        console.log('\n✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error verificando sistema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const institutionId = process.argv[2];
    
    if (!institutionId) {
        console.log('❌ Uso: node verify-clean-system.js <institutionId>');
        console.log('💡 Ejemplo: node verify-clean-system.js cmdt7n66m00003t1jy17ay313');
        process.exit(1);
    }
    
    verifyCleanSystem(institutionId);
}

module.exports = { verifyCleanSystem };