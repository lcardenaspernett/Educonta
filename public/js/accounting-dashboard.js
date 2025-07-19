// ===================================
// EDUCONTA - Dashboard de Contabilidad Avanzado
// ===================================

// Función para crear gráficos de contabilidad
function createAccountingCharts() {
    createAccountTypeChart();
    createBalanceChart();
    createTransactionTrendChart();
}

// Gráfico de distribución por tipo de cuenta
function createAccountTypeChart() {
    const canvas = document.getElementById('accountTypeChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Datos de ejemplo basados en tu estructura actual
    const accountTypes = {
        'ASSET': { count: 5, color: '#10b981', label: 'Activos' },
        'LIABILITY': { count: 2, color: '#f59e0b', label: 'Pasivos' },
        'EQUITY': { count: 1, color: '#8b5cf6', label: 'Patrimonio' },
        'INCOME': { count: 3, color: '#06b6d4', label: 'Ingresos' },
        'EXPENSE': { count: 4, color: '#ef4444', label: 'Gastos' }
    };

    // Crear gráfico de dona simple con Canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    let currentAngle = 0;
    const total = Object.values(accountTypes).reduce((sum, type) => sum + type.count, 0);
    
    Object.entries(accountTypes).forEach(([key, type]) => {
        const sliceAngle = (type.count / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = type.color;
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
}

// Gráfico de balance por cuenta principal
function createBalanceChart() {
    const container = document.getElementById('balanceChart');
    if (!container) return;

    // Datos de ejemplo basados en tus transacciones
    const balances = [
        { account: 'Caja', balance: 500000, type: 'ASSET' },
        { account: 'Bancos', balance: 400000, type: 'ASSET' },
        { account: 'Matrículas', balance: 500000, type: 'INCOME' },
        { account: 'Gastos Personal', balance: 2500000, type: 'EXPENSE' }
    ];

    let html = '<div class="balance-bars">';
    const maxBalance = Math.max(...balances.map(b => Math.abs(b.balance)));

    balances.forEach(item => {
        const percentage = (Math.abs(item.balance) / maxBalance) * 100;
        const color = getAccountTypeColor(item.type);
        
        html += `
            <div class="balance-bar-item">
                <div class="balance-bar-label">
                    <span>${item.account}</span>
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

// Función para actualizar métricas en tiempo real
function updateAccountingMetrics() {
    // Simular actualización de métricas
    const metrics = {
        totalAccounts: 26,
        activeAccounts: 26,
        totalBalance: 3850000,
        pendingTransactions: 0,
        monthlyIncome: 500000,
        monthlyExpenses: 2500000,
        netIncome: -2000000
    };

    // Actualizar elementos del DOM
    updateElement('total-accounts', metrics.totalAccounts);
    updateElement('active-accounts', metrics.activeAccounts);
    updateElement('total-balance', formatCurrency(metrics.totalBalance));
    updateElement('pending-transactions', metrics.pendingTransactions);
    
    // Métricas adicionales si existen
    updateElement('monthly-income', formatCurrency(metrics.monthlyIncome));
    updateElement('monthly-expenses', formatCurrency(metrics.monthlyExpenses));
    updateElement('net-income', formatCurrency(metrics.netIncome));
    
    // Actualizar indicadores de tendencia
    updateTrendIndicator('income-trend', metrics.monthlyIncome > 0 ? 'up' : 'down');
    updateTrendIndicator('expense-trend', metrics.monthlyExpenses > metrics.monthlyIncome ? 'up' : 'down');
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
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que se carguen los datos principales
    setTimeout(() => {
        createAccountingCharts();
        updateAccountingMetrics();
    }, 1000);
    
    // Actualizar métricas cada 30 segundos
    setInterval(updateAccountingMetrics, 30000);
});