// ===================================
// EDUCONTA - Gestión de Facturas Pendientes
// ===================================

/**
 * Sistema completo de gestión de facturas pendientes con aprobaciones
 */
class PendingInvoicesManager {
    constructor() {
        this.pendingInvoices = this.loadPendingInvoices();
        this.approvalSystem = window.approvalSystem;
        this.init();
    }

    init() {
        console.log('📋 Inicializando gestor de facturas pendientes');
        this.setupDashboardSection();
        this.generateSampleInvoices(); // Para demo
    }

    /**
     * Crear sección en el dashboard
     */
    setupDashboardSection() {
        // Esperar a que el dashboard esté listo
        setTimeout(() => {
            this.createPendingInvoicesCard();
            this.updateDashboardStats();
        }, 2000);
    }

    /**
     * Crear tarjeta de facturas pendientes
     */
    createPendingInvoicesCard() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) return;

        const pendingCard = document.createElement('div');
        pendingCard.className = 'dashboard-card pending-invoices-card';
        pendingCard.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">📋 Facturas Pendientes de Aprobación</h3>
                <div class="pending-badges">
                    <span class="pending-count urgent">${this.getUrgentCount()}</span>
                    <span class="pending-count normal">${this.getNormalCount()}</span>
                </div>
            </div>
            <div class="card-content">
                <div class="pending-summary">
                    <div class="summary-item">
                        <span class="summary-label">Requieren mi aprobación:</span>
                        <span class="summary-value" id="myApprovalCount">${this.getMyApprovalCount()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total pendientes:</span>
                        <span class="summary-value">${this.pendingInvoices.length}</span>
                    </div>
                </div>
                
                <div class="pending-invoices-list" id="pendingInvoicesList">
                    ${this.renderPendingInvoicesList()}
                </div>
                
                <div class="pending-actions">
                    <button class="btn btn-outline" onclick="window.pendingInvoicesManager.showAllPending()">
                        <svg width="16" height="16" fill="currentColor">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                        </svg>
                        Ver Todas (${this.pendingInvoices.length})
                    </button>
                    <button class="btn btn-primary" onclick="window.pendingInvoicesManager.showApprovalInterface()" 
                            ${this.getMyApprovalCount() === 0 ? 'disabled' : ''}>
                        <svg width="16" height="16" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Aprobar Facturas (${this.getMyApprovalCount()})
                    </button>
                </div>
            </div>
        `;

        dashboardGrid.appendChild(pendingCard);
        this.addPendingInvoicesStyles();
    }

    /**
     * Renderizar lista resumida de facturas pendientes
     */
    renderPendingInvoicesList() {
        if (this.pendingInvoices.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <p>No hay facturas pendientes</p>
                    <small>Todas las facturas han sido procesadas</small>
                </div>
            `;
        }

        // Mostrar solo las 3 más urgentes
        const urgentInvoices = this.pendingInvoices
            .filter(inv => this.isUrgent(inv))
            .slice(0, 3);

        if (urgentInvoices.length === 0) {
            return `
                <div class="info-state">
                    <div class="info-icon">📋</div>
                    <p>${this.pendingInvoices.length} facturas pendientes</p>
                    <small>Ninguna requiere atención urgente</small>
                </div>
            `;
        }

        return urgentInvoices.map(invoice => this.renderInvoiceItem(invoice)).join('');
    }

    /**
     * Renderizar item individual de factura
     */
    renderInvoiceItem(invoice) {
        const approvalInfo = this.approvalSystem.requiresApproval(invoice);
        const canApprove = this.approvalSystem.canApprove(invoice);
        const urgency = this.getInvoiceUrgency(invoice);

        return `
            <div class="pending-invoice-item ${urgency.class}" data-invoice-id="${invoice.id}">
                <div class="invoice-priority">
                    <span class="priority-indicator ${urgency.class}">${urgency.icon}</span>
                </div>
                
                <div class="invoice-info">
                    <div class="invoice-student">${invoice.studentName}</div>
                    <div class="invoice-concept">
                        <span class="concept-type">${invoice.concept}</span>
                        ${invoice.hasDiscount ? '<span class="discount-badge">Con descuento</span>' : ''}
                    </div>
                    <div class="invoice-meta">
                        <span class="invoice-date">${this.formatDate(invoice.createdAt)}</span>
                        ${this.isOverdue(invoice) ? '<span class="overdue-badge">Vencida</span>' : ''}
                    </div>
                </div>
                
                <div class="invoice-amount">
                    <div class="amount-value">${this.formatCurrency(invoice.amount)}</div>
                    <div class="approval-info">
                        <small>${approvalInfo.required ? 'Requiere aprobación' : 'Auto-aprobable'}</small>
                    </div>
                </div>
                
                <div class="invoice-actions">
                    ${canApprove.canApprove ? `
                        <button class="btn-action approve" onclick="pendingInvoicesManager.quickApprove('${invoice.id}')" 
                                title="Aprobar factura">
                            ✅
                        </button>
                    ` : `
                        <span class="approval-required" title="${canApprove.reason}">
                            🔒
                        </span>
                    `}
                    <button class="btn-action details" onclick="pendingInvoicesManager.showInvoiceDetails('${invoice.id}')" 
                            title="Ver detalles">
                        👁️
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Mostrar todas las facturas pendientes
     */
    showAllPending() {
        this.showApprovalInterface();
    }

    /**
     * Mostrar interfaz completa de aprobación
     */
    showApprovalInterface() {
        const modal = this.createApprovalModal();
        document.body.appendChild(modal);
    }

    /**
     * Crear modal de aprobación
     */
    createApprovalModal() {
        const modal = document.createElement('div');
        modal.className = 'approval-modal';
        modal.innerHTML = `
            <div class="approval-modal-content">
                <div class="approval-header">
                    <h2>📋 Gestión de Facturas Pendientes</h2>
                    <div class="approval-stats">
                        <span class="stat-item">
                            <span class="stat-label">Total:</span>
                            <span class="stat-value">${this.pendingInvoices.length}</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-label">Puedo aprobar:</span>
                            <span class="stat-value">${this.getMyApprovalCount()}</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-label">Urgentes:</span>
                            <span class="stat-value urgent">${this.getUrgentCount()}</span>
                        </span>
                    </div>
                    <button class="close-btn" onclick="this.closest('.approval-modal').remove()">×</button>
                </div>
                
                <div class="approval-filters">
                    <div class="filter-group">
                        <label>Filtrar por:</label>
                        <select id="conceptFilter" onchange="pendingInvoicesManager.filterInvoices()">
                            <option value="">Todos los conceptos</option>
                            ${this.getUniqueConceptsOptions()}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Estado:</label>
                        <select id="statusFilter" onchange="pendingInvoicesManager.filterInvoices()">
                            <option value="">Todos</option>
                            <option value="can-approve">Puedo aprobar</option>
                            <option value="urgent">Urgentes</option>
                            <option value="overdue">Vencidas</option>
                        </select>
                    </div>
                    <div class="filter-actions">
                        <button class="btn btn-outline" onclick="pendingInvoicesManager.clearFilters()">
                            Limpiar filtros
                        </button>
                        <button class="btn btn-success" onclick="pendingInvoicesManager.bulkApprove()" 
                                ${this.getMyApprovalCount() === 0 ? 'disabled' : ''}>
                            Aprobar todas las mías
                        </button>
                    </div>
                </div>
                
                <div class="approval-body">
                    <div class="invoices-grid" id="approvalInvoicesGrid">
                        ${this.renderFullInvoicesList()}
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Renderizar lista completa de facturas
     */
    renderFullInvoicesList() {
        return this.pendingInvoices.map(invoice => {
            const approvalInfo = this.approvalSystem.requiresApproval(invoice);
            const canApprove = this.approvalSystem.canApprove(invoice);
            const urgency = this.getInvoiceUrgency(invoice);

            return `
                <div class="invoice-card ${urgency.class}" data-invoice-id="${invoice.id}">
                    <div class="card-header">
                        <div class="student-info">
                            <h4>${invoice.studentName}</h4>
                            <p class="student-grade">${invoice.studentGrade || 'Sin grado'}</p>
                        </div>
                        <div class="urgency-indicator ${urgency.class}">
                            ${urgency.icon} ${urgency.label}
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <div class="invoice-details">
                            <div class="detail-row">
                                <span class="label">Concepto:</span>
                                <span class="value concept-${this.approvalSystem.normalizeConceptType(invoice.concept).toLowerCase()}">
                                    ${invoice.concept}
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Monto:</span>
                                <span class="value amount">${this.formatCurrency(invoice.amount)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Fecha:</span>
                                <span class="value">${this.formatDate(invoice.createdAt)}</span>
                            </div>
                            ${invoice.dueDate ? `
                                <div class="detail-row">
                                    <span class="label">Vencimiento:</span>
                                    <span class="value ${this.isOverdue(invoice) ? 'overdue' : ''}">${this.formatDate(invoice.dueDate)}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="approval-details">
                            <div class="approval-rule">
                                <strong>Regla de aprobación:</strong>
                                <p>${approvalInfo.reason}</p>
                                <p><strong>Requiere:</strong> ${approvalInfo.approvers.map(r => this.approvalSystem.getRoleLabel(r)).join(' o ')}</p>
                            </div>
                            
                            <div class="approval-status">
                                ${canApprove.canApprove ? `
                                    <span class="status-badge can-approve">✅ Puedes aprobar</span>
                                ` : `
                                    <span class="status-badge cannot-approve">🔒 ${canApprove.reason}</span>
                                `}
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-actions">
                        ${canApprove.canApprove ? `
                            <button class="btn btn-success" onclick="pendingInvoicesManager.approveInvoice('${invoice.id}')">
                                ✅ Aprobar
                            </button>
                        ` : ''}
                        <button class="btn btn-outline" onclick="pendingInvoicesManager.showInvoiceDetails('${invoice.id}')">
                            👁️ Ver detalles
                        </button>
                        <button class="btn btn-secondary" onclick="pendingInvoicesManager.editInvoice('${invoice.id}')">
                            ✏️ Editar
                        </button>
                        ${this.approvalSystem.userRole === 'RECTOR' ? `
                            <button class="btn btn-danger" onclick="pendingInvoicesManager.rejectInvoice('${invoice.id}')">
                                ❌ Rechazar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Aprobación rápida desde el dashboard
     */
    async quickApprove(invoiceId) {
        const invoice = this.findInvoice(invoiceId);
        if (!invoice) return;

        if (confirm(`¿Aprobar factura de ${invoice.studentName} por ${this.formatCurrency(invoice.amount)}?`)) {
            await this.approveInvoice(invoiceId);
        }
    }

    /**
     * Aprobar factura
     */
    async approveInvoice(invoiceId) {
        const invoice = this.findInvoice(invoiceId);
        if (!invoice) {
            this.showNotification('Factura no encontrada', 'error');
            return;
        }

        try {
            // Usar el sistema de aprobaciones
            const approval = await this.approvalSystem.approveInvoice(invoice);
            
            // Crear transacción contable automáticamente
            await this.createAccountingTransaction(invoice);
            
            // Remover de pendientes
            this.pendingInvoices = this.pendingInvoices.filter(inv => inv.id !== invoiceId);
            this.savePendingInvoices();
            
            // Actualizar UI
            this.updateAllDisplays();
            
            this.showNotification(
                `Factura de ${invoice.studentName} aprobada exitosamente`, 
                'success'
            );

            // Log para auditoría
            console.log('✅ Factura aprobada:', {
                invoice: invoice.id,
                student: invoice.studentName,
                amount: invoice.amount,
                approver: approval.approverName,
                timestamp: approval.approvedAt
            });

        } catch (error) {
            console.error('Error aprobando factura:', error);
            this.showNotification(error.message, 'error');
        }
    }

    /**
     * Crear transacción contable automáticamente
     */
    async createAccountingTransaction(invoice) {
        const conceptType = this.approvalSystem.normalizeConceptType(invoice.concept);
        
        // Determinar cuentas según el concepto
        const accountMapping = {
            'MATRICULA': { debit: '1', credit: '5' }, // Caja -> Ingresos servicios educativos
            'MENSUALIDAD': { debit: '1', credit: '5' },
            'RIFA': { debit: '1', credit: 'income-2' }, // Caja -> Otros ingresos
            'UNIFORME': { debit: '1', credit: 'income-2' },
            'CERTIFICADO': { debit: '1', credit: 'income-2' },
            'CARNET': { debit: '1', credit: 'income-2' },
            'OTRO': { debit: '1', credit: 'income-2' }
        };

        const accounts = accountMapping[conceptType] || accountMapping['OTRO'];

        const transactionData = {
            date: new Date().toISOString().split('T')[0],
            reference: `FAC-${invoice.invoiceNumber || invoice.id}`,
            description: `${invoice.concept} - ${invoice.studentName}`,
            amount: invoice.amount,
            type: 'INCOME',
            debitAccountId: accounts.debit,
            creditAccountId: accounts.credit,
            status: 'APPROVED'
        };

        // Crear transacción usando el sistema existente
        if (window.AccountingState) {
            await window.AccountingState.createTransaction(transactionData);
        }

        console.log('💰 Transacción contable creada:', transactionData);
    }

    /**
     * Generar facturas de ejemplo para demo
     */
    generateSampleInvoices() {
        if (this.pendingInvoices.length > 0) return; // Ya hay datos

        const sampleInvoices = [
            {
                id: 'pending-1',
                invoiceNumber: 'FAC-2024-001',
                studentName: 'Ana María González Pérez',
                studentId: 'student-1',
                studentGrade: '10°A',
                concept: 'Matrícula 2024',
                amount: 800000,
                hasDiscount: true,
                discountAmount: 100000,
                status: 'PENDING',
                dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 días
                createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 días atrás
                priority: 'high',
                notes: 'Estudiante con beca parcial del 10%'
            },
            {
                id: 'pending-2',
                invoiceNumber: 'FAC-2024-002',
                studentName: 'Carlos Andrés López Silva',
                studentId: 'student-2',
                studentGrade: '8°B',
                concept: 'Mensualidad Febrero',
                amount: 350000,
                hasDiscount: false,
                status: 'PENDING',
                dueDate: new Date(Date.now() - 86400000).toISOString(), // Vencida ayer
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                priority: 'urgent'
            },
            {
                id: 'pending-3',
                invoiceNumber: 'FAC-2024-003',
                studentName: 'María José Rodríguez Castro',
                studentId: 'student-3',
                studentGrade: '6°C',
                concept: 'Rifa Navideña',
                amount: 75000,
                hasDiscount: false,
                status: 'PENDING',
                dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                priority: 'normal'
            },
            {
                id: 'pending-4',
                invoiceNumber: 'FAC-2024-004',
                studentName: 'Diego Fernando Martínez Ruiz',
                studentId: 'student-4',
                studentGrade: '11°A',
                concept: 'Excursión Pedagógica',
                amount: 450000,
                hasDiscount: false,
                status: 'PENDING',
                dueDate: new Date(Date.now() + 86400000 * 15).toISOString(),
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                priority: 'high'
            },
            {
                id: 'pending-5',
                invoiceNumber: 'FAC-2024-005',
                studentName: 'Sofía Isabella Torres Mendoza',
                studentId: 'student-5',
                studentGrade: '9°B',
                concept: 'Uniforme Deportivo',
                amount: 120000,
                hasDiscount: false,
                status: 'PENDING',
                dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
                createdAt: new Date().toISOString(),
                priority: 'normal'
            }
        ];

        this.pendingInvoices = sampleInvoices;
        this.savePendingInvoices();
    }

    // Métodos auxiliares
    findInvoice(invoiceId) {
        return this.pendingInvoices.find(inv => inv.id === invoiceId);
    }

    getMyApprovalCount() {
        return this.pendingInvoices.filter(invoice => 
            this.approvalSystem.canApprove(invoice).canApprove
        ).length;
    }

    getUrgentCount() {
        return this.pendingInvoices.filter(inv => this.isUrgent(inv)).length;
    }

    getNormalCount() {
        return this.pendingInvoices.length - this.getUrgentCount();
    }

    isUrgent(invoice) {
        return this.isOverdue(invoice) || 
               invoice.priority === 'urgent' || 
               invoice.priority === 'high';
    }

    isOverdue(invoice) {
        if (!invoice.dueDate) return false;
        return new Date(invoice.dueDate) < new Date();
    }

    getInvoiceUrgency(invoice) {
        if (this.isOverdue(invoice)) {
            return { class: 'overdue', icon: '🚨', label: 'Vencida' };
        }
        if (invoice.priority === 'urgent') {
            return { class: 'urgent', icon: '⚡', label: 'Urgente' };
        }
        if (invoice.priority === 'high') {
            return { class: 'high', icon: '🔥', label: 'Alta' };
        }
        return { class: 'normal', icon: '📋', label: 'Normal' };
    }

    getUniqueConceptsOptions() {
        const concepts = [...new Set(this.pendingInvoices.map(inv => inv.concept))];
        return concepts.map(concept => 
            `<option value="${concept}">${concept}</option>`
        ).join('');
    }

    updateAllDisplays() {
        // Actualizar dashboard
        const list = document.getElementById('pendingInvoicesList');
        if (list) {
            list.innerHTML = this.renderPendingInvoicesList();
        }

        // Actualizar contadores
        const myApprovalCount = document.getElementById('myApprovalCount');
        if (myApprovalCount) {
            myApprovalCount.textContent = this.getMyApprovalCount();
        }

        // Actualizar badges
        const urgentBadge = document.querySelector('.pending-count.urgent');
        const normalBadge = document.querySelector('.pending-count.normal');
        if (urgentBadge) urgentBadge.textContent = this.getUrgentCount();
        if (normalBadge) normalBadge.textContent = this.getNormalCount();

        // Actualizar modal si está abierto
        const modal = document.querySelector('.approval-modal');
        if (modal) {
            const grid = document.getElementById('approvalInvoicesGrid');
            if (grid) {
                grid.innerHTML = this.renderFullInvoicesList();
            }
        }

        // Actualizar estadísticas del dashboard principal
        this.updateDashboardStats();
    }

    updateDashboardStats() {
        // Actualizar el contador de facturas pendientes en el dashboard principal
        if (window.AccountingState) {
            const currentStats = window.AccountingState.get('stats') || {};
            currentStats.pendingInvoices = this.pendingInvoices.length;
            currentStats.urgentInvoices = this.getUrgentCount();
            window.AccountingState.set('stats', currentStats);
        }
    }

    // Métodos de utilidad
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
    savePendingInvoices() {
        localStorage.setItem('educonta-pending-invoices', JSON.stringify(this.pendingInvoices));
    }

    loadPendingInvoices() {
        try {
            const stored = localStorage.getItem('educonta-pending-invoices');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error cargando facturas pendientes:', error);
            return [];
        }
    }

    // Estilos CSS
    addPendingInvoicesStyles() {
        const styles = `
            <style>
                .pending-invoices-card {
                    border-left: 4px solid var(--warning);
                    background: linear-gradient(135deg, var(--bg-card) 0%, rgba(255, 193, 7, 0.05) 100%);
                }

                .pending-badges {
                    display: flex;
                    gap: 0.5rem;
                }

                .pending-count {
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    min-width: 24px;
                    text-align: center;
                }

                .pending-count.urgent {
                    background: var(--error);
                    color: white;
                }

                .pending-count.normal {
                    background: var(--warning);
                    color: white;
                }

                .pending-summary {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    padding: 0.75rem;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                }

                .summary-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                }

                .summary-label {
                    font-size: 0.75rem;
                    color: var(--text-light);
                }

                .summary-value {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--primary);
                }

                .pending-invoice-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                    background: var(--bg-secondary);
                    transition: all 0.3s ease;
                }

                .pending-invoice-item:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .pending-invoice-item.urgent {
                    border-left: 4px solid var(--error);
                    background: rgba(239, 68, 68, 0.05);
                }

                .pending-invoice-item.high {
                    border-left: 4px solid var(--warning);
                    background: rgba(245, 158, 11, 0.05);
                }

                .priority-indicator {
                    font-size: 1.25rem;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .priority-indicator.urgent {
                    background: rgba(239, 68, 68, 0.1);
                }

                .priority-indicator.high {
                    background: rgba(245, 158, 11, 0.1);
                }

                .invoice-info {
                    flex: 1;
                }

                .invoice-student {
                    font-weight: 600;
                    color: var(--text);
                    margin-bottom: 0.25rem;
                }

                .invoice-concept {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }

                .concept-type {
                    font-size: 0.875rem;
                    color: var(--text-light);
                }

                .discount-badge {
                    background: var(--success);
                    color: white;
                    padding: 0.125rem 0.375rem;
                    border-radius: 4px;
                    font-size: 0.625rem;
                    font-weight: 600;
                }

                .invoice-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--text-light);
                }

                .overdue-badge {
                    background: var(--error);
                    color: white;
                    padding: 0.125rem 0.375rem;
                    border-radius: 4px;
                    font-weight: 600;
                }

                .invoice-amount {
                    text-align: right;
                    margin-right: 1rem;
                }

                .amount-value {
                    font-weight: 600;
                    color: var(--success);
                    font-size: 1rem;
                }

                .approval-info {
                    font-size: 0.75rem;
                    color: var(--text-light);
                    margin-top: 0.25rem;
                }

                .invoice-actions {
                    display: flex;
                    gap: 0.25rem;
                }

                .btn-action {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    padding: 0.375rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-action.approve:hover {
                    background: rgba(16, 185, 129, 0.1);
                }

                .btn-action.details:hover {
                    background: var(--bg-hover);
                }

                .approval-required {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    font-size: 1.25rem;
                    color: var(--text-light);
                }

                .empty-state, .info-state {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-light);
                }

                .empty-icon, .info-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                /* Modal styles */
                .approval-modal {
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

                .approval-modal-content {
                    background: var(--bg-card);
                    border-radius: 16px;
                    width: 95%;
                    max-width: 1200px;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    display: flex;
                    flex-direction: column;
                }

                .approval-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--primary);
                    color: white;
                }

                .approval-stats {
                    display: flex;
                    gap: 1rem;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                }

                .stat-label {
                    font-size: 0.75rem;
                    opacity: 0.9;
                }

                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .stat-value.urgent {
                    color: #ffeb3b;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-btn:hover {
                    background: rgba(255,255,255,0.1);
                }

                .approval-filters {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .filter-group label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text);
                }

                .filter-group select {
                    padding: 0.375rem 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    background: var(--bg);
                    color: var(--text);
                }

                .filter-actions {
                    margin-left: auto;
                    display: flex;
                    gap: 0.5rem;
                }

                .approval-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                }

                .invoices-grid {
                    display: grid;
                    gap: 1rem;
                }

                .invoice-card {
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    background: var(--bg-secondary);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .invoice-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                }

                .invoice-card.urgent {
                    border-left: 4px solid var(--error);
                }

                .invoice-card.high {
                    border-left: 4px solid var(--warning);
                }

                .invoice-card .card-header {
                    padding: 1rem;
                    background: var(--bg);
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .student-info h4 {
                    margin: 0;
                    color: var(--primary);
                    font-size: 1.125rem;
                }

                .student-grade {
                    margin: 0.25rem 0 0 0;
                    font-size: 0.875rem;
                    color: var(--text-light);
                }

                .urgency-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.375rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .urgency-indicator.urgent {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                }

                .urgency-indicator.high {
                    background: rgba(245, 158, 11, 0.1);
                    color: var(--warning);
                }

                .urgency-indicator.normal {
                    background: rgba(107, 114, 128, 0.1);
                    color: var(--text-light);
                }

                .invoice-card .card-body {
                    padding: 1rem;
                }

                .invoice-details {
                    margin-bottom: 1rem;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .detail-row .label {
                    font-size: 0.875rem;
                    color: var(--text-light);
                    font-weight: 500;
                }

                .detail-row .value {
                    font-size: 0.875rem;
                    color: var(--text);
                    font-weight: 600;
                }

                .detail-row .value.amount {
                    color: var(--success);
                    font-size: 1rem;
                }

                .detail-row .value.overdue {
                    color: var(--error);
                }

                .approval-details {
                    background: var(--bg);
                    padding: 0.75rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .approval-rule {
                    margin-bottom: 0.75rem;
                }

                .approval-rule strong {
                    color: var(--primary);
                    font-size: 0.875rem;
                }

                .approval-rule p {
                    margin: 0.25rem 0;
                    font-size: 0.8125rem;
                    color: var(--text-light);
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.375rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-badge.can-approve {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--success);
                }

                .status-badge.cannot-approve {
                    background: rgba(107, 114, 128, 0.1);
                    color: var(--text-light);
                }

                .card-actions {
                    padding: 1rem;
                    border-top: 1px solid var(--border);
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .concept-matricula { color: var(--primary); }
                .concept-mensualidad { color: var(--success); }
                .concept-rifa { color: var(--warning); }
                .concept-excursion { color: var(--info); }
                .concept-uniforme { color: var(--secondary); }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.approvalSystem) {
            window.pendingInvoicesManager = new PendingInvoicesManager();
        } else {
            console.warn('⚠️ Sistema de aprobaciones no disponible');
        }
    }, 3000);
});

console.log('📋 Sistema de facturas pendientes cargado');