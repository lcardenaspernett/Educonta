/**
 * Script de diagnóstico para el botón "Nuevo Evento"
 * Detecta y soluciona problemas comunes
 */

(function() {
    'use strict';

    console.log('🔍 DIAGNÓSTICO DEL BOTÓN NUEVO EVENTO');
    console.log('='.repeat(40));

    function diagnoseEventButton() {
        const results = {
            timestamp: new Date().toISOString(),
            bootstrap: typeof bootstrap !== 'undefined',
            eventsPage: typeof window.eventsPage !== 'undefined',
            buttons: {},
            modal: {},
            form: {},
            errors: []
        };

        // 1. Verificar Bootstrap
        console.log('1. 🔧 Verificando Bootstrap...');
        if (results.bootstrap) {
            console.log('   ✅ Bootstrap cargado correctamente');
        } else {
            console.log('   ❌ Bootstrap NO está cargado');
            results.errors.push('Bootstrap no está disponible');
        }

        // 2. Verificar botones
        console.log('2. 🔘 Verificando botones...');
        const buttonIds = ['newEventBtnHeader', 'newEventBtn'];
        buttonIds.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            results.buttons[buttonId] = {
                exists: !!button,
                hasClickListener: false,
                isVisible: button ? button.offsetParent !== null : false
            };

            if (button) {
                console.log(`   ✅ Botón ${buttonId} encontrado`);
                
                // Verificar si tiene event listeners (getEventListeners solo está disponible en DevTools)
                try {
                    const listeners = typeof getEventListeners !== 'undefined' ? getEventListeners(button) : null;
                    if (listeners && listeners.click && listeners.click.length > 0) {
                        results.buttons[buttonId].hasClickListener = true;
                        console.log(`   ✅ ${buttonId} tiene event listeners`);
                    } else {
                        console.log(`   ⚠️ ${buttonId} NO tiene event listeners detectables`);
                    }
                } catch (e) {
                    // getEventListeners no está disponible fuera de DevTools
                    console.log(`   ⚠️ ${buttonId} - No se pueden detectar event listeners (normal en producción)`);
                }
            } else {
                console.log(`   ❌ Botón ${buttonId} NO encontrado`);
                results.errors.push(`Botón ${buttonId} no existe`);
            }
        });

        // 3. Verificar modal
        console.log('3. 🪟 Verificando modal...');
        const modalElement = document.getElementById('eventModal');
        results.modal = {
            exists: !!modalElement,
            hasBootstrapInstance: false,
            isVisible: modalElement ? modalElement.classList.contains('show') : false
        };

        if (modalElement) {
            console.log('   ✅ Modal eventModal encontrado');
            
            const modalInstance = bootstrap?.Modal?.getInstance(modalElement);
            results.modal.hasBootstrapInstance = !!modalInstance;
            
            if (modalInstance) {
                console.log('   ✅ Modal tiene instancia de Bootstrap');
            } else {
                console.log('   ⚠️ Modal NO tiene instancia de Bootstrap');
            }
        } else {
            console.log('   ❌ Modal eventModal NO encontrado');
            results.errors.push('Modal eventModal no existe');
        }

        // 4. Verificar formulario
        console.log('4. 📝 Verificando formulario...');
        const formElement = document.getElementById('eventForm');
        results.form = {
            exists: !!formElement,
            fieldCount: 0
        };

        if (formElement) {
            const fields = formElement.querySelectorAll('input, select, textarea');
            results.form.fieldCount = fields.length;
            console.log(`   ✅ Formulario encontrado con ${fields.length} campos`);
        } else {
            console.log('   ❌ Formulario eventForm NO encontrado');
            results.errors.push('Formulario eventForm no existe');
        }

        // 5. Verificar clase EventsTableView
        console.log('5. 🏗️ Verificando clase EventsTableView...');
        if (results.eventsPage) {
            console.log('   ✅ window.eventsPage está disponible');
            
            if (typeof window.eventsPage.showEventModal === 'function') {
                console.log('   ✅ Método showEventModal existe');
            } else {
                console.log('   ❌ Método showEventModal NO existe');
                results.errors.push('Método showEventModal no está disponible');
            }
        } else {
            console.log('   ❌ window.eventsPage NO está disponible');
            results.errors.push('EventsTableView no está inicializada');
        }

        // 6. Verificar backdrops residuales
        console.log('6. 🎭 Verificando backdrops...');
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 0) {
            console.log(`   ⚠️ Se encontraron ${backdrops.length} backdrops residuales`);
            results.errors.push(`${backdrops.length} backdrops residuales encontrados`);
        } else {
            console.log('   ✅ No hay backdrops residuales');
        }

        // 7. Verificar estado del body
        console.log('7. 🏠 Verificando estado del body...');
        const bodyClasses = Array.from(document.body.classList);
        const hasModalOpen = bodyClasses.includes('modal-open');
        
        if (hasModalOpen && backdrops.length === 0) {
            console.log('   ⚠️ Body tiene clase modal-open pero no hay backdrops');
            results.errors.push('Estado inconsistente del body');
        } else {
            console.log('   ✅ Estado del body es consistente');
        }

        // Mostrar resumen
        console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
        console.log('='.repeat(30));
        
        if (results.errors.length === 0) {
            console.log('✅ No se encontraron problemas críticos');
        } else {
            console.log(`❌ Se encontraron ${results.errors.length} problemas:`);
            results.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        return results;
    }

    function fixCommonIssues() {
        console.log('\n🔧 APLICANDO CORRECCIONES AUTOMÁTICAS...');
        
        // 1. Limpiar backdrops residuales
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 0) {
            console.log(`🧹 Limpiando ${backdrops.length} backdrops residuales...`);
            backdrops.forEach(backdrop => backdrop.remove());
        }

        // 2. Restaurar estado del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.marginRight = '';

        // 3. Agregar event listeners si faltan
        const buttonIds = ['newEventBtnHeader', 'newEventBtn'];
        buttonIds.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button && window.eventsPage && typeof window.eventsPage.showEventModal === 'function') {
                // Remover listeners existentes
                button.removeEventListener('click', window.eventsPage.showEventModal);
                
                // Agregar nuevo listener
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`🔘 Botón ${buttonId} clickeado`);
                    window.eventsPage.showEventModal();
                });
                
                console.log(`✅ Event listener agregado a ${buttonId}`);
            }
        });

        console.log('✅ Correcciones aplicadas');
    }

    function testEventModal() {
        console.log('\n🧪 PROBANDO MODAL DE EVENTO...');
        
        if (window.eventsPage && typeof window.eventsPage.showEventModal === 'function') {
            try {
                window.eventsPage.showEventModal();
                console.log('✅ Modal de evento abierto exitosamente');
            } catch (error) {
                console.error('❌ Error abriendo modal:', error);
            }
        } else {
            console.log('❌ No se puede probar: EventsTableView no disponible');
        }
    }

    // Exponer funciones globalmente
    window.EventButtonDiagnostic = {
        diagnose: diagnoseEventButton,
        fix: fixCommonIssues,
        test: testEventModal
    };

    // Ejecutar diagnóstico automático después de un delay
    setTimeout(() => {
        console.log('\n🚀 EJECUTANDO DIAGNÓSTICO AUTOMÁTICO...');
        const results = diagnoseEventButton();
        
        if (results.errors.length > 0) {
            console.log('\n🔧 Aplicando correcciones automáticas...');
            fixCommonIssues();
            
            // Re-diagnosticar después de las correcciones
            setTimeout(() => {
                console.log('\n🔄 RE-DIAGNOSTICANDO DESPUÉS DE CORRECCIONES...');
                diagnoseEventButton();
            }, 1000);
        }
    }, 2000);

    console.log('\n💡 COMANDOS DISPONIBLES EN CONSOLA:');
    console.log('   EventButtonDiagnostic.diagnose() - Ejecutar diagnóstico');
    console.log('   EventButtonDiagnostic.fix() - Aplicar correcciones');
    console.log('   EventButtonDiagnostic.test() - Probar modal');

})();