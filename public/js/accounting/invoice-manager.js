/**
 * Invoice Manager - Sistema de gestión de facturas
 */

class InvoiceManager {
    constructor() {
        this.invoices = [];
        this.currentInvoice = null;
        this.init();
    }

    init() {
        console.log('📋 Inicializando gestor de facturas...');
        this.setupEventListeners();
        this.loadInvoices();
        console.log('✅ Gestor de facturas inicializado');
    }

    setupEventListeners() {
        // Event listeners para botones de facturas
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="new-invoice"]')) {
                this.showNewInvoiceModal();
            }
            if (e.target.matches('[data-action="edit-invoice"]')) {
                const invoiceId = e.target.dataset.invoiceId;
                this.editInvoice(invoiceId);
            }
            if (e.target.matches('[data-action="delete-invoice"]')) {
                const invoiceId = e.target.dataset.invoiceId;
                this.deleteInvoice(invoiceId);
            }
        });
    }

    async loadInvoices() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('⚠️ No hay token de autenticación');
                return;
            }

            const response = await fetch('/api/accounting/invoices', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.invoices = await response.json();
                this.renderInvoices();
            } else {
                console.log('⚠️ Error cargando facturas:', response.status);
            }
        } catch (error) {
            console.log('⚠️ Error en loadInvoices:', error.message);
        }
    }

    renderInvoices() {
        const container = document.getElementById('invoices-container');
        if (!container) return;

        if (this.invoices.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-gray-400 mb-4">
                        <i class="fas fa-file-invoice text-4xl"></i>
                    </div>
                    <p class="text-gray-500">No hay facturas registradas</p>
                    <button class="btn btn-primary mt-4" data-action="new-invoice">
                        <i class="fas fa-plus mr-2"></i>Nueva Factura
                    </button>
                </div>
            `;
            return;
        }

        const invoicesHTML = this.invoices.map(invoice => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-gray-900 dark:text-white">
                            Factura #${invoice.number}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            ${invoice.client?.name || 'Cliente no especificado'}
                        </p>
                        <p class="text-sm text-gray-500">
                            ${new Date(invoice.date).toLocaleDateString()}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-lg text-gray-900 dark:text-white">
                            $${invoice.total?.toLocaleString() || '0'}
                        </p>
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusClass(invoice.status)}">
                            ${this.getStatusText(invoice.status)}
                        </span>
                    </div>
                </div>
                <div class="mt-4 flex space-x-2">
                    <button class="btn btn-sm btn-outline" data-action="edit-invoice" data-invoice-id="${invoice.id}">
                        <i class="fas fa-edit mr-1"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-outline" data-action="view-invoice" data-invoice-id="${invoice.id}">
                        <i class="fas fa-eye mr-1"></i>Ver
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="delete-invoice" data-invoice-id="${invoice.id}">
                        <i class="fas fa-trash mr-1"></i>Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = invoicesHTML;
    }

    getStatusClass(status) {
        const classes = {
            'DRAFT': 'bg-gray-100 text-gray-800',
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'APPROVED': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800',
            'PAID': 'bg-blue-100 text-blue-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'DRAFT': 'Borrador',
            'PENDING': 'Pendiente',
            'APPROVED': 'Aprobada',
            'REJECTED': 'Rechazada',
            'PAID': 'Pagada'
        };
        return texts[status] || 'Desconocido';
    }

    showNewInvoiceModal() {
        console.log('📋 Mostrando modal de nueva factura...');
        // Implementar modal de nueva factura
        if (window.showModal) {
            window.showModal('new-invoice-modal');
        }
    }

    editInvoice(invoiceId) {
        console.log('✏️ Editando factura:', invoiceId);
        // Implementar edición de factura
    }

    async deleteInvoice(invoiceId) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/accounting/invoices/${invoiceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.loadInvoices(); // Recargar lista
                console.log('✅ Factura eliminada');
            } else {
                console.error('❌ Error eliminando factura');
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
}

// Hacer disponible globalmente
window.InvoiceManager = InvoiceManager;

console.log('📋 InvoiceManager cargado');