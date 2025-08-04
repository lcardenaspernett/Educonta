// ===================================
// EDUCONTA - Estado Centralizado de Contabilidad
// ===================================

/**
 * Sistema de gestión de estado centralizado para el módulo de contabilidad
 */
class AccountingState {
    constructor() {
        this.state = {
            // Usuario y autenticación
            user: null,
            institution: null,
            isAuthenticated: false,
            
            // Datos principales
            accounts: [],
            transactions: [],
            stats: {},
            
            // UI State
            loading: {
                global: false,
                accounts: false,
                transactions: false,
                stats: false
            },
            
            // Filtros activos
            filters: {
                accounts: {
                    type: '',
                    level: '',
                    search: '',
                    active: true
                },
                transactions: {
                    type: '',
                    status: '',
                    dateFrom: '',
                    dateTo: '',
                    search: ''
                }
            },
            
            // Configuración
            config: {
                currency: 'COP',
                locale: 'es-CO',
                apiBase: '/api/accounting-simple', // Cambiar a /api/accounting para producción
                refreshInterval: 60000 // 1 minuto
            }
        };
        
        this.listeners = new Map();
        this.init();
    }
    
    init() {
        console.log('🏪 Estado centralizado inicializado');
        
        // Cargar configuración desde localStorage
        this.loadConfig();
        
        // Configurar auto-refresh
        this.setupAutoRefresh();
    }
    
    // ===================================
    // GESTIÓN DE ESTADO
    // ===================================
    
    /**
     * Obtener valor del estado
     */
    get(path) {
        return this.getNestedValue(this.state, path);
    }
    
    /**
     * Establecer valor en el estado
     */
    set(path, value) {
        this.setNestedValue(this.state, path, value);
        this.notifyListeners(path, value);
    }
    
    /**
     * Actualizar múltiples valores
     */
    update(updates) {
        Object.entries(updates).forEach(([path, value]) => {
            this.set(path, value);
        });
    }
    
    /**
     * Resetear estado
     */
    reset() {
        const config = this.state.config;
        this.state = {
            user: null,
            institution: null,
            isAuthenticated: false,
            accounts: [],
            transactions: [],
            stats: {},
            loading: {
                global: false,
                accounts: false,
                transactions: false,
                stats: false
            },
            filters: {
                accounts: {
                    type: '',
                    level: '',
                    search: '',
                    active: true
                },
                transactions: {
                    type: '',
                    status: '',
                    dateFrom: '',
                    dateTo: '',
                    search: ''
                }
            },
            config
        };
        
        this.notifyListeners('*', this.state);
    }
    
    // ===================================
    // SUSCRIPCIONES
    // ===================================
    
    /**
     * Suscribirse a cambios en el estado
     */
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        
        this.listeners.get(path).add(callback);
        
        // Retornar función para desuscribirse
        return () => {
            const pathListeners = this.listeners.get(path);
            if (pathListeners) {
                pathListeners.delete(callback);
                if (pathListeners.size === 0) {
                    this.listeners.delete(path);
                }
            }
        };
    }
    
    /**
     * Notificar a los listeners
     */
    notifyListeners(path, value) {
        // Notificar listeners específicos
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.forEach(callback => {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error('Error en listener:', error);
                }
            });
        }
        
        // Notificar listeners globales
        const globalListeners = this.listeners.get('*');
        if (globalListeners) {
            globalListeners.forEach(callback => {
                try {
                    callback(this.state, path);
                } catch (error) {
                    console.error('Error en listener global:', error);
                }
            });
        }
    }
    
    // ===================================
    // ACCIONES DE DATOS
    // ===================================
    
    /**
     * Cargar estadísticas
     */
    async loadStats() {
        this.set('loading.stats', true);
        
        try {
            let response;
            
            // Usar null si está disponible, sino usar API
            if (null && null.stats) {
                console.log('📊 Usando estadísticas de null...');
                response = {
                    success: true,
                    data: null.stats
                };
            } else {
                response = await this.apiRequest('/stats');
            }
            
            // Asegurar que las transacciones estén cargadas primero
            if (!this.get('transactions') || this.get('transactions').length === 0) {
                console.log('🔄 Cargando transacciones para calcular estadísticas...');
                await this.loadTransactions();
            }
            
            // Calcular estadísticas adicionales basadas en transacciones
            const enhancedStats = this.calculateEnhancedStats(response.data);
            
            this.set('stats', enhancedStats);
            console.log('📊 Estadísticas cargadas y actualizadas:', enhancedStats);
            
            // Forzar actualización de la UI
            this.notifyListeners('stats', enhancedStats);
            
            return enhancedStats;
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
            throw error;
        } finally {
            this.set('loading.stats', false);
        }
    }

    /**
     * Calcular estadísticas mejoradas basadas en transacciones
     */
    calculateEnhancedStats(baseStats) {
        const transactions = this.get('transactions') || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        console.log('🧮 Calculando estadísticas con', transactions.length, 'transacciones');
        
        let totalIncome = 0;
        let totalExpenses = 0;
        let pendingInvoices = 0;
        
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            
            console.log('📊 Procesando transacción:', {
                type: transaction.type,
                amount: transaction.amount,
                date: transaction.date,
                isCurrentMonth: transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
            });
            
            // Solo contar transacciones del mes actual
            if (transactionDate.getMonth() === currentMonth && 
                transactionDate.getFullYear() === currentYear) {
                
                if (transaction.type === 'INCOME') {
                    totalIncome += transaction.amount || 0;
                } else if (transaction.type === 'EXPENSE') {
                    totalExpenses += transaction.amount || 0;
                }
            }
            
            // Contar facturas pendientes
            if (transaction.type === 'INCOME' && transaction.status === 'PENDING') {
                pendingInvoices++;
            }
        });
        
        console.log('💰 Estadísticas calculadas:', {
            totalIncome,
            totalExpenses,
            pendingInvoices,
            netBalance: totalIncome - totalExpenses
        });
        
        return {
            ...baseStats,
            totalIncome,
            totalExpenses,
            pendingInvoices,
            netBalance: totalIncome - totalExpenses
        };
    }
    
    /**
     * Cargar cuentas
     */
    async loadAccounts(filters = {}) {
        this.set('loading.accounts', true);
        
        try {
            const params = new URLSearchParams();
            
            // Aplicar filtros
            const currentFilters = { ...this.get('filters.accounts'), ...filters };
            
            if (currentFilters.type) params.append('type', currentFilters.type);
            if (currentFilters.level) params.append('level', currentFilters.level);
            if (currentFilters.search) params.append('search', currentFilters.search);
            if (currentFilters.active !== undefined) params.append('active', currentFilters.active);
            
            const response = await this.apiRequest(`/accounts?${params}`);
            this.set('accounts', response.data);
            this.set('filters.accounts', currentFilters);
            
            console.log('🏦 Cuentas cargadas:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ Error cargando cuentas:', error);
            throw error;
        } finally {
            this.set('loading.accounts', false);
        }
    }
    
    /**
     * Cargar transacciones
     */
    async loadTransactions(filters = {}) {
        this.set('loading.transactions', true);
        
        try {
            const params = new URLSearchParams();
            
            // Aplicar filtros
            const currentFilters = { ...this.get('filters.transactions'), ...filters };
            
            if (currentFilters.type) params.append('type', currentFilters.type);
            if (currentFilters.status) params.append('status', currentFilters.status);
            if (currentFilters.dateFrom) params.append('startDate', currentFilters.dateFrom);
            if (currentFilters.dateTo) params.append('endDate', currentFilters.dateTo);
            if (currentFilters.search) params.append('search', currentFilters.search);
            
            let response;
            
            // Usar null si está disponible, sino usar API
            if (null && null.transactions) {
                console.log('📊 Usando transacciones de null...');
                response = {
                    success: true,
                    data: null.transactions
                };
            } else {
                response = await this.apiRequest(`/transactions?${params}`);
            }
            
            this.set('transactions', response.data);
            this.set('filters.transactions', currentFilters);
            
            console.log('💳 Transacciones cargadas:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ Error cargando transacciones:', error);
            throw error;
        } finally {
            this.set('loading.transactions', false);
        }
    }
    
    /**
     * Crear cuenta
     */
    async createAccount(accountData) {
        try {
            const response = await this.apiRequest('/accounts', {
                method: 'POST',
                body: JSON.stringify(accountData)
            });
            
            // Recargar cuentas
            await this.loadAccounts();
            await this.loadStats();
            
            console.log('✅ Cuenta creada:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error creando cuenta:', error);
            throw error;
        }
    }
    
    /**
     * Crear transacción
     */
    async createTransaction(transactionData) {
        try {
            const response = await this.apiRequest('/transactions', {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });
            
            // Recargar datos
            await this.loadTransactions();
            await this.loadStats();
            
            console.log('✅ Transacción creada:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error creando transacción:', error);
            throw error;
        }
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    
    /**
     * Realizar petición a la API
     */
    async apiRequest(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const apiBase = this.get('config.apiBase');
        
        // Verificar si estamos en modo demo
        const urlParams = new URLSearchParams(window.location.search);
        const demoMode = urlParams.get('demo') === 'true' || !token;
        
        if (demoMode && null) {
            console.log('🎭 Usando datos de demostración para:', endpoint);
            return this.handleDemoRequest(endpoint, options);
        }
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
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
            const response = await fetch(`${apiBase}${endpoint}`, finalOptions);
            
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
            
            // Fallback a datos demo si hay error de conexión
            if (null && (error.message.includes('fetch') || error.message.includes('HTTP'))) {
                console.log('🎭 Fallback a datos demo debido a error de conexión');
                return this.handleDemoRequest(endpoint, options);
            }
            
            throw error;
        }
    }
    
    /**
     * Manejar peticiones en modo demo
     */
    async handleDemoRequest(endpoint, options = {}) {
        const method = options.method || 'GET';
        
        switch (endpoint) {
            case '/stats':
                return await null.getStats();
                
            case '/accounts':
                return await null.getAccounts();
                
            case '/transactions':
                return await null.getTransactions();
                
            default:
                if (endpoint === '/transactions' && method === 'POST') {
                    const transactionData = JSON.parse(options.body);
                    return await null.createTransaction(transactionData);
                }
                
                // Respuesta genérica para endpoints no implementados
                return {
                    success: true,
                    data: {},
                    message: `Demo response for ${method} ${endpoint}`
                };
        }
    }
    
    /**
     * Obtener valor anidado
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    
    /**
     * Establecer valor anidado
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }
    
    /**
     * Cargar configuración
     */
    loadConfig() {
        const savedConfig = localStorage.getItem('accounting-config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                this.set('config', { ...this.get('config'), ...config });
            } catch (error) {
                console.warn('Error cargando configuración:', error);
            }
        }
    }
    
    /**
     * Guardar configuración
     */
    saveConfig() {
        localStorage.setItem('accounting-config', JSON.stringify(this.get('config')));
    }
    
    /**
     * Configurar auto-refresh
     */
    setupAutoRefresh() {
        const interval = this.get('config.refreshInterval');
        
        if (interval > 0) {
            setInterval(() => {
                if (this.get('isAuthenticated') && !this.get('loading.global')) {
                    console.log('🔄 Auto-refresh de datos');
                    this.loadStats().catch(console.error);
                }
            }, interval);
        }
    }
    
    /**
     * Formatear moneda
     */
    formatCurrency(amount) {
        const currency = this.get('config.currency');
        const locale = this.get('config.locale');
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }
    
    /**
     * Formatear fecha
     */
    formatDate(date) {
        const locale = this.get('config.locale');
        
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        return d.toLocaleDateString(locale);
    }
}

// Crear instancia global
const accountingState = new AccountingState();

// Exportar para uso en módulos
window.AccountingState = accountingState;

// Hacer disponible globalmente
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccountingState;
}