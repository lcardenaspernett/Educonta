// Diagnóstico completo del sistema de movimientos

console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE MOVIMIENTOS - MODO MANUAL');
console.log('=====================================================');
console.log('ℹ️  Para ejecutar el diagnóstico completo, usa: diagnosticarSistema()');
console.log('ℹ️  Para probar funciones individuales, usa los comandos mostrados en el diagnóstico');

// Función para verificar el estado del sistema
function diagnosticarSistema() {
    console.log('\n📋 1. VERIFICANDO DEPENDENCIAS...');
    
    // Verificar scripts cargados
    const scriptsEsperados = [
        'globals.js',
        'state.js', 
        'demo-data.js',
        'movements-page.js'
    ];
    
    scriptsEsperados.forEach(script => {
        const scriptElement = document.querySelector(`script[src*="${script}"]`);
        if (scriptElement) {
            console.log(`✅ ${script} está cargado`);
        } else {
            console.error(`❌ ${script} NO está cargado`);
        }
    });
    
    console.log('\n🔧 2. VERIFICANDO OBJETOS GLOBALES...');
    
    const objetosGlobales = [
        'DemoData',
        'MovementsManagementPage',
        'movementsPage',
        'AccountingGlobals'
    ];
    
    objetosGlobales.forEach(obj => {
        if (window[obj]) {
            console.log(`✅ ${obj} está disponible`);
            if (obj === 'movementsPage' && window[obj].transactions) {
                console.log(`   - Transacciones: ${window[obj].transactions.length}`);
            }
        } else {
            console.error(`❌ ${obj} NO está disponible`);
        }
    });
    
    console.log('\n⚙️ 3. VERIFICANDO FUNCIONES...');
    
    const funcionesEsperadas = [
        'viewTransaction',
        'editTransaction',
        'viewTransactionInvoice',
        'showAlert',
        'formatCurrency',
        'formatDate',
        'debugMovementsPage'
    ];
    
    funcionesEsperadas.forEach(func => {
        if (typeof window[func] === 'function') {
            console.log(`✅ ${func} está disponible`);
        } else {
            console.error(`❌ ${func} NO está disponible`);
        }
    });
    
    console.log('\n📊 4. VERIFICANDO DATOS...');
    
    if (window.DemoData) {
        window.DemoData.getTransactions().then(response => {
            console.log('✅ Datos de transacciones cargados:', response.data.length);
            
            if (response.data.length > 0) {
                const primeraTransaccion = response.data[0];
                console.log('📄 Primera transacción:', {
                    id: primeraTransaccion.id,
                    description: primeraTransaccion.description,
                    type: primeraTransaccion.type,
                    amount: primeraTransaccion.amount
                });
                
                console.log('\n🧪 5. FUNCIONES DISPONIBLES PARA PRUEBA MANUAL...');
                console.log('   Para probar manualmente, ejecuta en la consola:');
                console.log('   - viewTransaction("' + primeraTransaccion.id + '")');
                console.log('   - editTransaction("' + primeraTransaccion.id + '")');
                console.log('   - viewTransactionInvoice("' + primeraTransaccion.id + '")');
                
                // NO ejecutar automáticamente las funciones de prueba
                // Las funciones están disponibles para ejecución manual
            }
        }).catch(error => {
            console.error('❌ Error cargando datos:', error);
        });
    }
    
    console.log('\n🎯 6. VERIFICANDO DOM...');
    
    const elementosDOM = [
        'transactionsTableBody',
        'transactionsSummary',
        'dateFrom',
        'dateTo'
    ];
    
    elementosDOM.forEach(elementId => {
        const elemento = document.getElementById(elementId);
        if (elemento) {
            console.log(`✅ Elemento ${elementId} encontrado`);
        } else {
            console.error(`❌ Elemento ${elementId} NO encontrado`);
        }
    });
    
    console.log('\n📱 7. VERIFICANDO BOTONES DE ACCIÓN...');
    
    const botones = document.querySelectorAll('.action-buttons button');
    console.log(`📊 Botones de acción encontrados: ${botones.length}`);
    
    botones.forEach((boton, index) => {
        const onclick = boton.getAttribute('onclick');
        console.log(`🔘 Botón ${index + 1}: ${onclick || 'Sin onclick'}`);
    });
}

// NO ejecutar diagnóstico automáticamente - solo cuando se llame manualmente
// Para ejecutar el diagnóstico, usar: diagnosticarSistema() en la consola

// Hacer disponible globalmente
window.diagnosticarSistema = diagnosticarSistema;