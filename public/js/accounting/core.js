// ===================================
// EDUCONTA - Core de Contabilidad
// ===================================

// Configuración global del módulo
const AccountingConfig = {
    API_BASE: '/api/accounting',
    CURRENCY: 'COP',
    LOCALE: 'es-CO',
    DECIMAL_PLACES: 2,
    DATE_FORMAT: 'DD/MM/YYYY'
};

// Estado global compartido (implementado en state.js)
// const AccountingState se define en state.js

// ===================================
// INICIALIZACIÓN GLOBAL
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧮 Core de Contabilidad inicializado');
    initializeAccountingCore();
});

async function initializeAccountingCore() {
    try {
        // Inicializar tema
        initializeTheme();
        
        // Configurar event listeners globales
        setupGlobalEventListeners();
        
        // El archivo principal (accounting.js) se encarga de la autenticación
        console.log('✅ Core de contabilidad listo');
        
    } catch (error) {
        console.error('❌ Error inicializando core:', error);
        handleInitializationError(error);
    }
}

// ===================================
// AUTENTICACIÓN
// ===================================
// La autenticación se maneja en el archivo principal accounting.js

// ===================================
// GESTIÓN DE TEMA
// ===================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeLabels(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeLabels(newTheme);
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
}

function updateThemeLabels(theme) {
    const lightLabel = document.getElementById('light-label');
    const darkLabel = document.getElementById('dark-label');
    
    if (lightLabel && darkLabel) {
        if (theme === 'dark') {
            lightLabel.style.color = 'var(--text-light)';
            darkLabel.style.color = 'var(--primary)';
        } else {
            lightLabel.style.color = 'var(--primary)';
            darkLabel.style.color = 'var(--text-light)';
        }
    }
}

// ===================================
// GESTIÓN DE PESTAÑAS
// ===================================

function showTab(tabName) {
    // Ocultar todas las pestañas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Ocultar todos los botones
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Mostrar pestaña seleccionada
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Activar botón correspondiente
    const clickedButton = event?.target;
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // Disparar evento de cambio de pestaña
    window.dispatchEvent(new CustomEvent('tabChanged', { 
        detail: { tab: tabName } 
    }));
    
    // Cargar datos específicos de la pestaña
    loadTabData(tabName);
}

async function loadTabData(tabName) {
    switch(tabName) {
        case 'accounts':
            if (window.AccountsModule) {
                await window.AccountsModule.loadAccounts();
            }
            break;
        case 'transactions':
            if (window.TransactionsModule) {
                await window.TransactionsModule.loadTransactions();
            }
            break;
        case 'reports':
            if (window.ReportsModule) {
                await window.ReportsModule.loadReports();
            }
            break;
    }
}

// ===================================
// CARGA DE DATOS INICIALES
// ===================================

async function loadInitialData() {
    try {
        setGlobalLoading(true);
        
        // Cargar estadísticas generales
        await loadAccountingStats();
        
        // Cargar datos de la pestaña activa
        const activeTab = document.querySelector('.tab-btn.active')?.textContent?.toLowerCase();
        if (activeTab) {
            await loadTabData(activeTab);
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
        showNotification('Error cargando datos iniciales', 'error');
    } finally {
        setGlobalLoading(false);
    }
}

async function loadAccountingStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${AccountingConfig.API_BASE}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
            updateStatsDisplay(result.data);
            console.log('📊 Estadísticas cargadas');
        } else {
            throw new Error(result.error || 'Error al cargar estadísticas');
        }

    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        // No mostrar error si es solo estadísticas
    }
}

function updateStatsDisplay(stats) {
    // Actualizar métricas principales
    updateElement('total-accounts', stats.totalAccounts || 0);
    updateElement('active-accounts', stats.totalAccounts || 0); // Asumiendo que todas están activas
    updateElement('total-balance', formatCurrency(stats.totalBalance || 0));
    updateElement('pending-transactions', stats.pendingTransactions || 0);
    
    // Disparar evento para el dashboard
    window.dispatchEvent(new CustomEvent('dataLoaded', { 
        detail: { 
            stats: stats,
            accounts: window.currentAccounts || []
        } 
    }));
    
    // Actualizar dashboard si está inicializado
    if (window.accountingDashboard) {
        window.accountingDashboard.updateMetrics(stats);
        window.accountingDashboard.updateCharts({
            accounts: window.currentAccounts || [],
            stats: stats
        });
    }
}

// ===================================
// EVENT LISTENERS GLOBALES
// ===================================

function setupGlobalEventListeners() {
    // Botón de toggle de tema
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Botones de pestañas
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.textContent.toLowerCase().trim();
            const tabMap = {
                'plan de cuentas': 'accounts',
                'transacciones': 'transactions',
                'reportes': 'reports'
            };
            showTab(tabMap[tabName] || tabName);
        });
    });
    
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="flex"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
}

// ===================================
// UTILIDADES GLOBALES
// ===================================

function formatCurrency(amount) {
    return new Intl.NumberFormat(AccountingConfig.LOCALE, {
        style: 'currency',
        currency: AccountingConfig.CURRENCY,
        minimumFractionDigits: 0,
        maximumFractionDigits: AccountingConfig.DECIMAL_PLACES
    }).format(amount || 0);
}

function formatDate(date, format = AccountingConfig.DATE_FORMAT) {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString(AccountingConfig.LOCALE);
}

function formatNumber(number, decimals = 0) {
    return new Intl.NumberFormat(AccountingConfig.LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number || 0);
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        if (typeof value === 'number' && id.includes('balance')) {
            element.textContent = formatCurrency(value);
        } else {
            element.textContent = value;
        }
        element.classList.remove('loading');
    }
}

function setGlobalLoading(isLoading) {
    AccountingState.isLoading = isLoading;
    
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = isLoading ? 'flex' : 'none';
    }
    
    // Disparar evento de cambio de loading
    window.dispatchEvent(new CustomEvent('loadingChanged', { 
        detail: { isLoading } 
    }));
}

function showNotification(message, type = 'info', duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-ocultar
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    return notification;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Limpiar formularios
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // Disparar evento de cierre
        window.dispatchEvent(new CustomEvent('modalClosed', { 
            detail: { modalId } 
        }));
    }
}

function handleInitializationError(error) {
    const container = document.querySelector('.main');
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h2>Error de Inicialización</h2>
                <p>No se pudo cargar el módulo de contabilidad.</p>
                <p class="error-details">${error.message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// ===================================
// API HELPERS
// ===================================

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${AccountingConfig.API_BASE}${endpoint}`, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Error en la respuesta del servidor');
        }
        
        return result;
        
    } catch (error) {
        console.error(`❌ Error en API ${endpoint}:`, error);
        throw error;
    }
}

// Exportar funciones y objetos globales
window.AccountingCore = {
    config: AccountingConfig,
    state: AccountingState,
    formatCurrency,
    formatDate,
    formatNumber,
    showNotification,
    closeModal,
    updateElement,
    setGlobalLoading,
    apiRequest,
    showTab,
    toggleTheme
};