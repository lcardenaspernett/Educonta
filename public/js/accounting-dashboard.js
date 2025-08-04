// ===================================
// EDUCONTA - Dashboard de Contabilidad Avanzado
// ===================================

// Función para crear gráficos de contabilidad
function createAccountingCharts() {
    createAccountTypeChart();
    createBalanceChart();
    createTransactionTrendChart();
}

// Gráfico de distribución por tipo de cuenta (con datos reales)
function createAccountTypeChart(accountsByType = null) {
    const canvas = document.getElementById('accountTypeChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Usar datos reales si se proporcionan, sino usar datos por defecto
    const accountTypes = accountsByType ? {
        'ASSET': { count: accountsByType.ASSET || 0, color: '#10b981', label: 'Activos' },
        'LIABILITY': { count: accountsByType.LIABILITY || 0, color: '#f59e0b', label: 'Pasivos' },
        'EQUITY': { count: accountsByType.EQUITY || 0, color: '#8b5cf6', label: 'Patrimonio' },
        'INCOME': { count: accountsByType.INCOME || 0, color: '#06b6d4', label: 'Ingresos' },
        'EXPENSE': { count: accountsByType.EXPENSE || 0, color: '#ef4444', label: 'Gastos' }
    } : {
        'ASSET': { count: 5, color: '#10b981', label: 'Activos' },
        'LIABILITY': { count: 3, color: '#f59e0b', label: 'Pasivos' },
        'EQUITY': { count: 3, color: '#8b5cf6', label: 'Patrimonio' },
        'INCOME': { count: 3, color: '#06b6d4', label: 'Ingresos' },
        'EXPENSE': { count: 4, color: '#ef4444', label: 'Gastos' }
    };

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Crear gráfico de dona simple con Canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    let currentAngle = 0;
    const total = Object.values(accountTypes).reduce((sum, type) => sum + type.count, 0);
    
    if (total > 0) {
        Object.entries(accountTypes).forEach(([key, type]) => {
            if (type.count > 0) {
                const sliceAngle = (type.count / total) * 2 * Math.PI;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.lineTo(centerX, centerY);
                ctx.fillStyle = type.color;
                ctx.fill();
                
                currentAngle += sliceAngle;
            }
        });
    }
}

// Función para actualizar el gráfico de tipos de cuenta
function updateAccountTypeChart(accountsByType) {
    createAccountTypeChart(accountsByType);
}

// Función para actualizar el gráfico de balance
function updateBalanceChart() {
    createBalanceChart();
}

// Gráfico de balance por cuenta principal (con datos reales)
async function createBalanceChart() {
    const container = document.getElementById('balanceChart');
    if (!container) return;

    try {
        const token = localStorage.getItem('token');
        
        // Obtener datos reales de cuentas
        const accountsResponse = await fetch('/api/accounting-simple/accounts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (accountsResponse.ok) {
            const accountsData = await accountsResponse.json();
            const accounts = accountsData.data;
            
            // Filtrar solo cuentas hijas con balance > 0 para el gráfico
            const balances = accounts
                .filter(account => account.parentId && account.balance > 0)
                .map(account => ({
                    account: account.name,
                    balance: account.balance,
                    type: account.accountType,
                    code: account.code
                }))
                .sort((a, b) => b.balance - a.balance) // Ordenar por balance descendente
                .slice(0, 6); // Mostrar solo las 6 cuentas principales

            if (balances.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-light);">No hay datos de balance disponibles</p>';
                return;
            }

            let html = '<div class="balance-bars">';
            const maxBalance = Math.max(...balances.map(b => Math.abs(b.balance)));

            balances.forEach(item => {
                const percentage = (Math.abs(item.balance) / maxBalance) * 100;
                const color = getAccountTypeColor(item.type);
                
                html += `
                    <div class="balance-bar-item">
                        <div class="balance-bar-label">
                            <span>${item.code} - ${item.account}</span>
                            <span class="balance-amount">${formatCurrency(item.balance)}</span>
                        </div>
                        <div class="balance-bar-container">
                            <div class="balance-bar" style="width: ${percentage}%; background-color: ${color};"></div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;
            
            console.log('✅ Gráfico de balance actualizado con datos reales');
        }
    } catch (error) {
        console.error('❌ Error cargando datos de balance:', error);
        // Fallback a datos de ejemplo si hay error
        createBalanceChartFallback();
    }
}

// Función de respaldo con datos de ejemplo
function createBalanceChartFallback() {
    const container = document.getElementById('balanceChart');
    if (!container) return;

    const balances = [
        { account: 'Caja', balance: 500000, type: 'ASSET', code: '1105' },
        { account: 'Bancos', balance: 2500000, type: 'ASSET', code: '1110' },
        { account: 'Inversiones Temporales', balance: 1200000, type: 'ASSET', code: '1205' },
        { account: 'Ingresos por Servicios', balance: 1500000, type: 'INCOME', code: '4135' }
    ];

    let html = '<div class="balance-bars">';
    const maxBalance = Math.max(...balances.map(b => Math.abs(b.balance)));

    balances.forEach(item => {
        const percentage = (Math.abs(item.balance) / maxBalance) * 100;
        const color = getAccountTypeColor(item.type);
        
        html += `
            <div class="balance-bar-item">
                <div class="balance-bar-label">
                    <span>${item.code} - ${item.account}</span>
                    <span class="balance-amount">${formatCurrency(item.balance)}</span>
                </div>
                <div class="balance-bar-container">
                    <div class="balance-bar" style="width: ${percentage}%; background-color: ${color};"></div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Tendencia de transacciones
function createTransactionTrendChart() {
    const container = document.getElementById('transactionTrend');
    if (!container) return;

    // Datos de ejemplo de los últimos 6 meses
    const months = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'];
    const transactions = [2, 3, 1, 4, 5, 2]; // Número de transacciones por mes
    
    let html = '<div class="trend-chart">';
    const maxTransactions = Math.max(...transactions);

    months.forEach((month, index) => {
        const height = (transactions[index] / maxTransactions) * 100;
        html += `
            <div class="trend-bar-item">
                <div class="trend-bar" style="height: ${height}%;" title="${transactions[index]} transacciones"></div>
                <div class="trend-label">${month}</div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Función auxiliar para obtener colores por tipo de cuenta
function getAccountTypeColor(type) {
    const colors = {
        'ASSET': '#10b981',
        'LIABILITY': '#f59e0b', 
        'EQUITY': '#8b5cf6',
        'INCOME': '#06b6d4',
        'EXPENSE': '#ef4444'
    };
    return colors[type] || '#6b7280';
}

// Función para actualizar métricas con datos reales de la API
async function updateAccountingMetrics() {
    console.log('📊 Actualizando métricas con datos reales de la API');
    
    try {
        const token = localStorage.getItem('token');
        
        // Obtener datos reales de estadísticas
        const statsResponse = await fetch('/api/accounting-simple/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            const stats = statsData.data;
            
            // Actualizar gráficos con datos reales
            updateAccountTypeChart(stats.accountsByType);
            updateBalanceChart();
            
            console.log('✅ Gráficos actualizados con datos reales:', stats);
        }
    } catch (error) {
        console.error('❌ Error actualizando métricas:', error);
    }
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
        element.classList.remove('loading');
    }
}

function updateTrendIndicator(id, direction) {
    const element = document.getElementById(id);
    if (element) {
        element.className = `trend-indicator ${direction}`;
        element.innerHTML = direction === 'up' ? '↗️' : '↘️';
    }
}

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Inicializar dashboard cuando se carga la página
// ================= MOVEMENTS SECTION =================
let allMovements = [];
let movementsPagination = null;

async function loadMovements() {
    const list = document.getElementById('movementsList');
    const loading = document.getElementById('movementsLoading');
    if (!list) return;
    
    loading.style.display = '';
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/accounting-simple/movements', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar movimientos');
        const data = await res.json();
        
        allMovements = data.data || [];
        
        // Inicializar paginación si no existe
        if (!movementsPagination) {
            movementsPagination = new PaginationManager({
                itemsPerPage: 5,
                containerId: 'movementsPagination',
                onPageChange: (page) => {
                    console.log(`📄 Cambiando a página ${page} de movimientos`);
                    renderCurrentMovements();
                }
            });
        }
        
        // Actualizar paginación y renderizar
        movementsPagination.updateTotal(allMovements.length);
        renderCurrentMovements();
        
    } catch (e) {
        console.error('❌ Error cargando movimientos:', e);
        list.innerHTML = `<div class="error-message">No se pudieron cargar los movimientos.</div>`;
    } finally {
        loading.style.display = 'none';
    }
}

function renderCurrentMovements() {
    const list = document.getElementById('movementsList');
    if (!list || !movementsPagination) return;
    
    // Obtener movimientos para la página actual
    const currentMovements = movementsPagination.getPageItems(allMovements);
    
    if (currentMovements.length === 0) {
        list.innerHTML = '<div class="empty-message">No hay movimientos registrados.</div>';
        return;
    }
    
    list.innerHTML = currentMovements.map(m => `
        <div class="movement-item ${m.type}">
            <div class="movement-icon">
                ${m.type === 'income' ? '💰' : '💸'}
            </div>
            <div class="movement-content">
                <div class="movement-title">${m.concept || 'Sin concepto'}</div>
                <div class="movement-meta">
                    <span>${new Date(m.date).toLocaleDateString('es-CO')}</span>
                    <span>•</span>
                    <span>${m.type === 'income' ? 'Ingreso' : 'Egreso'}</span>
                    ${m.reference ? `<span>• Ref: ${m.reference}</span>` : ''}
                </div>
            </div>
            <div class="movement-amount ${m.type}">
                ${m.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(m.amount))}
            </div>
            <div class="movement-actions">
                <button class="btn btn-ghost btn-sm" data-invoice-id="${m.invoiceId || ''}" data-movement-id="${m.id}" title="Ver Factura">
                    <svg width="14" height="14" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z"/>
                    </svg>
                </button>
                <button class="btn btn-ghost btn-sm" data-edit-id="${m.id}" title="Editar">
                    <svg width="14" height="14" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    // Attach event listeners
    list.querySelectorAll('.btn[data-invoice-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const movementId = btn.getAttribute('data-movement-id');
            const invoiceId = btn.getAttribute('data-invoice-id');
            viewInvoiceForMovement(movementId, invoiceId);
        });
    });
    
    list.querySelectorAll('[data-edit-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const movementId = btn.getAttribute('data-edit-id');
            editMovement(movementId);
        });
    });
    
    console.log(`✅ Renderizados ${currentMovements.length} movimientos de ${allMovements.length} totales`);
}

function viewInvoiceForMovement(movementId, invoiceId) {
    if (!invoiceId) {
        alert('Este movimiento no tiene factura asociada.');
        return;
    }
    if (window.invoiceViewer && typeof window.invoiceViewer.viewInvoice === 'function') {
        window.invoiceViewer.viewInvoice(invoiceId);
    } else {
        alert('Visualizador de facturas no disponible.');
    }
}

function editMovement(movementId) {
    // Aquí puedes implementar un modal de edición o redirigir a una página de edición
    alert('Funcionalidad de edición de movimiento en desarrollo. ID: ' + movementId);
}

function refreshMovements() {
    loadMovements();
}

// Inicializar dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Inicializando dashboard de contabilidad con datos reales');
    setTimeout(() => {
        console.log('🎨 Creando gráficos con datos reales...');
        createAccountingCharts();
        updateAccountingMetrics();
        loadMovements();
    }, 2000);
    setInterval(() => {
        console.log('🔄 Actualizando gráficos automáticamente...');
        updateAccountingMetrics();
    }, 60000);
});