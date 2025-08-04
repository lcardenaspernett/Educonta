// ===================================
// DIAGNÓSTICO - Sistema de Eventos
// ===================================

console.log('🔍 Iniciando diagnóstico del sistema de eventos...');

// 1. Verificar que los elementos HTML existen
function verificarElementosHTML() {
    console.log('\n📋 Verificando elementos HTML...');
    
    const elementos = [
        'newEventBtn',
        'eventSearch',
        'eventTypeFilter', 
        'eventStatusFilter',
        'eventsContainer',
        'totalEvents',
        'activeEvents',
        'totalTarget',
        'totalRaised',
        'totalPending',
        'collectionPercentage',
        'pendingPercentage',
        'overallProgress'
    ];
    
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            console.log(`✅ ${id}: Encontrado`);
        } else {
            console.log(`❌ ${id}: NO encontrado`);
        }
    });
}

// 2. Verificar que los modales existen
function verificarModales() {
    console.log('\n🪟 Verificando modales...');
    
    const modales = [
        'eventModal',
        'eventDetailsModal',
        'transactionModal',
        'participantsModal'
    ];
    
    modales.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            console.log(`✅ ${id}: Encontrado`);
        } else {
            console.log(`❌ ${id}: NO encontrado`);
        }
    });
}

// 3. Verificar que Bootstrap está cargado
function verificarBootstrap() {
    console.log('\n🎨 Verificando Bootstrap...');
    
    if (typeof bootstrap !== 'undefined') {
        console.log('✅ Bootstrap: Cargado correctamente');
        console.log(`📦 Versión: ${bootstrap.Tooltip.VERSION || 'Desconocida'}`);
    } else {
        console.log('❌ Bootstrap: NO cargado');
    }
}

// 4. Verificar que la clase EventsManagementPage existe
function verificarClaseEventos() {
    console.log('\n🏗️ Verificando clase EventsManagementPage...');
    
    if (typeof EventsManagementPage !== 'undefined') {
        console.log('✅ EventsManagementPage: Definida');
        
        // Verificar si la instancia global existe
        if (typeof window.eventsPage !== 'undefined') {
            console.log('✅ window.eventsPage: Instancia creada');
            console.log(`📊 Eventos cargados: ${window.eventsPage.events?.length || 0}`);
        } else {
            console.log('❌ window.eventsPage: Instancia NO creada');
        }
    } else {
        console.log('❌ EventsManagementPage: NO definida');
    }
}

// 5. Verificar CSS personalizado
function verificarCSS() {
    console.log('\n🎨 Verificando CSS personalizado...');
    
    // Verificar si las clases CSS empresariales están disponibles
    const testElement = document.createElement('div');
    testElement.className = 'event-card-enterprise';
    document.body.appendChild(testElement);
    
    const styles = window.getComputedStyle(testElement);
    const hasCustomStyles = styles.borderRadius !== '0px' || styles.boxShadow !== 'none';
    
    if (hasCustomStyles) {
        console.log('✅ CSS empresarial: Cargado correctamente');
    } else {
        console.log('❌ CSS empresarial: NO cargado o no aplicado');
    }
    
    document.body.removeChild(testElement);
}

// 6. Probar funcionalidad del botón Nuevo Evento
function probarBotonNuevoEvento() {
    console.log('\n🔘 Probando botón Nuevo Evento...');
    
    const boton = document.getElementById('newEventBtn');
    if (boton) {
        // Verificar si tiene event listeners
        const hasListeners = boton.onclick !== null || 
                           (window.eventsPage && typeof window.eventsPage.showEventModal === 'function');
        
        if (hasListeners) {
            console.log('✅ Botón Nuevo Evento: Configurado correctamente');
        } else {
            console.log('❌ Botón Nuevo Evento: Sin event listeners');
        }
    } else {
        console.log('❌ Botón Nuevo Evento: NO encontrado');
    }
}

// 7. Verificar datos de demostración
function verificarDatosDemostracion() {
    console.log('\n📊 Verificando datos de demostración...');
    
    if (window.eventsPage && window.eventsPage.events) {
        const eventos = window.eventsPage.events;
        console.log(`✅ Eventos de demostración: ${eventos.length} eventos cargados`);
        
        eventos.forEach((evento, index) => {
            console.log(`   ${index + 1}. ${evento.name} (${evento.type}) - ${evento.status}`);
        });
    } else {
        console.log('❌ Datos de demostración: NO cargados');
    }
}

// 8. Verificar errores en consola
function verificarErrores() {
    console.log('\n🚨 Verificando errores...');
    
    // Capturar errores futuros
    const originalError = console.error;
    let erroresCapturados = [];
    
    console.error = function(...args) {
        erroresCapturados.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    setTimeout(() => {
        if (erroresCapturados.length === 0) {
            console.log('✅ Sin errores detectados');
        } else {
            console.log(`❌ ${erroresCapturados.length} errores detectados:`);
            erroresCapturados.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
        // Restaurar console.error original
        console.error = originalError;
    }, 2000);
}

// Ejecutar diagnóstico completo
function ejecutarDiagnostico() {
    console.log('🏥 DIAGNÓSTICO COMPLETO DEL SISTEMA DE EVENTOS');
    console.log('='.repeat(50));
    
    verificarElementosHTML();
    verificarModales();
    verificarBootstrap();
    verificarClaseEventos();
    verificarCSS();
    probarBotonNuevoEvento();
    verificarDatosDemostracion();
    verificarErrores();
    
    console.log('\n✨ Diagnóstico completado');
    console.log('='.repeat(50));
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ejecutarDiagnostico);
} else {
    ejecutarDiagnostico();
}

// Exportar funciones para uso manual
window.diagnosticoEventos = {
    ejecutar: ejecutarDiagnostico,
    verificarElementos: verificarElementosHTML,
    verificarModales: verificarModales,
    verificarBootstrap: verificarBootstrap,
    verificarClase: verificarClaseEventos,
    verificarCSS: verificarCSS,
    probarBoton: probarBotonNuevoEvento,
    verificarDatos: verificarDatosDemostracion
};