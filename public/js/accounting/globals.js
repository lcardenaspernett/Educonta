// ===================================
// EDUCONTA - Funciones Globales de Compatibilidad
// ===================================

/**
 * Funciones globales para mantener compatibilidad con el HTML existente
 * y proporcionar una interfaz simple para las acciones comunes
 */

// ===================================
// FUNCIONES DE DASHBOARD
// ===================================

function refreshDashboard() {
    console.log('🔄 Refrescando dashboard');
    if (window.accountingController) {
        window.accountingController.refreshData();
    } else {
        console.warn('⚠️ Controlador no disponible');
        location.reload();
    }
}

function logout() {
    console.log('👋 Cerrando sesión');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// ===================================
// NAVEGACIÓN
// ===================================

function showAllTransactions() {
    console.log('📋 Mostrando todas las transacciones');
    // Cambiar a la pestaña de transacciones si existe
    const transactionsTab = document.querySelector('[data-section="transactions"]');
    if (transactionsTab) {
        transactionsTab.click();
    } else {
        // Redirigir a la página de contabilidad completa
        window.location.href = '/accounting.html';
    }
}

function showSection(sectionName) {
    console.log(`📄 Mostrando sección: ${sectionName}`);
    
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Actualizar navegación activa
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// ===================================
// ALERTAS Y NOTIFICACIONES
// ===================================

function showAlert(message, type = 'info', duration = 4000) {
    console.log(`🔔 Alerta ${type}: ${message}`);
    
    // Buscar contenedor de alertas existente
    let alertContainer = document.getElementById('alert-container');
    
    if (!alertContainer) {
        // Crear contenedor si no existe
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 99999;
            max-width: 420px;
            pointer-events: none;
        `;
        document.body.appendChild(alertContainer);
    }
    
    // Configuración de tipos de alerta
    const alertConfig = {
        success: {
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
            icon: '✅',
            title: 'Éxito'
        },
        error: {
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            icon: '❌',
            title: 'Error'
        },
        warning: {
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: '#f59e0b',
            icon: '⚠️',
            title: 'Advertencia'
        },
        info: {
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            icon: 'ℹ️',
            title: 'Información'
        }
    };
    
    const config = alertConfig[type] || alertConfig.info;
    
    // Crear elemento de alerta
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        background: var(--card-bg);
        backdrop-filter: blur(12px);
        border: 1px solid ${config.borderColor};
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                    0 10px 10px -5px rgba(0, 0, 0, 0.04),
                    0 0 0 1px rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        position: relative;
        overflow: hidden;
        min-width: 320px;
        max-width: 420px;
    `;
    
    // Agregar barra de progreso
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: ${config.color};
        width: 100%;
        transform-origin: left;
        animation: progressShrink ${duration}ms linear;
    `;
    
    alert.innerHTML = `
        <div style="
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: ${config.bgColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        ">${config.icon}</div>
        <div style="flex: 1; min-width: 0;">
            <div style="
                font-weight: 700;
                color: var(--text-primary);
                font-size: 0.95rem;
                margin-bottom: 0.25rem;
            ">${config.title}</div>
            <div style="
                color: var(--text-secondary);
                font-size: 0.9rem;
                line-height: 1.4;
                word-wrap: break-word;
            ">${message}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: rgba(0, 0, 0, 0.05);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 1.1rem;
            font-weight: bold;
            transition: all 0.2s ease;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        " onmouseover="this.style.background='rgba(0, 0, 0, 0.1)'; this.style.transform='scale(1.05)'" 
           onmouseout="this.style.background='rgba(0, 0, 0, 0.05)'; this.style.transform='scale(1)'">×</button>
    `;
    
    // Agregar barra de progreso
    alert.appendChild(progressBar);
    
    // Agregar al contenedor
    alertContainer.appendChild(alert);
    
    // Auto-remover después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => {
            if (alert.parentElement) {
                alert.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => {
                    if (alert.parentElement) {
                        alert.remove();
                    }
                }, 400);
            }
        }, duration);
    }
    
    return alert;
}

// ===================================
// FORMATEO
// ===================================

function formatCurrency(amount) {
    try {
        if (window.AccountingState && typeof window.AccountingState.formatCurrency === 'function') {
            return window.AccountingState.formatCurrency(amount);
        }
        
        // Fallback robusto
        const numAmount = parseFloat(amount) || 0;
        
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(numAmount);
    } catch (error) {
        console.error('Error formateando moneda:', error);
        return `$${amount || 0}`;
    }
}

function formatDate(date) {
    try {
        if (window.AccountingState && typeof window.AccountingState.formatDate === 'function') {
            return window.AccountingState.formatDate(date);
        }
        
        // Fallback robusto
        if (!date) return 'Sin fecha';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Fecha inválida';
        
        return d.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return 'Error en fecha';
    }
}

// ===================================
// TEMA
// ===================================

function toggleTheme() {
    if (window.accountingController) {
        window.accountingController.toggleTheme();
    } else {
        // Fallback
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        console.log(`🎨 Tema cambiado a: ${newTheme}`);
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Actualizar labels si existen
    const lightLabel = document.getElementById('light-label');
    const darkLabel = document.getElementById('dark-label');
    
    if (lightLabel && darkLabel) {
        lightLabel.classList.toggle('active', savedTheme === 'light');
        darkLabel.classList.toggle('active', savedTheme === 'dark');
    }
    
    console.log(`🎨 Tema inicializado: ${savedTheme}`);
}

// ===================================
// UTILIDADES DE FORMULARIOS
// ===================================

function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        console.log(`📝 Formulario ${formId} limpiado`);
    }
}

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

// ===================================
// CARGA DE DATOS
// ===================================

async function loadAccountingStats() {
    console.log('📊 Cargando estadísticas (función global)');
    
    if (window.AccountingState) {
        try {
            return await window.AccountingState.loadStats();
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
            showAlert('Error cargando estadísticas: ' + error.message, 'error');
        }
    } else {
        console.warn('⚠️ AccountingState no disponible');
    }
}

async function loadAccounts() {
    console.log('🏦 Cargando cuentas (función global)');
    
    if (window.AccountingState) {
        try {
            return await window.AccountingState.loadAccounts();
        } catch (error) {
            console.error('❌ Error cargando cuentas:', error);
            showAlert('Error cargando cuentas: ' + error.message, 'error');
        }
    } else {
        console.warn('⚠️ AccountingState no disponible');
    }
}

// ===================================
// INICIALIZACIÓN
// ===================================

// Inicializar tema cuando se carga el script
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
});

// Agregar estilos CSS mejorados para las animaciones de alertas
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
        }
        to {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
        to {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
        }
    }
    
    @keyframes progressShrink {
        from {
            transform: scaleX(1);
        }
        to {
            transform: scaleX(0);
        }
    }
    
    /* Estilos para alertas responsivas */
    @media (max-width: 480px) {
        #alert-container {
            top: 16px !important;
            right: 16px !important;
            left: 16px !important;
            max-width: none !important;
        }
        
        .alert {
            min-width: auto !important;
            max-width: none !important;
        }
    }
    
    .form-input.error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
    }
    
    /* Mejoras para el scroll de alertas */
    #alert-container {
        max-height: calc(100vh - 48px);
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    
    #alert-container::-webkit-scrollbar {
        display: none;
    }
`;
document.head.appendChild(alertStyles);

// Exportar funciones para uso en módulos
window.AccountingGlobals = {
    refreshDashboard,
    logout,
    showAllTransactions,
    showSection,
    showAlert,
    formatCurrency,
    formatDate,
    toggleTheme,
    initializeTheme,
    clearForm,
    validateForm,
    loadAccountingStats,
    loadAccounts
};
// ==

// FUNCIONES DE TRANSACCIONES


function showTransactionModal() {
    console.log('💰 Mostrando modal de nueva transacción');
    
    if (window.accountingController && window.accountingController.showTransactionModal) {
        window.accountingController.showTransactionModal();
    } else {
        // Fallback - mostrar el modal existente
        showInvoiceModal();
    }
}

function showInvoiceHistory() {
    console.log('📋 Mostrando historial de facturas');
    showSection('invoices');
}