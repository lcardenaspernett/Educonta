// Prueba específica del botón de factura

console.log('🧾 PRUEBA ESPECÍFICA DEL BOTÓN DE FACTURA');
console.log('=========================================');

// Función para probar el botón de factura
function probarBotonFactura() {
    console.log('🔍 Buscando transacciones de ingreso...');
    
    if (!window.DemoData) {
        console.error('❌ DemoData no disponible');
        return;
    }
    
    window.DemoData.getTransactions().then(response => {
        console.log(`📊 Total transacciones: ${response.data.length}`);
        
        // Buscar transacciones de ingreso
        const transaccionesIngreso = response.data.filter(t => t.type === 'INCOME');
        console.log(`💰 Transacciones de ingreso: ${transaccionesIngreso.length}`);
        
        if (transaccionesIngreso.length === 0) {
            console.error('❌ No hay transacciones de ingreso para probar');
            return;
        }
        
        // Probar con la primera transacción de ingreso
        const transaccion = transaccionesIngreso[0];
        console.log('🎯 Probando con transacción:', {
            id: transaccion.id,
            description: transaccion.description,
            type: transaccion.type,
            amount: transaccion.amount
        });
        
        // Verificar que la función existe
        if (typeof viewTransactionInvoice !== 'function') {
            console.error('❌ viewTransactionInvoice no está disponible');
            return;
        }
        
        console.log('🚀 Ejecutando viewTransactionInvoice...');
        try {
            viewTransactionInvoice(transaccion.id);
            console.log('✅ Función ejecutada sin errores');
        } catch (error) {
            console.error('❌ Error ejecutando función:', error);
        }
        
    }).catch(error => {
        console.error('❌ Error cargando transacciones:', error);
    });
}

// Función para probar con transacción de gasto (debería mostrar warning)
function probarBotonFacturaGasto() {
    console.log('🔍 Probando botón de factura con transacción de gasto...');
    
    if (!window.DemoData) {
        console.error('❌ DemoData no disponible');
        return;
    }
    
    window.DemoData.getTransactions().then(response => {
        // Buscar transacciones de gasto
        const transaccionesGasto = response.data.filter(t => t.type === 'EXPENSE');
        console.log(`💸 Transacciones de gasto: ${transaccionesGasto.length}`);
        
        if (transaccionesGasto.length === 0) {
            console.error('❌ No hay transacciones de gasto para probar');
            return;
        }
        
        // Probar con la primera transacción de gasto
        const transaccion = transaccionesGasto[0];
        console.log('🎯 Probando con transacción de gasto:', {
            id: transaccion.id,
            description: transaccion.description,
            type: transaccion.type,
            amount: transaccion.amount
        });
        
        console.log('🚀 Ejecutando viewTransactionInvoice (debería mostrar warning)...');
        try {
            viewTransactionInvoice(transaccion.id);
            console.log('✅ Función ejecutada - debería mostrar warning');
        } catch (error) {
            console.error('❌ Error ejecutando función:', error);
        }
        
    }).catch(error => {
        console.error('❌ Error cargando transacciones:', error);
    });
}

// Función para verificar si los modales se crean correctamente
function verificarModales() {
    console.log('🔍 Verificando modales existentes...');
    
    const modales = [
        'transactionDetailsModal',
        'editTransactionModal', 
        'invoiceViewerModal'
    ];
    
    modales.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log(`✅ Modal ${modalId} existe`);
            console.log(`   - Visible: ${modal.classList.contains('show')}`);
        } else {
            console.log(`ℹ️ Modal ${modalId} no existe (normal si no se ha abierto)`);
        }
    });
}

// Hacer funciones disponibles globalmente
window.probarBotonFactura = probarBotonFactura;
window.probarBotonFacturaGasto = probarBotonFacturaGasto;
window.verificarModales = verificarModales;

console.log('✅ Funciones de prueba cargadas:');
console.log('   - probarBotonFactura()');
console.log('   - probarBotonFacturaGasto()');
console.log('   - verificarModales()');