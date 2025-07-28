// ===================================
// EDUCONTA - Página de Gestión de Facturas Pendientes
// ===================================

/**
 * Controlador para la página dedicada de facturas pendientes
 */
class PendingInvoicesPage {
    constructor() {
        this.pendingInvoices = this.loadPendingInvoices();
        this.filteredInvoices = [...this.pendingInvoices];
        this.selectedInvoices = new Set();
        this.currentRole = this.getCurrentUserRole();
        this.init();
    }

    init() {
        console.log('📋 Inicializando página de facturas pendientes');
        this.generateSampleData();
        this.updateStats();
        this.renderInvoices();
        this.populateFilters();
        this.setupEventListeners();
    }

    /**
     * Generar datos de ejemplo
     */
    generateSampleData() {
        if (this.pendingInvoices.length > 0) return;

        const sampleInvoices = [
            {
                id: 'pending-1',
                invoiceNumber: 'FAC-2024-001',
                studentName: 'Ana María González Pérez',
                studentId: 'student-1',
                studentGrade: '11°A',
                concept: 'Derecho de Grado',
                amount: 800000,
                hasDiscount: true,
                discountAmount: 100000,
                status: 'PENDING',
                dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
                createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                priority: 'high'
            },
            {
                id: 'pending-2',
                invoiceNumber: 'FAC-2024-002',
                studentName: 'Carlos Andrés López Silva',
                studentId: 'student-2',
                studentGrade: '10°B',
                concept: 'Mensualidad Febrero',
                amount: 350000,
                hasDiscount: false,
                status: 'PENDING',
                dueDate: new Date(Date.now() - 86400000).toISOString(),
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                priority: 'urgent'
            },
            {
                id: 'pending-3',
                invoiceNumber: 'FAC-2024-003',
                studentName: 'María José Rodríguez Castro',
                studentId: 'student-3',
                studentGrade: '9°C',
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
            },
            {
                id: 'pending-6',
                invoiceNumber: 'FAC-2024-006',
                studentName: 'Alejandro Ramírez Herrera',
                studentId: 'student-6',
                studentGrade: '8°A',
                concept: 'Matrícula 2024',
                amount: 1200000,
                hasDiscount: false,
                status: 'PENDING',
                dueDate: new Date(Date.now() + 86400000 * 20).toISOString(),
                createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                priority: 'high'
            }
        ];

        this.pendingInvoices = sampleInvoices;
        this.filteredInvoices = [...this.pendingInvoices];
        this.savePendingInvoices();
    }

    /**
     * Actualizar estadísticas
     */
    updateStats() {
        const totalPending = this.pendingInvoices.length;
        const canApprove = this.getCanApproveCount();
        const urgent = this.getUrgentCount();
        const totalAmount = this.getTotalAmount();

        document.getElementById('totalPending').textContent = totalPending;
        document.getElementById('canApprove').textContent = canApprove;
        document.getElementById('urgentCount').textContent = urgent;
        document.getElementById('totalAmount').textContent = this.formatCurrency(totalAmount);
    }

    /**
     * Renderizar facturas
     */
    renderInvoices() {
        const container = document.getElementById('invoicesGrid');
        const loading = document.getElementById('loadingState');

        if (loading) loading.style.display = 'none';

        if (this.filteredInvoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No hay facturas pendientes</h3>
                    <p>No se encontraron facturas que coincidan con los filtros aplicados</p>
                </div>
            `;
            return;
        }

        const html = this.filteredInvoices.map(invoice => this.renderInvoiceCard(invoice)).join('');
        container.innerHTML = html;
    }

    /**
     * Renderizar tarjeta de factura
     */
    renderInvoiceCard(invoice) {
        const canApprove = this.canUserApprove(invoice);
        const urgency = this.getInvoiceUrgency(invoice);
        const isSelected = this.selectedInvoices.has(invoice.id);

        return `
            <div class="invoice-card ${urgency.class} ${isSelected ? 'selected' : ''}" data-invoice-id="${invoice.id}">
                <div class="card-header">
                    <div class="card-checkbox">
                        <input type="checkbox" id="invoice-${invoice.id}" 
                               ${canApprove.canApprove ? '' : 'disabled'}
                               ${isSelected ? 'checked' : ''}
                               onchange="toggleInvoiceSelection('${invoice.id}')">
                        <label for="invoice-${invoice.id}"></label>
                    </div>
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
                            <span class="label">Factura:</span>
                            <span class="value">${invoice.invoiceNumber}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Concepto:</span>
                            <span class="value concept-${this.normalizeConceptType(invoice.concept).toLowerCase()}">
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
                        ${invoice.hasDiscount ? `
                            <div class="detail-row">
                                <span class="label">Descuento:</span>
                                <span class="value discount">${this.formatCurrency(invoice.discountAmount || 0)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="approval-status">
                        ${canApprove.canApprove ? `
                            <span class="status-badge can-approve">✅ Puedes aprobar</span>
                        ` : `
                            <span class="status-badge cannot-approve">🔒 ${canApprove.reason}</span>
                        `}
                    </div>
                </div>
                
                <div class="card-actions">
                    ${canApprove.canApprove ? `
                        <button class="btn btn-success btn-sm" onclick="approveInvoice('${invoice.id}')">
                            ✅ Aprobar
                        </button>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" onclick="viewInvoiceDetails('${invoice.id}')">
                        👁️ Ver Detalles
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editInvoice('${invoice.id}')">
                        ✏️ Editar
                    </button>
                    ${this.currentRole === 'RECTOR' ? `
                        <button class="btn btn-danger btn-sm" onclick="rejectInvoice('${invoice.id}')">
                            ❌ Rechazar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Aplicar filtros
     */
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const conceptFilter = document.getElementById('conceptFilter').value;
        const gradeFilter = document.getElementById('gradeFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        this.filteredInvoices = this.pendingInvoices.filter(invoice => {
            // Filtro por estado
            if (statusFilter) {
                switch (statusFilter) {
                    case 'can-approve':
                        if (!this.canUserApprove(invoice).canApprove) return false;
                        break;
                    case 'urgent':
                        if (!this.isUrgent(invoice)) return false;
                        break;
                    case 'overdue':
                        if (!this.isOverdue(invoice)) return false;
                        break;
                    case 'high-amount':
                        if (invoice.amount < 500000) return false;
                        break;
                }
            }

            // Filtro por concepto
            if (conceptFilter && invoice.concept !== conceptFilter) return false;

            // Filtro por grado
            if (gradeFilter && !invoice.studentGrade?.includes(gradeFilter)) return false;

            // Filtro por búsqueda
            if (searchFilter && !invoice.studentName.toLowerCase().includes(searchFilter)) return false;

            return true;
        });

        this.renderInvoices();
        this.updateBulkActions();
    }

    /**
     * Limpiar filtros
     */
    clearFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('conceptFilter').value = '';
        document.getElementById('gradeFilter').value = '';
        document.getElementById('searchFilter').value = '';
        
        this.filteredInvoices = [...this.pendingInvoices];
        this.renderInvoices();
        this.updateBulkActions();
    }

    /**
     * Poblar filtros con opciones dinámicas
     */
    populateFilters() {
        // Poblar filtro de conceptos
        const concepts = [...new Set(this.pendingInvoices.map(inv => inv.concept))];
        const conceptFilter = document.getElementById('conceptFilter');
        
        concepts.forEach(concept => {
            const option = document.createElement('option');
            option.value = concept;
            option.textContent = concept;
            conceptFilter.appendChild(option);
        });
    }

    /**
     * Alternar selección de factura
     */
    toggleInvoiceSelection(invoiceId) {
        if (this.selectedInvoices.has(invoiceId)) {
            this.selectedInvoices.delete(invoiceId);
        } else {
            this.selectedInvoices.add(invoiceId);
        }
        this.updateBulkActions();
    }

    /**
     * Limpiar selección
     */
    clearSelection() {
        this.selectedInvoices.clear();
        document.querySelectorAll('.invoice-card input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        document.querySelectorAll('.invoice-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateBulkActions();
    }

    /**
     * Actualizar acciones masivas
     */
    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        const bulkApproveBtn = document.getElementById('bulkApproveBtn');

        if (this.selectedInvoices.size > 0) {
            bulkActions.style.display = 'flex';
            selectedCount.textContent = this.selectedInvoices.size;
            
            // Verificar si todas las seleccionadas se pueden aprobar
            const canApproveAll = Array.from(this.selectedInvoices).every(id => {
                const invoice = this.pendingInvoices.find(inv => inv.id === id);
                return invoice && this.canUserApprove(invoice).canApprove;
            });
            
            bulkApproveBtn.disabled = !canApproveAll;
        } else {
            bulkActions.style.display = 'none';
        }
    }

    /**
     * Aprobación masiva
     */
    async bulkApprove() {
        if (this.selectedInvoices.size === 0) return;

        const selectedIds = Array.from(this.selectedInvoices);
        const invoices = selectedIds.map(id => this.pendingInvoices.find(inv => inv.id === id));

        if (confirm(`¿Aprobar ${selectedIds.length} facturas seleccionadas?`)) {
            try {
                for (const invoice of invoices) {
                    await this.processApproval(invoice);
                }
                
                this.showNotification(`${selectedIds.length} facturas aprobadas exitosamente`, 'success');
                this.clearSelection();
                this.updateStats();
                this.renderInvoices();
                
            } catch (error) {
                console.error('Error en aprobación masiva:', error);
                this.showNotification('Error en la aprobación masiva: ' + error.message, 'error');
            }
        }
    }

    /**
     * Aprobar factura individual
     */
    async approveInvoice(invoiceId) {
        const invoice = this.pendingInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        if (confirm(`¿Aprobar factura de ${invoice.studentName} por ${this.formatCurrency(invoice.amount)}?`)) {
            try {
                await this.processApproval(invoice);
                this.showNotification(`Factura de ${invoice.studentName} aprobada exitosamente`, 'success');
                this.updateStats();
                this.renderInvoices();
                
            } catch (error) {
                console.error('Error aprobando factura:', error);
                this.showNotification('Error aprobando factura: ' + error.message, 'error');
            }
        }
    }

    /**
     * Procesar aprobación
     */
    async processApproval(invoice) {
        // Usar el sistema de aprobaciones
        if (window.approvalSystem) {
            await window.approvalSystem.approveInvoice(invoice);
        }

        // Crear transacción contable
        await this.createAccountingTransaction(invoice);

        // Remover de pendientes
        this.pendingInvoices = this.pendingInvoices.filter(inv => inv.id !== invoice.id);
        this.filteredInvoices = this.filteredInvoices.filter(inv => inv.id !== invoice.id);
        this.savePendingInvoices();
    }

    /**
     * Crear transacción contable
     */
    async createAccountingTransaction(invoice) {
        const transactionData = {
            date: new Date().toISOString().split('T')[0],
            reference: invoice.invoiceNumber || `FAC-${invoice.id}`,
            description: `${invoice.concept} - ${invoice.studentName}`,
            amount: invoice.amount,
            type: 'INCOME',
            debitAccountId: '1', // Caja
            creditAccountId: '5', // Ingresos por servicios educativos
            status: 'APPROVED'
        };

        if (window.AccountingState) {
            await window.AccountingState.createTransaction(transactionData);
        }
    }

    /**
     * Ver detalles de factura
     */
    viewInvoiceDetails(invoiceId) {
        const invoice = this.pendingInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        // Crear modal de detalles
        const modal = this.createInvoiceDetailsModal(invoice);
        document.body.appendChild(modal);
    }

    /**
     * Crear modal de detalles de factura
     */
    createInvoiceDetailsModal(invoice) {
        const modal = document.createElement('div');
        modal.className = 'invoice-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📋 Detalles de Factura - ${invoice.invoiceNumber}</h3>
                    <button class="close-btn" onclick="this.closest('.invoice-details-modal').remove()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="invoice-info-grid">
                        <div class="info-section">
                            <h4>Información del Estudiante</h4>
                            <div class="info-item">
                                <span class="label">Nombre:</span>
                                <span class="value">${invoice.studentName}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Grado:</span>
                                <span class="value">${invoice.studentGrade || 'No especificado'}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">ID Estudiante:</span>
                                <span class="value">${invoice.studentId}</span>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h4>Información de la Factura</h4>
                            <div class="info-item">
                                <span class="label">Número:</span>
                                <span class="value">${invoice.invoiceNumber}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Concepto:</span>
                                <span class="value">${invoice.concept}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Monto:</span>
                                <span class="value amount">${this.formatCurrency(invoice.amount)}</span>
                            </div>
                            ${invoice.hasDiscount ? `
                                <div class="info-item">
                                    <span class="label">Descuento:</span>
                                    <span class="value discount">${this.formatCurrency(invoice.discountAmount || 0)}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="info-section">
                            <h4>Fechas</h4>
                            <div class="info-item">
                                <span class="label">Creada:</span>
                                <span class="value">${this.formatDate(invoice.createdAt)}</span>
                            </div>
                            ${invoice.dueDate ? `
                                <div class="info-item">
                                    <span class="label">Vencimiento:</span>
                                    <span class="value ${this.isOverdue(invoice) ? 'overdue' : ''}">${this.formatDate(invoice.dueDate)}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="info-section">
                            <h4>Estado de Aprobación</h4>
                            <div class="approval-info">
                                ${this.getApprovalInfo(invoice)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    ${this.canUserApprove(invoice).canApprove ? `
                        <button class="btn btn-success" onclick="approveInvoice('${invoice.id}'); this.closest('.invoice-details-modal').remove();">
                            ✅ Aprobar Factura
                        </button>
                    ` : ''}
                    <button class="btn btn-outline" onclick="this.closest('.invoice-details-modal').remove()">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Actualizar para nuevo rol
     */
    updateForRole(newRole) {
        this.currentRole = newRole;
        this.updateStats();
        this.renderInvoices();
        this.clearSelection();
    }

    // Métodos auxiliares
    getCurrentUserRole() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role || 'AUXILIARY_ACCOUNTANT';
    }

    canUserApprove(invoice) {
        if (!window.approvalSystem) {
            return { canApprove: false, reason: 'Sistema de aprobaciones no disponible' };
        }
        return window.approvalSystem.canApprove(invoice);
    }

    getCanApproveCount() {
        return this.pendingInvoices.filter(invoice => 
            this.canUserApprove(invoice).canApprove
        ).length;
    }

    getUrgentCount() {
        return this.pendingInvoices.filter(inv => this.isUrgent(inv)).length;
    }

    getTotalAmount() {
        return this.pendingInvoices.reduce((total, inv) => total + inv.amount, 0);
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

    normalizeConceptType(concept) {
        if (!concept) return 'OTRO';
        const normalized = concept.toUpperCase();
        
        const mappings = {
            'MATRICULA': ['MATRÍCULA', 'MATRICULA', 'INSCRIPCION'],
            'MENSUALIDAD': ['MENSUALIDAD', 'PENSION', 'PENSIÓN'],
            'RIFA': ['RIFA', 'SORTEO', 'BINGO'],
            'EXCURSION': ['EXCURSIÓN', 'EXCURSION', 'PASEO'],
            'UNIFORME': ['UNIFORME', 'UNIFORMES'],
            'CERTIFICADO': ['CERTIFICADO', 'CONSTANCIA'],
            'CARNET': ['CARNET', 'CARNÉ']
        };

        for (const [key, variations] of Object.entries(mappings)) {
            if (variations.some(v => normalized.includes(v))) {
                return key;
            }
        }

        return 'OTRO';
    }

    getApprovalInfo(invoice) {
        const canApprove = this.canUserApprove(invoice);
        const approvalInfo = window.approvalSystem?.requiresApproval(invoice);
        
        return `
            <div class="approval-status-info">
                <p><strong>Estado:</strong> ${canApprove.canApprove ? '✅ Puedes aprobar' : '🔒 ' + canApprove.reason}</p>
                ${approvalInfo ? `
                    <p><strong>Regla:</strong> ${approvalInfo.reason}</p>
                    <p><strong>Requiere:</strong> ${approvalInfo.approvers.map(r => this.getRoleLabel(r)).join(' o ')}</p>
                ` : ''}
            </div>
        `;
    }

    getRoleLabel(role) {
        const labels = {
            'SUPER_ADMIN': 'Super Administrador',
            'RECTOR': 'Rector',
            'AUXILIARY_ACCOUNTANT': 'Auxiliar Contable'
        };
        return labels[role] || role;
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

    setupEventListeners() {
        // Listener para selección de todas las facturas
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.selectAllVisible();
            }
        });
    }

    selectAllVisible() {
        this.filteredInvoices.forEach(invoice => {
            if (this.canUserApprove(invoice).canApprove) {
                this.selectedInvoices.add(invoice.id);
            }
        });
        this.renderInvoices();
        this.updateBulkActions();
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
}

// Funciones globales para la página
window.toggleInvoiceSelection = function(invoiceId) {
    if (window.pendingInvoicesPage) {
        window.pendingInvoicesPage.toggleInvoiceSelection(invoiceId);
    }
};

window.approveInvoice = function(invoiceId) {
    if (window.pendingInvoicesPage) {
        window.pendingInvoicesPage.approveInvoice(invoiceId);
    }
};

window.viewInvoiceDetails = function(invoiceId) {
    if (window.pendingInvoicesPage) {
        window.pendingInvoicesPage.viewInvoiceDetails(invoiceId);
    }
};

window.editInvoice = function(invoiceId) {
    console.log('Editar factura:', invoiceId);
    // Implementar funcionalidad de edición
};

window.rejectInvoice = function(invoiceId) {
    console.log('Rechazar factura:', invoiceId);
    // Implementar funcionalidad de rechazo
};

window.PendingInvoicesPage = PendingInvoicesPage;