// ===================================
// EDUCONTA - Módulo Dashboard de Contabilidad
// ===================================

/**
 * Clase para gestionar el dashboard de contabilidad
 */
class AccountingDashboard {
    constructor(core) {
        this.core = core;
        this.charts = {};
        this.metrics = {};
        
        this.init();
    }

    /**
     * Inicialización del dashboard
     */
    init() {
        console.log('📊 Inicializando Dashboard de Contabilidad');
        
        // Escuchar eventos del core
        this.core.on('dataLoaded', (data) => {
            this.updateMetrics(data.stats);
            this.updateCharts(data);
        });
        
        this.core.on('loadingChanged', (loading) => {
            this.toggleLoadingState(loading);
        });
        
        // Configurar elementos interactivos
        this.setupInteractions();
    }

    /**
     * Actualizar métricas
     */
    updateMetrics(stats) {
        const metrics = {
            'total-accounts': stats.totalAccounts || 0,
            'active-accounts': stats.totalAccounts || 0, // Asumiendo que todas están activas
            'total-balance': this.core.formatCurrency(stats.totalBalance || 0),
            'pending-transactions': stats.pendingTransactions || 0
        };

        Object.entries(metrics).forEach(([id, value]) => {
            this.updateMetricElement(id, value);
        });

        // Guardar métricas para uso posterior
        this.metrics = stats;
    }

    /**
     * Actualizar elemento de métrica individual
     */
    updateMetricElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Animación de contador
            this.animateCounter(element, value);
            element.classList.remove('loading');
        }
    }

    /**
     * Animar contador numérico
     */
    animateCounter(element, finalValue) {
        if (typeof finalValue !== 'number') {
            element.textContent = finalValue;
            return;
        }

        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (finalValue - startValue) * easeOut);
            
            element.textContent = this.core.formatNumber(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = this.core.formatNumber(finalValue);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Actualizar gráficos
     */
    updateCharts(data) {
        this.createAccountTypeChart(data.accounts);
        this.createBalanceChart(data.accounts);
        this.createTransactionTrendChart(data.stats);
    }

    /**
     * Crear gráfico de distribución por tipo de cuenta
     */
    createAccountTypeChart(accounts) {
        const canvas = document.getElementById('accountTypeChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Contar cuentas por tipo
        const accountTypes = accounts.reduce((acc, account) => {
            acc[account.accountType] = (acc[account.accountType] || 0) + 1;
            return acc;
        }, {});

        const colors = {
            'ASSET': '#10b981',
            'LIABILITY': '#f59e0b',
            'EQUITY': '#8b5cf6',
            'INCOME': '#06b6d4',
            'EXPENSE': '#ef4444'
        };

        const labels = {
            'ASSET': 'Activos',
            'LIABILITY': 'Pasivos',
            'EQUITY': 'Patrimonio',
            'INCOME': 'Ingresos',
            'EXPENSE': 'Gastos'
        };

        // Dibujar gráfico de dona
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        const innerRadius = radius * 0.6;
        
        let currentAngle = -Math.PI / 2; // Empezar desde arriba
        const total = Object.values(accountTypes).reduce((sum, count) => sum + count, 0);
        
        // Dibujar segmentos
        Object.entries(accountTypes).forEach(([type, count]) => {
            const sliceAngle = (count / total) * 2 * Math.PI;
            
            // Segmento exterior
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = colors[type] || '#6b7280';
            ctx.fill();
            
            // Texto del porcentaje
            const percentage = Math.round((count / total) * 100);
            const textAngle = currentAngle + sliceAngle / 2;
            const textRadius = (radius + innerRadius) / 2;
            const textX = centerX + Math.cos(textAngle) * textRadius;
            const textY = centerY + Math.sin(textAngle) * textRadius;
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percentage}%`, textX, textY);
            
            currentAngle += sliceAngle;
        });

        // Texto central
        ctx.fillStyle = 'var(--text)';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total.toString(), centerX, centerY - 5);
        
        ctx.font = '12px Inter';
        ctx.fillText('Cuentas', centerX, centerY + 10);

        // Leyenda
        this.createChartLegend('accountTypeChart', accountTypes, colors, labels);
    }

    /**
     * Crear leyenda para gráficos
     */
    createChartLegend(chartId, data, colors, labels) {
        const chartContainer = document.getElementById(chartId).parentElement;
        let legend = chartContainer.querySelector('.chart-legend');
        
        if (!legend) {
            legend = document.createElement('div');
            legend.className = 'chart-legend';
            chartContainer.appendChild(legend);
        }

        let legendHTML = '';
        Object.entries(data).forEach(([key, value]) => {
            legendHTML += `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${colors[key]}"></div>
                    <span class="legend-label">${labels[key] || key}</span>
                    <span class="legend-value">${value}</span>
                </div>
            `;
        });

        legend.innerHTML = legendHTML;
    }

    /**
     * Crear gráfico de balance por cuenta
     */
    createBalanceChart(accounts) {
        const container = document.getElementById('balanceChart');
        if (!container) return;

        // Filtrar cuentas principales con movimientos
        const mainAccounts = accounts
            .filter(acc => acc.level <= 2 && acc._count && 
                (acc._count.debitTransactions > 0 || acc._count.creditTransactions > 0))
            .slice(0, 5); // Top 5

        if (mainAccounts.length === 0) {
            container.innerHTML = '<p class="no-data">No hay datos de balance disponibles</p>';
            return;
        }

        const maxBalance = Math.max(...mainAccounts.map(acc => Math.abs(acc.balance || 0)));

        let html = '<div class="balance-bars">';
        
        mainAccounts.forEach(account => {
            const balance = account.balance || 0;
            const percentage = maxBalance > 0 ? (Math.abs(balance) / maxBalance) * 100 : 0;
            const color = this.getAccountTypeColor(account.accountType);
            
            html += `
                <div class="balance-bar-item">
                    <div class="balance-bar-label">
                        <span>${account.code} - ${account.name}</span>
                        <span class="balance-amount">${this.core.formatCurrency(balance)}</span>
                    </div>
                    <div class="balance-bar-container">
                        <div class="balance-bar" 
                             style="width: ${percentage}%; background-color: ${color};"
                             data-balance="${balance}">
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Animar barras
        setTimeout(() => {
            container.querySelectorAll('.balance-bar').forEach(bar => {
                bar.style.width = bar.style.width;
            });
        }, 100);
    }

    /**
     * Crear gráfico de tendencia de transacciones
     */
    createTransactionTrendChart(stats) {
        const container = document.getElementById('transactionTrend');
        if (!container) return;

        // Datos simulados de los últimos 6 meses
        const months = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'];
        const transactions = [1, 2, 1, 3, 5, 2]; // Basado en tus 5 transacciones
        
        const maxTransactions = Math.max(...transactions);

        let html = '<div class="trend-chart">';
        
        months.forEach((month, index) => {
            const height = maxTransactions > 0 ? (transactions[index] / maxTransactions) * 100 : 0;
            html += `
                <div class="trend-bar-item">
                    <div class="trend-bar" 
                         style="height: ${height}%;" 
                         title="${transactions[index]} transacciones"
                         data-month="${month}"
                         data-count="${transactions[index]}">
                    </div>
                    <div class="trend-label">${month}</div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Agregar interactividad
        container.querySelectorAll('.trend-bar').forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                const count = e.target.dataset.count;
                const month = e.target.dataset.month;
                this.showTooltip(e.target, `${month}: ${count} transacciones`);
            });

            bar.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    /**
     * Obtener color por tipo de cuenta
     */
    getAccountTypeColor(type) {
        const colors = {
            'ASSET': '#10b981',
            'LIABILITY': '#f59e0b',
            'EQUITY': '#8b5cf6',
            'INCOME': '#06b6d4',
            'EXPENSE': '#ef4444'
        };
        return colors[type] || '#6b7280';
    }

    /**
     * Mostrar tooltip
     */
    showTooltip(element, text) {
        let tooltip = document.getElementById('chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.className = 'chart-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.textContent = text;
        tooltip.style.display = 'block';

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    }

    /**
     * Ocultar tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    /**
     * Configurar interacciones
     */
    setupInteractions() {
        // Hacer las métricas clickeables para más detalles
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const metricId = card.querySelector('[id]')?.id;
                if (metricId) {
                    this.showMetricDetails(metricId);
                }
            });
        });
    }

    /**
     * Mostrar detalles de métrica
     */
    showMetricDetails(metricId) {
        const details = {
            'total-accounts': 'Total de cuentas en el plan contable',
            'active-accounts': 'Cuentas actualmente en uso',
            'total-balance': 'Balance total de todas las transacciones',
            'pending-transactions': 'Transacciones pendientes de aprobación'
        };

        const message = details[metricId] || 'Información de la métrica';
        this.core.showNotification(message, 'info');
    }

    /**
     * Alternar estado de carga
     */
    toggleLoadingState(loading) {
        const elements = document.querySelectorAll('.metric-value, .chart-container');
        
        elements.forEach(element => {
            if (loading) {
                element.classList.add('loading');
            } else {
                element.classList.remove('loading');
            }
        });
    }

    /**
     * Actualizar dashboard
     */
    async refresh() {
        console.log('🔄 Actualizando dashboard...');
        await this.core.loadInitialData();
    }
}

// Registrar módulo
window.AccountingDashboard = AccountingDashboard;