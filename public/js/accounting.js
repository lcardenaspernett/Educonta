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
    
    // Verificar si venimos de otra página con usuario ya autenticado
    const urlParams = new URLSearchParams(window.location.search);
    const token = localStorage.getItem('token');
    
    if (urlParams.get('skipAuth') === 'true' && token) {
        console.log('🔄 Saltando verificación de auth, usuario ya verificado');
        // Crear un usuario básico para evitar errores
        currentUser = {
            id: 'temp',
            email: 'temp@temp.com',
            firstName: 'Usuario',
            lastName: 'Autenticado'
        };
        initializePage();
    } else if (token) {
        checkAuth();
    } else {
        console.log('❌ No hay token, redirigiendo a login');
        window.location.href = '/login.html';
    }
    
    setupEventListeners();
});

// ===================================
// GESTIÓN DE TEMA - VERSIÓN FINAL CORREGIDA
// ===================================

// Variable para prevenir múltiples inicializaciones
let themeInitialized = false;

function initializeTheme() {
    // Solo inicializar una vez para evitar conflictos
    if (themeInitialized) {
        console.log('🎨 Tema ya inicializado, saltando...');
        return;
    }
    
    console.log('🎨 Inicializando tema en módulo de contabilidad...');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Aplicar tema al documento
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Asegurar que el CSS de tema está presente
    ensureThemeCSS();
    
    // Marcar como inicializado
    themeInitialized = true;
    
    // Actualizar labels del interruptor con verificación
    setTimeout(() => {
        updateThemeLabels();
    }, 100); // Pequeño delay para asegurar que el DOM está listo
    
    console.log(`✅ Tema aplicado: ${savedTheme}`);
}

function toggleTheme() {
    console.log('🔄 Cambiando tema...');
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    console.log(`🔄 Cambio: ${currentTheme} → ${newTheme}`);

    // Aplicar nuevo tema al documento INMEDIATAMENTE
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Guardar en localStorage INMEDIATAMENTE
    localStorage.setItem('theme', newTheme);
    
    console.log(`✅ Tema cambiado a: ${newTheme}`);
    
    // FORZAR actualización de labels inmediatamente SIN ASYNC
    updateThemeLabelsForced(newTheme);
    
    console.log('✅ Cambio de tema completado exitosamente');
}

// Nueva función que fuerza la actualización sin verificaciones async
function updateThemeLabelsForced(forcedTheme) {
    console.log('🏷️ FORZANDO actualización de labels del tema...');
    
    const theme = forcedTheme || document.documentElement.getAttribute('data-theme') || 'light';
    
    console.log('🔍 Tema forzado:', theme);
    
    const lightLabel = document.getElementById('light-label');
    const darkLabel = document.getElementById('dark-label');

    // ✅ VERIFICAR que los elementos existen
    if (!lightLabel || !darkLabel) {
        console.warn('⚠️ Elementos de tema no encontrados');
        return;
    }

    // Remover TODAS las clases activas
    lightLabel.classList.remove('active');
    darkLabel.classList.remove('active');
    
    // Aplicar clase según el tema forzado
    if (theme === 'dark') {
        darkLabel.classList.add('active');
        console.log('🌙 Modo oscuro FORZADO');
    } else {
        lightLabel.classList.add('active');
        console.log('☀️ Modo claro FORZADO');
    }
    
    // Verificar que se aplicó correctamente
    console.log('🔍 Verificación inmediata:', {
        lightActive: lightLabel.classList.contains('active'),
        darkActive: darkLabel.classList.contains('active'),
        themeEnDOM: document.documentElement.getAttribute('data-theme')
    });
}

function updateThemeLabels() {
    console.log('🏷️ Actualizando labels del tema...');
    
    // Obtener tema de diferentes fuentes para asegurar consistencia
    const documentTheme = document.documentElement.getAttribute('data-theme');
    const savedTheme = localStorage.getItem('theme');
    const theme = documentTheme || savedTheme || 'light';
    
    console.log('🔍 Debug tema:', { documentTheme, savedTheme, finalTheme: theme });
    
    const lightLabel = document.getElementById('light-label');
    const darkLabel = document.getElementById('dark-label');

    // ✅ VERIFICAR que los elementos existen antes de usarlos
    if (!lightLabel || !darkLabel) {
        console.warn('⚠️ Elementos de tema no encontrados, intentando reparar...');
        
        // Intentar buscar elementos alternativos
        const allLabels = document.querySelectorAll('.theme-label');
        if (allLabels.length >= 2) {
            const light = allLabels[0];
            const dark = allLabels[1];
            
            light.classList.remove('active');
            dark.classList.remove('active');
            
            if (theme === 'dark') {
                dark.classList.add('active');
                console.log('🌙 Modo oscuro activado (alternativo)');
            } else {
                light.classList.add('active');
                console.log('☀️ Modo claro activado (alternativo)');
            }
        } else {
            console.error('❌ No se pudieron encontrar elementos de tema para actualizar');
        }
        return;
    }

    // Remover clases activas existentes
    lightLabel.classList.remove('active');
    darkLabel.classList.remove('active');
    
    // Verificar estado actual de las clases antes del cambio
    console.log('🔍 Estado antes del cambio:', {
        lightActive: lightLabel.classList.contains('active'),
        darkActive: darkLabel.classList.contains('active')
    });
    
    if (theme === 'dark') {
        darkLabel.classList.add('active');
        console.log('🌙 Modo oscuro activado');
        console.log('🔍 Estado después del cambio:', {
            lightActive: lightLabel.classList.contains('active'),
            darkActive: darkLabel.classList.contains('active')
        });
    } else {
        lightLabel.classList.add('active');
        console.log('☀️ Modo claro activado');
        console.log('🔍 Estado después del cambio:', {
            lightActive: lightLabel.classList.contains('active'),
            darkActive: darkLabel.classList.contains('active')
        });
    }
}

// Función para asegurar que el CSS de tema está presente
function ensureThemeCSS() {
    if (!document.getElementById('contabilidad-theme-css')) {
        const css = `
        /* CSS específico para el interruptor de tema en contabilidad */
        .theme-label {
            color: var(--text-light);
            transition: all 0.3s ease;
            cursor: pointer;
            user-select: none;
        }
        
        .theme-label.active {
            color: var(--primary);
            font-weight: 600;
        }
        
        .theme-toggle {
            position: relative;
            width: 50px;
            height: 25px;
            background: var(--bg-secondary);
            border: 2px solid var(--border);
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        .theme-toggle::before {
            content: '';
            position: absolute;
            top: 1px;
            left: 1px;
            width: 19px;
            height: 19px;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            border-radius: 50%;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }
        
        [data-theme="dark"] .theme-toggle::before {
            transform: translateX(25px);
            background: linear-gradient(135deg, var(--accent), #7c3aed);
            box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
        }
        
        /* Mejorar variables CSS para mejor compatibilidad */
        :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --accent: #8b5cf6;
            --text-light: #6b7280;
            --bg-secondary: #f8fafc;
            --border: rgba(255, 255, 255, 0.2);
        }
        
        [data-theme="dark"] {
            --primary: #3b82f6;
            --primary-dark: #2563eb;
            --accent: #a855f7;
            --text-light: #d1d5db;
            --bg-secondary: #1e293b;
            --border: rgba(255, 255, 255, 0.1);
        }
        `;
        
        const style = document.createElement('style');
        style.id = 'contabilidad-theme-css';
        style.textContent = css;
        document.head.appendChild(style);
        
        console.log('✅ CSS de tema para contabilidad agregado');
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
        window.location.href = '/login.html';
        return;
    }

    try {
        console.log('🔍 Verificando token con el servidor...');
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 Respuesta del servidor:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('📄 Datos recibidos:', data);
            
            if (data.success && data.user) {
                currentUser = data.user;
                console.log('👤 Usuario autenticado:', currentUser);
                console.log('✅ Usuario autenticado, cargando página');
                initializePage();
            } else {
                console.log('❌ Respuesta inválida del servidor:', data);
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            }
        } else {
            console.log('❌ Error HTTP:', response.status);
            
            // Intentar leer el error del servidor
            try {
                const errorData = await response.json();
                console.log('❌ Error del servidor:', errorData);
            } catch (e) {
                console.log('❌ No se pudo leer el error del servidor');
            }
            
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        console.error('❌ Stack trace:', error.stack);
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }
}

// ===================================
// INICIALIZACIÓN DE PÁGINA
// ===================================

async function initializePage() {
    console.log('🏗️ Inicializando página de contabilidad');
    
    // Inicializar dashboard si está disponible
    if (window.AccountingDashboard) {
        try {
            window.accountingDashboard = new AccountingDashboard();
            console.log('📊 Dashboard de contabilidad inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando dashboard:', error);
        }
    } else {
        console.warn('⚠️ AccountingDashboard no está disponible');
    }
    
    setDefaultDate();
    
    // Cargar datos en secuencia para asegurar que el dashboard reciba todo
    await loadAccountingStats();
    await loadAccounts();
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
        const response = await fetch('/api/accounting-simple/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📊 Datos recibidos del servidor:', data);
            updateAccountingStats(data.data);
        } else {
            console.error('Error loading accounting stats:', response.status, response.statusText);
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
    console.log('📊 Actualizando estadísticas:', stats);
    
    // Solo actualizar dashboard si está disponible, sino actualizar DOM directamente
    if (window.accountingDashboard) {
        console.log('📊 Actualizando a través del dashboard');
        window.accountingDashboard.updateMetrics(stats);
        window.accountingDashboard.updateCharts({
            accounts: currentAccounts || [],
            stats: stats
        });
    } else {
        console.log('📊 Actualizando DOM directamente');
        // Actualizar elementos del DOM directamente como fallback
        document.getElementById('total-accounts').textContent = stats.totalAccounts || 0;
        document.getElementById('active-accounts').textContent = stats.activeAccounts || 0;
        document.getElementById('total-balance').textContent = formatCurrency(stats.totalBalance || 0);
        document.getElementById('pending-transactions').textContent = stats.pendingTransactions || 0;
    }
    
    // Disparar evento para otros componentes que puedan estar escuchando
    window.dispatchEvent(new CustomEvent('dataLoaded', { 
        detail: { 
            stats: stats,
            accounts: currentAccounts || []
        } 
    }));
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

        if (searchInput?.value.trim()) {
            params.append('search', searchInput.value.trim());
        }
        if (typeFilter?.value) {
            params.append('type', typeFilter.value);
        }
        if (levelFilter?.value) {
            params.append('level', levelFilter.value);
        }

        const response = await fetch(`/api/accounting-simple/accounts?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('🔧 ACCOUNTS LOADED:', {
                count: data.data.length,
                summary: data.summary,
                firstAccount: data.data[0]?.code,
                lastAccount: data.data[data.data.length - 1]?.code
            });
            currentAccounts = data.data;
            updateAccountsTree();
            loadParentAccountOptions();
            loadAccountOptions();
            
            // Actualizar dashboard con las cuentas cargadas
            if (window.accountingDashboard) {
                window.accountingDashboard.updateCharts({
                    accounts: currentAccounts,
                    stats: {} // Las stats se cargan por separado
                });
            }
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

    // Renderizar estructura jerárquica con categorías principales
    accountsTree.innerHTML = renderHierarchicalAccountsStructure();
}

function renderHierarchicalAccountsStructure() {
    // Agrupar cuentas por tipo
    const accountsByType = {
        'ASSET': [],
        'LIABILITY': [],
        'EQUITY': [],
        'INCOME': [],
        'EXPENSE': []
    };

    currentAccounts.forEach(account => {
        if (accountsByType[account.accountType]) {
            accountsByType[account.accountType].push(account);
        }
    });

    // Calcular totales por tipo (SOLO cuentas hijas, NO cuentas padre)
    const typeTotals = {};
    Object.keys(accountsByType).forEach(type => {
        typeTotals[type] = accountsByType[type].reduce((sum, account) => {
            // Solo sumar cuentas HIJAS (que tienen parentId)
            if (account.parentId) {
                return sum + (account.balance || 0);
            }
            return sum;
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
                    ${renderCategoryAccountsList(accounts)}
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function renderCategoryAccountsList(accounts) {
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
        html += renderAccountItemStructure(account, 0);
    });
    html += '</div>';

    return html;
}

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

function renderAccountItemStructure(account, depth = 0) {
    const hasChildren = account.children && account.children.length > 0;
    const hasMovements = account._count && (account._count.debitTransactions > 0 || account._count.creditTransactions > 0);
    
    // Calcular balance: si es cuenta padre, sumar hijas; si no, usar balance propio
    let balance = account.balance || 0;
    if (hasChildren && account.children.length > 0) {
        balance = account.children.reduce((sum, child) => sum + (child.balance || 0), 0);
    }

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
                    
                    <div class="account-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn btn-sm btn-secondary" onclick="viewAccount('${account.id}')" title="Ver detalles">
                            <svg width="14" height="14" fill="currentColor">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            <span class="btn-text">Ver</span>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="editAccount('${account.id}')" title="Editar">
                            <svg width="14" height="14" fill="currentColor">
                                <path d="M11 4a2 2 0 114 4l-9 9-4 1 1-4 9-9z"/>
                            </svg>
                            <span class="btn-text">Editar</span>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAccount('${account.id}')" title="Eliminar">
                            <svg width="14" height="14" fill="currentColor">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            <span class="btn-text">Eliminar</span>
                        </button>
                    </div>
                </div>
            </div>
            
            ${hasChildren ? `
                <div class="account-children" id="children-${account.id}" style="display: none;">
                    ${account.children.map(child => renderAccountItemStructure(child, depth + 1)).join('')}
                </div>
            ` : ''}
        </div>
    `;

    return html;
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
        const response = await fetch(`/api/accounting-simple/accounts/${accountId}`, {
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

// 🔧 FIX: Función loadTransactions modificada para respetar preventAutoReload
async function loadTransactions(page = 1, isSearch = false, forceReload = false) {
    // Si hay una actualización de estado en proceso y no es forzada, no recargar
    if (preventAutoReload && !forceReload && !isSearch) {
        console.log('🚫 Recarga preventiva bloqueada para evitar sobrescribir estado actualizado');
        return;
    }

    const token = localStorage.getItem('token');
    const searchInput = document.getElementById('transaction-search-input');
    const dateFromFilter = document.getElementById('date-from-filter');
    const dateToFilter = document.getElementById('date-to-filter');
    const typeFilter = document.getElementById('transaction-type-filter');
    const statusFilter = document.getElementById('transaction-status-filter');

    // Mostrar indicador de búsqueda en tiempo real
    if (isSearch && searchInput) {
        searchInput.style.background = 'linear-gradient(90deg, var(--bg) 0%, var(--bg-secondary) 50%, var(--bg) 100%)';
        searchInput.style.backgroundSize = '200% 100%';
        searchInput.style.animation = 'shimmer 1s ease-in-out infinite';
    } else if (!isSearch) {
        document.getElementById('transactions-loading').style.display = 'flex';
    }

    try {
        const params = new URLSearchParams({
            page: page,
            limit: 20
        });

        if (searchInput?.value.trim()) {
            params.append('search', searchInput.value.trim());
        }
        if (dateFromFilter?.value) {
            params.append('dateFrom', dateFromFilter.value);
        }
        if (dateToFilter?.value) {
            params.append('dateTo', dateToFilter.value);
        }
        if (typeFilter?.value) {
            params.append('type', typeFilter.value);
        }
        if (statusFilter?.value) {
            params.append('status', statusFilter.value);
        }

        console.log('🔍 Cargando transacciones:', { 
            page, 
            isSearch, 
            forceReload, 
            preventAutoReload,
            params: params.toString() 
        });

        const response = await fetch(`/api/accounting-simple/transactions?${params}`, {
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
            
            console.log(`✅ ${currentTransactions.length} transacciones cargadas`);
        } else {
            showAlert('Error cargando transacciones', 'error');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        showAlert('Error de conexión', 'error');
    } finally {
        // Limpiar indicadores de loading
        if (isSearch && searchInput) {
            searchInput.style.background = '';
            searchInput.style.backgroundSize = '';
            searchInput.style.animation = '';
        } else if (!isSearch) {
            document.getElementById('transactions-loading').style.display = 'none';
        }
    }
}

// 🔧 FIX: Función mejorada para actualizar tabla con estado correcto
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
        <tr class="fade-in" data-transaction-id="${transaction.id}">
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
                <span class="status-badge status-${transaction.status.toLowerCase()}" 
                      data-status="${transaction.status}">
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

    // 🔧 FIX: Agregar animación de actualización a filas modificadas
    tbody.querySelectorAll('tr[data-transaction-id]').forEach(row => {
        const transactionId = row.dataset.transactionId;
        const statusBadge = row.querySelector('.status-badge');
        
        // Destacar transacciones recién actualizadas
        if (statusBadge && statusBadge.dataset.status !== 'PENDING') {
            row.style.background = 'var(--success-light)';
            setTimeout(() => {
                row.style.background = '';
            }, 2000);
        }
    });
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

// ===================================
// 🔧 FIX DEFINITIVO PARA ESTADO DE TRANSACCIONES
// ===================================

// Flag para prevenir recargas automáticas durante actualizaciones
let preventAutoReload = false;

// 🔧 FIX PRINCIPAL: Función updateTransactionStatus completamente reescrita
async function updateTransactionStatus(transactionId, status) {
    console.log('🔄 Iniciando actualización de estado:', { transactionId, status });
    const token = localStorage.getItem('token');

    // Mostrar loading en el botón específico
    const buttons = document.querySelectorAll(`[onclick*="${transactionId}"]`);
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });

    try {
        // Mapear estados correctamente para las rutas del backend
        const statusMap = {
            'APPROVED': 'approve',
            'REJECTED': 'reject'
        };
        const endpoint = statusMap[status] || status.toLowerCase();
        
        console.log('📡 Enviando petición a:', `/api/accounting-simple/transactions/${transactionId}/${endpoint}`);
        
        const response = await fetch(`/api/accounting-simple/transactions/${transactionId}/${endpoint}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        console.log('📨 Respuesta del servidor:', { status: response.status, ok: response.ok });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Respuesta exitosa del servidor:', result);
            
            // ✅ VERIFICAR QUE EL BACKEND CONFIRMÓ EL CAMBIO
            if (result.success && result.data && result.data.status === status) {
                console.log('✅ Backend confirmó el cambio de estado');
                
                // Actualizar la transacción en el array local con los datos del servidor
                const transactionIndex = currentTransactions.findIndex(t => t.id === transactionId);
                if (transactionIndex !== -1) {
                    // Usar los datos completos del servidor
                    currentTransactions[transactionIndex] = {
                        ...currentTransactions[transactionIndex],
                        ...result.data,
                        status: result.data.status || status
                    };
                    console.log('🔄 Transacción actualizada con datos del servidor:', currentTransactions[transactionIndex]);
                }
                
                // Actualizar la tabla inmediatamente
                updateTransactionsTable();
                
                // Mostrar mensaje de éxito
                const statusLabel = getTransactionStatusLabel(status);
                showAlert(`Transacción ${statusLabel.toLowerCase()} exitosamente`, 'success');
                
                // Cerrar modal si está abierto
                closeViewTransactionModal();
                
                // 🚫 PREVENIR RECARGAS AUTOMÁTICAS POR 3 SEGUNDOS
                preventAutoReload = true;
                setTimeout(() => {
                    preventAutoReload = false;
                    // Solo recargar estadísticas sin afectar la tabla
                    loadAccountingStats();
                }, 3000);
                
            } else if (result.success) {
                // Si el servidor dice que tuvo éxito pero no devuelve el estado correcto,
                // hacer una verificación adicional
                console.log('⚠️ Verificando estado en servidor...');
                await verifyTransactionStatus(transactionId, status);
            } else {
                console.error('❌ El backend no confirmó el cambio:', result);
                showAlert('Error: El cambio no fue confirmado por el servidor', 'error');
            }
            
        } else {
            const error = await response.json();
            console.log('❌ Error del servidor:', error);
            showAlert(error.message || 'Error actualizando estado', 'error');
        }
    } catch (error) {
        console.error('❌ Error en updateTransactionStatus:', error);
        showAlert('Error de conexión', 'error');
    } finally {
        // Restaurar botones
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
}

// 🔧 FUNCIÓN PARA VERIFICAR ESTADO EN SERVIDOR
async function verifyTransactionStatus(transactionId, expectedStatus) {
    const token = localStorage.getItem('token');
    
    try {
        console.log('🔍 Verificando estado en servidor...');
        const verifyResponse = await fetch(`/api/accounting-simple/transactions/${transactionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json();
            const serverTransaction = verifyResult.data;
            
            console.log('🔍 Estado en servidor:', serverTransaction.status);
            console.log('🔍 Estado esperado:', expectedStatus);
            
            if (serverTransaction.status === expectedStatus) {
                // El servidor tiene el estado correcto, actualizar UI
                const transactionIndex = currentTransactions.findIndex(t => t.id === transactionId);
                if (transactionIndex !== -1) {
                    currentTransactions[transactionIndex] = serverTransaction;
                    updateTransactionsTable();
                    console.log('✅ Estado verificado y UI actualizada');
                }
                
                const statusLabel = getTransactionStatusLabel(expectedStatus);
                showAlert(`Transacción ${statusLabel.toLowerCase()} exitosamente`, 'success');
                closeViewTransactionModal();
                
            } else {
                console.error('❌ Estado en servidor no coincide:', {
                    esperado: expectedStatus,
                    actual: serverTransaction.status
                });
                showAlert(`Error: Estado esperado ${expectedStatus}, pero servidor tiene ${serverTransaction.status}`, 'error');
                
                // Forzar sincronización con el estado del servidor
                const transactionIndex = currentTransactions.findIndex(t => t.id === transactionId);
                if (transactionIndex !== -1) {
                    currentTransactions[transactionIndex] = serverTransaction;
                    updateTransactionsTable();
                }
            }
        } else {
            console.error('❌ No se pudo verificar el estado en el servidor');
            showAlert('Error verificando el estado', 'error');
        }
    } catch (error) {
        console.error('❌ Error verificando estado:', error);
    }
}

// 🔧 FUNCIONES DE APROBACIÓN ACTUALIZADAS
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

// 🔧 FUNCIÓN DE DEBUG PARA VERIFICAR ESTADO
async function debugTransactionStatus(transactionId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`/api/accounting-simple/transactions/${transactionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('🔍 DEBUG - Estado actual en servidor:', result.data.status);
            console.log('🔍 DEBUG - Transacción completa:', result.data);
            
            // Comparar con el estado local
            const localTransaction = currentTransactions.find(t => t.id === transactionId);
            console.log('🔍 DEBUG - Estado local:', localTransaction?.status);
            
            return result.data;
        }
    } catch (error) {
        console.error('❌ DEBUG - Error:', error);
    }
}

// 🔧 FUNCIÓN PARA FORZAR SINCRONIZACIÓN
async function forceSyncTransaction(transactionId) {
    console.log('🔄 Forzando sincronización de transacción:', transactionId);
    
    const serverData = await debugTransactionStatus(transactionId);
    if (serverData) {
        const transactionIndex = currentTransactions.findIndex(t => t.id === transactionId);
        if (transactionIndex !== -1) {
            currentTransactions[transactionIndex] = serverData;
            updateTransactionsTable();
            console.log('✅ Transacción sincronizada');
        }
    }
}

// 🔧 FUNCIÓN PARA PROBAR EL BACKEND
async function testBackendApproval(transactionId) {
    const token = localStorage.getItem('token');
    
    console.log('🧪 TESTING - Estado antes de aprobar');
    await debugTransactionStatus(transactionId);
    
    console.log('🧪 TESTING - Enviando aprobación...');
    const response = await fetch(`/api/accounting-simple/transactions/${transactionId}/approve`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'APPROVED' })
    });
    
    const result = await response.json();
    console.log('🧪 TESTING - Respuesta del servidor:', result);
    
    console.log('🧪 TESTING - Estado después de aprobar');
    setTimeout(async () => {
        await debugTransactionStatus(transactionId);
    }, 500);
}

async function deleteTransaction(transactionId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/accounting-simple/transactions/${transactionId}`, {
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
        const response = await fetch(`/api/accounting-simple/reports/balance-sheet?date=${reportDate}`, {
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
        const response = await fetch(`/api/accounting-simple/reports/income-statement?date=${reportDate}`, {
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
// BÚSQUEDA EN TIEMPO REAL
// ===================================

// 🔧 FIX: Búsqueda en tiempo real para transacciones
function setupRealTimeTransactionSearch() {
    const searchInput = document.getElementById('transaction-search-input');
    const dateFromFilter = document.getElementById('date-from-filter');
    const dateToFilter = document.getElementById('date-to-filter');
    const typeFilter = document.getElementById('transaction-type-filter');
    const statusFilter = document.getElementById('transaction-status-filter');

    // Búsqueda en tiempo real con debounce
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            console.log('🔍 Búsqueda en tiempo real activada:', searchInput.value);
            loadTransactions(1, true); // true = isSearch
        }, 300));
    }

    // Filtros en tiempo real
    [dateFromFilter, dateToFilter, typeFilter, statusFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', () => {
                console.log('🔍 Filtro cambiado:', filter.id, filter.value);
                loadTransactions(1, true);
            });
        }
    });
}

// 🔧 FIX: Búsqueda en tiempo real para cuentas
function setupRealTimeAccountSearch() {
    const searchInput = document.getElementById('account-search-input');
    const typeFilter = document.getElementById('account-type-filter');
    const levelFilter = document.getElementById('account-level-filter');

    // Búsqueda en tiempo real con debounce
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            console.log('🔍 Búsqueda de cuentas en tiempo real:', searchInput.value);
            loadAccounts();
        }, 300));
    }

    // Filtros en tiempo real
    [typeFilter, levelFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', () => {
                console.log('🔍 Filtro de cuentas cambiado:', filter.id, filter.value);
                loadAccounts();
            });
        }
    });
}

// ===================================
// FORMULARIOS
// ===================================

// 🔧 FIX: setupEventListeners actualizado con búsqueda en tiempo real
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

    // 🔧 NUEVO: Configurar búsqueda en tiempo real
    setTimeout(() => {
        setupRealTimeAccountSearch();
        setupRealTimeTransactionSearch();
        console.log('✅ Búsqueda en tiempo real configurada');
    }, 1000);

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

    console.log('✅ Event listeners configurados');
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
        const url = isEditing ? `/api/accounting-simple/accounts/${editingAccount.id}` : '/api/accounting-simple/accounts';
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
        const url = isEditing ? `/api/accounting-simple/transactions/${editingTransaction.id}` : '/api/accounting-simple/transactions';
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
// FUNCIONES DE INTERACCIÓN
// ===================================

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
        
        // Rotar el ícono
        const toggleIcon = toggleButton.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
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
    console.log('🚨 showAlert llamada:', { message, type });
    
    const alert = document.getElementById('alert');
    const alertMessage = document.getElementById('alert-message');
    
    console.log('🔍 Elementos encontrados:', { alert: !!alert, alertMessage: !!alertMessage });

    if (!alert || !alertMessage) {
        console.error('❌ Elementos de alerta no encontrados');
        // Fallback: usar alert del navegador
        window.alert(message);
        return;
    }

    alert.className = `alert ${type} show`;
    alertMessage.textContent = message;
    
    console.log('✅ Alerta mostrada:', { className: alert.className, text: alertMessage.textContent });

    setTimeout(() => {
        alert.classList.remove('show');
        console.log('⏰ Alerta ocultada después de 5 segundos');
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

// ===================================
// CSS ADICIONAL PARA FIXES
// ===================================

// 🔧 FIX: Agregar CSS para animaciones de búsqueda y estados
const additionalCSS = `
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.status-badge.status-approved {
    background-color: var(--success);
    color: white;
}

.status-badge.status-rejected {
    background-color: var(--danger);
    color: white;
}

.status-badge.status-pending {
    background-color: var(--warning);
    color: var(--text-dark);
}

tr[data-transaction-id] {
    transition: background-color 0.3s ease;
}

.fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Estilos para indicadores de búsqueda */
.form-input[style*="shimmer"] {
    position: relative;
    overflow: hidden;
}

.form-input[style*="shimmer"]::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 1.5s infinite;
}

/* Mejoras visuales para estados de transacciones */
.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.2s ease-in-out;
}

.status-badge:hover {
    transform: scale(1.05);
}

/* Animación para filas actualizadas */
.transaction-updated {
    background-color: var(--success-light) !important;
    animation: highlightUpdate 2s ease-in-out;
}

@keyframes highlightUpdate {
    0% { background-color: var(--success); }
    100% { background-color: transparent; }
}

/* Mejoras para botones de acción */
.btn-text {
    margin-left: 0.25rem;
}

@media (max-width: 768px) {
    .btn-text {
        display: none;
    }
}

/* Indicadores de carga mejorados */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.loading-overlay .loading {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--border);
    border-top: 2px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Agregar el CSS al documento si no existe
if (!document.getElementById('transaction-fixes-css')) {
    const style = document.createElement('style');
    style.id = 'transaction-fixes-css';
    style.textContent = additionalCSS;
    document.head.appendChild(style);
    console.log('✅ CSS de fixes aplicado');
}

// ===================================
// INICIALIZACIÓN DE FIXES
// ===================================

// 🔧 EJECUTAR FIXES AL CARGAR
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Aplicando fixes para transacciones...');
    
    // Re-configurar event listeners cuando el DOM esté listo
    setTimeout(() => {
        // Solo configurar si los elementos existen
        const transactionSearchInput = document.getElementById('transaction-search-input');
        const accountSearchInput = document.getElementById('account-search-input');
        
        if (transactionSearchInput || accountSearchInput) {
            setupRealTimeAccountSearch();
            setupRealTimeTransactionSearch();
            console.log('✅ Fixes aplicados correctamente');
        } else {
            console.log('⚠️ Elementos de búsqueda no encontrados, reintentando...');
            // Reintentar después de 2 segundos
            setTimeout(() => {
                setupRealTimeAccountSearch();
                setupRealTimeTransactionSearch();
                console.log('✅ Fixes aplicados en segundo intento');
            }, 2000);
        }
    }, 1000);
});

// ===================================
// FUNCIONES GLOBALES ADICIONALES
// ===================================

// Función para recargar datos manualmente
function refreshData() {
    console.log('🔄 Recargando todos los datos...');
    loadAccountingStats();
    
    if (activeTab === 'accounts') {
        loadAccounts();
    } else if (activeTab === 'transactions') {
        loadTransactions(currentPage);
    }
}

// Función para exportar datos (placeholder)
function exportData(type) {
    console.log(`📄 Exportando datos de ${type}...`);
    showAlert(`Función de exportación de ${type} en desarrollo`, 'info');
}

// Función para mostrar estadísticas rápidas
function showQuickStats() {
    const stats = {
        accounts: currentAccounts.length,
        transactions: currentTransactions.length,
        pendingTransactions: currentTransactions.filter(t => t.status === 'PENDING').length
    };
    
    showAlert(`Cuentas: ${stats.accounts} | Transacciones: ${stats.transactions} | Pendientes: ${stats.pendingTransactions}`, 'info');
}

// Función para limpiar filtros
function clearAllFilters() {
    // Limpiar filtros de cuentas
    const accountSearch = document.getElementById('account-search-input');
    const accountType = document.getElementById('account-type-filter');
    const accountLevel = document.getElementById('account-level-filter');
    
    if (accountSearch) accountSearch.value = '';
    if (accountType) accountType.value = '';
    if (accountLevel) accountLevel.value = '';
    
    // Limpiar filtros de transacciones
    const transactionSearch = document.getElementById('transaction-search-input');
    const dateFrom = document.getElementById('date-from-filter');
    const dateTo = document.getElementById('date-to-filter');
    const transactionType = document.getElementById('transaction-type-filter');
    const transactionStatus = document.getElementById('transaction-status-filter');
    
    if (transactionSearch) transactionSearch.value = '';
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';
    if (transactionType) transactionType.value = '';
    if (transactionStatus) transactionStatus.value = '';
    
    // Recargar datos
    refreshData();
    
    showAlert('Filtros limpiados', 'success');
}

// Atajos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + R para recargar datos
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshData();
    }
    
    // Ctrl/Cmd + N para nueva transacción/cuenta según la pestaña activa
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (activeTab === 'accounts') {
            openAccountModal();
        } else if (activeTab === 'transactions') {
            openTransactionModal();
        }
    }
    
    // Ctrl/Cmd + F para enfocar búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (activeTab === 'accounts') {
            const accountSearch = document.getElementById('account-search-input');
            if (accountSearch) accountSearch.focus();
        } else if (activeTab === 'transactions') {
            const transactionSearch = document.getElementById('transaction-search-input');
            if (transactionSearch) transactionSearch.focus();
        }
    }
});

console.log('🔧 Fixes para transacciones cargados correctamente');
// ===================================
// FUNCIONES DE DIAGNÓSTICO PARA TEMAS
// ===================================

function diagnoseThemeSystem() {
    console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE TEMA:');
    
    const elements = {
        'light-label': document.getElementById('light-label'),
        'dark-label': document.getElementById('dark-label'),
        'theme-toggle': document.querySelector('.theme-toggle'),
        'theme-container': document.querySelector('.theme-toggle-container')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`  ${name}:`, element ? '✅ Encontrado' : '❌ NO encontrado');
        if (element && name.includes('label')) {
            console.log(`    - Clases:`, element.classList.toString());
            console.log(`    - Texto:`, element.textContent);
        }
    });
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const savedTheme = localStorage.getItem('theme');
    
    console.log('📊 ESTADO DEL TEMA:');
    console.log('  Tema actual:', currentTheme);
    console.log('  Tema guardado:', savedTheme);
    console.log('  Elementos .theme-label:', document.querySelectorAll('.theme-label').length);
    
    return elements;
}

function testThemeToggle() {
    console.log('🧪 PROBANDO TOGGLE DE TEMA:');
    
    // Estado inicial
    diagnoseThemeSystem();
    
    console.log('🔄 Haciendo toggle...');
    toggleTheme();
    
    // Verificar después del toggle
    setTimeout(() => {
        console.log('📊 Estado después del toggle:');
        diagnoseThemeSystem();
    }, 100);
}

function forceThemeSync() {
    console.log('🔧 Forzando sincronización de tema...');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Forzar actualización de labels
    updateThemeLabelsForced(savedTheme);
    
    console.log(`✅ Tema sincronizado a: ${savedTheme}`);
}

function emergencyThemeToggle() {
    console.log('🚨 TOGGLE DE EMERGENCIA - FORZANDO CAMBIO');
    
    const current = localStorage.getItem('theme') || 'light';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    
    console.log(`🚨 Cambio forzado: ${current} → ${newTheme}`);
    
    // Aplicar en TODO
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Forzar labels inmediatamente
    updateThemeLabelsForced(newTheme);
    
    console.log('🚨 CAMBIO DE EMERGENCIA COMPLETADO');
}

function forceReloadThemeCSS() {
    console.log('🔄 Forzando recarga de CSS de tema...');
    
    // Eliminar CSS existente
    const existingCSS = document.getElementById('contabilidad-theme-css');
    if (existingCSS) {
        existingCSS.remove();
        console.log('🗑️ CSS anterior eliminado');
    }
    
    // Recrear CSS
    ensureThemeCSS();
    
    // Forzar reflow del navegador
    document.body.offsetHeight;
    
    // Aplicar tema actual
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeLabelsForced(currentTheme);
    
    console.log('✅ CSS de tema recargado y aplicado');
}

// Hacer las funciones disponibles globalmente para debugging
window.diagnoseThemeSystem = diagnoseThemeSystem;
window.testThemeToggle = testThemeToggle;
window.forceThemeSync = forceThemeSync;
window.emergencyThemeToggle = emergencyThemeToggle;
window.updateThemeLabelsForced = updateThemeLabelsForced;
window.forceReloadThemeCSS = forceReloadThemeCSS;

console.log('✅ Archivo accounting.js completamente corregido y optimizado');
console.log('🎨 Fix de tema integrado - Funciones de debug disponibles:');
console.log('  - diagnoseThemeSystem(): Verificar estado del tema');
console.log('  - testThemeToggle(): Probar cambio de tema');
console.log('  - forceThemeSync(): Forzar sincronización');
console.log('  - debugTransactionStatus(id): Verificar estado de transacción');
console.log('  - forceSyncTransaction(id): Forzar sincronización de transacción');