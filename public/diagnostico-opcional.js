// Diagnóstico opcional - Solo se ejecuta manualmente

console.log('🔧 DIAGNÓSTICO OPCIONAL CARGADO');
console.log('===============================');
console.log('📋 Funciones disponibles:');
console.log('   - diagnosticarSistemaCompleto() - Diagnóstico completo sin ejecutar pruebas');
console.log('   - probarModalDetalles() - Probar modal de detalles');
console.log('   - probarModalEdicion() - Probar modal de edición');
console.log('   - probarModalFactura() - Probar modal de factura');
console.log('   - probarNotificaciones() - Probar sistema de notificaciones');

// Función de diagnóstico que NO ejecuta pruebas automáticamente
function diagnosticarSistemaCompleto() {
    console.log('\n🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA');
    console.log('===================================');
    
    // 1. Verificar dependencias
    console.log('\n📋 1. VERIFICANDO DEPENDENCIAS...');
    const scriptsEsperados = ['globals.js', 'state.js', 'demo-data.js', 'movements-page.js'];
    scriptsEsperados.forEach(script => {
        const scriptElement = document.querySelector(`script[src*="${script}"]`);
        console.log(`${scriptElement ? '✅' : '❌'} ${script}`);
    });
    
    // 2. Verificar objetos globales
    console.log('\n🔧 2. VERIFICANDO OBJETOS GLOBALES...');
    const objetosGlobales = ['DemoData', 'MovementsManagementPage', 'movementsPage', 'AccountingGlobals'];
    objetosGlobales.forEach(obj => {
        const disponible = !!window[obj];
        console.log(`${disponible ? '✅' : '❌'} ${obj}`);
        if (obj === 'movementsPage' && window[obj] && window[obj].transactions) {
            console.log(`   - Transacciones cargadas: ${window[obj].transactions.length}`);
        }
    });
    
    // 3. Verificar funciones
    console.log('\n⚙️ 3. VERIFICANDO FUNCIONES...');
    const funcionesEsperadas = ['viewTransaction', 'editTransaction', 'viewTransactionInvoice', 'showAlert', 'formatCurrency', 'formatDate'];
    funcionesEsperadas.forEach(func => {
        const disponible = typeof window[func] === 'function';
        console.log(`${disponible ? '✅' : '❌'} ${func}`);
    });
    
    // 4. Verificar DOM
    console.log('\n🎯 4. VERIFICANDO DOM...');
    const elementosDOM = ['transactionsTableBody', 'transactionsSummary', 'dateFrom', 'dateTo'];
    elementosDOM.forEach(elementId => {
        const elemento = document.getElementById(elementId);
        console.log(`${elemento ? '✅' : '❌'} Elemento ${elementId}`);
    });
    
    // 5. Mostrar comandos de prueba disponibles
    console.log('\n🧪 5. COMANDOS DE PRUEBA DISPONIBLES...');
    if (window.movementsPage && window.movementsPage.transactions.length > 0) {
        const primeraTransaccion = window.movementsPage.transactions[0];
        console.log('   Para probar manualmente, ejecuta:');
        console.log(`   - probarModalDetalles() // Usa ID: ${primeraTransaccion.id}`);
        console.log(`   - probarModalEdicion() // Usa ID: ${primeraTransaccion.id}`);
        console.log(`   - probarModalFactura() // Busca transacción de ingreso`);
        console.log(`   - probarNotificaciones() // Muestra todas las notificaciones`);
    } else {
        console.log('   ❌ No hay transacciones disponibles para pruebas');
    }
    
    console.log('\n✅ Diagnóstico completado sin ejecutar pruebas automáticas');
}

// Funciones de prueba manual
function probarModalDetalles() {
    console.log('🧪 Probando modal de detalles...');
    if (window.movementsPage && window.movementsPage.transactions.length > 0) {
        const transactionId = window.movementsPage.transactions[0].id;
        console.log(`📋 Usando transacción ID: ${transactionId}`);
        viewTransaction(transactionId);
        console.log('✅ Modal de detalles ejecutado');
    } else {
        console.error('❌ No hay transacciones disponibles');
    }
}

function probarModalEdicion() {
    console.log('🧪 Probando modal de edición...');
    if (window.movementsPage && window.movementsPage.transactions.length > 0) {
        const transactionId = window.movementsPage.transactions[0].id;
        console.log(`📋 Usando transacción ID: ${transactionId}`);
        editTransaction(transactionId);
        console.log('✅ Modal de edición ejecutado');
    } else {
        console.error('❌ No hay transacciones disponibles');
    }
}

function probarModalFactura() {
    console.log('🧪 Probando modal de factura...');
    if (window.movementsPage && window.movementsPage.transactions.length > 0) {
        const incomeTransaction = window.movementsPage.transactions.find(t => t.type === 'INCOME');
        if (incomeTransaction) {
            console.log(`📋 Usando transacción de ingreso ID: ${incomeTransaction.id}`);
            viewTransactionInvoice(incomeTransaction.id);
            console.log('✅ Modal de factura ejecutado');
        } else {
            console.error('❌ No hay transacciones de ingreso disponibles');
        }
    } else {
        console.error('❌ No hay transacciones disponibles');
    }
}

function probarNotificaciones() {
    console.log('🧪 Probando sistema de notificaciones...');
    
    showAlert('✅ Notificación de éxito - El sistema funciona correctamente', 'success');
    
    setTimeout(() => {
        showAlert('❌ Notificación de error - Ejemplo de mensaje de error', 'error');
    }, 500);
    
    setTimeout(() => {
        showAlert('⚠️ Notificación de advertencia - Revisa esta información', 'warning');
    }, 1000);
    
    setTimeout(() => {
        showAlert('ℹ️ Notificación informativa - Sistema funcionando normalmente', 'info');
    }, 1500);
    
    console.log('✅ Notificaciones enviadas');
}

// Hacer funciones disponibles globalmente
window.diagnosticarSistemaCompleto = diagnosticarSistemaCompleto;
window.probarModalDetalles = probarModalDetalles;
window.probarModalEdicion = probarModalEdicion;
window.probarModalFactura = probarModalFactura;
window.probarNotificaciones = probarNotificaciones;