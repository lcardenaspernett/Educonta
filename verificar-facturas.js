// Script para verificar que las facturas aparecen correctamente
console.log('🔍 Verificando sistema de facturas pendientes...');

// Función para verificar después de cargar la página
function verificarFacturas() {
    console.log('📋 Verificando facturas pendientes...');
    
    // 1. Verificar que existe el manager
    if (window.pendingInvoicesManager) {
        console.log('✅ PendingInvoicesManager cargado');
        console.log('📊 Facturas cargadas:', window.pendingInvoicesManager.pendingInvoices.length);
        
        // Mostrar facturas
        window.pendingInvoicesManager.pendingInvoices.forEach((invoice, index) => {
            console.log(`${index + 1}. ${invoice.studentName} - ${invoice.concept} - ${invoice.amount.toLocaleString('es-CO', {style: 'currency', currency: 'COP'})}`);
        });
    } else {
        console.log('❌ PendingInvoicesManager no encontrado');
    }
    
    // 2. Verificar que existe la tarjeta en el DOM
    const pendingCard = document.querySelector('.pending-invoices-card');
    if (pendingCard) {
        console.log('✅ Tarjeta de facturas pendientes encontrada en el DOM');
    } else {
        console.log('❌ Tarjeta de facturas pendientes NO encontrada');
        console.log('🔍 Elementos dashboard-grid encontrados:', document.querySelectorAll('.dashboard-grid').length);
    }
    
    // 3. Verificar lista de facturas
    const invoicesList = document.getElementById('pendingInvoicesList');
    if (invoicesList) {
        console.log('✅ Lista de facturas encontrada');
        console.log('📝 Contenido:', invoicesList.innerHTML.length > 0 ? 'Con contenido' : 'Vacía');
    } else {
        console.log('❌ Lista de facturas NO encontrada');
    }
    
    // 4. Verificar sistema de aprobaciones
    if (window.approvalSystem) {
        console.log('✅ Sistema de aprobaciones cargado');
        console.log('👤 Rol actual:', window.approvalSystem.userRole);
    } else {
        console.log('❌ Sistema de aprobaciones no encontrado');
    }
    
    // 5. Verificar selector de rol
    const roleSelector = document.getElementById('roleSelect');
    if (roleSelector) {
        console.log('✅ Selector de rol encontrado');
        console.log('🎭 Rol seleccionado:', roleSelector.value);
    } else {
        console.log('❌ Selector de rol NO encontrado');
    }
}

// Ejecutar verificación después de que todo se cargue
setTimeout(verificarFacturas, 6000); // 6 segundos para asegurar que todo esté cargado

// También hacer disponible para ejecución manual
window.verificarFacturas = verificarFacturas;

console.log('💡 Ejecuta window.verificarFacturas() en cualquier momento para verificar el estado');