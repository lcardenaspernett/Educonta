/**
 * Script de corrección para problemas de modales en eventos
 * Soluciona el problema de la cubierta gris que bloquea la interacción
 */

(function() {
    'use strict';

    // Función para limpiar modales residuales
    function cleanupModalBackdrop() {
        // Limpiar todos los backdrops residuales
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.remove();
        });
        
        // Restaurar el estado del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.marginLeft = '';
        document.body.style.transform = '';
        
        // Restaurar el estado del app-container
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.transform = '';
            appContainer.style.marginLeft = '';
            appContainer.style.paddingRight = '';
        }
        
        // Restaurar el estado del sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.left = '';
            sidebar.style.transform = '';
        }
        
        // Restaurar el estado del main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginLeft = '';
            mainContent.style.transform = '';
        }
        
        console.log('Modal backdrop and layout cleanup completed');
    }

    // Función para configurar modales correctamente
    function setupModalCorrectly(modalElement, options = {}) {
        if (!modalElement) return null;

        // Limpiar modal existente
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            existingModal.dispose();
        }

        // Limpiar backdrop residual
        cleanupModalBackdrop();

        // Configuración por defecto
        const defaultOptions = {
            backdrop: true, // Permitir cerrar haciendo clic fuera
            keyboard: true,
            focus: true
        };

        const finalOptions = { ...defaultOptions, ...options };

        // Crear nuevo modal
        const modal = new bootstrap.Modal(modalElement, finalOptions);
        
        // Agregar listener para limpieza al cerrar
        modalElement.addEventListener('hidden.bs.modal', cleanupModalBackdrop, { once: true });
        
        return modal;
    }

    // Función para mostrar modal de eventos de forma segura
    function showEventModalSafely(modalId = 'eventModal') {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.error(`Modal element with id '${modalId}' not found`);
            return null;
        }

        const modal = setupModalCorrectly(modalElement);
        if (modal) {
            modal.show();
            console.log(`Modal '${modalId}' shown successfully`);
        }
        
        return modal;
    }

    // Función de diagnóstico
    function diagnoseModalState() {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        const modalOpen = document.body.classList.contains('modal-open');
        const bodyOverflow = document.body.style.overflow;
        const bodyPadding = document.body.style.paddingRight;
        const appContainer = document.querySelector('.app-container');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        const diagnosis = {
            backdropsCount: backdrops.length,
            bodyHasModalOpen: modalOpen,
            bodyOverflow: bodyOverflow || 'normal',
            bodyPadding: bodyPadding || 'normal',
            appContainerTransform: appContainer?.style.transform || 'normal',
            sidebarLeft: sidebar?.style.left || 'normal',
            mainContentMargin: mainContent?.style.marginLeft || 'normal',
            timestamp: new Date().toISOString()
        };

        console.log('Modal State Diagnosis:', diagnosis);
        return diagnosis;
    }

    // Función para diagnosticar layout
    function diagnoseLayout() {
        const body = document.body;
        const appContainer = document.querySelector('.app-container');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        const layoutDiagnosis = {
            bodyClasses: Array.from(body.classList),
            bodyStyles: {
                overflow: body.style.overflow,
                paddingRight: body.style.paddingRight,
                marginLeft: body.style.marginLeft,
                transform: body.style.transform
            },
            appContainer: appContainer ? {
                transform: appContainer.style.transform,
                marginLeft: appContainer.style.marginLeft,
                paddingRight: appContainer.style.paddingRight
            } : null,
            sidebar: sidebar ? {
                left: sidebar.style.left,
                transform: sidebar.style.transform,
                position: getComputedStyle(sidebar).position
            } : null,
            mainContent: mainContent ? {
                marginLeft: mainContent.style.marginLeft,
                transform: mainContent.style.transform,
                width: mainContent.style.width
            } : null
        };

        console.log('Layout Diagnosis:', layoutDiagnosis);
        return layoutDiagnosis;
    }

    // Función para forzar limpieza completa
    function forceCleanup() {
        // Cerrar todos los modales activos
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });

        // Limpiar después de un breve delay
        setTimeout(() => {
            cleanupModalBackdrop();
            
            // Limpiar cualquier elemento residual
            const overlays = document.querySelectorAll('.modal-backdrop, .fade.show');
            overlays.forEach(overlay => {
                if (overlay.classList.contains('modal-backdrop')) {
                    overlay.remove();
                }
            });

            console.log('Force cleanup completed');
        }, 300);
    }

    // Exponer funciones globalmente para debugging
    window.ModalFixer = {
        cleanupModalBackdrop,
        setupModalCorrectly,
        showEventModalSafely,
        diagnoseModalState,
        diagnoseLayout,
        forceCleanup
    };

    // Auto-limpieza al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
        cleanupModalBackdrop();
        console.log('Modal fixer loaded and initial cleanup completed');
    });

    // Limpieza adicional cuando se cambia de página
    window.addEventListener('beforeunload', () => {
        cleanupModalBackdrop();
    });

    // Interceptar eventos de Bootstrap para asegurar limpieza
    document.addEventListener('hidden.bs.modal', (event) => {
        setTimeout(cleanupModalBackdrop, 100);
    });

    console.log('Modal fix script loaded successfully');
})();