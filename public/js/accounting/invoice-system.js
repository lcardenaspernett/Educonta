// ===================================
// EDUCONTA - Sistema de Facturas
// ===================================

/**
 * Sistema completo de gestión de facturas
 */
class InvoiceSystem {
    constructor() {
        this.invoices = [];
        this.students = [];
        this.currentInvoice = null;
        this.init();
    }

    init() {
        console.log('🧾 Inicializando sistema de facturas');
        this.loadData();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            // Cargar facturas desde la API
            const response = await fetch('/api/accounting/invoices');
            if (response.ok) {
                const data = await response.json();
                this.invoices = data.invoices || [];
            } else {
                console.log('📋 No hay facturas en el sistema');
                this.invoices = [];
            }

            // Cargar estudiantes
            const studentsResponse = await fetch('/api/students');
            if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json();
                this.students = studentsData.students || [];
            }

            this.renderInvoicesList();
            this.updateStats();

        } catch (error) {
            console.error('❌ Error cargando datos de facturas:', error);
            this.invoices = [];
            this.renderEmptyState();
        }
    }

    renderInvoicesList() {
        const container = document.getElementById('invoicesContainer');
        if (!container) return;

        if (this.invoices.length === 0) {
            this.renderEmptyState();
            return;
        }

        container.innerHTML = `
            <div class="invoices-header">
                <h3>📋 Lista de Facturas</h3>
                <div class="invoices-actions">
                    <button class="btn btn-primary" onclick="invoiceSystem.showCreateModal()">
                        <i class="fas fa-plus"></i> Nueva Factura
                    </button>
                </div>
            </div>
            <div class="invoices-table">
                <table>
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Descripción</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.invoices.map(invoice => this.renderInvoiceRow(invoice)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderInvoiceRow(invoice) {
        const statusClass = this.getStatusClass(invoice.status);
        const statusText = this.getStatusText(invoice.status);

        return `
            <tr>
                <td><strong>${invoice.invoiceNumber}</strong></td>
                <td>${invoice.student?.nombre || 'N/A'} ${invoice.student?.apellido || ''}</td>
                <td>${invoice.notes || 'Factura de servicios'}</td>
                <td>${new Date(invoice.date).toLocaleDateString()}</td>
                <td>$${invoice.total.toLocaleString()}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-outline" onclick="invoiceSystem.viewInvoice('${invoice.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="invoiceSystem.downloadPDF('${invoice.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        ${invoice.status === 'PENDING' ? `
                            <button class="btn btn-sm btn-success" onclick="invoiceSystem.markAsPaid('${invoice.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    renderEmptyState() {
        const container = document.getElementById('invoicesContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No hay facturas registradas</h3>
                <p>Comienza creando tu primera factura para un estudiante</p>
                <button class="btn btn-primary" onclick="invoiceSystem.showCreateModal()">
                    <i class="fas fa-plus"></i> Crear Primera Factura
                </button>
            </div>
        `;
    }

    updateStats() {
        const stats = this.calculateStats();
        
        // Actualizar elementos del dashboard
        this.updateStatElement('totalInvoices', stats.total);
        this.updateStatElement('paidInvoices', stats.paid);
        this.updateStatElement('pendingInvoices', stats.pending);
        this.updateStatElement('totalRevenue', `$${stats.revenue.toLocaleString()}`);
    }

    calculateStats() {
        const stats = {
            total: this.invoices.length,
            paid: 0,
            pending: 0,
            overdue: 0,
            revenue: 0
        };

        this.invoices.forEach(invoice => {
            switch (invoice.status) {
                case 'PAID':
                    stats.paid++;
                    stats.revenue += invoice.total;
                    break;
                case 'PENDING':
                    stats.pending++;
                    break;
                case 'OVERDUE':
                    stats.overdue++;
                    break;
            }
        });

        return stats;
    }

    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    getStatusClass(status) {
        const classes = {
            'PENDING': 'status-pending',
            'PAID': 'status-paid',
            'OVERDUE': 'status-overdue',
            'CANCELLED': 'status-cancelled'
        };
        return classes[status] || 'status-pending';
    }

    getStatusText(status) {
        const texts = {
            'PENDING': 'Pendiente',
            'PAID': 'Pagada',
            'OVERDUE': 'Vencida',
            'CANCELLED': 'Cancelada'
        };
        return texts[status] || 'Pendiente';
    }

    showCreateModal() {
        // Implementar modal de creación de facturas
        console.log('🆕 Abriendo modal de nueva factura');
        // TODO: Implementar modal
    }

    viewInvoice(invoiceId) {
        console.log('👁️ Viendo factura:', invoiceId);
        // TODO: Implementar vista de factura
    }

    downloadPDF(invoiceId) {
        console.log('📄 Descargando PDF de factura:', invoiceId);
        // TODO: Implementar descarga de PDF
    }

    async markAsPaid(invoiceId) {
        try {
            const response = await fetch(`/api/accounting/invoices/${invoiceId}/mark-paid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('✅ Factura marcada como pagada');
                this.loadData(); // Recargar datos
            } else {
                console.error('❌ Error marcando factura como pagada');
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }

    setupEventListeners() {
        // Configurar listeners para filtros y búsqueda
        const searchInput = document.getElementById('invoiceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterInvoices(e.target.value);
            });
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }
    }

    filterInvoices(searchTerm) {
        // TODO: Implementar filtrado de facturas
        console.log('🔍 Filtrando facturas:', searchTerm);
    }

    filterByStatus(status) {
        // TODO: Implementar filtrado por estado
        console.log('📊 Filtrando por estado:', status);
    }
}

// Inicializar sistema de facturas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('invoicesContainer')) {
        window.invoiceSystem = new InvoiceSystem();
    }
});

// Exportar para uso global
window.InvoiceSystem = InvoiceSystem;