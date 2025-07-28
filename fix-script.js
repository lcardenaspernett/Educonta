// SCRIPT DE CORRECCIÓN MANUAL
console.log('🔧 Aplicando correcciones manuales...');

// 1. Reinicializar estadísticas
if (window.DemoData) {
    window.DemoData.stats.totalIncome = 0;
    window.DemoData.stats.totalExpenses = 0;
    window.DemoData.stats.netBalance = 0;
    window.DemoData.stats.totalTransactions = window.DemoData.transactions.length;
    
    // Recalcular todo
    window.DemoData.recalculateStats();
    console.log('✅ Estadísticas reinicializadas');
}

// 2. Forzar actualización de UI
setTimeout(() => {
    if (window.AccountingState) {
        window.AccountingState.loadStats().then(() => {
            console.log('✅ UI actualizada con nuevas estadísticas');
            
            // 3. Actualización manual de elementos
            const stats = window.AccountingState.get('stats') || {};
            console.log('📊 Stats para actualización manual:', stats);
            
            const elements = {
                'monthlyIncome': stats.totalIncome || 0,
                'monthlyExpenses': stats.totalExpenses || 0,
                'netBalance': (stats.totalIncome || 0) - (stats.totalExpenses || 0),
                'totalTransactions': stats.totalTransactions || 0
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    const formattedValue = typeof value === 'number' && id !== 'pendingInvoices' 
                        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)
                        : value;
                    element.textContent = formattedValue;
                    console.log(`✅ Actualizado ${id}: ${formattedValue}`);
                } else {
                    console.error(`❌ Elemento ${id} no encontrado`);
                }
            });
        });
    }
}, 1000);

console.log('🎉 Correcciones aplicadas exitosamente');