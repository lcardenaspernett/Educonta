// Script para forzar actualización del dashboard
console.log('🔄 Forzando actualización del dashboard...');

// Función para actualizar elemento
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
        element.classList.remove('loading');
        console.log(`✅ Actualizado ${id}: ${value}`);
        return true;
    } else {
        console.error(`❌ Elemento ${id} no encontrado`);
        return false;
    }
}

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount || 0);
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceUpdate);
} else {
    forceUpdate();
}

function forceUpdate() {
    console.log('📊 Iniciando actualización forzada...');
    
    // Valores correctos
    const stats = {
        totalIncome: 920000,
        totalExpenses: 230000,
        netBalance: 690000,
        totalTransactions: 5
    };
    
    // Actualizar elementos
    const updates = [
        ['monthlyIncome', formatCurrency(stats.totalIncome)],
        ['monthlyExpenses', formatCurrency(stats.totalExpenses)],
        ['netBalance', formatCurrency(stats.netBalance)],
        ['totalTransactions', stats.totalTransactions]
    ];
    
    let successCount = 0;
    updates.forEach(([id, value]) => {
        if (updateElement(id, value)) {
            successCount++;
        }
    });
    
    console.log(`✅ Actualización completada: ${successCount}/${updates.length} elementos actualizados`);
    
    // Verificar si DemoData existe y actualizarlo
    if (window.DemoData) {
        console.log('🔄 Actualizando DemoData...');
        window.DemoData.stats.totalIncome = stats.totalIncome;
        window.DemoData.stats.totalExpenses = stats.totalExpenses;
        window.DemoData.stats.netBalance = stats.netBalance;
        window.DemoData.stats.totalTransactions = stats.totalTransactions;
        console.log('✅ DemoData actualizado');
    }
    
    // Verificar si AccountingState existe y actualizarlo
    if (window.AccountingState) {
        console.log('🔄 Actualizando AccountingState...');
        window.AccountingState.set('stats', stats);
        console.log('✅ AccountingState actualizado');
    }
}

// Exportar para uso en consola
window.forceUpdateDashboard = forceUpdate;
console.log('💡 Función disponible: window.forceUpdateDashboard()');