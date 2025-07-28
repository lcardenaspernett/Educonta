// Diagnóstico completo de carga de datos

console.log('🔍 DIAGNÓSTICO DE CARGA DE DATOS');
console.log('================================');

// Función para diagnosticar problemas de carga
function diagnosticarCargaDatos() {
    console.log('\n📋 1. VERIFICANDO OBJETOS GLOBALES...');
    
    // Verificar DemoData
    if (window.DemoData) {
        console.log('✅ DemoData está disponible');
        console.log('📊 Métodos disponibles:', Object.getOwnPropertyNames(window.DemoData));
        
        // Probar getClients
        if (typeof window.DemoData.getClients === 'function') {
            console.log('✅ getClients está disponible');
            window.DemoData.getClients().then(response => {
                console.log('📊 Respuesta getClients:', response);
            }).catch(error => {
                console.error('❌ Error en getClients:', error);
            });
        } else {
            console.error('❌ getClients NO está disponible');
        }
        
        // Probar getInvoices
        if (typeof window.DemoData.getInvoices === 'function') {
            console.log('✅ getInvoices está disponible');
            window.DemoData.getInvoices().then(response => {
                console.log('📊 Respuesta getInvoices:', response);
            }).catch(error => {
                console.error('❌ Error en getInvoices:', error);
            });
        } else {
            console.error('❌ getInvoices NO está disponible');
        }
        
        // Probar getTransactions
        if (typeof window.DemoData.getTransactions === 'function') {
            console.log('✅ getTransactions está disponible');
            window.DemoData.getTransactions().then(response => {
                console.log('📊 Respuesta getTransactions:', response);
            }).catch(error => {
                console.error('❌ Error en getTransactions:', error);
            });
        } else {
            console.error('❌ getTransactions NO está disponible');
        }
        
    } else {
        console.error('❌ DemoData NO está disponible');
    }
    
    console.log('\n🔧 2. VERIFICANDO PÁGINAS...');
    
    // Verificar ClientsManagementPage
    if (window.ClientsManagementPage) {
        console.log('✅ ClientsManagementPage está disponible');
        if (window.clientsPage) {
            console.log('✅ Instancia clientsPage existe');
            console.log('📊 Clientes cargados:', window.clientsPage.clients.length);
        } else {
            console.error('❌ Instancia clientsPage NO existe');
        }
    } else {
        console.error('❌ ClientsManagementPage NO está disponible');
    }
    
    // Verificar InvoicesManagementPage
    if (window.InvoicesManagementPage) {
        console.log('✅ InvoicesManagementPage está disponible');
        if (window.invoicesPage) {
            console.log('✅ Instancia invoicesPage existe');
            console.log('📊 Facturas cargadas:', window.invoicesPage.invoices.length);
        } else {
            console.error('❌ Instancia invoicesPage NO existe');
        }
    } else {
        console.error('❌ InvoicesManagementPage NO está disponible');
    }
    
    // Verificar MovementsManagementPage
    if (window.MovementsManagementPage) {
        console.log('✅ MovementsManagementPage está disponible');
        if (window.movementsPage) {
            console.log('✅ Instancia movementsPage existe');
            console.log('📊 Transacciones cargadas:', window.movementsPage.transactions.length);
        } else {
            console.error('❌ Instancia movementsPage NO existe');
        }
    } else {
        console.error('❌ MovementsManagementPage NO está disponible');
    }
    
    console.log('\n⚙️ 3. VERIFICANDO FUNCIONES GLOBALES...');
    
    const funcionesEsperadas = [
        'showAlert',
        'formatCurrency',
        'formatDate'
    ];
    
    funcionesEsperadas.forEach(func => {
        if (typeof window[func] === 'function') {
            console.log(`✅ ${func} está disponible`);
        } else {
            console.error(`❌ ${func} NO está disponible`);
        }
    });
    
    console.log('\n🎯 4. VERIFICANDO ERRORES EN CONSOLA...');
    
    // Capturar errores
    const originalError = console.error;
    const errores = [];
    
    console.error = function(...args) {
        errores.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    setTimeout(() => {
        console.log('📊 Errores capturados:', errores);
        console.error = originalError;
    }, 2000);
}

// Función para probar carga manual
function probarCargaManual() {
    console.log('\n🧪 PROBANDO CARGA MANUAL...');
    
    if (window.DemoData) {
        // Probar clientes
        console.log('📋 Probando carga de clientes...');
        window.DemoData.getClients().then(response => {
            console.log('✅ Clientes cargados:', response.data.length);
            
            if (window.clientsPage) {
                window.clientsPage.clients = response.data;
                window.clientsPage.filteredClients = [...response.data];
                window.clientsPage.renderClients();
                window.clientsPage.updateStats();
                console.log('✅ Clientes renderizados manualmente');
            }
        }).catch(error => {
            console.error('❌ Error cargando clientes:', error);
        });
        
        // Probar facturas
        console.log('📋 Probando carga de facturas...');
        window.DemoData.getInvoices().then(response => {
            console.log('✅ Facturas cargadas:', response.data.length);
            
            if (window.invoicesPage) {
                window.invoicesPage.invoices = response.data;
                window.invoicesPage.filteredInvoices = [...response.data];
                window.invoicesPage.renderInvoices();
                window.invoicesPage.updateSummary();
                console.log('✅ Facturas renderizadas manualmente');
            }
        }).catch(error => {
            console.error('❌ Error cargando facturas:', error);
        });
    }
}

// Función para reinicializar páginas
function reinicializarPaginas() {
    console.log('\n🔄 REINICIALIZANDO PÁGINAS...');
    
    // Reinicializar clientes
    if (window.ClientsManagementPage && !window.clientsPage) {
        console.log('🔧 Creando nueva instancia de ClientsManagementPage...');
        window.clientsPage = new ClientsManagementPage();
    }
    
    // Reinicializar facturas
    if (window.InvoicesManagementPage && !window.invoicesPage) {
        console.log('🔧 Creando nueva instancia de InvoicesManagementPage...');
        window.invoicesPage = new InvoicesManagementPage();
    }
    
    // Reinicializar movimientos
    if (window.MovementsManagementPage && !window.movementsPage) {
        console.log('🔧 Creando nueva instancia de MovementsManagementPage...');
        window.movementsPage = new MovementsManagementPage();
    }
}

// Hacer funciones disponibles globalmente
window.diagnosticarCargaDatos = diagnosticarCargaDatos;
window.probarCargaManual = probarCargaManual;
window.reinicializarPaginas = reinicializarPaginas;

console.log('✅ Funciones de diagnóstico cargadas:');
console.log('   - diagnosticarCargaDatos()');
console.log('   - probarCargaManual()');
console.log('   - reinicializarPaginas()');