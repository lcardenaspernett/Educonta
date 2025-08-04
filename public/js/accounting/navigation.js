// ===================================
// EDUCONTA - Sistema de Navegación del Dashboard
// ===================================

/**
 * Sistema de navegación para el dashboard de contabilidad
 */
class AccountingNavigation {
    constructor() {
        this.currentSection = 'dashboard';
        this.sections = new Map();
        this.init();
    }
    
    init() {
        console.log('🧭 Inicializando sistema de navegación');
        this.setupSections();
        this.setupEventListeners();
        this.initializeCurrentSection();
    }
    
    setupSections() {
        // Configurar secciones disponibles
        this.sections.set('dashboard', {
            id: 'dashboard-section',
            title: 'Dashboard',
            icon: '📊',
            onShow: this.showDashboard.bind(this),
            onHide: this.hideDashboard.bind(this)
        });
        
        this.sections.set('transactions', {
            id: 'transactions-section',
            title: 'Movimientos',
            icon: '💳',
            onShow: this.showTransactions.bind(this),
            onHide: this.hideTransactions.bind(this)
        });
        
        this.sections.set('accounts', {
            id: 'accounts-section',
            title: 'Plan de Cuentas',
            icon: '🏦',
            onShow: this.showAccounts.bind(this),
            onHide: this.hideAccounts.bind(this)
        });
        
        this.sections.set('invoices', {
            id: 'invoices-section',
            title: 'Facturas',
            icon: '🧾',
            onShow: this.showInvoices.bind(this),
            onHide: this.hideInvoices.bind(this)
        });
        
        this.sections.set('payments', {
            id: 'payments-section',
            title: 'Gestión de Pagos',
            icon: '💰',
            onShow: this.showPayments.bind(this),
            onHide: this.hidePayments.bind(this)
        });
        
        this.sections.set('reports', {
            id: 'reports-section',
            title: 'Reportes',
            icon: '📈',
            onShow: this.showReports.bind(this),
            onHide: this.hideReports.bind(this)
        });
    }
    
    setupEventListeners() {
        // Configurar listeners para los enlaces de navegación
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = link.getAttribute('data-section');
                this.showSection(sectionName);
            });
        });
        
        // Listener para el historial del navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.showSection(e.state.section, false);
            }
        });
    }
    
    initializeCurrentSection() {
        // Determinar sección inicial desde la URL o usar dashboard por defecto
        const urlParams = new URLSearchParams(window.location.search);
        const initialSection = urlParams.get('section') || 'dashboard';
        
        this.showSection(initialSection, false);
    }
    
    // ===================================
    // NAVEGACIÓN PRINCIPAL
    // ===================================
    
    showSection(sectionName, updateHistory = true) {
        console.log(`🧭 Navegando a sección: ${sectionName}`);
        
        if (!this.sections.has(sectionName)) {
            console.warn(`⚠️ Sección no encontrada: ${sectionName}`);
            return;
        }
        
        // Ocultar sección actual
        if (this.currentSection && this.sections.has(this.currentSection)) {
            const currentConfig = this.sections.get(this.currentSection);
            if (currentConfig.onHide) {
                currentConfig.onHide();
            }
            this.hideSectionElement(this.currentSection);
        }
        
        // Mostrar nueva sección
        const newConfig = this.sections.get(sectionName);
        this.showSectionElement(sectionName);
        
        if (newConfig.onShow) {
            newConfig.onShow();
        }
        
        // Actualizar navegación activa
        this.updateActiveNavigation(sectionName);
        
        // Actualizar historial del navegador
        if (updateHistory) {
            const url = new URL(window.location);
            url.searchParams.set('section', sectionName);
            window.history.pushState({ section: sectionName }, '', url);
        }
        
        this.currentSection = sectionName;
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('sectionChanged', {
            detail: { section: sectionName, config: newConfig }
        }));
    }
    
    showSectionElement(sectionName) {
        const config = this.sections.get(sectionName);
        if (!config) return;
        
        const element = document.getElementById(config.id);
        if (element) {
            element.style.display = 'block';
            element.classList.add('active');
        }
    }
    
    hideSectionElement(sectionName) {
        const config = this.sections.get(sectionName);
        if (!config) return;
        
        const element = document.getElementById(config.id);
        if (element) {
            element.style.display = 'none';
            element.classList.remove('active');
        }
    }
    
    updateActiveNavigation(sectionName) {
        // Remover clase activa de todos los enlaces
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Agregar clase activa al enlace correspondiente
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // ===================================
    // HANDLERS DE SECCIONES
    // ===================================
    
    async showDashboard() {
        console.log('📊 Mostrando dashboard');
        
        // Cargar datos del dashboard si es necesario
        if (window.AccountingState) {
            try {
                await Promise.all([
                    window.AccountingState.loadStats(),
                    window.AccountingState.loadAccounts()
                ]);
            } catch (error) {
                console.error('❌ Error cargando datos del dashboard:', error);
            }
        }
        
        // Actualizar gráficos si el dashboard está disponible
        if (window.accountingDashboard) {
            const stats = window.AccountingState?.get('stats') || {};
            const accounts = window.AccountingState?.get('accounts') || [];
            
            window.accountingDashboard.updateMetrics(stats);
            window.accountingDashboard.updateCharts({ accounts, stats });
        }
    }
    
    hideDashboard() {
        console.log('📊 Ocultando dashboard');
        // Limpiar timers o recursos si es necesario
    }
    
    async showTransactions() {
        console.log('💳 Mostrando transacciones');
        
        // Esperar a que los módulos estén listos
        let retries = 0;
        const maxRetries = 10;
        
        const waitForModules = async () => {
            if (window.AccountingState && window.accountingController && null) {
                return true;
            }
            
            if (retries < maxRetries) {
                retries++;
                console.log(`⏳ Esperando módulos... intento ${retries}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 500));
                return await waitForModules();
            }
            
            return false;
        };
        
        const modulesReady = await waitForModules();
        
        if (!modulesReady) {
            console.error('❌ Módulos no disponibles después de esperar');
            return;
        }
        
        try {
            console.log('🔄 Cargando transacciones...');
            
            // Usar null directamente si está disponible
            let transactions = [];
            if (null && null.transactions) {
                transactions = null.transactions;
                console.log('📊 Usando transacciones de null:', transactions.length);
            } else {
                await window.AccountingState.loadTransactions();
                transactions = window.AccountingState.get('transactions') || [];
                console.log('📋 Transacciones obtenidas de AccountingState:', transactions.length);
            }
            
            console.log('🎮 Renderizando transacciones con controller');
            window.accountingController.renderTransactionsList(transactions);
            
            // Asegurar que la sección de transacciones sea visible
            const transactionsSection = document.getElementById('transactions-section');
            const transactionsList = document.getElementById('transactionsList');
            
            if (transactionsSection) {
                transactionsSection.style.display = 'block';
                transactionsSection.classList.add('active');
                console.log('✅ Sección de transacciones hecha visible');
            }
            
            if (transactionsList) {
                transactionsList.style.display = 'block';
                transactionsList.style.visibility = 'visible';
                console.log('✅ Lista de transacciones hecha visible');
                console.log('📋 Contenido HTML:', transactionsList.innerHTML.substring(0, 200) + '...');
            }
            
        } catch (error) {
            console.error('❌ Error cargando transacciones:', error);
        }
    }
    
    hideTransactions() {
        console.log('💳 Ocultando transacciones');
    }
    
    async showAccounts() {
        console.log('🏦 Mostrando plan de cuentas');
        
        // Cargar cuentas si es necesario
        if (window.AccountingState) {
            try {
                await window.AccountingState.loadAccounts();
            } catch (error) {
                console.error('❌ Error cargando cuentas:', error);
            }
        }
        
        // Mostrar mensaje de desarrollo si la sección no está implementada
        const section = document.getElementById('accounts-section');
        if (section && section.innerHTML.trim() === '') {
            section.innerHTML = `
                <div class="development-notice">
                    <div class="notice-icon">🚧</div>
                    <h3>Sección en Desarrollo</h3>
                    <p>La gestión completa del plan de cuentas estará disponible próximamente.</p>
                    <p>Puedes acceder al sistema completo de contabilidad para gestionar cuentas.</p>
                    <button class="btn btn-primary" onclick="window.location.href='/accounting.html'">
                        Ir a Contabilidad Completa
                    </button>
                </div>
            `;
        }
    }
    
    hideAccounts() {
        console.log('🏦 Ocultando plan de cuentas');
    }
    
    showInvoices() {
        console.log('🧾 Mostrando facturas');
        
        const section = document.getElementById('invoices-section');
        if (section && section.innerHTML.trim() === '') {
            section.innerHTML = `
                <div class="development-notice">
                    <div class="notice-icon">🚧</div>
                    <h3>Sección en Desarrollo</h3>
                    <p>La gestión completa de facturas estará disponible próximamente.</p>
                    <p>Por ahora puedes generar facturas rápidas desde el dashboard principal.</p>
                    <button class="btn btn-primary" onclick="accountingNavigation.showSection('dashboard')">
                        Volver al Dashboard
                    </button>
                </div>
            `;
        }
    }
    
    hideInvoices() {
        console.log('🧾 Ocultando facturas');
    }
    
    showPayments() {
        console.log('💰 Mostrando gestión de pagos');
        
        const section = document.getElementById('payments-section');
        if (section && section.innerHTML.trim() === '') {
            section.innerHTML = `
                <div class="development-notice">
                    <div class="notice-icon">🚧</div>
                    <h3>Sección en Desarrollo</h3>
                    <p>La gestión de pagos estará disponible próximamente.</p>
                    <p>Esta funcionalidad incluirá seguimiento de pagos de estudiantes y proveedores.</p>
                    <button class="btn btn-primary" onclick="accountingNavigation.showSection('dashboard')">
                        Volver al Dashboard
                    </button>
                </div>
            `;
        }
    }
    
    hidePayments() {
        console.log('💰 Ocultando gestión de pagos');
    }
    
    showReports() {
        console.log('📈 Mostrando reportes');
        
        const section = document.getElementById('reports-section');
        if (section && section.innerHTML.trim() === '') {
            section.innerHTML = `
                <div class="development-notice">
                    <div class="notice-icon">🚧</div>
                    <h3>Sección en Desarrollo</h3>
                    <p>Los reportes contables estarán disponibles próximamente.</p>
                    <p>Incluirán balance general, estado de resultados y otros reportes financieros.</p>
                    <button class="btn btn-primary" onclick="accountingNavigation.showSection('dashboard')">
                        Volver al Dashboard
                    </button>
                </div>
            `;
        }
    }
    
    hideReports() {
        console.log('📈 Ocultando reportes');
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    
    getCurrentSection() {
        return this.currentSection;
    }
    
    getSectionConfig(sectionName) {
        return this.sections.get(sectionName);
    }
    
    getAllSections() {
        return Array.from(this.sections.keys());
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.accountingNavigation = new AccountingNavigation();
});

// Función global para compatibilidad
function showSection(sectionName) {
    if (window.accountingNavigation) {
        window.accountingNavigation.showSection(sectionName);
    } else {
        console.warn('⚠️ Sistema de navegación no disponible');
    }
}

// Agregar estilos para las notificaciones de desarrollo
const navigationStyles = document.createElement('style');
navigationStyles.textContent = `
    .development-notice {
        text-align: center;
        padding: 3rem 2rem;
        max-width: 500px;
        margin: 2rem auto;
        background: var(--bg-card);
        border-radius: 12px;
        border: 1px solid var(--border);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .notice-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    .development-notice h3 {
        color: var(--text);
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    .development-notice p {
        color: var(--text-light);
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    
    .development-notice .btn {
        margin-top: 1rem;
    }
    
    .content-section {
        display: none;
    }
    
    .content-section.active {
        display: block;
    }
`;
document.head.appendChild(navigationStyles);

// Exportar para uso global
window.AccountingNavigation = AccountingNavigation;
window.showSection = showSection;