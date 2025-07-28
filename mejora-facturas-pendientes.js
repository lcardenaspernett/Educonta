// ===================================
// PROPUESTA: Sistema Mejorado de Facturas Pendientes
// ===================================

/**
 * Clase para gestionar facturas pendientes de manera más robusta
 */
class PendingInvoiceManager {
    constructor() {
        this.pendingInvoices = this.loadPendingInvoices();
        this.init();
    }
    
    init() {
        console.log('📋 Inicializando gestor de facturas pendientes');
        this.createPendingInvoicesSection();
        this.setupApprovalInterface();
    }
    
    /**
     * Crear sección de facturas pendientes en el dashboard
     */
    createPendingInvoicesSection() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) return;
        
        const pendingSection = document.createElement('div');
        pendingSection.className = 'dashboard-card pending-invoices-card';
        pendingSection.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">📋 Facturas Pendientes</h3>
                <span class="pending-count">${this.pendingInvoices.length}</span>
            </div>
            <div class="card-content">
                <div class="pending-invoices-list" id="pendingInvoicesList">
                    ${this.renderPendingInvoices()}
                </div>
                <div class="pending-actions">
                    <button class="btn btn-outline" onclick="pendingInvoiceManager.showAllPending()">
                        Ver Todas
                    </button>
                    <button class="btn btn-primary" onclick="pendingInvoiceManager.showApprovalInterface()">
                        Gestionar Aprobaciones
                    </button>
                </div>
            </div>
        `;
        
        dashboardGrid.appendChild(pendingSection);
    }
    
    /**
     * Renderizar lista de facturas pendientes
     */
    renderPendingInvoices() {
        if (this.pendingInvoices.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <p>No hay facturas pendientes</p>
                </div>
            `;
        }
        
        return this.pendingInvoices.slice(0, 3).map(invoice => `
            <div class="pending-invoice-item">
                <div class="invoice-info">
                    <div class="invoice-student">${invoice.studentName}</div>
                    <div class="invoice-concept">${invoice.concept}</div>
                    <div class="invoice-date">${this.formatDate(invoice.createdAt)}</div>
                </div>
                <div class="invoice-amount">${this.formatCurrency(invoice.amount)}</div>
                <div class="invoice-status">
                    <span class="status-badge ${invoice.status.toLowerCase()}">${this.getStatusLabel(invoice.status)}</span>
                </div>
                <div class="invoice-actions">
                    <button class="btn-icon" onclick="pendingInvoiceManager.approveInvoice('${invoice.id}')" title="Aprobar">
                        ✅
                    </button>
                    <button class="btn-icon" onclick="pendingInvoiceManager.rejectInvoice('${invoice.id}')" title="Rechazar">
                        ❌
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Configurar interfaz de aprobación
     */
    setupApprovalInterface() {
        // Agregar estilos CSS
        const styles = `
            <style>
                .pending-invoices-card {
                    border-left: 4px solid var(--warning);
                }
                
                .pending-count {
                    background: var(--warning);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .pending-invoice-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                    background: var(--bg-secondary);
                }
                
                .invoice-info {
                    flex: 1;
                }
                
                .invoice-student {
                    font-weight: 600;
                    color: var(--text);
                }
                
                .invoice-concept {
                    font-size: 0.875rem;
                    color: var(--text-light);
                }
                
                .invoice-date {
                    font-size: 0.75rem;
                    color: var(--text-light);
                }
                
                .invoice-amount {
                    font-weight: 600;
                    color: var(--success);
                }
                
                .status-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .status-badge.pending {
                    background: var(--warning);
                    color: white;
                }
                
                .status-badge.overdue {
                    background: var(--error);
                    color: white;
                }
                
                .btn-icon {
                    background: none;
                    border: none;
                    font-size: 1rem;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                
                .btn-icon:hover {
                    background: var(--bg-hover);
                }
                
                .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-light);
                }
                
                .empty-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    /**
     * Aprobar factura
     */
    async approveInvoice(invoiceId) {
        const invoice = this.pendingInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;
        
        if (confirm(`¿Aprobar factura de ${invoice.studentName} por ${this.formatCurrency(invoice.amount)}?`)) {
            try {
                // Cambiar estado a aprobado
                invoice.status = 'APPROVED';
                invoice.approvedAt = new Date().toISOString();
                
                // Crear transacción contable automáticamente
                await this.createAccountingTransaction(invoice);
                
                // Remover de pendientes
                this.pendingInvoices = this.pendingInvoices.filter(inv => inv.id !== invoiceId);
                this.savePendingInvoices();
                
                // Actualizar UI
                this.updatePendingInvoicesDisplay();
                
                this.showNotification(`Factura de ${invoice.studentName} aprobada exitosamente`, 'success');
                
            } catch (error) {
                console.error('Error aprobando factura:', error);
                this.showNotification('Error al aprobar la factura', 'error');
            }
        }
    }
    
    /**
     * Rechazar factura
     */
    async rejectInvoice(invoiceId) {
        const invoice = this.pendingInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;
        
        const reason = prompt(`¿Por qué rechazar la factura de ${invoice.studentName}?`);
        if (reason) {
            invoice.status = 'REJECTED';
            invoice.rejectedAt = new Date().toISOString();
            invoice.rejectionReason = reason;
            
            // Remover de pendientes
            this.pendingInvoices = this.pendingInvoices.filter(inv => inv.id !== invoiceId);
            this.savePendingInvoices();
            
            // Actualizar UI
            this.updatePendingInvoicesDisplay();
            
            this.showNotification(`Factura de ${invoice.studentName} rechazada`, 'warning');
        }
    }
    
    /**
     * Crear transacción contable automáticamente
     */
    async createAccountingTransaction(invoice) {
        const transactionData = {
            date: new Date().toISOString().split('T')[0],
            reference: `FAC-${invoice.invoiceNumber}`,
            description: `Factura aprobada - ${invoice.concept} - ${invoice.studentName}`,
            amount: invoice.amount,
            type: 'INCOME',
            debitAccountId: '1', // Caja
            creditAccountId: '5', // Ingresos por servicios educativos
            status: 'APPROVED'
        };
        
        // Usar el sistema existente para crear la transacción
        if (window.AccountingState) {
            await window.AccountingState.createTransaction(transactionData);
        }
        
        console.log('✅ Transacción contable creada automáticamente:', transactionData);
    }
    
    /**
     * Mostrar interfaz de aprobación completa
     */
    showApprovalInterface() {
        const modal = this.createApprovalModal();
        document.body.appendChild(modal);
    }
    
    createApprovalModal() {
        const modal = document.createElement('div');
        modal.className = 'approval-modal';
        modal.style.cssText = `
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
        `;
        
        modal.innerHTML = `
            <div class="approval-content" style="
                background: var(--bg-card);
                border-radius: 16px;
                width: 90%;
                max-width: 1000px;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div class="approval-header" style="
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--primary);
                    color: white;
                ">
                    <h2 style="margin: 0;">📋 Gestión de Facturas Pendientes</h2>
                    <button onclick="this.closest('.approval-modal').remove()" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0.5rem;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                    ">×</button>
                </div>
                <div class="approval-body" style="
                    padding: 1.5rem;
                    max-height: 60vh;
                    overflow-y: auto;
                ">
                    ${this.renderFullPendingList()}
                </div>
            </div>
        `;
        
        return modal;
    }
    
    renderFullPendingList() {
        if (this.pendingInvoices.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                    <h3>No hay facturas pendientes</h3>
                    <p>Todas las facturas han sido procesadas</p>
                </div>
            `;
        }
        
        return `
            <div class="approval-grid" style="display: grid; gap: 1rem;">
                ${this.pendingInvoices.map(invoice => `
                    <div class="approval-item" style="
                        border: 1px solid var(--border);
                        border-radius: 8px;
                        padding: 1rem;
                        background: var(--bg-secondary);
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <h4 style="margin: 0; color: var(--primary);">${invoice.studentName}</h4>
                                <p style="margin: 0.25rem 0; color: var(--text-light);">${invoice.concept}</p>
                                <p style="margin: 0; font-size: 0.875rem; color: var(--text-light);">
                                    Creada: ${this.formatDate(invoice.createdAt)}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 1.25rem; font-weight: 600; color: var(--success);">
                                    ${this.formatCurrency(invoice.amount)}
                                </div>
                                <span class="status-badge ${invoice.status.toLowerCase()}">${this.getStatusLabel(invoice.status)}</span>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="pendingInvoiceManager.approveInvoice('${invoice.id}')" style="
                                background: var(--success);
                                color: white;
                                border: none;
                                padding: 0.5rem 1rem;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 600;
                            ">✅ Aprobar</button>
                            <button onclick="pendingInvoiceManager.rejectInvoice('${invoice.id}')" style="
                                background: var(--error);
                                color: white;
                                border: none;
                                padding: 0.5rem 1rem;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 600;
                            ">❌ Rechazar</button>
                            <button onclick="pendingInvoiceManager.viewInvoiceDetails('${invoice.id}')" style="
                                background: var(--secondary);
                                color: white;
                                border: none;
                                padding: 0.5rem 1rem;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 600;
                            ">👁️ Ver Detalles</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Actualizar display de facturas pendientes
     */
    updatePendingInvoicesDisplay() {
        const list = document.getElementById('pendingInvoicesList');
        const count = document.querySelector('.pending-count');
        
        if (list) {
            list.innerHTML = this.renderPendingInvoices();
        }
        
        if (count) {
            count.textContent = this.pendingInvoices.length;
        }
    }
    
    /**
     * Generar datos de ejemplo para facturas pendientes
     */
    generateSamplePendingInvoices() {
        return [
            {
                id: 'pending-1',
                invoiceNumber: 'FAC-2024-001',
                studentName: 'Ana María González',
                studentId: 'student-1',
                concept: 'Matrícula 2024',
                amount: 500000,
                status: 'PENDING',
                dueDate: '2024-02-15',
                createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 días atrás
                priority: 'high'
            },
            {
                id: 'pending-2',
                invoiceNumber: 'FAC-2024-002',
                studentName: 'Carlos Andrés López',
                studentId: 'student-2',
                concept: 'Mensualidad Enero',
                amount: 300000,
                status: 'OVERDUE',
                dueDate: '2024-01-31',
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 días atrás
                priority: 'urgent'
            },
            {
                id: 'pending-3',
                invoiceNumber: 'FAC-2024-003',
                studentName: 'María José Rodríguez',
                studentId: 'student-3',
                concept: 'Rifa Navideña',
                amount: 50000,
                status: 'PENDING',
                dueDate: '2024-02-10',
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
                priority: 'normal'
            }
        ];
    }
    
    // Métodos auxiliares
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
    
    getStatusLabel(status) {
        const labels = {
            'PENDING': 'Pendiente',
            'OVERDUE': 'Vencida',
            'APPROVED': 'Aprobada',
            'REJECTED': 'Rechazada'
        };
        return labels[status] || status;
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
            return stored ? JSON.parse(stored) : this.generateSamplePendingInvoices();
        } catch (error) {
            console.warn('Error cargando facturas pendientes:', error);
            return this.generateSamplePendingInvoices();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.pendingInvoiceManager = new PendingInvoiceManager();
    }, 3000); // Esperar a que se cargue el dashboard principal
});

console.log('📋 Sistema mejorado de facturas pendientes cargado');