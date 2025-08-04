/**
 * Script de corrección inmediata para la inicialización de EventsTableView
 * Soluciona el problema de window.eventsPage no disponible
 */

(function() {
    'use strict';

    console.log('🔧 CORRECCIÓN DE INICIALIZACIÓN DE EVENTOS');
    console.log('='.repeat(45));

    function forceInitializeEventsPage() {
        console.log('🚀 Forzando inicialización de EventsTableView...');

        // Verificar si ya existe
        if (window.eventsPage) {
            console.log('✅ window.eventsPage ya existe');
            return window.eventsPage;
        }

        // Verificar si la clase EventsTableView está disponible
        if (typeof EventsTableView === 'undefined') {
            console.log('❌ Clase EventsTableView no está definida');
            
            // Intentar cargar el script si no está
            const script = document.createElement('script');
            script.src = 'js/accounting/events-table-view.js';
            script.onload = () => {
                console.log('📦 Script events-table-view.js cargado');
                setTimeout(forceInitializeEventsPage, 500);
            };
            script.onerror = () => {
                console.error('❌ Error cargando events-table-view.js');
            };
            document.head.appendChild(script);
            return null;
        }

        // Intentar crear la instancia
        try {
            window.eventsPage = new EventsTableView();
            console.log('✅ EventsTableView inicializada forzadamente');
            
            // Configurar event listeners manualmente si es necesario
            setupEventListenersManually();
            
            return window.eventsPage;
        } catch (error) {
            console.error('❌ Error creando EventsTableView:', error);
            
            // Crear una versión mínima funcional
            createMinimalEventsPage();
            return window.eventsPage;
        }
    }

    function setupEventListenersManually() {
        console.log('🎯 Configurando event listeners manualmente...');

        const buttonIds = ['newEventBtnHeader', 'newEventBtn'];
        
        buttonIds.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button && window.eventsPage && typeof window.eventsPage.showEventModal === 'function') {
                
                // Remover listeners existentes
                button.removeEventListener('click', handleEventButtonClick);
                
                // Agregar nuevo listener
                button.addEventListener('click', handleEventButtonClick);
                
                console.log(`✅ Event listener configurado para ${buttonId}`);
            }
        });
    }

    function handleEventButtonClick(e) {
        e.preventDefault();
        console.log('🔘 Botón de evento clickeado');
        
        if (window.eventsPage && typeof window.eventsPage.showEventModal === 'function') {
            window.eventsPage.showEventModal();
        } else {
            console.log('⚠️ window.eventsPage no disponible, usando modal directo');
            showModalDirectly();
        }
    }

    function showModalDirectly() {
        console.log('🪟 Mostrando modal directamente...');
        
        const modalElement = document.getElementById('eventModal');
        if (!modalElement) {
            console.error('❌ Modal eventModal no encontrado');
            return;
        }

        try {
            // Limpiar estado previo
            const existingBackdrops = document.querySelectorAll('.modal-backdrop');
            existingBackdrops.forEach(backdrop => backdrop.remove());
            
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

            // Mostrar modal con Bootstrap
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });

            modal.show();
            console.log('✅ Modal mostrado directamente');

        } catch (error) {
            console.error('❌ Error mostrando modal directamente:', error);
        }
    }

    function createMinimalEventsPage() {
        console.log('🔧 Creando EventsPage mínima funcional...');

        window.eventsPage = {
            events: [],
            currentEvent: null,
            
            showEventModal: function(eventId = null) {
                console.log('📝 showEventModal (versión mínima)');
                showModalDirectly();
            },
            
            showNotification: function(message, type = 'info') {
                console.log(`🔔 ${type.toUpperCase()}: ${message}`);
                
                // Crear notificación visual simple
                const notification = document.createElement('div');
                notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
                notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
                notification.innerHTML = `
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 5000);
            }
        };

        // Configurar event listeners
        setupEventListenersManually();
        
        console.log('✅ EventsPage mínima creada');
    }

    function diagnoseAndFix() {
        console.log('🔍 Diagnosticando estado actual...');

        const checks = {
            bootstrap: typeof bootstrap !== 'undefined',
            eventsTableViewClass: typeof EventsTableView !== 'undefined',
            eventsPageInstance: typeof window.eventsPage !== 'undefined',
            modalElement: !!document.getElementById('eventModal'),
            headerButton: !!document.getElementById('newEventBtnHeader'),
            cardButton: !!document.getElementById('newEventBtn')
        };

        console.log('📊 Estado del sistema:', checks);

        // Aplicar correcciones según el diagnóstico
        if (!checks.eventsPageInstance) {
            console.log('🔧 window.eventsPage no existe, inicializando...');
            forceInitializeEventsPage();
        } else {
            console.log('✅ window.eventsPage ya existe');
            setupEventListenersManually();
        }

        // Verificar botones
        if (checks.headerButton || checks.cardButton) {
            console.log('🔘 Botones encontrados, configurando listeners...');
            setupEventListenersManually();
        }

        return checks;
    }

    // Exponer funciones globalmente
    window.EventsInitializationFix = {
        forceInitialize: forceInitializeEventsPage,
        diagnoseAndFix: diagnoseAndFix,
        setupListeners: setupEventListenersManually,
        showModal: showModalDirectly
    };

    // Ejecutar corrección automática
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(diagnoseAndFix, 1000);
        });
    } else {
        setTimeout(diagnoseAndFix, 500);
    }

    console.log('💡 Comandos disponibles:');
    console.log('   EventsInitializationFix.diagnoseAndFix()');
    console.log('   EventsInitializationFix.forceInitialize()');
    console.log('   EventsInitializationFix.showModal()');

})();