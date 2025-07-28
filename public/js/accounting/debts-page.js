// ===================================
// EDUCONTA - Página de Gestión de Deudas y Abonos
// ===================================

/**
 * Controlador para la página dedicada de deudas y abonos
 */
class DebtsManagementPage {
    constructor() {
        this.debts = this.loadDebts();
        this.filteredDebts = [...this.debts];
        this.init();
    }

    init() {
        console.log('💳 Inicializando página de gestión de deudas');
        this.generateSampleData();
        this.updateStats();
        this.renderDebts();
        this.populateFilters();
    }

    /**
     * Generar datos de ejemplo
     */
    generateSampleData() {
        if (this.debts.length > 0) return;

        const sampleDebts = [
            {
                id: 'debt-1',
                studentId: 'student-1',
                studentName: 'Ana María González Pérez',
                studentGrade: '11°A',
                concept: 'Derecho de Grado',
                totalAmount: 150000,
                paidAmount: 50000,
                pendingAmount: 100000,
                dueDate: new Date(Date.now() + 86400000 * 15).toISOString(),
                status: 'PARTIAL',
                priority: 'high',
                paymentHistory: [
                    {
                        id: 'payment-1',
                        amount: 50000,
                        date: new Date(Date.now() - 86400000 * 5).toISOString(),
                        method: 'Efectivo',
                        reference: 'ABONO-001'
                    }
                ],
                createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
            },
            {
                id: 'debt-2',
                studentId: 'student-2',
                studentName: 'Carlos Andrés López Silva',
                studentGrade: '10°B',
                concept: 'Mensualidad Febrero',
                totalAmount: 350000,
                paidAmount: 0,
                pendingAmount: 350000,
                dueDate: new Date(Date.now() - 86400000 * 5).toISOString(),
                status: 'OVERDUE',
                priority: 'urgent',
                paymentHistory: [],
                createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
            },
            {
                id: 'debt-3',
                studentId: 'student-3',
                studentName: 'María José Rodríguez Castro',
                studentGrade: '9°C',
                concept: 'Uniforme Deportivo',
                totalAmount: 120000,
                paidAmount: 0,
                pendingAmount: 120000,
                dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
                status: 'PENDING',
                priority: 'normal',
                paymentHistory: [],
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
            },
            {
                id: 'debt-4',
                studentId: 'student-4',
                studentName: 'Diego Fernando Martínez Ruiz',
                studentGrade: '11°A',
                concept: 'Excursión Pedagógica',
                totalAmount: 200000,
                paidAmount: 200000,
                pendingAmount: 0,
                dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
                status: 'PAID',
                priority: 'normal',
                paymentHistory: [
                    {
                        id: 'payment-2',
                        amount: 100000,
                        date: new Date(Date.now() - 86400000 * 8).toISOString(),
                        method: 'Transferencia',
                        reference: 'ABONO-002'
                    },
                    {
                        id: 'payment-3',
                        amount: 100000,
                        date: new Date(Date.now() - 86400000 * 2).toISOString(),
                        method: 'Efectivo',
                        reference: 'ABONO-003'
                    }
                ],
                createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
            }
        ];

        this.debts = sampleDebts;
        this.filteredDebts = [...this.debts];
        this.saveDebts();
    }

    /**
     * Actualizar estadísticas
     */
    updateStats() {
        const overdueCount = this.debts.filter(d => d.status === 'OVERDUE').length;
        const pendingCount = this.debts.filter(d => d.status === 'PENDING').length;
        const partialCount = this.debts.filter(d => d.status === 'PARTIAL').length;
        const totalDebt = this.debts.reduce((total, debt) => total + debt.pendingAmount, 0);

        document.getElementById('overdueCount').textContent = overdueCount;
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('partialCount').textContent = partialCount;
        document.getElementById('totalDebt').textContent = this.formatCurrency(totalDebt);
    }

    /**
     * Renderizar deudas
     */
    renderDebts() {
        const container = document.getElementById('debtsGrid');
        const loading = document.getElementById('loadingState');

        if (loading) loading.style.display = 'none';

        if (this.filteredDebts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💳</div>
                    <h3>No hay deudas</h3>
                    <p>No se encontraron deudas que coincidan con los filtros aplicados</p>
                </div>
            `;
            return;
        }

        const html = this.filteredDebts.map(debt => this.renderDebtCard(debt)).join('');
        container.innerHTML = html;
    }

    /**
     * Renderizar tarjeta de deuda
     */
    renderDebtCard(debt) {
        const statusConfig = {
            OVERDUE: { icon: '🚨', label: 'Vencida', class: 'overdue' },
            PENDING: { icon: '⏳', label: 'Pendiente', class: 'pending' },
            PARTIAL: { icon: '💰', label: 'Abono Parcial', class: 'partial' },
            PAID: { icon: '✅', label: 'Pagada', class: 'paid' }
        };

        const config = statusConfig[debt.status] || statusConfig.PENDING;
        const progressPercentage = (debt.paidAmount / debt.totalAmount) * 100;

        return `
            <div class="debt-card ${config.class}" data-debt-id="${debt.id}">
                <div class="debt-card-header">
                    <div class="student-info">
                        <h4>${debt.studentName}</h4>
                        <span class="student-grade">${debt.studentGrade}</span>
                    </div>
                    <div class="debt-status">
                        ${config.icon} ${config.label}
                    </div>
                </div>
                
                <div class="debt-card-body">
                    <div class="debt-concept">
                        <strong>${debt.concept}</strong>
                    </div>
                    
                    <div class="debt-amounts">
                        <div class="amount-row">
                            <span class="label">Total:</span>
                            <span class="value">${this.formatCurrency(debt.totalAmount)}</span>
                        </div>
                        <div class="amount-row">
                            <span class="label">Pagado:</span>
                            <span class="value paid">${this.formatCurrency(debt.paidAmount)}</span>
                        </div>
                        <div class="amount-row">
                            <span class="label">Pendiente:</span>
                            <span class="value pending">${this.formatCurrency(debt.pendingAmount)}</span>
                        </div>
                    </div>
                    
                    <div class="payment-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <span class="progress-text">${Math.round(progressPercentage)}% pagado</span>
                    </div>
                    
                    <div class="debt-dates">
                        <div class="date-info">
                            <span class="label">Vencimiento:</span>
                            <span class="value ${this.isOverdue(debt.dueDate) ? 'overdue' : ''}">${this.formatDate(debt.dueDate)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="debt-card-actions">
                    ${debt.status !== 'PAID' ? `
                        <button class="btn btn-success btn-sm" onclick="debtsPage.showPaymentForm('${debt.id}')">
                            💰 Registrar Abono
                        </button>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" onclick="debtsPage.showPaymentHistory('${debt.id}')">
                        📊 Historial
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="debtsPage.generateReminder('${debt.id}')">
                        📧 Recordatorio
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Aplicar filtros
     */
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const gradeFilter = document.getElementById('gradeFilter').value;
        const conceptFilter = document.getElementById('conceptFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        this.filteredDebts = this.debts.filter(debt => {
            if (statusFilter && debt.status !== statusFilter) return false;
            if (gradeFilter && !debt.studentGrade.includes(gradeFilter)) return false;
            if (conceptFilter && debt.concept !== conceptFilter) return false;
            if (searchFilter && !debt.studentName.toLowerCase().includes(searchFilter)) return false;
            return true;
        });

        this.renderDebts();
    }

    /**
     * Limpiar filtros
     */
    clearFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('gradeFilter').value = '';
        document.getElementById('conceptFilter').value = '';
        document.getElementById('searchFilter').value = '';
        
        this.filteredDebts = [...this.debts];
        this.renderDebts();
    }

    /**
     * Poblar filtros
     */
    populateFilters() {
        const concepts = [...new Set(this.debts.map(debt => debt.concept))];
        const conceptFilter = document.getElementById('conceptFilter');
        
        concepts.forEach(concept => {
            const option = document.createElement('option');
            option.value = concept;
            option.textContent = concept;
            conceptFilter.appendChild(option);
        });
    }

    /**
     * Mostrar formulario de pago
     */
    showPaymentForm(debtId) {
        const debt = this.debts.find(d => d.id === debtId);
        if (!debt) return;

        const modal = this.createPaymentModal(debt);
        document.body.appendChild(modal);
    }

    /**
     * Crear modal de pago
     */
    createPaymentModal(debt) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💰 Registrar Abono - ${debt.studentName}</h3>
                    <button class="close-btn" onclick="this.closest('.payment-modal').remove()">×</button>
                </div>
                
                <div class="debt-summary">
                    <div class="summary-item">
                        <span class="label">Concepto:</span>
                        <span class="value">${debt.concept}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Total:</span>
                        <span class="value">${this.formatCurrency(debt.totalAmount)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Pagado:</span>
                        <span class="value">${this.formatCurrency(debt.paidAmount)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Pendiente:</span>
                        <span class="value pending">${this.formatCurrency(debt.pendingAmount)}</span>
                    </div>
                </div>
                
                <form onsubmit="debtsPage.processPayment(event, '${debt.id}')">
                    <div class="form-group">
                        <label>Monto del Abono *</label>
                        <input type="number" name="amount" required 
                               min="1" max="${debt.pendingAmount}" step="1000"
                               placeholder="Ingrese el monto">
                        <small>Máximo: ${this.formatCurrency(debt.pendingAmount)}</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Método de Pago *</label>
                        <select name="method" required>
                            <option value="">Seleccionar método...</option>
                            <option value="Efectivo">💵 Efectivo</option>
                            <option value="Transferencia">🏦 Transferencia Bancaria</option>
                            <option value="Tarjeta">💳 Tarjeta</option>
                            <option value="Cheque">📝 Cheque</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Referencia</label>
                        <input type="text" name="reference" 
                               placeholder="Número de transacción, cheque, etc.">
                    </div>
                    
                    <div class="form-group">
                        <label>Fecha de Pago</label>
                        <input type="date" name="date" 
                               value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label>Observaciones</label>
                        <textarea name="notes" rows="3" 
                                  placeholder="Observaciones adicionales..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.payment-modal').remove()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-success">
                            💰 Registrar Abono
                        </button>
                    </div>
                </form>
            </div>
        `;

        return modal;
    }

    /**
     * Procesar pago
     */
    processPayment(event, debtId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const paymentData = Object.fromEntries(formData);
        const amount = parseFloat(paymentData.amount);
        
        const debt = this.debts.find(d => d.id === debtId);
        if (!debt) return;
        
        if (amount > debt.pendingAmount) {
            this.showNotification('El monto no puede ser mayor al pendiente', 'error');
            return;
        }
        
        // Crear registro de pago
        const payment = {
            id: 'payment-' + Date.now(),
            amount: amount,
            date: paymentData.date || new Date().toISOString(),
            method: paymentData.method,
            reference: paymentData.reference || `ABONO-${Date.now()}`,
            notes: paymentData.notes,
            createdAt: new Date().toISOString()
        };
        
        // Actualizar deuda
        debt.paidAmount += amount;
        debt.pendingAmount -= amount;
        debt.paymentHistory.push(payment);
        
        // Actualizar estado
        if (debt.pendingAmount === 0) {
            debt.status = 'PAID';
        } else if (debt.paidAmount > 0) {
            debt.status = 'PARTIAL';
        }
        
        // Guardar cambios
        this.saveDebts();
        
        // Actualizar UI
        this.updateStats();
        this.renderDebts();
        
        // Cerrar modal
        document.querySelector('.payment-modal')?.remove();
        
        this.showNotification(
            `Abono de ${this.formatCurrency(amount)} registrado exitosamente`, 
            'success'
        );
    }

    /**
     * Mostrar historial de pagos
     */
    showPaymentHistory(debtId) {
        const debt = this.debts.find(d => d.id === debtId);
        if (!debt) return;

        const modal = this.createHistoryModal(debt);
        document.body.appendChild(modal);
    }

    /**
     * Crear modal de historial
     */
    createHistoryModal(debt) {
        const modal = document.createElement('div');
        modal.className = 'history-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 Historial de Pagos - ${debt.studentName}</h3>
                    <button class="close-btn" onclick="this.closest('.history-modal').remove()">×</button>
                </div>
                
                <div class="debt-info">
                    <div class="info-item">
                        <span class="label">Concepto:</span>
                        <span class="value">${debt.concept}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Estado:</span>
                        <span class="value ${debt.status.toLowerCase()}">${this.getStatusLabel(debt.status)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Progreso:</span>
                        <span class="value">${this.formatCurrency(debt.paidAmount)} / ${this.formatCurrency(debt.totalAmount)}</span>
                    </div>
                </div>
                
                <div class="payment-history">
                    <h4>Historial de Abonos</h4>
                    ${debt.paymentHistory.length > 0 ? `
                        <div class="payments-list">
                            ${debt.paymentHistory.map(payment => `
                                <div class="payment-item">
                                    <div class="payment-info">
                                        <div class="payment-amount">${this.formatCurrency(payment.amount)}</div>
                                        <div class="payment-method">${payment.method}</div>
                                        <div class="payment-date">${this.formatDate(payment.date)}</div>
                                    </div>
                                    <div class="payment-details">
                                        <div class="payment-reference">Ref: ${payment.reference}</div>
                                        ${payment.notes ? `<div class="payment-notes">${payment.notes}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="no-payments">
                            <p>No hay abonos registrados</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Generar recordatorio
     */
    generateReminder(debtId) {
        const debt = this.debts.find(d => d.id === debtId);
        if (!debt) return;

        this.showNotification('Recordatorio generado (funcionalidad de envío en desarrollo)', 'info');
        console.log('📧 Recordatorio generado para:', debt.studentName);
    }

    /**
     * Mostrar modal de nueva deuda
     */
    showNewDebtModal() {
        console.log('Nueva deuda - funcionalidad en desarrollo');
        this.showNotification('Funcionalidad en desarrollo', 'info');
    }

    /**
     * Exportar reporte
     */
    exportReport() {
        console.log('Exportar reporte - funcionalidad en desarrollo');
        this.showNotification('Funcionalidad en desarrollo', 'info');
    }

    // Métodos auxiliares
    isOverdue(dueDate) {
        return new Date(dueDate) < new Date();
    }

    getStatusLabel(status) {
        const labels = {
            'OVERDUE': 'Vencida',
            'PENDING': 'Pendiente',
            'PARTIAL': 'Abono Parcial',
            'PAID': 'Pagada'
        };
        return labels[status] || status;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-CO');
    }

    showNotification(message, type = 'info') {
        if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Persistencia
    saveDebts() {
        localStorage.setItem('educonta-debts', JSON.stringify(this.debts));
    }

    loadDebts() {
        try {
            const stored = localStorage.getItem('educonta-debts');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error cargando deudas:', error);
            return [];
        }
    }
}

window.DebtsManagementPage = DebtsManagementPage;