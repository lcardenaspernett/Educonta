// ===================================
// EDUCONTA - Módulo Dashboard de Contabilidad
// ===================================

/**
 * Clase para gestionar el dashboard de contabilidad
 */
class AccountingDashboard {
    constructor() {
        this.charts = {};
        this.metrics = {};

        this.init();
    }

    /**
     * Inicialización del dashboard
     */
    init() {
        console.log('📊 Inicializando Dashboard de Contabilidad');

        // Escuchar eventos globales del sistema
        window.addEventListener('dataLoaded', (event) => {
            const data = event.detail;
            this.updateMetrics(data.stats);
            this.updateCharts(data);
        });

        window.addEventListener('loadingChanged', (event) => {
            this.toggleLoadingState(event.detail.isLoading);
        });

        // Configurar elementos interactivos
        this.setupInteractions();
    }

    /**
     * Actualizar métricas
     */
    updateMetrics(stats) {
        console.log('📊 Dashboard recibiendo stats:', stats);

        const metrics = {
            'total-accounts': stats.totalAccounts || 0,
            'active-accounts': stats.totalAccounts || 0, // Asumiendo que todas están activas
            'total-balance': this.formatCurrency(stats.totalBalance || 0),
            'pending-transactions': stats.pendingTransactions || 0
        };

        console.log('📊 Métricas calculadas:', metrics);

        Object.entries(metrics).forEach(([id, value]) => {
            console.log(`📊 Actualizando ${id} con valor:`, value);
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
        console.log(`📊 Actualizando elemento ${id}:`, element, 'con valor:', value);

        if (element) {
            // Remover el span de loading si existe
            const loadingSpan = element.querySelector('.loading');
            if (loadingSpan) {
                loadingSpan.remove();
            }

            // Remover clase loading del elemento principal
            element.classList.remove('loading');

            // Si es un número, usar animación; si no, actualizar directamente
            if (typeof value === 'number' && id !== 'total-balance') {
                this.animateCounter(element, value);
            } else {
                element.textContent = value;
            }
            console.log(`📊 Elemento ${id} actualizado a:`, element.textContent);
        } else {
            console.warn(`⚠️ Elemento ${id} no encontrado en el DOM`);
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

            element.textContent = this.formatNumber(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = this.formatNumber(finalValue);
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
                        <span class="balance-amount">${this.formatCurrency(balance)}</span>
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
        const transactions = [1, 2, 1, 3, 5, stats.pendingTransactions || 2]; // Usar datos reales cuando estén disponibles

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
            card.addEventListener('click', () => {
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
        this.showNotification(message, 'info');
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
        // Recargar datos desde el sistema principal
        if (window.loadAccountingStats) {
            await window.loadAccountingStats();
        }
    }

    /**
     * Formatear moneda
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }

    /**
     * Formatear número
     */
    formatNumber(number, decimals = 0) {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number || 0);
    }

    /**
     * Mostrar notificación mejorada
     */
    showNotification(message, type = 'info') {
        // Usar siempre la función global mejorada
        if (typeof showAlert === 'function') {
            showAlert(message, type);
        } else {
            // Fallback mejorado si no está disponible
            console.warn('showAlert no disponible, usando fallback');
            this.createFallbackNotification(message, type);
        }
    }

    /**
     * Fallback para notificaciones si showAlert no está disponible
     */
    createFallbackNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: var(--card-bg);
            border: 2px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            border-radius: 12px;
            padding: 1rem 1.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.2rem;">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span style="color: var(--text-primary); font-weight: 500;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-secondary);
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }
}

// Registrar módulo
window.AccountingDashboard = AccountingDashboard;