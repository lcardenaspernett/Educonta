// ===================================
// EDUCONTA - Gestión de Plan de Cuentas
// ===================================

// Estado global para cuentas
let accountsData = [];
let filteredAccounts = [];
let accountsTree = [];

// ===================================
// INICIALIZACIÓN
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('📊 Módulo de Plan de Cuentas cargado');
    initializeAccountsModule();
});

function initializeAccountsModule() {
    loadAccounts();
    setupAccountsEventListeners();
}

function setupAccountsEventListeners() {
    // Filtros
    const typeFilter = document.getElementById('account-type-filter');
    const levelFilter = document.getElementById('account-level-filter');
    const searchFilter = document.getElementById('account-search-input');

    if (typeFilter) typeFilter.addEventListener('change', filterAccounts);
    if (levelFilter) levelFilter.addEventListener('change', filterAccounts);
    if (searchFilter) searchFilter.addEventListener('input', debounce(filterAccounts, 300));

    // Formulario de cuenta
    const accountForm = document.getElementById('account-form');
    if (accountForm) accountForm.addEventListener('submit', createAccount);
}

// ===================================
// CARGA DE DATOS
// ===================================

async function loadAccounts() {
    try {
        showAccountsLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/accounting-simple/accounts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
            accountsData = result.data || [];
            accountsTree = result.tree || buildAccountTree(accountsData);

            renderAccountsTree();
            updateAccountsStats();
            populateAccountSelects();

            console.log(`✅ ${accountsData.length} cuentas cargadas`);
        } else {
            throw new Error(result.error || 'Error al cargar cuentas');
        }

    } catch (error) {
        console.error('❌ Error cargando cuentas:', error);
        showNotification('Error al cargar el plan de cuentas: ' + error.message, 'error');

        // Mostrar estado de error
        const container = document.getElementById('accountsTree');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Error al cargar cuentas</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="loadAccounts()">Reintentar</button>
                </div>
            `;
        }
    } finally {
        showAccountsLoading(false);
    }
}

// ===================================
// RENDERIZADO
// ===================================

function renderAccountsTree() {
    const container = document.getElementById('accounts-tree');
    if (!container) return;

    if (!accountsData || accountsData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No hay cuentas registradas</h3>
                <p>Comienza creando tu plan de cuentas</p>
                <button class="btn btn-primary" onclick="openAccountModal()">
                    <svg width="16" height="16" fill="currentColor">
                        <path d="M8 4a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H4a1 1 0 110-2h3V5a1 1 0 011-1z"/>
                    </svg>
                    Crear Primera Cuenta
                </button>
            </div>
        `;
        return;
    }

    // Renderizar estructura jerárquica simplificada
    container.innerHTML = renderHierarchicalAccounts();
}

function renderHierarchicalAccounts() {
    // Agrupar cuentas por tipo
    const accountsByType = {
        'ASSET': [],
        'LIABILITY': [],
        'EQUITY': [],
        'INCOME': [],
        'EXPENSE': []
    };

    accountsData.forEach(account => {
        if (accountsByType[account.accountType]) {
            accountsByType[account.accountType].push(account);
        }
    });

    // Calcular totales por tipo
    const typeTotals = {};
    Object.keys(accountsByType).forEach(type => {
        typeTotals[type] = accountsByType[type].reduce((sum, account) => {
            return sum + calculateAccountBalance(account);
        }, 0);
    });

    let html = '<div class="accounts-hierarchy">';

    // Renderizar cada categoría principal
    const categories = [
        { type: 'ASSET', label: 'Activos', icon: '🏦', color: 'asset' },
        { type: 'LIABILITY', label: 'Pasivos', icon: '💳', color: 'liability' },
        { type: 'EQUITY', label: 'Patrimonio', icon: '💰', color: 'equity' },
        { type: 'INCOME', label: 'Ingresos', icon: '📈', color: 'income' },
        { type: 'EXPENSE', label: 'Gastos', icon: '📉', color: 'expense' }
    ];

    categories.forEach(category => {
        const accounts = accountsByType[category.type] || [];
        const total = typeTotals[category.type] || 0;
        const count = accounts.length;

        html += `
            <div class="account-category ${category.color}">
                <div class="category-header" onclick="toggleCategory('${category.type}')">
                    <div class="category-info">
                        <span class="category-icon">${category.icon}</span>
                        <div class="category-details">
                            <h3 class="category-title">${category.label}</h3>
                            <span class="category-count">${count} cuenta${count !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div class="category-meta">
                        <span class="category-total ${total >= 0 ? 'positive' : 'negative'}">
                            ${formatCurrency(total)}
                        </span>
                        <button class="category-toggle" id="toggle-${category.type}">
                            <svg width="16" height="16" fill="currentColor" class="chevron-icon">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="category-accounts" id="accounts-${category.type}" style="display: none;">
                    ${renderCategoryAccounts(accounts)}
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function renderCategoryAccounts(accounts) {
    if (!accounts || accounts.length === 0) {
        return `
            <div class="no-accounts">
                <p>No hay cuentas en esta categoría</p>
                <button class="btn btn-sm btn-primary" onclick="openAccountModal()">
                    Crear cuenta
                </button>
            </div>
        `;
    }

    // Organizar cuentas por jerarquía
    const organizedAccounts = organizeAccountsByHierarchy(accounts);

    let html = '<div class="accounts-list">';
    organizedAccounts.forEach(account => {
        html += renderAccountItem(account, 0);
    });
    html += '</div>';

    return html;
}

function renderAccountItem(account, depth = 0) {
    const hasChildren = account.children && account.children.length > 0;
    const hasMovements = account._count && (account._count.debitTransactions > 0 || account._count.creditTransactions > 0);
    const balance = calculateAccountBalance(account);

    let html = `
        <div class="account-item level-${account.level || 1}" data-account-id="${account.id}" style="margin-left: ${depth * 20}px;">
            <div class="account-header ${hasChildren ? 'has-children' : ''} ${hasMovements ? 'has-movements' : ''}">
                <div class="account-main-info">
                    ${hasChildren ? `
                        <button class="account-toggle" onclick="toggleAccountChildren('${account.id}')">
                            <svg width="12" height="12" fill="currentColor" class="toggle-icon">
                                <path d="M4.5 6l3 3 3-3"/>
                            </svg>
                        </button>
                    ` : '<div class="account-spacer"></div>'}
                    
                    <div class="account-info">
                        <span class="account-code">${account.code}</span>
                        <span class="account-name">${account.name}</span>
                        <span class="account-type-badge ${account.accountType.toLowerCase()}">
                            ${getAccountTypeLabel(account.accountType)}
                        </span>
                    </div>
                </div>
                
                <div class="account-meta">
                    <span class="account-balance ${balance >= 0 ? 'positive' : 'negative'}">
                        ${formatCurrency(balance)}
                    </span>
                    
                    ${hasMovements ? `
                        <span class="account-movements">
                            ${(account._count.debitTransactions || 0) + (account._count.creditTransactions || 0)} mov.
                        </span>
                    ` : ''}
                    
                    <div class="account-actions">
                        <button class="btn-icon" onclick="viewAccountDetails('${account.id}')" title="Ver detalles">
                            <svg width="16" height="16" fill="currentColor">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM9.5 8a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="editAccount('${account.id}')" title="Editar">
                            <svg width="16" height="16" fill="currentColor">
                                <path d="M11 4a2 2 0 114 4l-9 9-4 1 1-4 9-9z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteAccount('${account.id}')" title="Eliminar">
                            <svg width="16" height="16" fill="currentColor">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            ${hasChildren ? `
                <div class="account-children" id="children-${account.id}">
                    ${account.children.map(child => renderAccountItem(child, depth + 1)).join('')}
                </div>
            ` : ''}
        </div>
    `;

    return html;
}

// ===================================
// FILTROS
// ===================================

function filterAccounts() {
    const typeFilter = document.getElementById('account-type-filter')?.value;
    const levelFilter = document.getElementById('account-level-filter')?.value;
    const searchFilter = document.getElementById('account-search-input')?.value?.toLowerCase();

    filteredAccounts = accountsData.filter(account => {
        // Filtro por tipo
        if (typeFilter && account.accountType !== typeFilter) {
            return false;
        }

        // Filtro por nivel
        if (levelFilter && account.level !== parseInt(levelFilter)) {
            return false;
        }

        // Filtro por búsqueda
        if (searchFilter) {
            const searchMatch =
                account.code.toLowerCase().includes(searchFilter) ||
                account.name.toLowerCase().includes(searchFilter);
            if (!searchMatch) return false;
        }



        return true;
    });

    renderAccountsTree();
    updateFilterStats();
}

function clearFilters() {
    const typeFilter = document.getElementById('account-type-filter');
    const levelFilter = document.getElementById('account-level-filter');
    const searchFilter = document.getElementById('account-search-input');
    
    if (typeFilter) typeFilter.value = '';
    if (levelFilter) levelFilter.value = '';
    if (searchFilter) searchFilter.value = '';

    filteredAccounts = [];
    renderAccountsTree();
    updateFilterStats();
}

// ===================================
// ACCIONES DE CUENTAS
// ===================================

function showCreateAccountModal() {
    const modal = document.getElementById('account-modal');
    if (modal) {
        // Limpiar formulario
        const form = modal.querySelector('form');
        if (form) form.reset();

        // Poblar select de cuentas padre
        populateParentAccountSelect();

        modal.style.display = 'flex';
    }
}

function openAccountModal() {
    showCreateAccountModal();
}

async function createAccount(event) {
    event.preventDefault();

    const accountData = {
        code: document.getElementById('account-code').value,
        name: document.getElementById('account-name').value,
        accountType: document.getElementById('account-type').value,
        parentId: document.getElementById('parent-account').value || null,
        level: parseInt(document.getElementById('account-level').value || '1'),
        initialBalance: parseFloat(document.getElementById('initial-balance').value || '0'),
        description: document.getElementById('account-description').value
    };

    try {
        showLoading(true);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/accounting/accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(accountData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('Cuenta creada exitosamente', 'success');
            closeAccountModal();
            loadAccounts(); // Recargar cuentas
        } else {
            throw new Error(result.error || 'Error al crear cuenta');
        }

    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function editAccount(accountId) {
    const account = accountsData.find(acc => acc.id === accountId);
    if (!account) return;

    // TODO: Implementar modal de edición
    console.log('Editar cuenta:', account);
    showNotification('Funcionalidad de edición en desarrollo', 'info');
}

async function deleteAccount(accountId) {
    const account = accountsData.find(acc => acc.id === accountId);
    if (!account) return;

    if (!confirm(`¿Estás seguro de eliminar la cuenta "${account.code} - ${account.name}"?`)) {
        return;
    }

    try {
        showLoading(true);

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/accounting/accounts/${accountId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('Cuenta eliminada exitosamente', 'success');
            loadAccounts(); // Recargar cuentas
        } else {
            throw new Error(result.error || 'Error al eliminar cuenta');
        }

    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function viewAccountDetails(accountId) {
    const account = accountsData.find(acc => acc.id === accountId);
    if (!account) return;

    // TODO: Implementar modal de detalles
    console.log('Ver detalles de cuenta:', account);
    showNotification('Funcionalidad de detalles en desarrollo', 'info');
}

// ===================================
// FUNCIONES AUXILIARES
// ===================================

function organizeAccountsByHierarchy(accounts) {
    const accountMap = new Map();
    const rootAccounts = [];

    // Crear mapa de cuentas
    accounts.forEach(account => {
        accountMap.set(account.id, { ...account, children: [] });
    });

    // Construir jerarquía
    accounts.forEach(account => {
        const accountWithChildren = accountMap.get(account.id);

        if (account.parentId && accountMap.has(account.parentId)) {
            const parent = accountMap.get(account.parentId);
            parent.children.push(accountWithChildren);
        } else {
            rootAccounts.push(accountWithChildren);
        }
    });

    // Ordenar por código
    const sortByCode = (a, b) => a.code.localeCompare(b.code, undefined, { numeric: true });

    rootAccounts.sort(sortByCode);
    rootAccounts.forEach(account => {
        if (account.children.length > 0) {
            account.children.sort(sortByCode);
        }
    });

    return rootAccounts;
}

function buildAccountTree(accounts) {
    return organizeAccountsByHierarchy(accounts);
}

function calculateAccountBalance(account) {
    // Usar el balance que viene directamente del backend
    return account.balance || 0;
}

function getAccountTypeLabel(type) {
    const labels = {
        'ASSET': 'Activo',
        'LIABILITY': 'Pasivo',
        'EQUITY': 'Patrimonio',
        'INCOME': 'Ingreso',
        'EXPENSE': 'Gasto'
    };
    return labels[type] || type;
}

function populateParentAccountSelect() {
    const select = document.getElementById('parent-account');
    if (!select) return;

    select.innerHTML = '<option value="">Sin cuenta padre</option>';

    // Solo mostrar cuentas que pueden ser padres (nivel 1-4)
    const parentAccounts = accountsData.filter(account => account.level < 5);

    parentAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.code} - ${account.name}`;
        select.appendChild(option);
    });
}

function populateAccountSelects() {
    // Poblar selects de cuentas en otros formularios
    const selects = document.querySelectorAll('.account-select');

    selects.forEach(select => {
        select.innerHTML = '<option value="">Seleccionar cuenta...</option>';

        accountsData.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.code} - ${account.name}`;
            select.appendChild(option);
        });
    });
}

function toggleCategory(categoryType) {
    const accountsContainer = document.getElementById(`accounts-${categoryType}`);
    const toggleButton = document.getElementById(`toggle-${categoryType}`);

    if (accountsContainer && toggleButton) {
        const isExpanded = accountsContainer.style.display !== 'none';

        accountsContainer.style.display = isExpanded ? 'none' : 'block';
        toggleButton.classList.toggle('expanded', !isExpanded);
        
        // Rotar el ícono
        const chevronIcon = toggleButton.querySelector('.chevron-icon');
        if (chevronIcon) {
            chevronIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }
}

function toggleAccountChildren(accountId) {
    const childrenContainer = document.getElementById(`children-${accountId}`);
    const toggleButton = document.querySelector(`[onclick="toggleAccountChildren('${accountId}')"]`);

    if (childrenContainer && toggleButton) {
        const isExpanded = childrenContainer.style.display !== 'none';

        childrenContainer.style.display = isExpanded ? 'none' : 'block';
        toggleButton.classList.toggle('expanded', !isExpanded);
    }
}

function updateAccountsStats() {
    const totalAccounts = accountsData.length;
    const activeAccounts = accountsData.filter(acc => acc.isActive).length;
    const accountsByType = {};

    accountsData.forEach(account => {
        accountsByType[account.accountType] = (accountsByType[account.accountType] || 0) + 1;
    });

    // Actualizar elementos del DOM si existen
    updateElement('total-accounts', totalAccounts);
    updateElement('active-accounts', activeAccounts);

    console.log('📊 Stats actualizadas:', { totalAccounts, activeAccounts, accountsByType });
}

function updateFilterStats() {
    const filterInfo = document.getElementById('filter-info');

    if (filterInfo) {
        if (filteredAccounts.length > 0 && filteredAccounts.length < accountsData.length) {
            filterInfo.textContent = `Mostrando ${filteredAccounts.length} de ${accountsData.length} cuentas`;
            filterInfo.style.display = 'block';
        } else {
            filterInfo.style.display = 'none';
        }
    }
}

function showAccountsLoading(show) {
    const container = document.getElementById('accountsTree');
    const loadingEl = document.getElementById('accounts-loading');

    if (show) {
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Cargando plan de cuentas...</p>
                </div>
            `;
        }
    }

    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
    }
}

// ===================================
// UTILIDADES
// ===================================

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

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount || 0);
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
        element.classList.remove('loading');
    }
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Agregar al DOM
    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 100);

    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
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
    }
}

function closeAccountModal() {
    closeModal('account-modal');
}

// Exportar funciones para uso global
window.AccountsModule = {
    loadAccounts,
    filterAccounts,
    clearFilters,
    showCreateAccountModal,
    createAccount,
    editAccount,
    deleteAccount,
    viewAccountDetails,
    toggleAccountChildren,
    toggleCategory
};

// Hacer funciones disponibles globalmente para onclick
window.toggleCategory = toggleCategory;
window.toggleAccountChildren = toggleAccountChildren;
window.editAccount = editAccount;
window.deleteAccount = deleteAccount;
window.viewAccountDetails = viewAccountDetails;