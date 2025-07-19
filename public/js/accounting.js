// ===================================
// EDUCONTA - Gestión de Contabilidad
// ===================================

console.log('🚀 Página de contabilidad iniciada');

let currentUser = null;
let currentAccounts = [];
let currentTransactions = [];
let currentPage = 1;
let totalPages = 1;
let editingAccount = null;
let editingTransaction = null;
let viewingTransaction = null;
let activeTab = 'accounts';

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, iniciando verificación de autenticación');
    initializeTheme();
    checkAuth();
    setupEventListeners();
});

// ===================================
// GESTIÓN DE TEMA
// ===================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeLabels();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeLabels();
}

function updateThemeLabels() {
    const theme = document.documentElement.getAttribute('data-theme');
    const lightLabel = document.getElementById('light-label');
    const darkLabel = document.getElementById('dark-label');

    if (theme === 'dark') {
        lightLabel.classList.remove('active');
        darkLabel.classList.add('active');
    } else {
        lightLabel.classList.add('active');
        darkLabel.classList.remove('active');
    }
}

// ===================================
// AUTENTICACIÓN
// ===================================

async function checkAuth() {
    const token = localStorage.getItem('token');
    console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');

    if (!token) {
        console.log('❌ No hay token, redirigiendo a login');
        window.location.href = '/login';
        return;
    }

    try {
        console.log('🔍 Verificando token con el servidor...');
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 Respuesta del servidor:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            console.log('👤 Usuario autenticado:', currentUser);
            
            console.log('✅ Usuario autenticado, cargando página');
            initializePage();
        } else {
            console.log('❌ Token inválido, limpiando y redirigiendo');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        window.location.href = '/login';
    }
}

// ===================================
// INICIALIZACIÓN DE PÁGINA
// ===================================

function initializePage() {
    console.log('🏗️ Inicializando página de contabilidad');
    loadAccountingStats();
    loadAccounts();
    setDefaultDate();
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('report-date').value = today;
    document.getElementById('transaction-date').value = today;
}

// ===================================
// GESTIÓN DE TABS
// ===================================

function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');

    activeTab = tabName;

    // Load data for the selected tab
    if (tabName === 'accounts') {
        loadAccounts();
    } else if (tabName === 'transactions') {
        loadTransactions();
    }
}

// ===================================
// ESTADÍSTICAS
// ===================================

async function loadAccountingStats() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/accounting/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateAccountingStats(data.data);
        } else {
            console.error('Error loading accounting stats');
        }
    } catch (error) {
        console.error('Error loading accounting stats:', error);
        updateAccountingStats({
            totalAccounts: 0,
            activeAccounts: 0,
            totalBalance: 0,
            pendingTransactions: 0
        });
    }
}

function updateAccountingStats(stats) {
    document.getElementById('total-accounts').textContent = stats.totalAccounts || 0;
    document.getElementById('active-accounts').textContent = stats.activeAccounts || 0;
    document.getElementById('total-balance').textContent = formatCurrency(stats.totalBalance || 0);
    document.getElementById('pending-transactions').textContent = stats.pendingTransactions || 0;
}

// ===================================
// CUENTAS CONTABLES
// ===================================

async function loadAccounts() {
    const token = localStorage.getItem('token');
    const searchInput = document.getElementById('account-search-input');
    const typeFilter = document.getElementById('account-type-filter');
    const levelFilter = document.getElementById('account-level-filter');

    document.getElementById('accounts-loading').style.display = 'flex';

    try {
        const params = new URLSearchParams();

        if (searchInput.value.trim()) {
            params.append('search', searchInput.value.trim());
        }
        if (typeFilter.value) {
            params.append('type', typeFilter.value);
        }
        if (levelFilter.value) {
            params.append('level', levelFilter.value);
        }

        const response = await fetch(`/api/accounting/accounts?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentAccounts = data.data;
            updateAccountsTree();
            loadParentAccountOptions();
            loadAccountOptions();
        } else {
            showAlert('Error cargando cuentas', 'error');
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
        showAlert('Error de conexión', 'error');
    } finally {
        document.getElementById('accounts-loading').style.display = 'none';
    }
}

function updateAccountsTree() {
    const accountsTree = document.getElementById('accounts-tree');

    if (currentAccounts.length === 0) {
        accountsTree.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                No se encontraron cuentas
            </div>
        `;
        return;
    }

    // Organize accounts by hierarchy
    const accountsByLevel = {};
    currentAccounts.forEach(account => {
        if (!accountsByLevel[account.level]) {
            accountsByLevel[account.level] = [];
        }
        accountsByLevel[account.level].push(account);
    });

    let accountsHTML = '';
    
    // Sort by level and then by code
    Object.keys(accountsByLevel).sort().forEach(level => {
        accountsByLevel[level].sort((a, b) => a.code.localeCompare(b.code)).forEach(account => {
            accountsHTML += `
                <div class="account-item level-${account.level} fade-in">
                    <div class="account-header">
                        <div class="account-info">
                            <span class="account-code">${account.code}</span>
                            <span class="account-name">${account.name}</span>
                            <span class="account-type">${getAccountTypeLabel(account.type)}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span class="account-balance">${formatCurrency(account.balance || 0)}</span>
                            <div class="account-actions">
                                <button class="btn btn-sm btn-secondary" onclick="viewAccount('${account.id}')" title="Ver detalles">
                                    <svg width="14" height="14" fill="currentColor">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="editAccount('${account.id}')" title="Editar">
                                    <svg width="14" height="14" fill="currentColor">
                                        <path d="M11 4a2 2 0 114 4l-9 9-4 1 1-4 9-9z"/>
                                    </svg>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteAccount('${account.id}')" title="Eliminar">
                                    <svg width="14" height="14" fill="currentColor">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    });

    accountsTree.innerHTML = accountsHTML;
}

function getAccountTypeLabel(type) {
    const types = {
        'ASSET': 'Activo',
        'LIABILITY': 'Pasivo',
        'EQUITY': 'Patrimonio',
        'INCOME': 'Ingreso',
        'EXPENSE': 'Gasto'
    };
    return types[type] || type;
}

function loadParentAccountOptions() {
    const parentSelect = document.getElementById('parent-account');
    parentSelect.innerHTML = '<option value="">Sin cuenta padre</option>';

    const parentAccounts = currentAccounts.filter(acc => acc.level < 5);
    
    parentAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.code} - ${account.name}`;
        parentSelect.appendChild(option);
    });
}

function loadAccountOptions() {
    const debitSelect = document.getElementById('debit-account');
    const creditSelect = document.getElementById('credit-account');
    
    [debitSelect, creditSelect].forEach(select => {
        select.innerHTML = '<option value="">Seleccionar cuenta...</option>';
        
        currentAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.code} - ${account.name}`;
            select.appendChild(option);
        });
    });
}

// ===================================
// MODAL DE CUENTAS
// ===================================

function openAccountModal() {
    editingAccount = null;
    document.getElementById('account-modal-title').textContent = 'Nueva Cuenta';
    document.getElementById('account-form').reset();
    document.getElementById('account-level').value = 1;
    document.getElementById('account-modal').classList.add('show');
}

function closeAccountModal() {
    document.getElementById('account-modal').classList.remove('show');
    editingAccount = null;
}

function editAccount(accountId) {
    const account = currentAccounts.find(acc => acc.id === accountId);
    if (!account) return;

    editingAccount = account;
    document.getElementById('account-modal-title').textContent = 'Editar Cuenta';

    // Fill form
    document.getElementById('account-code').value = account.code || '';
    document.getElementById('account-name').value = account.name || '';
    document.getElementById('account-type').value = account.type || '';
    document.getElementById('parent-account').value = account.parentId || '';
    document.getElementById('account-level').value = account.level || 1;
    document.getElementById('initial-balance').value = account.balance || 0;
    document.getElementById('account-description').value = account.description || '';

    document.getElementById('account-modal').classList.add('show');
}

function viewAccount(accountId) {
    const account = currentAccounts.find(acc => acc.id === accountId);
    if (!account) return;

    showAlert(`Cuenta: ${account.code} - ${account.name}\nTipo: ${getAccountTypeLabel(account.type)}\nBalance: ${formatCurrency(account.balance || 0)}`, 'success');
}

async function deleteAccount(accountId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/accounting/accounts/${accountId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showAlert('Cuenta eliminada exitosamente', 'success');
            loadAccounts();
            loadAccountingStats();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error eliminando cuenta', 'error');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        showAlert('Error de conexión', 'error');
    }
}

// ===================================
// TRANSACCIONES
// ===================================

async function loadTransactions(page = 1, isSearch = false) {
    const token = localStorage.getItem('token');
    const searchInput = document.getElementById('transaction-search-input');
    const dateFromFilter = document.getElementById('date-from-filter');
    const dateToFilter = document.getElementById('date-to-filter');
    const typeFilter = document.getElementById('transaction-type-filter');
    const statusFilter = document.getElementById('transaction-status-filter');

    if (!isSearch) {
        document.getElementById('transactions-loading').style.display = 'flex';
    } else {
        searchInput.style.background = 'linear-gradient(90deg, var(--bg) 0%, var(--bg-secondary) 50%, var(--bg) 100%)';
        searchInput.style.backgroundSize = '200% 100%';
        searchInput.style.animation = 'shimmer 1s ease-in-out infinite';
    }

    try {
        const params = new URLSearchParams({
            page: page,
            limit: 20
        });

        if (searchInput.value.trim()) {
            params.append('search', searchInput.value.trim());
        }
        if (dateFromFilter.value) {
            params.append('dateFrom', dateFromFilter.value);
        }
        if (dateToFilter.value) {
            params.append('dateTo', dateToFilter.value);
        }
        if (typeFilter.value) {
            params.append('type', typeFilter.value);
        }
        if (statusFilter.value) {
            params.append('status', statusFilter.value);
        }

        const response = await fetch(`/api/accounting/transactions?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentTransactions = data.data;
            currentPage = data.pagination.currentPage;
            totalPages = data.pagination.totalPages;

            updateTransactionsTable();
            updateTransactionsPagination();
        } else {
            showAlert('Error cargando transacciones', 'error');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        showAlert('Error de conexión', 'error');
    } finally {
        if (!isSearch) {
            document.getElementById('transactions-loading').style.display = 'none';
        } else {
            searchInput.style.background = '';
            searchInput.style.backgroundSize = '';
            searchInput.style.animation = '';
        }
    }
}

function updateTransactionsTable() {
    const tbody = document.getElementById('transactions-table-body');

    if (currentTransactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    No se encontraron transacciones
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = currentTransactions.map(transaction => `
        <tr class="fade-in">
            <td>${formatDate(transaction.date)}</td>
            <td><strong>${transaction.reference}</strong></td>
            <td>${transaction.description}</td>
            <td>${transaction.debitAccount?.code} - ${transaction.debitAccount?.name || 'N/A'}</td>
            <td>${transaction.creditAccount?.code} - ${transaction.creditAccount?.name || 'N/A'}</td>
            <td><strong>${formatCurrency(transaction.amount)}</strong></td>
            <td>
                <span class="account-type">${getTransactionTypeLabel(transaction.type)}</span>
            </td>
            <td>
                <span class="status-badge status-${transaction.status.toLowerCase()}">
                    ${getTransactionStatusLabel(transaction.status)}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-secondary" onclick="viewTransaction('${transaction.id}')" title="Ver detalles">
                        <svg width="14" height="14" fill="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span class="btn-text">Ver</span>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editTransaction('${transaction.id}')" title="Editar">
                        <svg width="14" height="14" fill="currentColor">
                            <path d="M11 4a2 2 0 114 4l-9 9-4 1 1-4 9-9z"/>
                        </svg>
                        <span class="btn-text">Editar</span>
                    </button>
                    ${transaction.status === 'PENDING' ? `
                        <button class="btn btn-sm btn-success" onclick="approveTransactionFromTable('${transaction.id}')" title="Aprobar">
                            <svg width="14" height="14" fill="currentColor">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                            <span class="btn-text">Aprobar</span>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteTransaction('${transaction.id}')" title="Eliminar">
                        <svg width="14" height="14" fill="currentColor">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        <span class="btn-text">Eliminar</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateTransactionsPagination() {
    const pagination = document.getElementById('transactions-pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="loadTransactions(${currentPage - 1})">
            <svg width="16" height="16" fill="currentColor">
                <path d="M15 18l-6-6 6-6"/>
            </svg>
        </button>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadTransactions(${i})">
                ${i}
            </button>
        `;
    }

    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="loadTransactions(${currentPage + 1})">
            <svg width="16" height="16" fill="currentColor">
                <path d="M9 18l6-6-6-6"/>
            </svg>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

function getTransactionTypeLabel(type) {
    const types = {
        'INCOME': 'Ingreso',
        'EXPENSE': 'Egreso',
        'TRANSFER': 'Traslado'
    };
    return types[type] || type;
}

function getTransactionStatusLabel(status) {
    const statuses = {
        'PENDING': 'Pendiente',
        'APPROVED': 'Aprobado',
        'REJECTED': 'Rechazado'
    };
    return statuses[status] || status;
}

// ===================================
// MODAL DE TRANSACCIONES
// ===================================

function openTransactionModal() {
    editingTransaction = null;
    document.getElementById('transaction-modal-title').textContent = 'Nueva Transacción';
    document.getElementById('transaction-form').reset();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    
    document.getElementById('transaction-modal').classList.add('show');
}

function closeTransactionModal() {
    document.getElementById('transaction-modal').classList.remove('show');
    editingTransaction = null;
}

function editTransaction(transactionId) {
    const transaction = currentTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    editingTransaction = transaction;
    document.getElementById('transaction-modal-title').textContent = 'Editar Transacción';

    document.getElementById('transaction-date').value = transaction.date.split('T')[0];
    document.getElementById('transaction-reference').value = transaction.reference || '';
    document.getElementById('transaction-amount').value = transaction.amount || '';
    document.getElementById('transaction-type').value = transaction.type || '';
    document.getElementById('debit-account').value = transaction.debitAccountId || '';
    document.getElementById('credit-account').value = transaction.creditAccountId || '';
    document.getElementById('transaction-description').value = transaction.description || '';

    document.getElementById('transaction-modal').classList.add('show');
}

function viewTransaction(transactionId) {
    const transaction = currentTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    viewingTransaction = transaction;

    document.getElementById('view-transaction-date').textContent = formatDate(transaction.date);
    document.getElementById('view-transaction-reference').textContent = transaction.reference || '-';
    document.getElementById('view-transaction-amount').textContent = formatCurrency(transaction.amount);
    document.getElementById('view-transaction-type').textContent = getTransactionTypeLabel(transaction.type);
    document.getElementById('view-debit-account').textContent = `${transaction.debitAccount?.code} - ${transaction.debitAccount?.name}` || '-';
    document.getElementById('view-credit-account').textContent = `${transaction.creditAccount?.code} - ${transaction.creditAccount?.name}` || '-';
    document.getElementById('view-transaction-description').textContent = transaction.description || '-';
    document.getElementById('view-transaction-status').innerHTML = `
        <span class="status-badge status-${transaction.status.toLowerCase()}">
            ${getTransactionStatusLabel(transaction.status)}
        </span>
    `;
    document.getElementById('view-transaction-created-by').textContent = transaction.createdBy?.name || '-';
    document.getElementById('view-transaction-created-at').textContent = formatDate(transaction.createdAt);
    document.getElementById('view-transaction-updated-at').textContent = formatDate(transaction.updatedAt);

    const editBtn = document.getElementById('edit-transaction-btn');
    const approveBtn = document.getElementById('approve-transaction-btn');
    const rejectBtn = document.getElementById('reject-transaction-btn');

    editBtn.style.display = transaction.status === 'PENDING' ? 'inline-flex' : 'none';
    approveBtn.style.display = transaction.status === 'PENDING' ? 'inline-flex' : 'none';
    rejectBtn.style.display = transaction.status === 'PENDING' ? 'inline-flex' : 'none';

    document.getElementById('view-transaction-modal').classList.add('show');
}

function closeViewTransactionModal() {
    document.getElementById('view-transaction-modal').classList.remove('show');
    viewingTransaction = null;
}

function editFromViewTransaction() {
    if (!viewingTransaction) return;
    
    closeViewTransactionModal();
    editTransaction(viewingTransaction.id);
}

async function approveTransaction() {
    if (!viewingTransaction) return;
    await updateTransactionStatus(viewingTransaction.id, 'APPROVED');
}

async function rejectTransaction() {
    if (!viewingTransaction) return;
    await updateTransactionStatus(viewingTransaction.id, 'REJECTED');
}

async function approveTransactionFromTable(transactionId) {
    await updateTransactionStatus(transactionId, 'APPROVED');
}

async function updateTransactionStatus(transactionId, status) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/accounting/transactions/${transactionId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            const statusLabel = getTransactionStatusLabel(status);
            showAlert(`Transacción ${statusLabel.toLowerCase()} exitosamente`, 'success');
            closeViewTransactionModal();
            loadTransactions(currentPage);
            loadAccountingStats();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error actualizando estado', 'error');
        }
    } catch (error) {
        console.error('Error updating transaction status:', error);
        showAlert('Error de conexión', 'error');
    }
}

async function deleteTransaction(transactionId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/accounting/transactions/${transactionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showAlert('Transacción eliminada exitosamente', 'success');
            loadTransactions(currentPage);
            loadAccountingStats();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error eliminando transacción', 'error');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showAlert('Error de conexión', 'error');
    }
}

// ===================================
// REPORTES
// ===================================

async function generateBalanceSheet() {
    const reportDate = document.getElementById('report-date').value;
    if (!reportDate) {
        showAlert('Por favor selecciona una fecha', 'error');
        return;
    }

    const token = localStorage.getItem('token');
    document.getElementById('reports-loading').style.display = 'flex';

    try {
        const response = await fetch(`/api/accounting/reports/balance-sheet?date=${reportDate}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayBalanceSheet(data.data);
        } else {
            showAlert('Error generando balance', 'error');
        }
    } catch (error) {
        console.error('Error generating balance sheet:', error);
        showAlert('Error de conexión', 'error');
    } finally {
        document.getElementById('reports-loading').style.display = 'none';
    }
}

async function generateIncomeStatement() {
    const reportDate = document.getElementById('report-date').value;
    if (!reportDate) {
        showAlert('Por favor selecciona una fecha', 'error');
        return;
    }

    const token = localStorage.getItem('token');
    document.getElementById('reports-loading').style.display = 'flex';

    try {
        const response = await fetch(`/api/accounting/reports/income-statement?date=${reportDate}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayIncomeStatement(data.data);
        } else {
            showAlert('Error generando estado de resultados', 'error');
        }
    } catch (error) {
        console.error('Error generating income statement:', error);
        showAlert('Error de conexión', 'error');
    } finally {
        document.getElementById('reports-loading').style.display = 'none';
    }
}

function displayBalanceSheet(data) {
    document.getElementById('report-title').textContent = `Balance General - ${formatDate(document.getElementById('report-date').value)}`;
    
    const content = document.getElementById('reports-content');
    content.innerHTML = `
        <div style="padding: 2rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 1rem;">ACTIVOS</h3>
                    ${generateAccountSection(data.assets)}
                    <div style="border-top: 2px solid var(--primary); margin-top: 1rem; padding-top: 0.5rem;">
                        <strong>Total Activos: ${formatCurrency(data.totalAssets)}</strong>
                    </div>
                </div>
                <div>
                    <h3 style="color: var(--secondary); margin-bottom: 1rem;">PASIVOS Y PATRIMONIO</h3>
                    <h4 style="color: var(--text); margin-bottom: 0.5rem;">Pasivos</h4>
                    ${generateAccountSection(data.liabilities)}
                    <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
                        <strong>Total Pasivos: ${formatCurrency(data.totalLiabilities)}</strong>
                    </div>
                    
                    <h4 style="color: var(--text); margin: 1rem 0 0.5rem 0;">Patrimonio</h4>
                    ${generateAccountSection(data.equity)}
                    <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
                        <strong>Total Patrimonio: ${formatCurrency(data.totalEquity)}</strong>
                    </div>
                    
                    <div style="border-top: 2px solid var(--secondary); margin-top: 1rem; padding-top: 0.5rem;">
                        <strong>Total Pasivos y Patrimonio: ${formatCurrency(data.totalLiabilities + data.totalEquity)}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayIncomeStatement(data) {
    document.getElementById('report-title').textContent = `Estado de Resultados - ${formatDate(document.getElementById('report-date').value)}`;
    
    const content = document.getElementById('reports-content');
    content.innerHTML = `
        <div style="padding: 2rem;">
            <div style="max-width: 600px; margin: 0 auto;">
                <h3 style="color: var(--success); margin-bottom: 1rem;">INGRESOS</h3>
                ${generateAccountSection(data.income)}
                <div style="border-top: 1px solid var(--border); margin: 1rem 0; padding-top: 0.5rem;">
                    <strong>Total Ingresos: ${formatCurrency(data.totalIncome)}</strong>
                </div>
                
                <h3 style="color: var(--danger); margin-bottom: 1rem;">GASTOS</h3>
                ${generateAccountSection(data.expenses)}
                <div style="border-top: 1px solid var(--border); margin: 1rem 0; padding-top: 0.5rem;">
                    <strong>Total Gastos: ${formatCurrency(data.totalExpenses)}</strong>
                </div>
                
                <div style="border-top: 2px solid var(--primary); margin-top: 2rem; padding-top: 1rem; text-align: center;">
                    <h3 style="color: ${data.netIncome >= 0 ? 'var(--success)' : 'var(--danger)'};">
                        ${data.netIncome >= 0 ? 'UTILIDAD' : 'PÉRDIDA'} DEL EJERCICIO: ${formatCurrency(Math.abs(data.netIncome))}
                    </h3>
                </div>
            </div>
        </div>
    `;
}

function generateAccountSection(accounts) {
    if (!accounts || accounts.length === 0) {
        return '<p style="color: var(--text-light); font-style: italic;">No hay cuentas</p>';
    }

    return accounts.map(account => `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
            <span>${account.code} - ${account.name}</span>
            <span>${formatCurrency(account.balance)}</span>
        </div>
    `).join('');
}

// ===================================
// FORMULARIOS
// ===================================

function setupEventListeners() {
    // Account form
    const accountForm = document.getElementById('account-form');
    if (accountForm) {
        accountForm.addEventListener('submit', handleAccountSubmit);
    }

    // Transaction form
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }

    // Parent account change updates level
    const parentAccountSelect = document.getElementById('parent-account');
    if (parentAccountSelect) {
        parentAccountSelect.addEventListener('change', function() {
            const levelInput = document.getElementById('account-level');
            if (this.value) {
                const parentAccount = currentAccounts.find(acc => acc.id === this.value);
                if (parentAccount) {
                    levelInput.value = Math.min(parentAccount.level + 1, 5);
                }
            } else {
                levelInput.value = 1;
            }
        });
    }

    // Search inputs with debounce
    const accountSearchInput = document.getElementById('account-search-input');
    if (accountSearchInput) {
        accountSearchInput.addEventListener('input', debounce(() => loadAccounts(), 300));
    }

    const transactionSearchInput = document.getElementById('transaction-search-input');
    if (transactionSearchInput) {
        transactionSearchInput.addEventListener('input', debounce(() => loadTransactions(1, true), 300));
    }

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            if (e.target.id === 'account-modal') {
                closeAccountModal();
            } else if (e.target.id === 'transaction-modal') {
                closeTransactionModal();
            } else if (e.target.id === 'view-transaction-modal') {
                closeViewTransactionModal();
            }
        }
    });
}

async function handleAccountSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const saveBtn = document.getElementById('account-save-btn');
    const saveText = document.getElementById('account-save-text');
    const saveLoading = document.getElementById('account-save-loading');

    // Show loading
    saveBtn.disabled = true;
    saveText.style.display = 'none';
    saveLoading.style.display = 'inline-block';

    const formData = {};

    // Required fields
    formData.code = document.getElementById('account-code').value.trim();
    formData.name = document.getElementById('account-name').value.trim();
    formData.type = document.getElementById('account-type').value;
    formData.level = parseInt(document.getElementById('account-level').value);
    formData.balance = parseFloat(document.getElementById('initial-balance').value) || 0;

    // Optional fields
    const parentAccountId = document.getElementById('parent-account').value;
    if (parentAccountId) {
        formData.parentId = parentAccountId;
    }

    const description = document.getElementById('account-description').value.trim();
    if (description) {
        formData.description = description;
    }

    try {
        const isEditing = editingAccount !== null;
        const url = isEditing ? `/api/accounting/accounts/${editingAccount.id}` : '/api/accounting/accounts';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const action = isEditing ? 'actualizada' : 'creada';
            showAlert(`Cuenta ${action} exitosamente`, 'success');
            closeAccountModal();
            loadAccounts();
            loadAccountingStats();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error guardando cuenta', 'error');
        }
    } catch (error) {
        console.error('Error saving account:', error);
        showAlert('Error de conexión', 'error');
    } finally {
        // Hide loading
        saveBtn.disabled = false;
        saveText.style.display = 'inline';
        saveLoading.style.display = 'none';
    }
}

async function handleTransactionSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const saveBtn = document.getElementById('transaction-save-btn');
    const saveText = document.getElementById('transaction-save-text');
    const saveLoading = document.getElementById('transaction-save-loading');

    // Show loading
    saveBtn.disabled = true;
    saveText.style.display = 'none';
    saveLoading.style.display = 'inline-block';

    const formData = {};

    // Required fields
    formData.date = document.getElementById('transaction-date').value;
    formData.reference = document.getElementById('transaction-reference').value.trim();
    formData.amount = parseFloat(document.getElementById('transaction-amount').value);
    formData.type = document.getElementById('transaction-type').value;
    formData.debitAccountId = document.getElementById('debit-account').value;
    formData.creditAccountId = document.getElementById('credit-account').value;
    formData.description = document.getElementById('transaction-description').value.trim();

    try {
        const isEditing = editingTransaction !== null;
        const url = isEditing ? `/api/accounting/transactions/${editingTransaction.id}` : '/api/accounting/transactions';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const action = isEditing ? 'actualizada' : 'creada';
            showAlert(`Transacción ${action} exitosamente`, 'success');
            closeTransactionModal();
            loadTransactions(currentPage);
            loadAccountingStats();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error guardando transacción', 'error');
        }
    } catch (error) {
        console.error('Error saving transaction:', error);
        showAlert('Error de conexión', 'error');
    } finally {
        // Hide loading
        saveBtn.disabled = false;
        saveText.style.display = 'inline';
        saveLoading.style.display = 'none';
    }
}

// ===================================
// UTILIDADES
// ===================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    const alertMessage = document.getElementById('alert-message');

    alert.className = `alert ${type} show`;
    alertMessage.textContent = message;

    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}