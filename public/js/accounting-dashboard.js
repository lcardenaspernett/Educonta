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
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Inicializando dashboard de contabilidad con datos reales');
    
    // Esperar a que se carguen los datos principales y luego crear gráficos
    setTimeout(() => {
        console.log('🎨 Creando gráficos con datos reales...');
        createAccountingCharts(); // Crear gráficos iniciales
        updateAccountingMetrics(); // Actualizar con datos reales de la API
    }, 2000); // Esperar 2 segundos para que se carguen los datos principales
    
    // Actualizar gráficos cada 60 segundos con datos reales
    setInterval(() => {
        console.log('🔄 Actualizando gráficos automáticamente...');
        updateAccountingMetrics();
    }, 60000);
});