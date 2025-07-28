// Script de prueba para verificar los botones de movimientos

console.log('🧪 Iniciando prueba de botones de movimientos...');

// Simular carga de la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, iniciando pruebas...');
    
    // Verificar si las funciones globales están disponibles
    const functionsToTest = [
        'viewTransaction',
        'editTransaction', 
        'viewTransactionInvoice',
        'showAlert',
        'formatCurrency',
        'formatDate'
    ];
    
    functionsToTest.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} está disponible`);
        } else {
            console.error(`❌ ${funcName} NO está disponible`);
        }
    });
    
    // Verificar si DemoData está disponible
    if (window.DemoData) {
        console.log('✅ DemoData está disponible');
        
        // Probar carga de transacciones
        window.DemoData.getTransactions().then(response => {
            console.log('📊 Transacciones cargadas:', response);
            
            if (response.data && response.data.length > 0) {
                const firstTransaction = response.data[0];
                console.log('🔍 Primera transacción:', firstTransaction);
                
                // Probar funciones con la primera transacción
                console.log('🧪 Probando viewTransaction...');
                try {
                    viewTransaction(firstTransaction.id);
                    console.log('✅ viewTransaction ejecutada');
                } catch (error) {
                    console.error('❌ Error en viewTransaction:', error);
                }
                
                console.log('🧪 Probando editTransaction...');
                try {
                    editTransaction(firstTransaction.id);
                    console.log('✅ editTransaction ejecutada');
                } catch (error) {
                    console.error('❌ Error en editTransaction:', error);
                }
                
                console.log('🧪 Probando viewTransactionInvoice...');
                try {
                    viewTransactionInvoice(firstTransaction.id);
                    console.log('✅ viewTransactionInvoice ejecutada');
                } catch (error) {
                    console.error('❌ Error en viewTransactionInvoice:', error);
                }
            }
        }).catch(error => {
            console.error('❌ Error cargando transacciones:', error);
        });
    } else {
        console.error('❌ DemoData NO está disponible');
    }
    
    // Verificar si MovementsManagementPage está disponible
    if (window.movementsPage) {
        console.log('✅ movementsPage está disponible');
        console.log('📊 Transacciones en movementsPage:', window.movementsPage.transactions.length);
    } else {
        console.error('❌ movementsPage NO está disponible');
    }
});