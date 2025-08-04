// ===================================
// EDUCONTA - Sistema de Estados de Aprobación
// ===================================

/**
 * Sistema para mostrar estados de aprobación en movimientos y facturas
 */
class ApprovalStatusManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('📋 Inicializando sistema de estados de aprobación');
        this.setupMovementsSection();
        this.setupInvoicesSection();
    }

    /**
     * Configurar sección de movimientos con estados
     */
    setupMovementsSection() {
        // Interceptar la renderización de transacciones para agregar estados
        this.enhanceTransactionsList();
        
        // Agregar filtro por estado de aprobación
        this.addApprovalFilters();
    }

    /**
     * Mejorar lista de transacciones con estados de aprobación
     */
    enhanceTransactionsList() {
        // Interceptar el método original de renderizado
        const originalRenderTransactionsList = window.accountingController?.renderTransactionsList;
        
        if (originalRenderTransactionsList) {
            window.accountingController.renderTransactionsList = (transactions) => {
                this.renderTransactionsWithApprovalStatus(transactions);
            };
        }

        // También interceptar actualizaciones del estado
        if (window.AccountingState) {
            window.AccountingState.subscribe('transactions', (transactions) => {
                this.renderTransactionsWithApprovalStatus(transactions);
            });
        }
    }

    /**
     * Renderizar transacciones con estado de aprobación
     */
    renderTransactionsWithApprovalStatus(transactions) {
        console.log('🎨 Renderizando transacciones con estados de aprobación:', transactions.length);

        let container = document.getElementById('transactionsList');
        
        if (!container) {
            // Crear container si no existe
            const section = document.getElementById('movements-section');
            if (section) {
                const existingCard = section.querySelector('.transactions-card');
                if (existingCard) {
                    container = existingCard.querySelector('#transactionsList') || 
                               this.createTransactionsContainer(existingCard);
                }
            }
        }

        if (!container) {
            console.error('❌ No se pudo encontrar/crear container de transacciones');
            return;
        }

        if (!transactions || transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No hay movimientos registrados</h3>
                    <p>Los movimientos contables aparecerán aquí</p>
                </div>
            `;
            return;
        }

        // Agrupar transacciones por estado
        const groupedTransactions = this.groupTransactionsByStatus(transactions);

        let html = '';

        // Sección de transacciones pendientes de aprobación
        if (groupedTransactions.pending.length > 0) {
            html += this.renderApprovalSection('Pendientes de Aprobación', groupedTransactions.pending, 'pending');
        }

        // Sección de transacciones aprobadas
        if (groupedTransactions.approved.length > 0) {
            html += this.renderApprovalSection('Aprobadas', groupedTransactions.approved, 'approved');
        }

        // Sección de transacciones rechazadas
        if (groupedTransactions.rejected.length > 0) {
            html += this.renderApprovalSection('Rechazadas', groupedTransactions.rejected, 'rejected');
        }

        container.innerHTML = html;
        
        // Forzar visibilidad
        setTimeout(() => {
            container.style.display = 'block';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
        }, 100);
    }

    /**
     * Agrupar transacciones por estado de aprobación
     */
    groupTransactionsByStatus(transactions) {
        return {
            pending: transactions.filter(t => t.status === 'PENDING'),
            approved: transactions.filter(t => t.status === 'APPROVED'),
            rejected: transactions.filter(t => t.status === 'REJECTED')
        };
    }

    /**
     * Renderizar sección de aprobación
     */
    renderApprovalSection(title, transactions, status) {
        const statusConfig = {
            pending: {
                icon: '⏳',
                color: 'var(--warning)',
                bgColor: 'rgba(245, 158, 11, 0.1)',
                description: 'Esperando aprobación'
            },
            approved: {
                icon: '✅',
                color: 'var(--success)',
                bgColor: 'rgba(16, 185, 129, 0.1)',
                description: 'Aprobadas y contabilizadas'
            },
            rejected: {
                icon: '❌',
                color: 'var(--error)',
                bgColor: 'rgba(239, 68, 68, 0.1)',
                description: 'Rechazadas por el aprobador'
            }
        };

        const config = statusConfig[status];
        
        return `
            <div class="approval-section" data-status="${status}">
                <div class="approval-section-header" style="
                    background: ${config.bgColor};
                    border-left: 4px solid ${config.color};
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border-radius: 8px;
                ">
                    <h3 style="
                        margin: 0;
                        color: ${config.color};
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        font-size: 1.125rem;
                    ">
                        ${config.icon} ${title} (${transactions.length})
                    </h3>
                    <p style="
                        margin: 0.25rem 0 0 0;
                        color: var(--text-light);
                        font-size: 0.875rem;
                    ">${config.description}</p>
                </div>
                
                <div class="transactions-grid">
                    ${transactions.map(transaction => this.renderTransactionWithStatus(transaction, status)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Renderizar transacción individual con estado
     */
    renderTransactionWithStatus(transaction, status) {
        const isIncome = transaction.type === 'INCOME';
        const amountClass = isIncome ? 'amount-income' : 'amount-expense';
        const icon = isIncome ? '💰' : '💸';
        
        // Determinar información de aprobación
        const approvalInfo = this.getApprovalInfo(transaction);
        
        return `
            <div class="transaction-item-enhanced" data-transaction-id="${transaction.id}" data-status="${status}">
                <div class="transaction-main-info">
                    <div class="transaction-icon" style="background-color: ${isIncome ? 'var(--success)' : 'var(--error)'}; color: white;">
                        ${icon}
                    </div>
                    <div class="transaction-details">
                        <h4 class="transaction-description">${transaction.description || 'Sin descripción'}</h4>
                        <div class="transaction-meta">
                            <span class="transaction-reference">Ref: ${transaction.reference || transaction.id}</span>
                            <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                            <span class="transaction-type">${transaction.type === 'INCOME' ? 'Ingreso' : 'Egreso'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="transaction-approval-info">
                    ${this.renderApprovalStatus(transaction, approvalInfo)}
                </div>
                
                <div class="transaction-amount-section">
                    <div class="transaction-amount ${amountClass}">
                        ${this.formatCurrency(transaction.amount)}
                    </div>
                    <div class="transaction-actions">
                        ${this.renderTransactionActions(transaction, status)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderizar estado de aprobación
     */
    renderApprovalStatus(transaction, approvalInfo) {
        if (transaction.status === 'PENDING') {
            return `
                <div class="approval-status pending">
                    <div class="status-indicator">
                        <span class="status-icon">⏳</span>
                        <span class="status-text">Esperando Aprobación</span>
                    </div>
                    <div class="approval-details">
                        <small>Requiere: ${approvalInfo.requiredApprover}</small>
                        <small>Razón: ${approvalInfo.reason}</small>
                    </div>
                </div>
            `;
        } else if (transaction.status === 'APPROVED') {
            return `
                <div class="approval-status approved">
                    <div class="status-indicator">
                        <span class="status-icon">✅</span>
                        <span class="status-text">Aprobada</span>
                    </div>
                    <div class="approval-details">
                        <small>Aprobada: ${this.formatDate(transaction.updatedAt)}</small>
                    </div>
                </div>
            `;
        } else if (transaction.status === 'REJECTED') {
            return `
                <div class="approval-status rejected">
                    <div class="status-indicator">
                        <span class="status-icon">❌</span>
                        <span class="status-text">Rechazada</span>
                    </div>
                    <div class="approval-details">
                        <small>Rechazada: ${this.formatDate(transaction.updatedAt)}</small>
                    </div>
                </div>
            `;
        }
        
        return '';
    }

    /**
     * Obtener información de aprobación para una transacción
     */
    getApprovalInfo(transaction) {
        // Simular lógica de aprobación basada en monto y concepto
        const amount = transaction.amount || 0;
        const description = (transaction.description || '').toUpperCase();
        
        // Determinar si requiere Rector o Contador Auxiliar
        let requiredApprover = 'Contador Auxiliar';
        let reason = 'Monto regular';
        
        // Montos altos = Rector
        if (amount > 1000000) {
            requiredApprover = 'Rector';
            reason = 'Monto superior a $1,000,000';
        }
        // Conceptos importantes = Rector
        else if (description.includes('MATRICULA') || description.includes('EXCURSION') || 
                 description.includes('GRADO') || description.includes('CURSO')) {
            requiredApprover = 'Rector';
            reason = 'Concepto requiere aprobación del Rector';
        }
        
        return {
            requiredApprover,
            reason
        };
    }

    /**
     * Renderizar acciones de transacción
     */
    renderTransactionActions(transaction, status) {
        if (status === 'pending') {
            const approvalInfo = this.getApprovalInfo(transaction);
            const userRole = this.getCurrentUserRole();
            
            // Verificar si el usuario actual puede aprobar
            const canApprove = (approvalInfo.requiredApprover === 'Rector' && userRole === 'RECTOR') ||
                              (approvalInfo.requiredApprover === 'Contador Auxiliar' && 
                               ['AUXILIARY_ACCOUNTANT', 'RECTOR'].includes(userRole));
            
            return `
                ${canApprove ? `
                    <button class="btn btn-small btn-success" onclick="approvalStatusManager.approveTransaction('${transaction.id}')">
                        ✅ Aprobar
                    </button>
                ` : `
                    <span class="approval-required" title="Requiere: ${approvalInfo.requiredApprover}">
                        🔒 ${approvalInfo.requiredApprover}
                    </span>
                `}
                ${userRole === 'RECTOR' ? `
                    <button class="btn btn-small btn-danger" onclick="approvalStatusManager.rejectTransaction('${transaction.id}')">
                        ❌ Rechazar
                    </button>
                ` : ''}
            `;
        }
        
        return `
            <button class="btn btn-small btn-outline" onclick="approvalStatusManager.viewTransactionDetails('${transaction.id}')">
                👁️ Ver
            </button>
        `;
    }

    /**
     * Aprobar transacción
     */
    async approveTransaction(transactionId) {
        if (confirm('¿Aprobar esta transacción?')) {
            try {
                // Aquí iría la llamada al backend para aprobar
                console.log('✅ Aprobando transacción:', transactionId);
                
                // Simular aprobación actualizando el estado local
                if (null) {
                    const transaction = null.transactions.find(t => t.id === transactionId);
                    if (transaction) {
                        transaction.status = 'APPROVED';
                        transaction.updatedAt = new Date().toISOString();
                        
                        // Actualizar display
                        this.renderTransactionsWithApprovalStatus(null.transactions);
                        
                        this.showNotification('Transacción aprobada exitosamente', 'success');
                    }
                }
                
            } catch (error) {
                console.error('Error aprobando transacción:', error);
                this.showNotification('Error al aprobar la transacción', 'error');
            }
        }
    }

    /**
     * Rechazar transacción
     */
    async rejectTransaction(transactionId) {
        const reason = prompt('¿Por qué rechazar esta transacción?');
        if (reason) {
            try {
                console.log('❌ Rechazando transacción:', transactionId, 'Razón:', reason);
                
                // Simular rechazo
                if (null) {
                    const transaction = null.transactions.find(t => t.id === transactionId);
                    if (transaction) {
                        transaction.status = 'REJECTED';
                        transaction.updatedAt = new Date().toISOString();
                        transaction.rejectionReason = reason;
                        
                        // Actualizar display
                        this.renderTransactionsWithApprovalStatus(null.transactions);
                        
                        this.showNotification('Transacción rechazada', 'warning');
                    }
                }
                
            } catch (error) {
                console.error('Error rechazando transacción:', error);
                this.showNotification('Error al rechazar la transacción', 'error');
            }
        }
    }

    /**
     * Crear container de transacciones si no existe
     */
    createTransactionsContainer(parentCard) {
        const container = document.createElement('div');
        container.id = 'transactionsList';
        container.className = 'transaction-list';
        
        parentCard.appendChild(container);
        return container;
    }

    /**
     * Agregar filtros de aprobación
     */
    addApprovalFilters() {
        // Buscar la barra de filtros existente
        const filtersBar = document.querySelector('.filters-bar');
        if (!filtersBar) return;

        // Agregar filtro por estado de aprobación
        const approvalFilter = document.createElement('div');
        approvalFilter.className = 'filter-group';
        approvalFilter.innerHTML = `
            <label class="filter-label">Estado:</label>
            <select class="filter-select" id="approvalStatusFilter" onchange="approvalStatusManager.filterByApprovalStatus(this.value)">
                <option value="">Todos los estados</option>
                <option value="PENDING">⏳ Pendientes</option>
                <option value="APPROVED">✅ Aprobadas</option>
                <option value="REJECTED">❌ Rechazadas</option>
            </select>
        `;

        // Insertar después del filtro de tipo
        const typeFilter = filtersBar.querySelector('#typeFilter')?.parentElement;
        if (typeFilter) {
            typeFilter.insertAdjacentElement('afterend', approvalFilter);
        }
    }

    /**
     * Filtrar por estado de aprobación
     */
    filterByApprovalStatus(status) {
        const sections = document.querySelectorAll('.approval-section');
        
        sections.forEach(section => {
            if (!status || section.dataset.status === status.toLowerCase()) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }

    // Métodos auxiliares
    getCurrentUserRole() {
        if (window.AccountingState) {
            const user = window.AccountingState.get('user');
            if (user && user.role) return user.role;
        }
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role || 'AUXILIARY_ACCOUNTANT';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.approvalStatusManager = new ApprovalStatusManager();
    }, 3000);
});

console.log('📋 Sistema de estados de aprobación cargado');