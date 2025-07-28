// ===================================
// EDUCONTA - Inicializador del Dashboard Contable
// ===================================

/**
 * Script de inicialización que coordina todos los módulos
 * y pone en funcionamiento el dashboard completo
 */

class DashboardInitializer {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Inicializando Dashboard Contable Completo');
        
        try {
            // Verificar dependencias
            await this.checkDependencies();
            
            // Inicializar tema
            this.initializeTheme();
            
            // Verificar autenticación
            await this.checkAuthentication();
            
            // Inicializar módulos en orden
            await this.initializeModules();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar auto-refresh
            this.setupAutoRefresh();
            
            this.isInitialized = true;
            console.log('✅ Dashboard inicializado completamente');
            
            // Mostrar notificación de éxito
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Error inicializando dashboard:', error);
            this.handleInitializationError(error);
        }
    }
    
    async checkDependencies() {
        console.log('🔍 Verificando dependencias...');
        
        const requiredModules = [
            'AccountingState',
            'AccountingForms', 
            'AccountingNavigation',
            'AccountingController'
        ];
        
        const missingModules = [];
        
        for (const moduleName of requiredModules) {
            if (!window[moduleName]) {
                missingModules.push(moduleName);
            }
        }
        
        if (missingModules.length > 0) {
            throw new Error(`Módulos faltantes: ${missingModules.join(', ')}`);
        }
        
        console.log('✅ Todas las dependencias están disponibles');
    }
    
    initializeTheme() {
        console.log('🎨 Inicializando tema...');
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Actualizar labels del toggle
        this.updateThemeLabels(savedTheme);
        
        console.log(`✅ Tema inicializado: ${savedTheme}`);
    }
    
    updateThemeLabels(theme) {
        const lightLabel = document.getElementById('light-label');
        const darkLabel = document.getElementById('dark-label');
        
        if (lightLabel && darkLabel) {
            lightLabel.classList.toggle('active', theme === 'light');
            darkLabel.classList.toggle('active', theme === 'dark');
        }
    }
    
    async checkAuthentication() {
        console.log('🔐 Verificando autenticación...');
        
        const token = localStorage.getItem('token');
        
        // Modo demo para desarrollo
        const urlParams = new URLSearchParams(window.location.search);
        const demoMode = urlParams.get('demo') === 'true';
        
        if (demoMode) {
            console.log('🎭 Modo demo activado');
            this.setupDemoUser();
            return;
        }
        
        if (!token) {
            console.log('❌ No hay token, redirigiendo...');
            window.location.href = '/login.html';
            return;
        }
        
        try {
            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    this.setupAuthenticatedUser(data.user);
                    console.log('✅ Usuario autenticado correctamente');
                } else {
                    throw new Error('Respuesta inválida del servidor');
                }
            } else {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error de autenticación:', error);
            
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 Reintentando autenticación (${this.retryCount}/${this.maxRetries})`);
                setTimeout(() => this.checkAuthentication(), 2000);
                return;
            }
            
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    }
    
    setupDemoUser() {
        const demoUser = {
            id: 'demo-user',
            email: 'demo@educonta.com',
            firstName: 'Usuario',
            lastName: 'Demo',
            role: 'AUXILIARY_ACCOUNTANT',
            institution: {
                id: 'demo-institution',
                name: 'Institución Demo'
            }
        };
        
        this.setupAuthenticatedUser(demoUser);
        window.AccountingState.set('user', demoUser);
        window.AccountingState.set('isAuthenticated', true);
    }
    
    setupAuthenticatedUser(user) {
        // Actualizar información del usuario en la UI
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const institutionName = document.getElementById('institutionName');
        
        if (userAvatar) {
            const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
            userAvatar.textContent = initials;
        }
        
        if (userName) {
            userName.textContent = `${user.firstName} ${user.lastName}`;
        }
        
        if (institutionName && user.institution) {
            institutionName.textContent = user.institution.name;
        }
        
        // Guardar en el estado global
        if (window.AccountingState) {
            window.AccountingState.set('user', user);
            window.AccountingState.set('isAuthenticated', true);
        }
    }
    
    async initializeModules() {
        console.log('📦 Inicializando módulos...');
        
        // Inicializar navegación
        if (window.AccountingNavigation && !window.accountingNavigation) {
            this.modules.navigation = new AccountingNavigation();
            window.accountingNavigation = this.modules.navigation;
            console.log('✅ Navegación inicializada');
        }
        
        // Inicializar formularios
        if (window.AccountingForms && !window.accountingForms) {
            this.modules.forms = new AccountingForms();
            window.accountingForms = this.modules.forms;
            console.log('✅ Formularios inicializados');
        }
        
        // Inicializar dashboard
        if (window.AccountingDashboard && !window.accountingDashboard) {
            this.modules.dashboard = new AccountingDashboard();
            window.accountingDashboard = this.modules.dashboard;
            console.log('✅ Dashboard inicializado');
        }
        
        // Inicializar controlador principal
        if (window.AccountingController && !window.accountingController) {
            this.modules.controller = new AccountingController();
            window.accountingController = this.modules.controller;
            console.log('✅ Controlador inicializado');
        }
        
        console.log('✅ Todos los módulos inicializados');
    }
    
    async loadInitialData() {
        console.log('📥 Cargando datos iniciales...');
        
        if (!window.AccountingState) {
            console.warn('⚠️ AccountingState no disponible');
            return;
        }
        
        try {
            // Mostrar indicador de carga
            this.setGlobalLoading(true);
            
            // Cargar datos en paralelo
            const promises = [
                window.AccountingState.loadStats(),
                window.AccountingState.loadAccounts(),
                window.AccountingState.loadTransactions({ limit: 5 })
            ];
            
            await Promise.all(promises);
            
            console.log('✅ Datos iniciales cargados');
            
        } catch (error) {
            console.error('❌ Error cargando datos iniciales:', error);
            this.showNotification('Error cargando datos: ' + error.message, 'error');
        } finally {
            this.setGlobalLoading(false);
        }
    }
    
    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');
        
        // Toggle de tema
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
        
        // Botón de refresh
        const refreshBtn = document.querySelector('[onclick="refreshDashboard()"]');
        if (refreshBtn) {
            refreshBtn.onclick = this.refreshDashboard.bind(this);
        }
        
        // Botón de logout
        const logoutBtn = document.querySelector('[onclick="logout()"]');
        if (logoutBtn) {
            logoutBtn.onclick = this.logout.bind(this);
        }
        
        // Escuchar cambios de estado
        if (window.AccountingState) {
            window.AccountingState.subscribe('stats', this.onStatsUpdated.bind(this));
            window.AccountingState.subscribe('accounts', this.onAccountsUpdated.bind(this));
            window.AccountingState.subscribe('transactions', this.onTransactionsUpdated.bind(this));
        }
        
        console.log('✅ Event listeners configurados');
    }
    
    setupAutoRefresh() {
        console.log('🔄 Configurando auto-refresh...');
        
        // Refresh cada 2 minutos
        setInterval(() => {
            if (this.isInitialized && window.AccountingState) {
                console.log('🔄 Auto-refresh ejecutándose...');
                window.AccountingState.loadStats().catch(console.error);
            }
        }, 120000); // 2 minutos
        
        console.log('✅ Auto-refresh configurado');
    }
    
    // ===================================
    // EVENT HANDLERS
    // ===================================
    
    onStatsUpdated(stats) {
        console.log('📊 Estadísticas actualizadas:', stats);
        
        // Actualizar métricas en la UI con animación
        this.updateElementWithAnimation('monthlyIncome', this.formatCurrency(stats.totalIncome || 0));
        this.updateElementWithAnimation('monthlyExpenses', this.formatCurrency(stats.totalExpenses || 0));
        this.updateElementWithAnimation('netBalance', this.formatCurrency(stats.netBalance || ((stats.totalIncome || 0) - (stats.totalExpenses || 0))));
        this.updateElementWithAnimation('totalTransactions', stats.totalTransactions || 0);
    }
    
    updateElementWithAnimation(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Agregar efecto de actualización
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                element.textContent = value;
                element.classList.remove('loading');
                element.style.transform = 'scale(1)';
            }, 150);
        }
    }
    
    onAccountsUpdated(accounts) {
        console.log('🏦 Cuentas actualizadas:', accounts.length);
        
        // Actualizar selects de cuentas en formularios
        if (window.accountingForms) {
            window.accountingForms.populateAccountSelects();
        }
    }
    
    onTransactionsUpdated(transactions) {
        console.log('💳 Transacciones actualizadas:', transactions.length);
        
        // Actualizar lista de transacciones recientes
        this.updateTransactionsList(transactions.slice(0, 5));
    }
    
    updateTransactionsList(transactions) {
        const container = document.getElementById('transactionsList');
        if (!container) return;
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                    <p>No hay transacciones recientes</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon" style="background: ${transaction.type === 'INCOME' ? '#10b981' : '#ef4444'};">
                        ${transaction.type === 'INCOME' ? '💰' : '💸'}
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description || transaction.reference || 'Transacción'}</h4>
                        <p>${this.formatDate(transaction.date)} • ${transaction.type}</p>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type === 'INCOME' ? 'amount-income' : 'amount-expense'}">
                    ${this.formatCurrency(transaction.amount)}
                </div>
            </div>
        `).join('');
    }
    
    // ===================================
    // ACCIONES
    // ===================================
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.updateThemeLabels(newTheme);
        
        console.log(`🎨 Tema cambiado a: ${newTheme}`);
    }
    
    async refreshDashboard() {
        console.log('🔄 Refrescando dashboard...');
        
        const button = event?.target;
        if (button) {
            const originalContent = button.innerHTML;
            button.innerHTML = '<div class="loading"></div> Actualizando...';
            button.disabled = true;
            
            try {
                await this.loadInitialData();
                
                setTimeout(() => {
                    button.innerHTML = originalContent;
                    button.disabled = false;
                }, 1000);
                
                this.showNotification('Dashboard actualizado correctamente', 'success');
                
            } catch (error) {
                console.error('❌ Error refrescando:', error);
                button.innerHTML = originalContent;
                button.disabled = false;
                this.showNotification('Error actualizando dashboard', 'error');
            }
        }
    }
    
    logout() {
        console.log('👋 Cerrando sesión...');
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedInstitution');
        
        window.location.href = '/login.html';
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            element.classList.remove('loading');
        }
    }
    
    setGlobalLoading(isLoading) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = isLoading ? 'flex' : 'none';
        }
        
        // Actualizar estado
        if (window.AccountingState) {
            window.AccountingState.set('loading.global', isLoading);
        }
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }
    
    formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        return d.toLocaleDateString('es-CO');
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            // Fallback simple
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    showWelcomeMessage() {
        setTimeout(() => {
            this.showNotification('¡Dashboard contable listo para usar!', 'success');
        }, 1000);
    }
    
    handleInitializationError(error) {
        console.error('❌ Error crítico de inicialización:', error);
        
        const container = document.querySelector('.main-content') || document.body;
        
        container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
                padding: 2rem;
                background: var(--bg);
                color: var(--text);
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                <h2 style="margin-bottom: 1rem;">Error de Inicialización</h2>
                <p style="margin-bottom: 1rem; color: var(--text-light);">
                    No se pudo cargar el dashboard contable correctamente.
                </p>
                <p style="margin-bottom: 2rem; font-family: monospace; background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
                    ${error.message}
                </p>
                <button onclick="location.reload()" style="
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para asegurar que todos los scripts se hayan cargado
    setTimeout(() => {
        window.dashboardInitializer = new DashboardInitializer();
    }, 500);
});

// Exportar para uso global
window.DashboardInitializer = DashboardInitializer;