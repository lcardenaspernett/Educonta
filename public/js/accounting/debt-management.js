// ===================================
// EDUCONTA - Sistema de Gestión de Deudas y Abonos
// ===================================

/**
 * Sistema completo para gestionar deudas, abonos y seguimiento de pagos
 */
class DebtManagement {
    constructor() {
        this.debts = this.loadDebts();
        this.payments = this.loadPayments();
        this.init();
    }

    init() {
        console.log('💰 Inicializando sistema de gestión de deudas y abonos');
        // Solo inicializar componentes básicos, NO crear dashboard automáticamente
        this.createDebtCard();
        this.generateSampleDebts();
        // this.createDebtDashboard(); // REMOVIDO: No crear automáticamente
        this.setupSidebarDebtButton();
    }

    /**
     * Configurar sección de deudas en el dashboard
     */
    // Eliminada la función setupDebtSection y addDebtButton

    setupSidebarDebtButton() {
        // Funcionalidad de Deudas y Abonos deshabilitada
        // Esta funcionalidad ha sido removida del sistema
        console.log('⚠️ Funcionalidad de Deudas y Abonos deshabilitada');
        
        // Remover cualquier enlace de "Deudas y Abonos" del sidebar si existe
        const sidebar = document.querySelector('.sidebar-nav');
        if (sidebar) {
            const debtLink = Array.from(sidebar.querySelectorAll('a')).find(a => 
                a.textContent.includes('Deudas y Abonos')
            );
            if (debtLink) {
                debtLink.style.display = 'none';
                console.log('🚫 Enlace de Deudas y Abonos ocultado');
            }
        }
    }

    /**
     * Agregar botón de deudas al header
     */
    addDebtButton() {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions && !document.getElementById('debtBtn')) {
            const button = document.createElement('button');
            button.id = 'debtBtn';
            button.className = 'btn btn-warning';
            button.innerHTML = `
                <svg width="16" height="16" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Deudas (${this.getOverdueCount()})
            `;
            button.onclick = () => this.showDebtManagement();
            
            headerActions.insertBefore(button, headerActions.children[1]);
        }
    }

    /**
     * Crear tarjeta de deudas en el dashboard
     */
    createDebtCard() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid || document.querySelector('.debt-card')) return;

        const debtCard = document.createElement('div');
        debtCard.className = 'dashboard-card debt-card';
        debtCard.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">💳 Estado de Deudas</h3>
                <div class="debt-summary">
                    <span class="debt-count overdue">${this.getOverdueCount()}</span>
                    <span class="debt-count pending">${this.getPendingCount()}</span>
                </div>
            </div>
        `;
        
        dashboardGrid.appendChild(debtCard);
    }

    /**
     * Generar deudas de ejemplo
     */
    generateSampleDebts() {
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
                dueDate: new Date(Date.now() + 86400000 * 15).toISOString(), // 15 días
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
                dueDate: new Date(Date.now() - 86400000 * 5).toISOString(), // Vencida hace 5 días
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
                dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 días
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
        this.saveDebts();
    }

    /**
     * Mostrar interfaz de gestión de deudas
     */
    showDebtManagement() {
        const modal = this.createDebtModal();
        document.body.appendChild(modal);
    }

    /**
     * Crear modal de gestión de deudas
     */
    createDebtModal() {
        const modal = document.createElement('div');
        modal.className = 'debt-modal';
        modal.innerHTML = `
            <div class="debt-modal-content">
                <div class="debt-header">
                    <h2>💳 Gestión de Deudas y Abonos</h2>
                    <div class="debt-stats">
                        <div class="stat-item">
                            <span class="stat-value overdue">${this.getOverdueCount()}</span>
                            <span class="stat-label">Vencidas</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value pending">${this.getPendingCount()}</span>
                            <span class="stat-label">Pendientes</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value partial">${this.getPartialCount()}</span>
                            <span class="stat-label">Parciales</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value total">${this.formatCurrency(this.getTotalDebt())}</span>
                            <span class="stat-label">Total Adeudado</span>
                        </div>
                    </div>
                    <button class="close-btn" onclick="this.closest('.debt-modal').remove()">×</button>
                </div>
                
                <div class="debt-filters">
                    <div class="filter-group">
                        <label>Estado:</label>
                        <select id="debtStatusFilter" onchange="debtManagement.filterDebts()">
                            <option value="">Todos</option>
                            <option value="OVERDUE">🚨 Vencidas</option>
                            <option value="PENDING">⏳ Pendientes</option>
                            <option value="PARTIAL">💰 Parciales</option>
                            <option value="PAID">✅ Pagadas</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Grado:</label>
                        <select id="debtGradeFilter" onchange="debtManagement.filterDebts()">
                            <option value="">Todos</option>
                            <option value="11°">11° Grado</option>
                            <option value="10°">10° Grado</option>
                            <option value="9°">9° Grado</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Buscar:</label>
                        <input type="text" id="debtSearchFilter" placeholder="Nombre del estudiante..." 
                               onkeyup="debtManagement.filterDebts()">
                    </div>
                </div>
                
                <div class="debt-body">
                    <div class="debts-grid" id="debtsGrid">
                        ${this.renderDebtsList()}
                    </div>
                </div>
            </div>
        `;

        this.addDebtModalStyles();
        return modal;
    }

    /**
     * Renderizar lista de deudas
     */
    renderDebtsList() {
        if (this.debts.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">💳</div>
                    <h3>No hay deudas registradas</h3>
                    <p>Las deudas de estudiantes aparecerán aquí</p>
                </div>
            `;
        }

        return this.debts.map(debt => this.renderDebtCard(debt)).join('');
    }

    /**
     * Renderizar tarjeta de deuda individual
     */
    renderDebtCard(debt) {
        const statusConfig = {
            OVERDUE: { icon: '🚨', label: 'Vencida', class: 'overdue', color: 'var(--error)' },
            PENDING: { icon: '⏳', label: 'Pendiente', class: 'pending', color: 'var(--warning)' },
            PARTIAL: { icon: '💰', label: 'Abono Parcial', class: 'partial', color: 'var(--info)' },
            PAID: { icon: '✅', label: 'Pagada', class: 'paid', color: 'var(--success)' }
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
                    <div class="debt-status" style="color: ${config.color}">
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
                        <button class="btn btn-success btn-small" onclick="debtManagement.showPaymentForm('${debt.id}')">
                            💰 Registrar Abono
                        </button>
                    ` : ''}
                    <button class="btn btn-outline btn-small" onclick="debtManagement.showPaymentHistory('${debt.id}')">
                        📊 Historial
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="debtManagement.generatePaymentReminder('${debt.id}')">
                        📧 Recordatorio
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Mostrar formulario de pago/abono
     */
    showPaymentForm(debtId) {
        const debt = this.debts.find(d => d.id === debtId);
        if (!debt) return;

        const formModal = document.createElement('div');
        formModal.className = 'payment-form-modal';
        formModal.innerHTML = `
            <div class="payment-form-content">
                <div class="form-header">
                    <h3>💰 Registrar Abono - ${debt.studentName}</h3>
                    <button class="close-btn" onclick="this.closest('.payment-form-modal').remove()">×</button>
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
                
                <form id="paymentForm" onsubmit="debtManagement.processPayment(event, '${debtId}')">
                    <div class="form-group">
                        <label for="paymentAmount">Monto del Abono *</label>
                        <input type="number" name="amount" id="paymentAmount" required 
                               min="1" max="${debt.pendingAmount}" step="1000"
                               placeholder="Ingrese el monto">
                        <small>Máximo: ${this.formatCurrency(debt.pendingAmount)}</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="paymentMethod">Método de Pago *</label>
                        <select name="method" id="paymentMethod" required>
                            <option value="">Seleccionar método...</option>
                            <option value="Efectivo">💵 Efectivo</option>
                            <option value="Transferencia">🏦 Transferencia Bancaria</option>
                            <option value="Tarjeta">💳 Tarjeta de Crédito/Débito</option>
                            <option value="Cheque">📝 Cheque</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="paymentReference">Referencia</label>
                        <input type="text" name="reference" id="paymentReference" 
                               placeholder="Número de transacción, cheque, etc.">
                    </div>
                    
                    <div class="form-group">
                        <label for="paymentDate">Fecha de Pago</label>
                        <input type="date" name="date" id="paymentDate" 
                               value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label for="paymentNotes">Observaciones</label>
                        <textarea name="notes" id="paymentNotes" rows="3" 
                                  placeholder="Observaciones adicionales..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.payment-form-modal').remove()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-success">
                            💰 Registrar Abono
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(formModal);
    }

    /**
     * Procesar pago/abono
     */
    processPayment(event, debtId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const paymentData = Object.fromEntries(formData);
        const amount = parseFloat(paymentData.amount);
        
        const debt = this.debts.find(d => d.id === debtId);
        if (!debt) return;
        
        // Validar monto
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
        this.updateDebtsList();
        this.updateDebtButton();
        
        // Cerrar modal
        document.querySelector('.payment-form-modal')?.remove();
        
        // Crear transacción contable
        this.createAccountingTransaction(debt, payment);
        
        this.showNotification(
            `Abono de ${this.formatCurrency(amount)} registrado exitosamente`, 
            'success'
        );
    }

    /**
     * Crear transacción contable por el abono
     */
    async createAccountingTransaction(debt, payment) {
        const transactionData = {
            date: payment.date.split('T')[0],
            reference: payment.reference,
            description: `Abono ${debt.concept} - ${debt.studentName}`,
            amount: payment.amount,
            type: 'INCOME',
            debitAccountId: '1', // Caja
            creditAccountId: '5', // Ingresos por servicios educativos
            status: 'APPROVED'
        };

        // Crear transacción usando el sistema existente
        if (window.AccountingState) {
            try {
                await window.AccountingState.createTransaction(transactionData);
                console.log('💰 Transacción contable creada por abono:', transactionData);
            } catch (error) {
                console.error('Error creando transacción contable:', error);
            }
        }
    }

    /**
     * Mostrar historial de pagos
     */
    showPaymentHistory(debtId) {
        const debt = this.debts.find(d => d.id === debtId);
        if (!debt) return;

        const historyModal = document.createElement('div');
        historyModal.className = 'payment-history-modal';
        historyModal.innerHTML = `
            <div class="payment-history-content">
                <div class="history-header">
                    <h3>📊 Historial de Pagos - ${debt.studentName}</h3>
                    <button class="close-btn" onclick="this.closest('.payment-history-modal').remove()">×</button>
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

        document.body.appendChild(historyModal);
    }

    /**
     * Filtrar deudas
     */
    filterDebts() {
        const statusFilter = document.getElementById('debtStatusFilter')?.value || '';
        const gradeFilter = document.getElementById('debtGradeFilter')?.value || '';
        const searchFilter = document.getElementById('debtSearchFilter')?.value.toLowerCase() || '';
        
        let filteredDebts = this.debts;
        
        if (statusFilter) {
            filteredDebts = filteredDebts.filter(d => d.status === statusFilter);
        }
        
        if (gradeFilter) {
            filteredDebts = filteredDebts.filter(d => d.studentGrade.includes(gradeFilter));
        }
        
        if (searchFilter) {
            filteredDebts = filteredDebts.filter(d => 
                d.studentName.toLowerCase().includes(searchFilter) ||
                d.concept.toLowerCase().includes(searchFilter)
            );
        }
        
        const grid = document.getElementById('debtsGrid');
        if (grid) {
            grid.innerHTML = filteredDebts.map(debt => this.renderDebtCard(debt)).join('');
        }
    }

    /**
     * Actualizar lista de deudas
     */
    updateDebtsList() {
        const grid = document.getElementById('debtsGrid');
        if (grid) {
            grid.innerHTML = this.renderDebtsList();
        }
    }

    /**
     * Actualizar botón de deudas
     */
    updateDebtButton() {
        const button = document.getElementById('debtBtn');
        if (button) {
            button.innerHTML = `
                <svg width="16" height="16" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Deudas (${this.getOverdueCount()})
            `;
        }
    }

    /**
     * Generar recordatorio de pago
     */
    generatePaymentReminder(debtId) {
        const debt = this.debts.find(d => d.id === debtId);
        if (!debt) return;

        const reminderText = `
Estimado acudiente de ${debt.studentName},

Le recordamos que tiene pendiente el pago de:
- Concepto: ${debt.concept}
- Monto pendiente: ${this.formatCurrency(debt.pendingAmount)}
- Fecha de vencimiento: ${this.formatDate(debt.dueDate)}

Por favor, acérquese a la institución para realizar el pago.

Gracias por su atención.
        `.trim();

        // Simular envío de recordatorio
        this.showNotification('Recordatorio generado (funcionalidad de envío en desarrollo)', 'info');
        console.log('📧 Recordatorio generado:', reminderText);
    }

    // Métodos auxiliares
    getOverdueCount() {
        return this.debts.filter(d => d.status === 'OVERDUE').length;
    }

    getPendingCount() {
        return this.debts.filter(d => d.status === 'PENDING').length;
    }

    getPartialCount() {
        return this.debts.filter(d => d.status === 'PARTIAL').length;
    }

    getTotalDebt() {
        return this.debts.reduce((total, debt) => total + debt.pendingAmount, 0);
    }

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

    loadPayments() {
        try {
            const stored = localStorage.getItem('educonta-payments');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error cargando pagos:', error);
            return [];
        }
    }

    // Utilidades
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

    /**
     * Agregar estilos del modal
     */
    addDebtModalStyles() {
        if (document.getElementById('debt-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'debt-modal-styles';
        styles.textContent = `
            .debt-modal, .payment-form-modal, .payment-history-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .debt-modal-content, .payment-form-content, .payment-history-content {
                background: var(--bg-card);
                border-radius: 16px;
                width: 90%;
                max-width: 1200px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
            }

            .payment-form-content {
                max-width: 500px;
            }

            .payment-history-content {
                max-width: 600px;
            }

            .debt-header, .form-header, .history-header {
                padding: 1.5rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--warning);
                color: white;
            }

            .debt-stats {
                display: flex;
                gap: 1rem;
            }

            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.25rem;
            }

            .stat-value {
                font-size: 1.25rem;
                font-weight: 600;
            }

            .stat-value.overdue { color: #ffeb3b; }
            .stat-value.pending { color: #fff; }
            .stat-value.partial { color: #81c784; }
            .stat-value.total { color: #ffab40; }

            .stat-label {
                font-size: 0.75rem;
                opacity: 0.9;
            }

            .debt-filters {
                padding: 1rem 1.5rem;
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--border);
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                min-width: 150px;
            }

            .filter-group label {
                font-size: 0.8rem;
                font-weight: 500;
                color: var(--text-secondary);
            }

            .filter-group select,
            .filter-group input {
                padding: 0.5rem;
                border: 1px solid var(--border);
                border-radius: 4px;
                background: var(--bg-primary);
                color: var(--text-primary);
                font-size: 0.875rem;
            }

            .debt-body {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }

            .debts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 1rem;
            }

            .debt-card {
                border: 1px solid var(--border);
                border-radius: 12px;
                background: var(--bg-secondary);
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .debt-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            }

            .debt-card.overdue {
                border-left: 4px solid var(--error);
                background: linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, var(--bg-secondary) 100%);
            }

            .debt-card.partial {
                border-left: 4px solid var(--info);
                background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, var(--bg-secondary) 100%);
            }

            .debt-card.paid {
                border-left: 4px solid var(--success);
                background: linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-secondary) 100%);
                opacity: 0.8;
            }

            .debt-card-header {
                padding: 1rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .student-info h4 {
                margin: 0 0 0.25rem 0;
                color: var(--text-primary);
                font-size: 1rem;
            }

            .student-grade {
                font-size: 0.8rem;
                color: var(--text-light);
                background: var(--bg-tertiary);
                padding: 0.2rem 0.5rem;
                border-radius: 12px;
            }

            .debt-status {
                font-size: 0.8rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .debt-card-body {
                padding: 1rem;
            }

            .debt-concept {
                margin-bottom: 1rem;
                font-size: 0.95rem;
                color: var(--text-primary);
            }

            .debt-amounts {
                margin-bottom: 1rem;
            }

            .amount-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
            }

            .amount-row .label {
                color: var(--text-light);
            }

            .amount-row .value {
                font-weight: 500;
                color: var(--text-primary);
            }

            .amount-row .value.paid {
                color: var(--success);
            }

            .amount-row .value.pending {
                color: var(--error);
                font-weight: 600;
            }

            .payment-progress {
                margin: 1rem 0;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: var(--bg);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 0.5rem;
            }

            .progress-fill {
                height: 100%;
                background: var(--success);
                transition: width 0.3s ease;
            }

            .progress-text {
                font-size: 0.75rem;
                color: var(--text-light);
            }

            .debt-dates {
                margin-bottom: 1rem;
            }

            .date-info {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
            }

            .date-info .label {
                color: var(--text-light);
            }

            .date-info .value {
                color: var(--text-primary);
            }

            .date-info .value.overdue {
                color: var(--error);
                font-weight: 600;
            }

            .debt-card-actions {
                padding: 1rem;
                border-top: 1px solid var(--border);
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .debt-card-actions .btn {
                flex: 1;
                min-width: auto;
                font-size: 0.8rem;
                padding: 0.5rem 0.75rem;
            }

            .btn-small {
                font-size: 0.8rem;
                padding: 0.5rem 0.75rem;
            }

            .debt-summary {
                background: var(--bg-secondary);
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
            }

            .summary-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                font-size: 0.9rem;
            }

            .summary-item:last-child {
                margin-bottom: 0;
            }

            .summary-item .label {
                color: var(--text-light);
            }

            .summary-item .value {
                font-weight: 500;
                color: var(--text-primary);
            }

            .summary-item .value.pending {
                color: var(--error);
                font-weight: 600;
            }

            .form-group {
                margin-bottom: 1rem;
            }

            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: var(--text-primary);
                font-size: 0.9rem;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border);
                border-radius: 6px;
                background: var(--bg-primary);
                color: var(--text-primary);
                font-size: 0.9rem;
                transition: border-color 0.2s ease;
            }

            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .form-group small {
                display: block;
                margin-top: 0.25rem;
                font-size: 0.8rem;
                color: var(--text-light);
            }

            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }

            .form-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                padding-top: 1rem;
                border-top: 1px solid var(--border);
            }

            .debt-info {
                padding: 1rem;
                background: var(--bg-secondary);
                border-radius: 8px;
                margin-bottom: 1.5rem;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                font-size: 0.9rem;
            }

            .info-item:last-child {
                margin-bottom: 0;
            }

            .info-item .label {
                color: var(--text-light);
                font-weight: 500;
            }

            .info-item .value {
                color: var(--text-primary);
            }

            .info-item .value.overdue {
                color: var(--error);
            }

            .info-item .value.partial {
                color: var(--warning);
            }

            .info-item .value.paid {
                color: var(--success);
            }

            .payment-history {
                padding: 1rem;
            }

            .payment-history h4 {
                margin: 0 0 1rem 0;
                color: var(--text-primary);
                border-bottom: 1px solid var(--border);
                padding-bottom: 0.5rem;
            }

            .payments-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .payment-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                border: 1px solid var(--border);
                border-radius: 8px;
                background: var(--bg-secondary);
            }

            .payment-info {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .payment-amount {
                font-size: 1rem;
                font-weight: 600;
                color: var(--success);
            }

            .payment-method {
                font-size: 0.8rem;
                color: var(--text);
                margin: 0.2rem 0;
            }

            .payment-date {
                font-size: 0.75rem;
                color: var(--text-light);
            }

            .payment-details {
                text-align: right;
            }

            .payment-reference {
                font-size: 0.75rem;
                color: var(--text-light);
                font-family: monospace;
            }

            .payment-notes {
                font-size: 0.8rem;
                color: var(--text);
                margin-top: 0.25rem;
                font-style: italic;
                max-width: 200px;
            }

            .no-payments {
                text-align: center;
                padding: 2rem;
                color: var(--text-light);
            }

            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 3rem;
                text-align: center;
                grid-column: 1 / -1;
            }

            .empty-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
                opacity: 0.5;
            }

            .empty-state h3 {
                margin: 0 0 0.5rem 0;
                color: var(--text-primary);
            }

            .empty-state p {
                margin: 0;
                color: var(--text-light);
                font-size: 0.9rem;
            }

            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }

            .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            @media (max-width: 768px) {
                .debts-grid {
                    grid-template-columns: 1fr;
                }
                
                .debt-stats {
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .debt-filters {
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .filter-group {
                    min-width: auto;
                }

                .debt-card-actions {
                    flex-direction: column;
                }

                .debt-card-actions .btn {
                    flex: none;
                }

                .form-actions {
                    flex-direction: column;
                }

                .payment-item {
                    flex-direction: column;
                    align-items: stretch;
                    text-align: center;
                }

                .payment-details {
                    text-align: center;
                    margin-top: 0.5rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Crear dashboard de deudas
     */
    createDebtDashboard() {
        console.log('💰 Creando dashboard de deudas');
        
        // Verificar si ya existe el dashboard
        if (document.getElementById('debt-dashboard')) {
            console.log('💰 Dashboard de deudas ya existe');
            return;
        }

        // Crear contenedor del dashboard
        const dashboardContainer = document.createElement('div');
        dashboardContainer.id = 'debt-dashboard';
        dashboardContainer.className = 'debt-dashboard hidden';
        dashboardContainer.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                        <i class="fas fa-money-bill-wave mr-2"></i>
                        Gestión de Deudas y Abonos
                    </h2>
                    <button class="btn btn-primary" onclick="window.debtManagement.showNewDebtModal()">
                        <i class="fas fa-plus mr-2"></i>Nueva Deuda
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                                <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-400"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-red-600 dark:text-red-400">Total Deudas</p>
                                <p class="text-lg font-semibold text-red-700 dark:text-red-300" id="total-debts">$0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                <i class="fas fa-check-circle text-green-600 dark:text-green-400"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-green-600 dark:text-green-400">Total Abonos</p>
                                <p class="text-lg font-semibold text-green-700 dark:text-green-300" id="total-payments">$0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div class="flex items-center">
                            <div class="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                <i class="fas fa-balance-scale text-blue-600 dark:text-blue-400"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm text-blue-600 dark:text-blue-400">Saldo Pendiente</p>
                                <p class="text-lg font-semibold text-blue-700 dark:text-blue-300" id="pending-balance">$0</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="debts-list-container">
                    <!-- Lista de deudas se carga aquí -->
                </div>
            </div>
        `;

        // Agregar al contenedor principal
        const mainContent = document.querySelector('.main-content') || document.body;
        mainContent.appendChild(dashboardContainer);
        
        console.log('✅ Dashboard de deudas creado');
    }

    showNewDebtModal() {
        console.log('💰 Mostrando modal de nueva deuda');
        // Implementar modal de nueva deuda
        if (window.showModal) {
            window.showModal('new-debt-modal');
        }
    }
}

// NO inicializar automáticamente - solo cuando se necesite
// Se inicializará manualmente desde la página de deudas

// Función para inicializar manualmente
window.initDebtManagement = function() {
    if (!window.debtManagement) {
        window.debtManagement = new DebtManagement();
    }
};

console.log('💰 Sistema de gestión de deudas y abonos cargado');