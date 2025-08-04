/**
 * Script de corrección de layout
 * Asegura que el sidebar y contenido principal mantengan su posición correcta
 */

(function() {
    'use strict';

    function fixLayout() {
        // Asegurar que el body no tenga estilos residuales
        document.body.style.paddingRight = '';
        document.body.style.marginLeft = '';
        document.body.style.transform = '';
        document.body.classList.remove('modal-open');

        // Asegurar que el app-container esté correcto
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.transform = '';
            appContainer.style.marginLeft = '';
            appContainer.style.paddingRight = '';
        }

        // Asegurar que el sidebar esté en su posición
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.left = '';
            sidebar.style.transform = '';
            sidebar.style.position = 'fixed';
            sidebar.style.width = '280px';
            sidebar.style.height = '100vh';
            sidebar.style.top = '0';
            sidebar.style.zIndex = '100';
        }

        // Asegurar que el main-content tenga el margen correcto
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginLeft = '280px';
            mainContent.style.transform = '';
            mainContent.style.width = 'calc(100% - 280px)';
        }

        console.log('Layout fixed');
    }

    function observeLayoutChanges() {
        // Observer para detectar cambios en las clases del body
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const hasModalOpen = document.body.classList.contains('modal-open');
                    if (!hasModalOpen) {
                        // Si no hay modal abierto, asegurar que el layout esté correcto
                        setTimeout(fixLayout, 100);
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'style']
        });

        return observer;
    }

    function handleResize() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (window.innerWidth <= 768) {
            // Mobile
            if (sidebar) {
                sidebar.style.transform = 'translateX(-100%)';
            }
            if (mainContent) {
                mainContent.style.marginLeft = '0';
                mainContent.style.width = '100%';
            }
        } else if (window.innerWidth <= 1024) {
            // Tablet
            if (sidebar) {
                sidebar.style.width = '240px';
                sidebar.style.transform = '';
            }
            if (mainContent) {
                mainContent.style.marginLeft = '240px';
                mainContent.style.width = 'calc(100% - 240px)';
            }
        } else {
            // Desktop
            if (sidebar) {
                sidebar.style.width = '280px';
                sidebar.style.transform = '';
            }
            if (mainContent) {
                mainContent.style.marginLeft = '280px';
                mainContent.style.width = 'calc(100% - 280px)';
            }
        }
    }

    // Función para forzar corrección del layout
    function forceLayoutFix() {
        // Limpiar cualquier modal residual
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Limpiar clases y estilos del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.marginLeft = '';
        document.body.style.transform = '';

        // Aplicar corrección del layout
        fixLayout();
        handleResize();

        console.log('Force layout fix applied');
    }

    // Inicialización
    document.addEventListener('DOMContentLoaded', () => {
        fixLayout();
        observeLayoutChanges();
        
        // Manejar cambios de tamaño de ventana
        window.addEventListener('resize', handleResize);
        
        // Aplicar corrección inicial después de un breve delay
        setTimeout(fixLayout, 500);
        
        console.log('Layout fix script initialized');
    });

    // Exponer función global para debugging
    window.LayoutFixer = {
        fixLayout,
        forceLayoutFix,
        handleResize
    };

    // Auto-corrección periódica (solo en desarrollo)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setInterval(() => {
            if (!document.body.classList.contains('modal-open')) {
                fixLayout();
            }
        }, 5000);
    }

})();