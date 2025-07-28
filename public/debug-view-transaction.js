// Versión de debugging para viewTransaction

console.log('🔧 DEBUGGING VIEW TRANSACTION');
console.log('=============================');

// Función simplificada para debugging
function debugViewTransaction(transactionId) {
    console.log('🔍 DEBUG: Iniciando viewTransaction para ID:', transactionId);
    
    try {
        // Paso 1: Verificar movementsPage
        if (!window.movementsPage) {
            console.error('❌ PASO 1 FALLÓ: movementsPage no disponible');
            return;
        }
        console.log('✅ PASO 1: movementsPage disponible');
        
        // Paso 2: Verificar transacciones
        if (!window.movementsPage.transactions || window.movementsPage.transactions.length === 0) {
            console.error('❌ PASO 2 FALLÓ: No hay transacciones');
            return;
        }
        console.log('✅ PASO 2: Transacciones disponibles:', window.movementsPage.transactions.length);
        
        // Paso 3: Buscar transacción
        const transaction = window.movementsPage.transactions.find(t => t.id === transactionId);
        if (!transaction) {
            console.error('❌ PASO 3 FALLÓ: Transacción no encontrada');
            console.log('📋 IDs disponibles:', window.movementsPage.transactions.map(t => t.id));
            return;
        }
        console.log('✅ PASO 3: Transacción encontrada:', transaction);
        
        // Paso 4: Verificar showAlert
        if (typeof showAlert !== 'function') {
            console.error('❌ PASO 4 FALLÓ: showAlert no disponible');
            return;
        }
        console.log('✅ PASO 4: showAlert disponible');
        
        // Paso 5: Verificar formatDate y formatCurrency
        if (typeof formatDate !== 'function') {
            console.error('❌ PASO 5A FALLÓ: formatDate no disponible');
            return;
        }
        if (typeof formatCurrency !== 'function') {
            console.error('❌ PASO 5B FALLÓ: formatCurrency no disponible');
            return;
        }
        console.log('✅ PASO 5: Funciones de formato disponibles');
        
        // Paso 6: Probar formateo
        try {
            const fechaFormateada = formatDate(transaction.date);
            const montoFormateado = formatCurrency(transaction.amount);
            console.log('✅ PASO 6: Formateo exitoso');
            console.log('   - Fecha:', fechaFormateada);
            console.log('   - Monto:', montoFormateado);
        } catch (error) {
            console.error('❌ PASO 6 FALLÓ: Error en formateo:', error);
            return;
        }
        
        // Paso 7: Crear modal simplificado
        console.log('🔧 PASO 7: Creando modal...');
        
        // Eliminar modal existente
        const modalExistente = document.getElementById('transactionDetailsModal');
        if (modalExistente) {
            modalExistente.remove();
            console.log('🗑️ Modal existente eliminado');
        }
        
        // Crear modal nuevo
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'transactionDetailsModal';
        
        // HTML simplificado para debugging
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">🔍 Detalles de Transacción (DEBUG)</h3>
                    <button class="modal-close" onclick="cerrarModalDebug()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>ID:</strong> ${transaction.id}</p>
                    <p><strong>Referencia:</strong> ${transaction.reference}</p>
                    <p><strong>Descripción:</strong> ${transaction.description}</p>
                    <p><strong>Fecha:</strong> ${formatDate(transaction.date)}</p>
                    <p><strong>Monto:</strong> ${formatCurrency(transaction.amount)}</p>
                    <p><strong>Tipo:</strong> ${transaction.type}</p>
                    <p><strong>Estado:</strong> ${transaction.status}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="cerrarModalDebug()">Cerrar</button>
                </div>
            </div>
        `;
        
        console.log('✅ PASO 7: Modal creado');
        
        // Paso 8: Agregar al DOM
        document.body.appendChild(modal);
        console.log('✅ PASO 8: Modal agregado al DOM');
        
        // Paso 9: Mostrar modal
        setTimeout(() => {
            modal.classList.add('show');
            console.log('✅ PASO 9: Clase "show" agregada');
            
            // Verificar estilos
            const estilos = window.getComputedStyle(modal);
            console.log('📊 Estilos del modal:');
            console.log('   - Display:', estilos.display);
            console.log('   - Opacity:', estilos.opacity);
            console.log('   - Visibility:', estilos.visibility);
            console.log('   - Z-index:', estilos.zIndex);
            
            if (estilos.display === 'flex' && estilos.opacity === '1') {
                console.log('🎉 ¡ÉXITO! Modal debería ser visible');
            } else {
                console.error('❌ Modal no está visible correctamente');
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ ERROR GENERAL:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Función para cerrar modal de debug
function cerrarModalDebug() {
    const modal = document.getElementById('transactionDetailsModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            console.log('✅ Modal de debug cerrado');
        }, 300);
    }
}

// Función para probar con la primera transacción disponible
function probarPrimeraTransaccion() {
    if (window.movementsPage && window.movementsPage.transactions.length > 0) {
        const primeraId = window.movementsPage.transactions[0].id;
        console.log('🎯 Probando con primera transacción:', primeraId);
        debugViewTransaction(primeraId);
    } else {
        console.error('❌ No hay transacciones disponibles para probar');
    }
}

// Hacer funciones disponibles globalmente
window.debugViewTransaction = debugViewTransaction;
window.cerrarModalDebug = cerrarModalDebug;
window.probarPrimeraTransaccion = probarPrimeraTransaccion;

console.log('✅ Funciones de debug cargadas:');
console.log('   - debugViewTransaction(id)');
console.log('   - probarPrimeraTransaccion()');
console.log('   - cerrarModalDebug()');