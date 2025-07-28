// ===================================
// EDUCONTA - Controlador Principal de Contabilidad
// ===================================

/**
 * Controlador principal que coordina todos los módulos de contabilidad
 */
class AccountingController {
    constructor() {
        this.state = window.AccountingState;
        this.modules = {};
        this.isInitialized = false;

        this.init();
    }

    async init() {
        console.log('🎮 Inicializando controlador de contabilidad');

        try {
            // Verificar autenticación
            await this.checkAuthentication();

            // Inicializar módulos
            this.initializeModules();

            // Configurar event listeners globales
            this.setupGlobalEventListeners();

            // Cargar datos iniciales
            await this.loadInitialData();

            this.isInitialized = true;
            console.log('✅ Controlador de contabilidad inicializado');

        } catch (error) {
            console.error('❌ Error inicializando controlador:', error);
            this.handleInitializationError(error);
        }
    }

    // ===================================
    // AUTENTICACIÓN
    // ===================================

    async checkAuthentication() {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('❌ No hay token, redirigiendo a login');
            window.location.href = '/login.html';
            return;
        }

        try {
            // Verificar token con el servidor (solo si no estamos en modo de prueba)
            const urlParams = new URLSearchParams(window.location.search);
            const skipAuth = urlParams.get('skipAuth') === 'true';

            if (skipAuth) {
                console.log('🔄 Saltando verificación de auth (modo prueba)');
                this.state.set('user', {
                    id: 'demo',
                    email: 'demo@educonta.com',
                    firstName: 'Usuario',
                    lastName: 'Demo'
                });
                this.state.set('isAuthenticated', true);
                return;
            }

            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    this.state.set('user', data.user);
                    this.state.set('isAuthenticated', true);
                    console.log('👤 Usuario autenticado:', data.user);
                } else {
                    throw new Error('Respuesta inválida del servidor');
                }
            } else {
                throw new Error(`Error HTTP: ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Error verificando autenticación:', error);
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    }

    // ===================================
    // INICIALIZACIÓN DE MÓDULOS
    // ===================================

    initializeModules() {
        console.log('📦 Inicializando módulos');

        // Inicializar dashboard
        if (window.AccountingDashboard) {
            this.modules.dashboard = new AccountingDashboard();
            console.log('📊 Dashboard inicializado');
        }

        // Suscribirse a cambios de estado para actualizar UI
        this.setupStateSubscriptions();
    }

    setupStateSubscriptions() {
        // Suscribirse a cambios en las estadísticas
        this.state.subscribe('stats', (stats) => {
            this.updateStatsDisplay(stats);
            if (this.modules.dashboard) {
                this.modules.dashboard.updateMetrics(stats);
            }
        });

        // Suscribirse a cambios en las cuentas
        this.state.subscribe('accounts', (accounts) => {
            this.updateAccountsDisplay(accounts);
            if (this.modules.dashboard) {
                this.modules.dashboard.updateCharts({ accounts, stats: this.state.get('stats') });
            }
        });

        // Suscribirse a cambios en las transacciones
        this.state.subscribe('transactions', (transactions) => {
            this.updateTransactionsDisplay(transactions);
        });

        // Suscribirse a cambios de loading
        this.state.subscribe('loading', (loading) => {
            this.updateLoadingStates(loading);
        });
    }

    // ===================================
    // CARGA DE DATOS
    // ===================================

    async loadInitialData() {
        console.log('📥 Cargando datos iniciales');

        this.state.set('loading.global', true);

        try {
            // Cargar en paralelo para mejor rendimiento
            await Promise.all([
                this.state.loadStats(),
                this.state.loadAccounts(),
                this.state.loadTransactions()
            ]);

            console.log('✅ Datos iniciales cargados');

        } catch (error) {
            console.error('❌ Error cargando datos iniciales:', error);
            this.showNotification('Error cargando datos iniciales: ' + error.message, 'error');
        } finally {
            this.state.set('loading.global', false);
        }
    }

    async refreshData() {
        console.log('🔄 Refrescando datos');
        await this.loadInitialData();
    }

    // ===================================
    // ACTUALIZACIÓN DE UI
    // ===================================

    updateStatsDisplay(stats) {
        console.log('📊 Actualizando display de estadísticas:', stats);

        // Actualizar métricas principales (elementos nuevos)
        this.updateElement('total-accounts', stats.totalAccounts || 0);
        this.updateElement('active-accounts', stats.activeAccounts || stats.totalAccounts || 0);
        this.updateElement('total-balance', this.state.formatCurrency(stats.totalBalance || 0));
        this.updateElement('pending-transactions', stats.pendingTransactions || 0);

        // Actualizar métricas originales del dashboard
        console.log('💰 Actualizando totalIncome:', stats.totalIncome, 'formatted:', this.state.formatCurrency(stats.totalIncome || 0));
        console.log('💸 Actualizando totalExpenses:', stats.totalExpenses, 'formatted:', this.state.formatCurrency(stats.totalExpenses || 0));

        // Forzar actualización inmediata
        setTimeout(() => {
            this.updateElement('monthlyIncome', this.state.formatCurrency(stats.totalIncome || 0));
            this.updateElement('monthlyExpenses', this.state.formatCurrency(stats.totalExpenses || 0));
            this.updateElement('netBalance', this.state.formatCurrency((stats.totalIncome || 0) - (stats.totalExpenses || 0)));
            this.updateElement('totalTransactions', stats.totalTransactions || 0);
            console.log('✅ Elementos de estadísticas actualizados forzadamente');
        }, 100);

        // Disparar evento personalizado para otros componentes
        window.dispatchEvent(new CustomEvent('statsUpdated', {
            detail: { stats }
        }));
    }

    updateAccountsDisplay(accounts) {
        console.log('🏦 Actualizando display de cuentas:', accounts.length);

        // Actualizar selectores de cuentas en formularios
        this.populateAccountSelects(accounts);

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('accountsUpdated', {
            detail: { accounts }
        }));
    }

    updateTransactionsDisplay(transactions) {
        console.log('💳 Actualizando display de transacciones:', transactions.length);

        // Renderizar transacciones en la sección correspondiente
        this.renderTransactionsList(transactions);

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('transactionsUpdated', {
            detail: { transactions }
        }));
    }

    renderTransactionsList(transactions) {
        console.log('🎨 Renderizando lista de transacciones:', transactions.length);

        let container = document.getElementById('transactionsList');

        // Si no existe el container, crearlo
        if (!container) {
            console.log('📦 Creando container de transacciones...');
            const section = document.getElementById('transactions-section');
            if (section) {
                section.innerHTML = `
                    <div class="header">
                        <h1 class="page-title">Movimientos Contables</h1>
                        <div class="header-actions">
                            <button class="btn btn-outline" onclick="refreshTransactions()">
                                <svg width="20" height="20" fill="currentColor">
                                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                                Actualizar
                            </button>
                        </div>
                    </div>
                    <div class="transactions-card">
                        <div class="card-header">
                            <h2 class="card-title">Historial de Transacciones</h2>
                        </div>
                        <div class="transaction-list" id="transactionsList">
                            <!-- Las transacciones se cargarán aquí -->
                        </div>
                    </div>
                `;
                container = document.getElementById('transactionsList');
            }
        }

        if (!container) {
            console.error('❌ No se pudo crear el container de transacciones');
            return;
        }

        console.log('✅ Container encontrado/creado');

        // Buscar elementos de estado después de crear el container
        const loading = document.getElementById('transactionsLoading');
        const empty = document.getElementById('transactionsEmpty');

        // Ocultar estados de carga y vacío
        if (loading) loading.style.display = 'none';
        if (empty) empty.style.display = 'none';

        if (!transactions || transactions.length === 0) {
            if (empty) empty.style.display = 'flex';
            return;
        }

        // Obtener facturas del localStorage
        const invoices = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');

        let html = '';
        transactions.forEach(transaction => {
            // Buscar si hay una factura asociada a esta transacción
            const relatedInvoice = invoices.find(inv =>
                inv.transactionId === transaction.id ||
                (inv.amount === transaction.amount &&
                    Math.abs(new Date(inv.createdAt) - new Date(transaction.date)) < 60000) // Mismo monto y creado en el mismo minuto
            );

            const isIncome = transaction.type === 'INCOME';
            const iconColor = isIncome ? 'var(--success)' : 'var(--error)';
            const amountClass = isIncome ? 'amount-income' : 'amount-expense';
            const icon = isIncome ? '💰' : '💸';

            html += `
                <div class="transaction-item" data-transaction-id="${transaction.id}">
                    <div class="transaction-info">
                        <div class="transaction-icon" style="background-color: ${iconColor}; color: white;">
                            ${icon}
                        </div>
                        <div class="transaction-details">
                            <h4>${transaction.description || 'Sin descripción'}</h4>
                            <div class="transaction-meta">
                                <p class="transaction-reference">Ref: ${transaction.reference || transaction.id}</p>
                                <p class="transaction-date">${this.formatDate(transaction.date)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="transaction-amount-section">
                        <div class="transaction-amount ${amountClass}">
                            ${this.formatCurrency(transaction.amount)}
                        </div>
                        <div class="transaction-actions">
                            <button class="btn btn-small btn-invoice" onclick="showInvoiceFromTransaction('${transaction.id}')">
                                <svg width="16" height="16" fill="currentColor">
                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                </svg>
                                ${relatedInvoice ? 'Ver Factura' : 'Generar Factura'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        console.log('📝 HTML generado para transacciones:', html.length, 'caracteres');
        container.innerHTML = html;
        console.log('✅ HTML insertado en container');
        
        // FORZAR VISIBILIDAD AUTOMÁTICAMENTE
        setTimeout(() => {
            // Forzar visibilidad del container
            container.style.display = 'block';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
            
            // Forzar visibilidad de cada transacción
            const transactionItems = container.querySelectorAll('.transaction-item');
            transactionItems.forEach((item, index) => {
                item.style.display = 'flex';
                item.style.visibility = 'visible';
                item.style.opacity = '1';
            });
            
            console.log(`✅ Forzada visibilidad de ${transactionItems.length} transacciones`);
        }, 100);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }

    updateLoadingStates(loading) {
        // Actualizar spinners de carga
        Object.entries(loading).forEach(([key, isLoading]) => {
            const spinner = document.getElementById(`${key}-loading`);
            if (spinner) {
                spinner.style.display = isLoading ? 'flex' : 'none';
            }
        });

        // Loading global
        const globalSpinner = document.getElementById('loadingSpinner');
        if (globalSpinner) {
            globalSpinner.style.display = loading.global ? 'flex' : 'none';
        }
    }

    // ===================================
    // ACCIONES DE FORMULARIOS
    // ===================================

    async handleIncomeForm(formData) {
        console.log('💰 Procesando formulario de ingreso:', formData);

        try {
            const transactionData = {
                date: formData.date || new Date().toISOString().split('T')[0],
                reference: formData.reference || `ING-${Date.now()}`,
                description: formData.description,
                amount: parseFloat(formData.amount),
                type: 'INCOME',
                debitAccountId: formData.debitAccount,
                creditAccountId: formData.creditAccount
            };

            await this.state.createTransaction(transactionData);
            this.showNotification('Ingreso registrado exitosamente', 'success');

            // Limpiar formulario
            const form = document.getElementById('incomeForm');
            if (form) form.reset();

        } catch (error) {
            console.error('❌ Error procesando ingreso:', error);
            this.showNotification('Error registrando ingreso: ' + error.message, 'error');
        }
    }

    async handleExpenseForm(formData) {
        console.log('💸 Procesando formulario de gasto:', formData);

        try {
            const transactionData = {
                date: formData.date || new Date().toISOString().split('T')[0],
                reference: formData.reference || `GAS-${Date.now()}`,
                description: formData.description,
                amount: parseFloat(formData.amount),
                type: 'EXPENSE',
                debitAccountId: formData.debitAccount,
                creditAccountId: formData.creditAccount
            };

            await this.state.createTransaction(transactionData);
            this.showNotification('Gasto registrado exitosamente', 'success');

            // Limpiar formulario
            const form = document.getElementById('expenseForm');
            if (form) form.reset();

        } catch (error) {
            console.error('❌ Error procesando gasto:', error);
            this.showNotification('Error registrando gasto: ' + error.message, 'error');
        }
    }

    async handleInvoiceForm(formData) {
        console.log('🧾 Procesando formulario de factura:', formData);

        try {
            // Primero crear la transacción
            const transactionData = {
                date: formData.date || new Date().toISOString().split('T')[0],
                reference: formData.reference || `FAC-${Date.now()}`,
                description: `Factura - ${formData.concept}`,
                amount: parseFloat(formData.amount),
                type: 'INCOME',
                debitAccountId: formData.debitAccount,
                creditAccountId: formData.creditAccount
            };

            await this.state.createTransaction(transactionData);
            this.showNotification('Factura generada exitosamente', 'success');

            // Limpiar formulario
            const form = document.getElementById('quickInvoiceForm');
            if (form) form.reset();

        } catch (error) {
            console.error('❌ Error procesando factura:', error);
            this.showNotification('Error generando factura: ' + error.message, 'error');
        }
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================

    setupGlobalEventListeners() {
        console.log('🎧 Configurando event listeners globales');

        // Formulario de ingresos
        const incomeForm = document.getElementById('incomeForm');
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(incomeForm);
                this.handleIncomeForm(Object.fromEntries(formData));
            });
        }

        // Formulario de gastos
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(expenseForm);
                this.handleExpenseForm(Object.fromEntries(formData));
            });
        }

        // Formulario de facturas
        const invoiceForm = document.getElementById('quickInvoiceForm');
        if (invoiceForm) {
            invoiceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(invoiceForm);
                this.handleInvoiceForm(Object.fromEntries(formData));
            });
        }

        // Botón de refresh
        const refreshBtn = document.querySelector('[onclick="refreshDashboard()"]');
        if (refreshBtn) {
            refreshBtn.onclick = () => this.refreshData();
        }

        // Toggle de tema
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
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

    populateAccountSelects(accounts) {
        const selects = [
            'debitAccountSelect',
            'creditAccountSelect',
            'expenseDebitAccountSelect',
            'expenseCreditAccountSelect',
            'invoiceDebitAccountSelect',
            'invoiceCreditAccountSelect'
        ];

        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">Seleccionar cuenta...</option>';

                accounts.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = `${account.code} - ${account.name}`;
                    if (account.id === currentValue) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        });
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Usar el sistema de notificaciones existente o crear uno nuevo
        if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            // Fallback simple
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Actualizar labels si existen
        const lightLabel = document.getElementById('light-label');
        const darkLabel = document.getElementById('dark-label');

        if (lightLabel && darkLabel) {
            lightLabel.classList.toggle('active', newTheme === 'light');
            darkLabel.classList.toggle('active', newTheme === 'dark');
        }

        console.log(`🎨 Tema cambiado a: ${newTheme}`);
    }

    handleInitializationError(error) {
        console.error('❌ Error de inicialización:', error);

        const container = document.querySelector('.main-content') || document.querySelector('main');
        if (container) {
            container.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 2rem;">
                    <div class="error-icon" style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                    <h2>Error de Inicialización</h2>
                    <p>No se pudo cargar el módulo de contabilidad.</p>
                    <p class="error-details" style="color: var(--text-light); margin: 1rem 0;">${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que se carguen las dependencias
    if (window.AccountingState) {
        window.accountingController = new AccountingController();
    } else {
        console.warn('⚠️ AccountingState no disponible, reintentando...');
        setTimeout(() => {
            if (window.AccountingState) {
                window.accountingController = new AccountingController();
            } else {
                console.error('❌ No se pudo inicializar el controlador');
            }
        }, 1000);
    }
});

// Exportar para uso global
window.AccountingController = AccountingController;

// Función global para mostrar factura desde transacción
window.showInvoiceFromTransaction = function(transactionId) {
    console.log('🧾 Mostrando factura para transacción:', transactionId);
    
    // Buscar factura relacionada
    const invoices = JSON.parse(localStorage.getItem('educonta-invoices') || '[]');
    let relatedInvoice = invoices.find(inv => inv.transactionId === transactionId);
    
    if (relatedInvoice) {
        // Si existe la factura, mostrarla
        if (window.invoiceViewer) {
            window.invoiceViewer.viewInvoice(relatedInvoice.id);
        } else {
            console.warn('⚠️ Visualizador de facturas no disponible');
        }
    } else {
        // Si no existe, generar una factura basada en la transacción
        generateInvoiceFromTransaction(transactionId);
    }
};

function generateInvoiceFromTransaction(transactionId) {
    // Obtener la transacción
    const transactions = window.AccountingState?.get('transactions') || [];
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
        console.warn('⚠️ Transacción no encontrada:', transactionId);
        return;
    }
    
    // Generar factura basada en la transacción
    const invoice = {
        id: 'inv-' + Date.now(),
        invoiceNumber: `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        studentName: extractStudentName(transaction.description) || 'Cliente',
        studentId: 'EST-' + String(Date.now()).slice(-3),
        studentGrade: 'N/A',
        concept: transaction.description || 'Servicio',
        amount: transaction.amount,
        discount: 0,
        finalAmount: transaction.amount,
        status: 'PAID',
        createdAt: transaction.date,
        paidAt: transaction.date,
        paymentMethod: 'Efectivo',
        transactionId: transactionId
    };
    
    // Guardar la factura
    const invoices = JSON.parse(localStorage.getItem('educonta-invoices') || '[]');
    invoices.push(invoice);
    localStorage.setItem('educonta-invoices', JSON.stringify(invoices));
    
    // Mostrar la factura
    if (window.invoiceViewer) {
        window.invoiceViewer.viewInvoice(invoice.id);
    }
}

function extractStudentName(description) {
    // Intentar extraer nombre del estudiante de la descripción
    const patterns = [
        /- (.+)$/,  // "Concepto - Nombre"
        /para (.+)$/i,  // "Pago para Nombre"
        /de (.+)$/i     // "Pago de Nombre"
    ];
    
    for (const pattern of patterns) {
        const match = description.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return null;
}   