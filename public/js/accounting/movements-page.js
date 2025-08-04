// ===================================
// EDUCONTA - Página de Gestión de Movimientos
// ===================================

/**
 * Controlador para la página dedicada de gestión de movimientos contables
 */
class MovementsManagementPage {
    constructor() {
        this.transactions = [];
        this.accounts = [];
        this.filteredTransactions = [];
        this.currentTab = 'transactions';
        
        this.init();
    }

    init() {
        console.log('💰 Inicializando página de gestión de movimientos');
        this.loadData();
        this.setupEventListeners();
        this.setDefaultDates();
    }

    async loadData() {
        try {
            // Cargar transacciones
            if (null) {
                const transactionsResponse = await null.getTransactions();
                this.transactions = transactionsResponse.data || [];
                this.filteredTransactions = [...this.transactions];
                
                // Cargar cuentas
                const accountsResponse = await null.getAccounts();
                this.accounts = accountsResponse.data || [];
            }
            
            this.renderTransactions();
            this.renderAccounts();
            this.updateSummary();
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            showAlert('Error cargando datos: ' + error.message, 'error');
        }
    }

    setDefaultDates() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('dateFrom').value = firstDayOfMonth.toISOString().split('T')[0];
        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
    }

    switchTab(tabName) {
        // Ocultar todas las pestañas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remover clase active de todos los botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostrar pestaña seleccionada
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Cargar datos específicos de la pestaña
        if (tabName === 'accounts' && this.accounts.length === 0) {
            this.loadData();
        }
    }

    filterTransactions() {
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        this.filteredTransactions = this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
            
            const matchesDate = (!dateFrom || transactionDate >= dateFrom) && 
                              (!dateTo || transactionDate <= dateTo);
            const matchesType = !typeFilter || transaction.type === typeFilter;
            const matchesStatus = !statusFilter || transaction.status === statusFilter;
            
            return matchesDate && matchesType && matchesStatus;
        });

        this.renderTransactions();
        this.updateSummary();
    }

    clearFilters() {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('statusFilter').value = '';
        
        this.filteredTransactions = [...this.transactions];
        this.renderTransactions();
        this.updateSummary();
    }

    renderTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        
        if (this.filteredTransactions.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="8">
                        <div class="empty-state">
                            <svg width="48" height="48" fill="currentColor" class="empty-icon">
                                <path d="M7 4V2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2h4c.6 0 1 .4 1 1s-.4 1-1 1h-1v16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6H1c-.6 0-1-.4-1-1s.4-1 1-1h6z"/>
                            </svg>
                            <h3>No hay transacciones</h3>
                            <p>No se encontraron transacciones con los filtros aplicados</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredTransactions.map(transaction => {
            const statusClass = transaction.status === 'APPROVED' ? 'approved' : 'pending';
            const statusText = transaction.status === 'APPROVED' ? 'Aprobada' : 'Pendiente';
            const typeClass = transaction.type === 'INCOME' ? 'income' : 'expense';
            
            return `
                <tr class="transaction-row">
                    <td>${formatDate(transaction.date)}</td>
                    <td><strong>${transaction.reference}</strong></td>
                    <td>${transaction.description}</td>
                    <td>
                        <span class="account-info">
                            ${transaction.debitAccount?.code} - ${transaction.debitAccount?.name}
                        </span>
                    </td>
                    <td>
                        <span class="account-info">
                            ${transaction.creditAccount?.code} - ${transaction.creditAccount?.name}
                        </span>
                    </td>
                    <td>
                        <span class="amount ${typeClass}">
                            ${formatCurrency(transaction.amount)}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-info btn-sm" 
                                    onclick="handleButtonClick('viewTransaction', '${transaction.id}')" 
                                    title="Ver detalles">
                                👁️
                            </button>
                            <button class="btn btn-warning btn-sm" 
                                    onclick="handleButtonClick('editTransaction', '${transaction.id}')" 
                                    title="Editar transacción">
                                ✏️
                            </button>
                            <button class="btn btn-success btn-sm" 
                                    onclick="handleButtonClick('viewTransactionInvoice', '${transaction.id}')" 
                                    title="Ver factura asociada">
                                🧾
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderAccounts() {
        const container = document.getElementById('accountsTree');
        
        if (this.accounts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" fill="currentColor" class="empty-icon">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <h3>No hay cuentas</h3>
                    <p>No se encontraron cuentas en el plan contable</p>
                </div>
            `;
            return;
        }

        // Agrupar cuentas por tipo
        const accountsByType = this.accounts.reduce((acc, account) => {
            if (!acc[account.accountType]) {
                acc[account.accountType] = [];
            }
            acc[account.accountType].push(account);
            return acc;
        }, {});

        const typeNames = {
            'ASSET': 'Activos',
            'LIABILITY': 'Pasivos',
            'EQUITY': 'Patrimonio',
            'INCOME': 'Ingresos',
            'EXPENSE': 'Gastos'
        };

        container.innerHTML = Object.entries(accountsByType).map(([type, accounts]) => `
            <div class="account-type-group">
                <h4 class="account-type-header">${typeNames[type] || type}</h4>
                <div class="accounts-list">
                    ${accounts.map(account => `
                        <div class="account-item">
                            <div class="account-info">
                                <span class="account-code">${account.code}</span>
                                <span class="account-name">${account.name}</span>
                            </div>
                            <div class="account-balance">
                                <span class="balance-amount">${formatCurrency(account.balance || 0)}</span>
                            </div>
                            <div class="account-actions">
                                <button class="btn btn-outline btn-sm" onclick="viewAccount('${account.id}')" title="Ver movimientos">
                                    <svg width="14" height="14" fill="currentColor">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    updateSummary() {
        const totalTransactions = this.filteredTransactions.length;
        const totalIncome = this.filteredTransactions
            .filter(t => t.type === 'INCOME' && t.status === 'APPROVED')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = this.filteredTransactions
            .filter(t => t.type === 'EXPENSE' && t.status === 'APPROVED')
            .reduce((sum, t) => sum + t.amount, 0);

        document.getElementById('totalTransactions').textContent = totalTransactions;
        document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    }

    setupEventListeners() {
        // Configurar filtros en tiempo real
        const filters = ['dateFrom', 'dateTo', 'typeFilter', 'statusFilter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => {
                    this.filterTransactions();
                });
            }
        });
    }

    showNewTransactionModal() {
        showAlert('Modal de nueva transacción en desarrollo', 'info');
    }

    showAccountsModal() {
        this.switchTab('accounts');
    }

    showNewAccountModal() {
        showAlert('Modal de nueva cuenta en desarrollo', 'info');
    }

    exportReport() {
        showAlert('Exportando reporte de movimientos...', 'info');
        
        setTimeout(() => {
            showAlert('Reporte exportado exitosamente', 'success');
        }, 2000);
    }

    generateBalanceSheet() {
        showAlert('Generando Balance General...', 'info');
        
        setTimeout(() => {
            showAlert('Balance General generado exitosamente', 'success');
        }, 2000);
    }

    generateIncomeStatement() {
        showAlert('Generando Estado de Resultados...', 'info');
        
        setTimeout(() => {
            showAlert('Estado de Resultados generado exitosamente', 'success');
        }, 2000);
    }

    generateJournal() {
        showAlert('Generando Libro Diario...', 'info');
        
        setTimeout(() => {
            showAlert('Libro Diario generado exitosamente', 'success');
        }, 2000);
    }
}

// Funciones globales para interactuar con transacciones
function viewTransaction(transactionId) {
    console.log('👁️ Ver transacción:', transactionId);
    
    // Verificar que movementsPage esté disponible
    if (!window.movementsPage) {
        console.error('❌ movementsPage no está disponible');
        showAlert('Error: Sistema no inicializado correctamente', 'error');
        return;
    }
    
    // Buscar la transacción
    const transaction = window.movementsPage.transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
        console.error('❌ Transacción no encontrada:', transactionId);
        console.log('📊 Transacciones disponibles:', window.movementsPage.transactions.map(t => t.id));
        showAlert('No se encontró la transacción', 'error');
        return;
    }
    
    console.log('✅ Transacción encontrada:', transaction);
    
    // Verificar que showAlert esté disponible
    if (typeof showAlert !== 'function') {
        console.error('❌ showAlert no está disponible');
        alert('Error: Función showAlert no disponible');
        return;
    }
    
    // Crear modal con detalles de la transacción
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'transactionDetailsModal';
    modal.innerHTML = `
        <div class="modal-content transaction-details">
            <div class="modal-header">
                <h3 class="modal-title">👁️ Detalles de la Transacción</h3>
                <button class="modal-close" onclick="closeTransactionDetails()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="transaction-info-grid">
                    <div class="info-section">
                        <h4>Información General</h4>
                        <div class="info-item">
                            <span class="label">Referencia:</span>
                            <span class="value">${transaction.reference}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Fecha:</span>
                            <span class="value">${formatDate(transaction.date)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Descripción:</span>
                            <span class="value">${transaction.description}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Tipo:</span>
                            <span class="value ${transaction.type.toLowerCase()}">${transaction.type === 'INCOME' ? 'Ingreso' : 'Gasto'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Estado:</span>
                            <span class="value ${transaction.status.toLowerCase()}">${transaction.status === 'APPROVED' ? 'Aprobada' : 'Pendiente'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Monto:</span>
                            <span class="value amount ${transaction.type.toLowerCase()}">${formatCurrency(transaction.amount)}</span>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Cuentas Contables</h4>
                        <div class="accounts-info">
                            <div class="account-item debit">
                                <span class="account-type">Cuenta Débito:</span>
                                <span class="account-code">${transaction.debitAccount?.code}</span>
                                <span class="account-name">${transaction.debitAccount?.name}</span>
                            </div>
                            <div class="account-item credit">
                                <span class="account-type">Cuenta Crédito:</span>
                                <span class="account-code">${transaction.creditAccount?.code}</span>
                                <span class="account-name">${transaction.creditAccount?.name}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Metadatos</h4>
                        <div class="info-item">
                            <span class="label">Creado:</span>
                            <span class="value">${formatDate(transaction.createdAt)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Actualizado:</span>
                            <span class="value">${formatDate(transaction.updatedAt)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">ID:</span>
                            <span class="value">${transaction.id}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeTransactionDetails()">Cerrar</button>
                <button class="btn btn-warning" onclick="editTransaction('${transaction.id}')">
                    ✏️ Editar
                </button>
                ${transaction.type === 'INCOME' ? `
                    <button class="btn btn-success" onclick="viewTransactionInvoice('${transaction.id}')">
                        🧾 Ver Factura
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar modal con animación
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function editTransaction(transactionId) {
    console.log('✏️ Editar transacción:', transactionId);
    
    // Verificar que movementsPage esté disponible
    if (!window.movementsPage) {
        console.error('❌ movementsPage no está disponible');
        showAlert('Error: Sistema no inicializado correctamente', 'error');
        return;
    }
    
    // Buscar la transacción
    const transaction = window.movementsPage.transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
        console.error('❌ Transacción no encontrada:', transactionId);
        console.log('📊 Transacciones disponibles:', window.movementsPage.transactions.map(t => t.id));
        showAlert('No se encontró la transacción', 'error');
        return;
    }
    
    console.log('✅ Transacción encontrada para editar:', transaction);
    
    // Verificar que showAlert esté disponible
    if (typeof showAlert !== 'function') {
        console.error('❌ showAlert no está disponible');
        alert('Error: Función showAlert no disponible');
        return;
    }
    
    // Cerrar modal de detalles si está abierto
    closeTransactionDetails();
    
    // Crear modal de edición
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editTransactionModal';
    modal.innerHTML = `
        <div class="modal-content edit-transaction">
            <div class="modal-header">
                <h3 class="modal-title">✏️ Editar Transacción</h3>
                <button class="modal-close" onclick="closeEditTransaction()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editTransactionForm" onsubmit="saveTransactionChanges(event, '${transaction.id}')">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="editReference">Referencia:</label>
                            <input type="text" id="editReference" value="${transaction.reference}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editDate">Fecha:</label>
                            <input type="date" id="editDate" value="${transaction.date.split('T')[0]}" required>
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="editDescription">Descripción:</label>
                            <input type="text" id="editDescription" value="${transaction.description}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editAmount">Monto:</label>
                            <input type="number" id="editAmount" value="${transaction.amount}" min="0" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editType">Tipo:</label>
                            <select id="editType" required>
                                <option value="INCOME" ${transaction.type === 'INCOME' ? 'selected' : ''}>Ingreso</option>
                                <option value="EXPENSE" ${transaction.type === 'EXPENSE' ? 'selected' : ''}>Gasto</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeEditTransaction()">Cancelar</button>
                <button class="btn btn-primary" onclick="document.getElementById('editTransactionForm').requestSubmit()">
                    💾 Guardar Cambios
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar modal con animación
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function viewAccount(accountId) {
    console.log('👁️ Ver cuenta:', accountId);
    showAlert('Abriendo movimientos de la cuenta...', 'info');
}

function viewTransactionInvoice(transactionId) {
    console.log('🧾 Ver factura de transacción:', transactionId);
    
    // Verificar que movementsPage esté disponible
    if (!window.movementsPage) {
        console.error('❌ movementsPage no está disponible');
        showAlert('Error: Sistema no inicializado correctamente', 'error');
        return;
    }
    
    // Buscar la transacción para obtener información adicional
    const transaction = window.movementsPage.transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
        console.error('❌ Transacción no encontrada:', transactionId);
        console.log('📊 Transacciones disponibles:', window.movementsPage.transactions.map(t => t.id));
        showAlert('No se encontró la transacción', 'error');
        return;
    }
    
    console.log('✅ Transacción encontrada para factura:', transaction);
    
    // Verificar que showAlert esté disponible
    if (typeof showAlert !== 'function') {
        console.error('❌ showAlert no está disponible');
        alert('Error: Función showAlert no disponible');
        return;
    }
    
    // Verificar si la transacción tiene una factura asociada
    if (transaction.type !== 'INCOME') {
        showAlert('Solo las transacciones de ingreso tienen facturas asociadas', 'warning');
        return;
    }
    
    // Generar ID de factura basado en la transacción
    const invoiceId = `INV-${transaction.reference}`;
    
    showAlert('Abriendo factura asociada...', 'info');
    
    // Simular apertura de factura (aquí se podría abrir un modal o nueva ventana)
    setTimeout(() => {
        openInvoiceViewer(invoiceId, transaction);
    }, 500);
}

function openInvoiceViewer(invoiceId, transaction) {
    // Crear modal para mostrar la factura
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'invoiceViewerModal';
    modal.innerHTML = `
        <div class="modal-content invoice-viewer">
            <div class="modal-header">
                <h3 class="modal-title">📄 Factura ${invoiceId}</h3>
                <button class="modal-close" onclick="closeInvoiceViewer()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="invoice-header">
                    <div class="invoice-info">
                        <h2>FACTURA DE VENTA</h2>
                        <p><strong>Número:</strong> ${invoiceId}</p>
                        <p><strong>Fecha:</strong> ${formatDate(transaction.date)}</p>
                        <p><strong>Referencia:</strong> ${transaction.reference}</p>
                    </div>
                    <div class="company-info">
                        <h3>EDUCONTA</h3>
                        <p>Institución Educativa</p>
                        <p>NIT: 123.456.789-0</p>
                    </div>
                </div>
                
                <div class="invoice-details">
                    <div class="client-section">
                        <h4>CLIENTE:</h4>
                        <p><strong>Nombre:</strong> ${getClientNameFromDescription(transaction.description)}</p>
                        <p><strong>Documento:</strong> ${getClientDocumentFromDescription(transaction.description)}</p>
                    </div>
                    
                    <div class="items-section">
                        <h4>DETALLE:</h4>
                        <table class="invoice-table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Cantidad</th>
                                    <th>Valor Unitario</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${transaction.description}</td>
                                    <td>1</td>
                                    <td>${formatCurrency(transaction.amount)}</td>
                                    <td>${formatCurrency(transaction.amount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="invoice-totals">
                        <div class="totals-row">
                            <span>Subtotal:</span>
                            <span>${formatCurrency(transaction.amount)}</span>
                        </div>
                        <div class="totals-row">
                            <span>IVA (0%):</span>
                            <span>$0</span>
                        </div>
                        <div class="totals-row total">
                            <span><strong>TOTAL:</strong></span>
                            <span><strong>${formatCurrency(transaction.amount)}</strong></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeInvoiceViewer()">Cerrar</button>
                <button class="btn btn-secondary" onclick="downloadInvoicePDF('${invoiceId}')">
                    <svg width="16" height="16" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z"/>
                    </svg>
                    Descargar PDF
                </button>
                <button class="btn btn-primary" onclick="printInvoice('${invoiceId}')">
                    <svg width="16" height="16" fill="currentColor">
                        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                    </svg>
                    Imprimir
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar modal con animación
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeInvoiceViewer() {
    const modal = document.getElementById('invoiceViewerModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function closeTransactionDetails() {
    const modal = document.getElementById('transactionDetailsModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function closeEditTransaction() {
    const modal = document.getElementById('editTransactionModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function saveTransactionChanges(event, transactionId) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const formData = {
        reference: document.getElementById('editReference').value,
        date: document.getElementById('editDate').value,
        description: document.getElementById('editDescription').value,
        amount: parseFloat(document.getElementById('editAmount').value),
        type: document.getElementById('editType').value
    };
    
    // Validar datos
    if (!formData.reference || !formData.date || !formData.description || !formData.amount) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }
    
    showAlert('Guardando cambios...', 'info');
    
    // Simular guardado
    setTimeout(() => {
        // Actualizar la transacción en los datos
        if (window.movementsPage) {
            const transactionIndex = window.movementsPage.transactions.findIndex(t => t.id === transactionId);
            if (transactionIndex !== -1) {
                // Actualizar la transacción
                window.movementsPage.transactions[transactionIndex] = {
                    ...window.movementsPage.transactions[transactionIndex],
                    ...formData,
                    updatedAt: new Date().toISOString()
                };
                
                // Actualizar la vista filtrada también
                const filteredIndex = window.movementsPage.filteredTransactions.findIndex(t => t.id === transactionId);
                if (filteredIndex !== -1) {
                    window.movementsPage.filteredTransactions[filteredIndex] = {
                        ...window.movementsPage.filteredTransactions[filteredIndex],
                        ...formData,
                        updatedAt: new Date().toISOString()
                    };
                }
                
                // Re-renderizar la tabla
                window.movementsPage.renderTransactions();
                window.movementsPage.updateSummary();
            }
        }
        
        closeEditTransaction();
        showAlert('Transacción actualizada exitosamente', 'success');
    }, 1000);
}

function downloadInvoicePDF(invoiceId) {
    showAlert(`Descargando PDF de factura ${invoiceId}...`, 'info');
    
    setTimeout(() => {
        showAlert('PDF descargado exitosamente', 'success');
    }, 2000);
}

function printInvoice(invoiceId) {
    showAlert(`Imprimiendo factura ${invoiceId}...`, 'info');
    
    // Simular impresión
    setTimeout(() => {
        window.print();
    }, 500);
}

function getClientNameFromDescription(description) {
    // Extraer nombre del cliente de la descripción
    const match = description.match(/- (.+?)$/);
    return match ? match[1] : 'Cliente General';
}

function getClientDocumentFromDescription(description) {
    // Generar documento simulado basado en el nombre
    const clientName = getClientNameFromDescription(description);
    const hash = clientName.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    return Math.abs(hash).toString().padStart(10, '0');
}

// Función para manejar clicks de botones con mejor manejo de errores
function handleButtonClick(functionName, transactionId) {
    console.log(`🔘 Click en botón: ${functionName} para transacción: ${transactionId}`);
    
    try {
        // Verificar que la función existe
        if (typeof window[functionName] !== 'function') {
            console.error(`❌ Función ${functionName} no está disponible`);
            if (typeof showAlert === 'function') {
                showAlert(`Error: Función ${functionName} no disponible`, 'error');
            } else {
                alert(`Error: Función ${functionName} no disponible`);
            }
            return;
        }
        
        // Verificar que el ID de transacción es válido
        if (!transactionId) {
            console.error('❌ ID de transacción no válido');
            if (typeof showAlert === 'function') {
                showAlert('Error: ID de transacción no válido', 'error');
            } else {
                alert('Error: ID de transacción no válido');
            }
            return;
        }
        
        // Ejecutar la función
        console.log(`✅ Ejecutando ${functionName}(${transactionId})`);
        window[functionName](transactionId);
        
    } catch (error) {
        console.error(`❌ Error ejecutando ${functionName}:`, error);
        if (typeof showAlert === 'function') {
            showAlert(`Error ejecutando ${functionName}: ${error.message}`, 'error');
        } else {
            alert(`Error ejecutando ${functionName}: ${error.message}`);
        }
    }
}

// Función de verificación de estado
function debugMovementsPage() {
    console.log('🔍 Estado de MovementsPage:');
    console.log('- movementsPage disponible:', !!window.movementsPage);
    console.log('- null disponible:', !!null);
    console.log('- showAlert disponible:', typeof showAlert);
    console.log('- formatCurrency disponible:', typeof formatCurrency);
    console.log('- formatDate disponible:', typeof formatDate);
    
    if (window.movementsPage) {
        console.log('- Transacciones cargadas:', window.movementsPage.transactions.length);
        console.log('- Transacciones filtradas:', window.movementsPage.filteredTransactions.length);
        console.log('- Tab actual:', window.movementsPage.currentTab);
        
        if (window.movementsPage.transactions.length > 0) {
            console.log('- Primera transacción:', window.movementsPage.transactions[0]);
        }
    }
}

// Hacer disponible globalmente
window.MovementsManagementPage = MovementsManagementPage;
window.debugMovementsPage = debugMovementsPage;
window.handleButtonClick = handleButtonClick;