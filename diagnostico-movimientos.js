// Diagnóstico completo del sistema de movimientos

console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE MOVIMIENTOS');
console.log('==========================================');

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
                
                console.log('\n🧪 5. PROBANDO FUNCIONES...');
                
                // Probar cada función
                try {
                    console.log('🔍 Probando viewTransaction...');
                    viewTransaction(primeraTransaccion.id);
                    console.log('✅ viewTransaction ejecutada sin errores');
                } catch (error) {
                    console.error('❌ Error en viewTransaction:', error);
                }
                
                setTimeout(() => {
                    try {
                        console.log('✏️ Probando editTransaction...');
                        editTransaction(primeraTransaccion.id);
                        console.log('✅ editTransaction ejecutada sin errores');
                    } catch (error) {
                        console.error('❌ Error en editTransaction:', error);
                    }
                }, 1000);
                
                setTimeout(() => {
                    try {
                        console.log('🧾 Probando viewTransactionInvoice...');
                        viewTransactionInvoice(primeraTransaccion.id);
                        console.log('✅ viewTransactionInvoice ejecutada sin errores');
                    } catch (error) {
                        console.error('❌ Error en viewTransactionInvoice:', error);
                    }
                }, 2000);
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

// Ejecutar diagnóstico cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', diagnosticarSistema);
} else {
    diagnosticarSistema();
}

// Hacer disponible globalmente
window.diagnosticarSistema = diagnosticarSistema;