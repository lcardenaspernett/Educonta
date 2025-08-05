/**
 * Pending Invoices - Sistema de facturas pendientes
 */

class PendingInvoicesManager {
    constructor() {
        this.pendingInvoices = [];
        this.init();
    }

    init() {
        console.log('⏳ Inicializando gestor de facturas pendientes...');
        this.loadPendingInvoices();
        this.setupEventListeners();
        console.log('✅ Gestor de facturas pendientes inicializado');
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="approve-invoice"]')) {
                const invoiceId = e.target.dataset.invoiceId;
                this.approveInvoice(invoiceId);
            }
            if (e.target.matches('[data-action="reject-invoice"]')) {
                const invoiceId = e.target.dataset.invoiceId;
                this.rejectInvoice(invoiceId);
            }
        });
    }

    async loadPendingInvoices() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('⚠️ No hay token de autenticación');
                return;
            }

            const response = await fetch('/api/accounting/invoices?status=PENDING', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.pendingInvoices = await response.json();
                this.renderPendingInvoices();
                this.updatePendingCount();
            } else {
                console.log('⚠️ Error cargando facturas pendientes:', response.status);
            }
        } catch (error) {
            console.log('⚠️ Error en loadPendingInvoices:', error.message);
        }
    }

    renderPendingInvoices() {
        const container = document.getElementById('pending-invoices-container');
        if (!container) return;

        if (this.pendingInvoices.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-gray-400 mb-4">
                        <i class="fas fa-check-circle text-4xl"></i>
                    </div>
                    <p class="text-gray-500">No hay facturas pendientes de aprobación</p>
                </div>
            `;
            return;
        }

        const invoicesHTML = this.pendingInvoices.map(invoice => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 border-l-4 border-yellow-400">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-gray-900 dark:text-white">
                            Factura #${invoice.number}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            ${invoice.client?.name || 'Cliente no especificado'}
                        </p>
                        <p class="text-sm text-gray-500">
                            Creada: ${new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                        <p class="text-sm text-gray-500">
                            Por: ${invoice.createdBy?.firstName} ${invoice.createdBy?.lastName}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-lg text-gray-900 dark:text-white">
                            $${invoice.total?.toLocaleString() || '0'}
                        </p>
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pendiente
                        </span>
                    </div>
                </div>
                
                <div class="mt-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Descripción:</strong> ${invoice.description || 'Sin descripción'}
                    </p>
                </div>

                <div class="mt-4 flex space-x-2">
                    <button class="btn btn-sm btn-success" data-action="approve-invoice" data-invoice-id="${invoice.id}">
                        <i class="fas fa-check mr-1"></i>Aprobar
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="reject-invoice" data-invoice-id="${invoice.id}">
                        <i class="fas fa-times mr-1"></i>Rechazar
                    </button>
                    <button class="btn btn-sm btn-outline" data-action="view-invoice" data-invoice-id="${invoice.id}">
                        <i class="fas fa-eye mr-1"></i>Ver Detalles
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = invoicesHTML;
    }

    updatePendingCount() {
        const countElements = document.querySelectorAll('[data-pending-count]');
        countElements.forEach(element => {
            element.textContent = this.pendingInvoices.length;
        });

        // Actualizar badge en sidebar si existe
        const badge = document.querySelector('#pending-invoices-badge');
        if (badge) {
            if (this.pendingInvoices.length > 0) {
                badge.textContent = this.pendingInvoices.length;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    async approveInvoice(invoiceId) {
        if (!confirm('¿Estás seguro de que deseas aprobar esta factura?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/accounting/invoices/${invoiceId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.loadPendingInvoices(); // Recargar lista
                console.log('✅ Factura aprobada');
                
                // Mostrar notificación
                if (window.showNotification) {
                    window.showNotification('Factura aprobada exitosamente', 'success');
                }
            } else {
                console.error('❌ Error aprobando factura');
                if (window.showNotification) {
                    window.showNotification('Error al aprobar la factura', 'error');
                }
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }

    async rejectInvoice(invoiceId) {
        const reason = prompt('¿Por qué rechazas esta factura? (opcional)');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/accounting/invoices/${invoiceId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                this.loadPendingInvoices(); // Recargar lista
                console.log('✅ Factura rechazada');
                
                // Mostrar notificación
                if (window.showNotification) {
                    window.showNotification('Factura rechazada', 'info');
                }
            } else {
                console.error('❌ Error rechazando factura');
                if (window.showNotification) {
                    window.showNotification('Error al rechazar la factura', 'error');
                }
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
}

// Hacer disponible globalmente
window.PendingInvoicesManager = PendingInvoicesManager;

console.log('⏳ PendingInvoicesManager cargado');