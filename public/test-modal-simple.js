// Prueba simple para verificar que los modales funcionan

console.log('🧪 PRUEBA SIMPLE DE MODALES');
console.log('===========================');

// Función para crear un modal de prueba
function crearModalPrueba() {
    console.log('🔧 Creando modal de prueba...');
    
    // Eliminar modal existente si existe
    const modalExistente = document.getElementById('testModal');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'testModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">🧪 Modal de Prueba</h3>
                <button class="modal-close" onclick="cerrarModalPrueba()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Este es un modal de prueba para verificar que los estilos CSS funcionan correctamente.</p>
                <p><strong>Si puedes ver este modal, los estilos están funcionando!</strong></p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="cerrarModalPrueba()">Cerrar</button>
                <button class="btn btn-primary" onclick="console.log('✅ Botón funcionando')">Probar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar modal
    setTimeout(() => {
        modal.classList.add('show');
        console.log('✅ Modal de prueba mostrado');
    }, 10);
}

// Función para cerrar modal de prueba
function cerrarModalPrueba() {
    const modal = document.getElementById('testModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            console.log('✅ Modal de prueba cerrado');
        }, 300);
    }
}

// Función para probar viewTransaction directamente
function probarViewTransactionDirecto() {
    console.log('🔍 Probando viewTransaction directamente...');
    
    if (!window.movementsPage || !window.movementsPage.transactions.length) {
        console.error('❌ No hay transacciones disponibles');
        return;
    }
    
    const primeraTransaccion = window.movementsPage.transactions[0];
    console.log('📋 Usando transacción:', primeraTransaccion.id);
    
    // Llamar directamente a la función
    viewTransaction(primeraTransaccion.id);
    
    // Verificar si el modal se creó
    setTimeout(() => {
        const modal = document.getElementById('transactionDetailsModal');
        if (modal) {
            console.log('✅ Modal creado correctamente');
            console.log('📊 Clases del modal:', modal.className);
            console.log('👁️ Modal visible:', modal.classList.contains('show'));
            
            // Verificar estilos computados
            const estilos = window.getComputedStyle(modal);
            console.log('🎨 Display:', estilos.display);
            console.log('🎨 Opacity:', estilos.opacity);
            console.log('🎨 Visibility:', estilos.visibility);
        } else {
            console.error('❌ Modal NO se creó');
        }
    }, 100);
}

// Función para verificar estilos CSS
function verificarEstilosCSS() {
    console.log('🎨 Verificando estilos CSS...');
    
    // Crear elemento temporal para probar estilos
    const testElement = document.createElement('div');
    testElement.className = 'modal show';
    testElement.style.position = 'fixed';
    testElement.style.top = '-9999px';
    document.body.appendChild(testElement);
    
    const estilos = window.getComputedStyle(testElement);
    console.log('📊 Estilos de .modal.show:');
    console.log('   - Display:', estilos.display);
    console.log('   - Opacity:', estilos.opacity);
    console.log('   - Visibility:', estilos.visibility);
    console.log('   - Z-index:', estilos.zIndex);
    
    testElement.remove();
}

// Hacer funciones disponibles globalmente
window.crearModalPrueba = crearModalPrueba;
window.cerrarModalPrueba = cerrarModalPrueba;
window.probarViewTransactionDirecto = probarViewTransactionDirecto;
window.verificarEstilosCSS = verificarEstilosCSS;

console.log('✅ Funciones de prueba de modales cargadas:');
console.log('   - crearModalPrueba()');
console.log('   - probarViewTransactionDirecto()');
console.log('   - verificarEstilosCSS()');