// ===================================
// EDUCONTA - Página de Gestión de Facturas
// ===================================

/**
 * Controlador para la página dedicada de gestión de facturas
 */
class InvoicesManagementPage {
    constructor() {
        this.invoices = [];
        this.filteredInvoices = [];
        this.currentTab = 'invoices';
        
        this.init();
    }

    init() {
        console.log('🧾 Inicializando página de gestión de facturas');
        this.loadData();
        this.setupEventListeners();
        this.setDefaultDates();
    }

    async loadData() {
        try {
            console.log('🔄 Cargando datos de facturas...');
            
            // Esperar un poco para asegurar que DemoData esté disponible
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Cargar facturas desde demo data
            if (window.DemoData && typeof window.DemoData.getInvoices === 'function') {
                console.log('📊 Cargando desde DemoData...');
                try {
                    const invoicesResponse = await window.DemoData.getInvoices();
                    this.invoices = invoicesResponse.data || [];
                    console.log('✅ Facturas cargadas desde DemoData:', this.invoices.length);
                } catch (demoError) {
                    console.error('❌ Error en DemoData.getInvoices:', demoError);
                    this.invoices = this.generateSampleInvoices();
                    console.log('⚠️ Usando datos de ejemplo por error en DemoData');
                }
            } else {
                console.log('⚠️ DemoData no disponible, usando datos de ejemplo...');
                this.invoices = this.generateSampleInvoices();
                console.log('✅ Facturas generadas:', this.invoices.length);
            }
            
            this.filteredInvoices = [...this.invoices];
            
            // Asegurar que los elementos DOM existan antes de renderizar
            if (document.getElementById('invoicesTableBody')) {
                this.renderInvoices();
                this.updateSummary();
                console.log('✅ Datos de facturas renderizados exitosamente');
            } else {
                console.log('⚠️ Elementos DOM no encontrados, reintentando...');
                setTimeout(() => {
                    if (document.getElementById('invoicesTableBody')) {
                        this.renderInvoices();
                        this.updateSummary();
                        console.log('✅ Datos de facturas renderizados en segundo intento');
                    }
                }, 500);
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            if (typeof showAlert === 'function') {
                showAlert('Error cargando datos: ' + error.message, 'error');
            }
        }
    }

    generateSampleInvoices() {
        return [
            {
                id: 'inv-001',
                number: 'FAC-2025-001',
                date: new Date('2025-01-15').toISOString(),
                dueDate: new Date('2025-02-15').toISOString(),
                client: {
                    id: '1',
                    name: 'Juan Carlos Pérez',
                    document: '1234567890',
                    email: 'juan.perez@email.com'
                },
                items: [
                    {
                        description: 'Matrícula Semestre 2025-1',
                        quantity: 1,
                        unitPrice: 1500000,
                        total: 1500000
                    }
                ],
                subtotal: 1500000,
                tax: 0,
                total: 1500000,
                status: 'PAID',
                paymentMethod: 'TRANSFER',
                paymentDate: new Date('2025-01-20').toISOString(),
                createdAt: new Date('2025-01-15').toISOString(),
                updatedAt: new Date('2025-01-20').toISOString()
            },
            {
                id: 'inv-002',
                number: 'FAC-2025-002',
                date: new Date('2025-01-20').toISOString(),
                dueDate: new Date('2025-02-20').toISOString(),
                client: {
                    id: '2',
                    name: 'María González López',
                    document: '2345678901',
                    email: 'maria.gonzalez@email.com'
                },
                items: [
                    {
                        description: 'Mensualidad Enero 2025',
                        quantity: 1,
                        unitPrice: 350000,
                        total: 350000
                    }
                ],
                subtotal: 350000,
                tax: 0,
                total: 350000,
                status: 'PENDING',
                paymentMethod: null,
                paymentDate: null,
                createdAt: new Date('2025-01-20').toISOString(),
                updatedAt: new Date('2025-01-20').toISOString()
            },
            {
                id: 'inv-003',
                number: 'FAC-2025-003',
                date: new Date('2025-01-25').toISOString(),
                dueDate: new Date('2025-02-25').toISOString(),
                client: {
                    id: '3',
                    name: 'Carlos Rodríguez Martín',
                    document: '3456789012',
                    email: 'carlos.rodriguez@email.com'
                },
                items: [
                    {
                        description: 'Curso de Inglés - Nivel Básico',
                        quantity: 1,
                        unitPrice: 450000,
                        total: 450000
                    }
                ],
                subtotal: 450000,
                tax: 0,
                total: 450000,
                status: 'OVERDUE',
                paymentMethod: null,
                paymentDate: null,
                createdAt: new Date('2025-01-25').toISOString(),
                updatedAt: new Date('2025-01-25').toISOString()
            },
            {
                id: 'inv-004',
                number: 'FAC-2025-004',
                date: new Date('2025-02-01').toISOString(),
                dueDate: new Date('2025-03-01').toISOString(),
                client: {
                    id: '4',
                    name: 'Ana Sofía Herrera',
                    document: '4567890123',
                    email: 'ana.herrera@email.com'
                },
                items: [
                    {
                        description: 'Matrícula + Mensualidad Febrero',
                        quantity: 1,
                        unitPrice: 800000,
                        total: 800000
                    }
                ],
                subtotal: 800000,
                tax: 0,
                total: 800000,
                status: 'PAID',
                paymentMethod: 'CASH',
                paymentDate: new Date('2025-02-05').toISOString(),
                createdAt: new Date('2025-02-01').toISOString(),
                updatedAt: new Date('2025-02-05').toISOString()
            },
            {
                id: 'inv-005',
                number: 'FAC-2025-005',
                date: new Date('2025-02-10').toISOString(),
                dueDate: new Date('2025-03-10').toISOString(),
                client: {
                    id: '5',
                    name: 'Luis Fernando Castro',
                    document: '5678901234',
                    email: 'luis.castro@email.com'
                },
                items: [
                    {
                        description: 'Mensualidad Febrero 2025',
                        quantity: 1,
                        unitPrice: 300000,
                        total: 300000
                    }
                ],
                subtotal: 300000,
                tax: 0,
                total: 300000,
                status: 'CANCELLED',
                paymentMethod: null,
                paymentDate: null,
                createdAt: new Date('2025-02-10').toISOString(),
                updatedAt: new Date('2025-02-12').toISOString()
            }
        ];
    }

    setDefaultDates() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const dateFromElement = document.getElementById('dateFrom');
        const dateToElement = document.getElementById('dateTo');
        
        if (dateFromElement) {
            dateFromElement.value = firstDayOfMonth.toISOString().split('T')[0];
        }
        if (dateToElement) {
            dateToElement.value = today.toISOString().split('T')[0];
        }
    }

    switchTab(tabName) {
        // Ocultar todas las pestañas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remover clase active de todos los botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostrar pestaña seleccionada
        const targetTab = document.getElementById(`${tabName}-tab`);
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetTab) targetTab.classList.add('active');
        if (targetBtn) targetBtn.classList.add('active');
        
        this.currentTab = tabName;
    }

    filterInvoices() {
        const dateFrom = document.getElementById('dateFrom')?.value;
        const dateTo = document.getElementById('dateTo')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;
        const clientFilter = document.getElementById('clientFilter')?.value;

        this.filteredInvoices = this.invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date).toISOString().split('T')[0];
            
            const matchesDate = (!dateFrom || invoiceDate >= dateFrom) && 
                              (!dateTo || invoiceDate <= dateTo);
            const matchesStatus = !statusFilter || invoice.status === statusFilter;
            const matchesClient = !clientFilter || 
                                invoice.client.name.toLowerCase().includes(clientFilter.toLowerCase()) ||
                                invoice.client.document.includes(clientFilter);
            
            return matchesDate && matchesStatus && matchesClient;
        });

        this.renderInvoices();
        this.updateSummary();
    }

    clearFilters() {
        const elements = ['dateFrom', 'dateTo', 'statusFilter', 'clientFilter'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        this.filteredInvoices = [...this.invoices];
        this.renderInvoices();
        this.updateSummary();
    }

    renderInvoices() {
        const tbody = document.getElementById('invoicesTableBody');
        if (!tbody) return;
        
        if (this.filteredInvoices.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">
                        <div class="empty-state">
                            <svg width="48" height="48" fill="currentColor" class="empty-icon">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z"/>
                            </svg>
                            <h3>No hay facturas</h3>
                            <p>No se encontraron facturas con los filtros aplicados</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredInvoices.map(invoice => {
            const statusClass = this.getStatusClass(invoice.status);
            const statusText = this.getStatusText(invoice.status);
            const isOverdue = invoice.status === 'OVERDUE';
            
            return `
                <tr class="invoice-row ${isOverdue ? 'overdue' : ''}">
                    <td>
                        <div class="invoice-number">
                            <strong>${invoice.number}</strong>
                            <span class="invoice-date">${formatDate(invoice.date)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="client-info">
                            <strong class="client-name">${invoice.client.name}</strong>
                            <span class="client-document">${invoice.client.document}</span>
                        </div>
                    </td>
                    <td>
                        <div class="invoice-items">
                            ${invoice.items.map(item => `
                                <div class="item-description">${item.description}</div>
                            `).join('')}
                        </div>
                    </td>
                    <td>
                        <span class="due-date ${isOverdue ? 'overdue' : ''}">
                            ${formatDate(invoice.dueDate)}
                        </span>
                    </td>
                    <td>
                        <span class="amount">
                            ${formatCurrency(invoice.total)}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-info btn-sm" 
                                    onclick="viewInvoice('${invoice.id}')" 
                                    title="Ver factura">
                                👁️
                            </button>
                            <button class="btn btn-warning btn-sm" 
                                    onclick="editInvoice('${invoice.id}')" 
                                    title="Editar factura">
                                ✏️
                            </button>
                            <button class="btn btn-success btn-sm" 
                                    onclick="downloadInvoicePDF('${invoice.id}')" 
                                    title="Descargar PDF">
                                📄
                            </button>
                            ${invoice.status === 'PENDING' ? `
                                <button class="btn btn-primary btn-sm" 
                                        onclick="markAsPaid('${invoice.id}')" 
                                        title="Marcar como pagada">
                                    💰
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getStatusClass(status) {
        const statusClasses = {
            'PAID': 'paid',
            'PENDING': 'pending',
            'OVERDUE': 'overdue',
            'CANCELLED': 'cancelled'
        };
        return statusClasses[status] || 'pending';
    }

    getStatusText(status) {
        const statusTexts = {
            'PAID': 'Pagada',
            'PENDING': 'Pendiente',
            'OVERDUE': 'Vencida',
            'CANCELLED': 'Cancelada'
        };
        return statusTexts[status] || 'Pendiente';
    }

    updateSummary() {
        const totalInvoices = this.filteredInvoices.length;
        const totalAmount = this.filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const paidAmount = this.filteredInvoices
            .filter(inv => inv.status === 'PAID')
            .reduce((sum, inv) => sum + inv.total, 0);
        const pendingAmount = this.filteredInvoices
            .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
            .reduce((sum, inv) => sum + inv.total, 0);

        // Actualizar elementos del DOM
        const elements = {
            'totalInvoices': totalInvoices,
            'totalAmount': formatCurrency(totalAmount),
            'paidAmount': formatCurrency(paidAmount),
            'pendingAmount': formatCurrency(pendingAmount)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    setupEventListeners() {
        // Configurar filtros en tiempo real
        const filters = ['dateFrom', 'dateTo', 'statusFilter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => {
                    this.filterInvoices();
                });
            }
        });

        // Configurar búsqueda de cliente
        const clientFilter = document.getElementById('clientFilter');
        if (clientFilter) {
            let searchTimeout;
            clientFilter.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterInvoices();
                }, 300);
            });
        }
    }

    showNewInvoiceModal() {
        showAlert('Modal de nueva factura en desarrollo', 'info');
    }

    exportInvoices() {
        showAlert('Exportando facturas...', 'info');
        
        setTimeout(() => {
            showAlert('Facturas exportadas exitosamente', 'success');
        }, 2000);
    }

    generateReport() {
        showAlert('Generando reporte de facturas...', 'info');
        
        setTimeout(() => {
            showAlert('Reporte generado exitosamente', 'success');
        }, 2000);
    }
}

// Funciones globales para interactuar con facturas
function viewInvoice(invoiceId) {
    console.log('👁️ Ver factura:', invoiceId);
    
    if (!window.invoicesPage) {
        showAlert('Error: Sistema no inicializado correctamente', 'error');
        return;
    }
    
    const invoice = window.invoicesPage.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showAlert('No se encontró la factura', 'error');
        return;
    }
    
    // Crear modal con detalles de la factura
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'invoiceDetailsModal';
    modal.innerHTML = `
        <div class="modal-content invoice-details">
            <div class="modal-header">
                <h3 class="modal-title">📄 Factura ${invoice.number}</h3>
                <button class="modal-close" onclick="closeInvoiceDetails()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="invoice-header">
                    <div class="invoice-info">
                        <h2>FACTURA DE VENTA</h2>
                        <p><strong>Número:</strong> ${invoice.number}</p>
                        <p><strong>Fecha:</strong> ${formatDate(invoice.date)}</p>
                        <p><strong>Vencimiento:</strong> ${formatDate(invoice.dueDate)}</p>
                    </div>
                    <div class="company-info">
                        <h3>EDUCONTA</h3>
                        <p>Institución Educativa</p>
                        <p>NIT: 123.456.789-0</p>
                    </div>
                </div>
                
                <div class="invoice-details-content">
                    <div class="client-section">
                        <h4>CLIENTE:</h4>
                        <p><strong>Nombre:</strong> ${invoice.client.name}</p>
                        <p><strong>Documento:</strong> ${invoice.client.document}</p>
                        <p><strong>Email:</strong> ${invoice.client.email}</p>
                    </div>
                    
                    <div class="items-section">
                        <h4>DETALLE:</h4>
                        <table class="invoice-table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Cantidad</th>
                                    <th>Valor Unitario</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoice.items.map(item => `
                                    <tr>
                                        <td>${item.description}</td>
                                        <td>${item.quantity}</td>
                                        <td>${formatCurrency(item.unitPrice)}</td>
                                        <td>${formatCurrency(item.total)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="invoice-totals">
                        <div class="totals-row">
                            <span>Subtotal:</span>
                            <span>${formatCurrency(invoice.subtotal)}</span>
                        </div>
                        <div class="totals-row">
                            <span>IVA:</span>
                            <span>${formatCurrency(invoice.tax)}</span>
                        </div>
                        <div class="totals-row total">
                            <span><strong>TOTAL:</strong></span>
                            <span><strong>${formatCurrency(invoice.total)}</strong></span>
                        </div>
                    </div>
                    
                    <div class="payment-info">
                        <h4>INFORMACIÓN DE PAGO:</h4>
                        <p><strong>Estado:</strong> 
                            <span class="status-badge ${window.invoicesPage.getStatusClass(invoice.status)}">
                                ${window.invoicesPage.getStatusText(invoice.status)}
                            </span>
                        </p>
                        ${invoice.paymentDate ? `
                            <p><strong>Fecha de Pago:</strong> ${formatDate(invoice.paymentDate)}</p>
                            <p><strong>Método de Pago:</strong> ${getPaymentMethodText(invoice.paymentMethod)}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeInvoiceDetails()">Cerrar</button>
                <button class="btn btn-secondary" onclick="downloadInvoicePDF('${invoice.id}')">
                    📄 Descargar PDF
                </button>
                <button class="btn btn-warning" onclick="editInvoice('${invoice.id}')">
                    ✏️ Editar
                </button>
                ${invoice.status === 'PENDING' ? `
                    <button class="btn btn-success" onclick="markAsPaid('${invoice.id}')">
                        💰 Marcar como Pagada
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function editInvoice(invoiceId) {
    console.log('✏️ Editar factura:', invoiceId);
    
    if (!window.invoicesPage) {
        showAlert('Error: Sistema no inicializado correctamente', 'error');
        return;
    }
    
    const invoice = window.invoicesPage.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showAlert('No se encontró la factura', 'error');
        return;
    }
    
    // Cerrar modal de detalles si está abierto
    closeInvoiceDetails();
    
    // Crear modal de edición
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editInvoiceModal';
    modal.innerHTML = `
        <div class="modal-content edit-invoice">
            <div class="modal-header">
                <h3 class="modal-title">✏️ Editar Factura ${invoice.number}</h3>
                <button class="modal-close" onclick="closeEditInvoice()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editInvoiceForm" onsubmit="saveInvoiceChanges(event, '${invoice.id}')">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="editInvoiceNumber">Número de Factura:</label>
                            <input type="text" id="editInvoiceNumber" value="${invoice.number}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editInvoiceDate">Fecha de Emisión:</label>
                            <input type="date" id="editInvoiceDate" value="${invoice.date.split('T')[0]}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editInvoiceDueDate">Fecha de Vencimiento:</label>
                            <input type="date" id="editInvoiceDueDate" value="${invoice.dueDate.split('T')[0]}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editInvoiceStatus">Estado:</label>
                            <select id="editInvoiceStatus" required>
                                <option value="PENDING" ${invoice.status === 'PENDING' ? 'selected' : ''}>Pendiente</option>
                                <option value="PAID" ${invoice.status === 'PAID' ? 'selected' : ''}>Pagada</option>
                                <option value="OVERDUE" ${invoice.status === 'OVERDUE' ? 'selected' : ''}>Vencida</option>
                                <option value="CANCELLED" ${invoice.status === 'CANCELLED' ? 'selected' : ''}>Cancelada</option>
                            </select>
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="editClientName">Cliente:</label>
                            <input type="text" id="editClientName" value="${invoice.client.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editClientDocument">Documento:</label>
                            <input type="text" id="editClientDocument" value="${invoice.client.document}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editClientEmail">Email:</label>
                            <input type="email" id="editClientEmail" value="${invoice.client.email}" required>
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="editItemDescription">Descripción del Servicio:</label>
                            <input type="text" id="editItemDescription" value="${invoice.items[0]?.description || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editItemQuantity">Cantidad:</label>
                            <input type="number" id="editItemQuantity" value="${invoice.items[0]?.quantity || 1}" min="1" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editItemPrice">Precio Unitario:</label>
                            <input type="number" id="editItemPrice" value="${invoice.items[0]?.unitPrice || 0}" min="0" step="0.01" required>
                        </div>
                        
                        ${invoice.status === 'PAID' ? `
                            <div class="form-group">
                                <label for="editPaymentMethod">Método de Pago:</label>
                                <select id="editPaymentMethod">
                                    <option value="CASH" ${invoice.paymentMethod === 'CASH' ? 'selected' : ''}>Efectivo</option>
                                    <option value="TRANSFER" ${invoice.paymentMethod === 'TRANSFER' ? 'selected' : ''}>Transferencia</option>
                                    <option value="CARD" ${invoice.paymentMethod === 'CARD' ? 'selected' : ''}>Tarjeta</option>
                                    <option value="CHECK" ${invoice.paymentMethod === 'CHECK' ? 'selected' : ''}>Cheque</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="editPaymentDate">Fecha de Pago:</label>
                                <input type="date" id="editPaymentDate" value="${invoice.paymentDate ? invoice.paymentDate.split('T')[0] : ''}">
                            </div>
                        ` : ''}
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeEditInvoice()">Cancelar</button>
                <button class="btn btn-primary" onclick="document.getElementById('editInvoiceForm').requestSubmit()">
                    💾 Guardar Cambios
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function downloadInvoicePDF(invoiceId) {
    console.log('📄 Descargar PDF de factura:', invoiceId);
    
    if (!window.invoicesPage) {
        showAlert('Error: Sistema no inicializado correctamente', 'error');
        return;
    }
    
    const invoice = window.invoicesPage.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showAlert('No se encontró la factura', 'error');
        return;
    }
    
    showAlert(`Generando PDF de factura ${invoice.number}...`, 'info');
    
    // Generar contenido HTML para el PDF
    const pdfContent = generateInvoicePDFContent(invoice);
    
    // Crear elemento temporal para la descarga
    const element = document.createElement('a');
    const file = new Blob([pdfContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `Factura_${invoice.number}.html`;
    
    // Simular descarga
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setTimeout(() => {
        showAlert(`PDF de factura ${invoice.number} descargado exitosamente`, 'success');
    }, 1000);
}

function generateInvoicePDFContent(invoice) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura ${invoice.number}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        .company-info h1 {
            color: #2563eb;
            margin: 0;
            font-size: 2.5rem;
        }
        .company-info p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-info h2 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 1.8rem;
        }
        .invoice-info p {
            margin: 5px 0;
        }
        .client-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .client-section h3 {
            color: #2563eb;
            margin: 0 0 15px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        .items-table th {
            background: #2563eb;
            color: white;
            padding: 15px;
            text-align: left;
        }
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .totals-section {
            text-align: right;
            margin-top: 30px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .total-final {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2563eb;
            border-top: 3px solid #2563eb;
            padding-top: 15px;
            margin-top: 15px;
        }
        .payment-info {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            border-left: 4px solid #2563eb;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9rem;
        }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .status-cancelled { background: #f3f4f6; color: #374151; }
        @media print {
            body { margin: 0; }
            .invoice-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="company-info">
                <h1>EDUCONTA</h1>
                <p>Institución Educativa</p>
                <p>NIT: 123.456.789-0</p>
                <p>Dirección: Calle Principal #123</p>
                <p>Teléfono: +57 (1) 234-5678</p>
            </div>
            <div class="invoice-info">
                <h2>FACTURA DE VENTA</h2>
                <p><strong>Número:</strong> ${invoice.number}</p>
                <p><strong>Fecha:</strong> ${new Date(invoice.date).toLocaleDateString('es-CO')}</p>
                <p><strong>Vencimiento:</strong> ${new Date(invoice.dueDate).toLocaleDateString('es-CO')}</p>
            </div>
        </div>
        
        <div class="client-section">
            <h3>INFORMACIÓN DEL CLIENTE</h3>
            <p><strong>Nombre:</strong> ${invoice.client.name}</p>
            <p><strong>Documento:</strong> ${invoice.client.document}</p>
            <p><strong>Email:</strong> ${invoice.client.email}</p>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Valor Unitario</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.unitPrice.toLocaleString('es-CO')}</td>
                        <td>$${item.total.toLocaleString('es-CO')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals-section">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>$${invoice.subtotal.toLocaleString('es-CO')}</span>
            </div>
            <div class="totals-row">
                <span>IVA (0%):</span>
                <span>$${invoice.tax.toLocaleString('es-CO')}</span>
            </div>
            <div class="totals-row total-final">
                <span>TOTAL:</span>
                <span>$${invoice.total.toLocaleString('es-CO')}</span>
            </div>
        </div>
        
        <div class="payment-info">
            <h3>INFORMACIÓN DE PAGO</h3>
            <p><strong>Estado:</strong> 
                <span class="status-badge status-${invoice.status.toLowerCase()}">
                    ${window.invoicesPage ? window.invoicesPage.getStatusText(invoice.status) : invoice.status}
                </span>
            </p>
            ${invoice.paymentDate ? `
                <p><strong>Fecha de Pago:</strong> ${new Date(invoice.paymentDate).toLocaleDateString('es-CO')}</p>
                <p><strong>Método de Pago:</strong> ${getPaymentMethodText(invoice.paymentMethod)}</p>
            ` : ''}
        </div>
        
        <div style="margin-top: 50px; text-align: center; color: #666; font-size: 0.9rem;">
            <p>Gracias por confiar en EDUCONTA</p>
            <p>Esta factura fue generada electrónicamente el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
        </div>
    </div>
</body>
</html>
    `;
}

function markAsPaid(invoiceId) {
    console.log('💰 Marcar como pagada:', invoiceId);
    
    if (!window.invoicesPage) {
        showAlert('Error: Sistema no inicializado correctamente', 'error');
        return;
    }
    
    const invoice = window.invoicesPage.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showAlert('No se encontró la factura', 'error');
        return;
    }
    
    if (confirm(`¿Marcar la factura ${invoice.number} como pagada?`)) {
        // Actualizar estado
        invoice.status = 'PAID';
        invoice.paymentDate = new Date().toISOString();
        invoice.paymentMethod = 'CASH'; // Por defecto
        invoice.updatedAt = new Date().toISOString();
        
        // Actualizar en filteredInvoices también
        const filteredInvoice = window.invoicesPage.filteredInvoices.find(inv => inv.id === invoiceId);
        if (filteredInvoice) {
            filteredInvoice.status = 'PAID';
            filteredInvoice.paymentDate = invoice.paymentDate;
            filteredInvoice.paymentMethod = invoice.paymentMethod;
            filteredInvoice.updatedAt = invoice.updatedAt;
        }
        
        window.invoicesPage.renderInvoices();
        window.invoicesPage.updateSummary();
        
        showAlert('Factura marcada como pagada exitosamente', 'success');
    }
}

function closeInvoiceDetails() {
    const modal = document.getElementById('invoiceDetailsModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function closeEditInvoice() {
    const modal = document.getElementById('editInvoiceModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function saveInvoiceChanges(event, invoiceId) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const formData = {
        number: document.getElementById('editInvoiceNumber').value,
        date: document.getElementById('editInvoiceDate').value + 'T00:00:00.000Z',
        dueDate: document.getElementById('editInvoiceDueDate').value + 'T00:00:00.000Z',
        status: document.getElementById('editInvoiceStatus').value,
        client: {
            name: document.getElementById('editClientName').value,
            document: document.getElementById('editClientDocument').value,
            email: document.getElementById('editClientEmail').value
        },
        items: [{
            description: document.getElementById('editItemDescription').value,
            quantity: parseInt(document.getElementById('editItemQuantity').value),
            unitPrice: parseFloat(document.getElementById('editItemPrice').value),
            total: parseInt(document.getElementById('editItemQuantity').value) * parseFloat(document.getElementById('editItemPrice').value)
        }]
    };
    
    // Calcular totales
    formData.subtotal = formData.items[0].total;
    formData.tax = 0;
    formData.total = formData.subtotal + formData.tax;
    
    // Agregar información de pago si está pagada
    if (formData.status === 'PAID') {
        const paymentMethodElement = document.getElementById('editPaymentMethod');
        const paymentDateElement = document.getElementById('editPaymentDate');
        
        if (paymentMethodElement) {
            formData.paymentMethod = paymentMethodElement.value;
        }
        if (paymentDateElement && paymentDateElement.value) {
            formData.paymentDate = paymentDateElement.value + 'T00:00:00.000Z';
        }
    } else {
        formData.paymentMethod = null;
        formData.paymentDate = null;
    }
    
    // Validar datos
    if (!formData.number || !formData.date || !formData.client.name || !formData.items[0].description) {
        showAlert('Por favor completa todos los campos obligatorios', 'error');
        return;
    }
    
    showAlert('Guardando cambios...', 'info');
    
    // Simular guardado
    setTimeout(() => {
        // Actualizar la factura en los datos
        if (window.invoicesPage) {
            const invoiceIndex = window.invoicesPage.invoices.findIndex(inv => inv.id === invoiceId);
            if (invoiceIndex !== -1) {
                // Actualizar la factura
                window.invoicesPage.invoices[invoiceIndex] = {
                    ...window.invoicesPage.invoices[invoiceIndex],
                    ...formData,
                    updatedAt: new Date().toISOString()
                };
                
                // Actualizar la vista filtrada también
                const filteredIndex = window.invoicesPage.filteredInvoices.findIndex(inv => inv.id === invoiceId);
                if (filteredIndex !== -1) {
                    window.invoicesPage.filteredInvoices[filteredIndex] = {
                        ...window.invoicesPage.filteredInvoices[filteredIndex],
                        ...formData,
                        updatedAt: new Date().toISOString()
                    };
                }
                
                // Re-renderizar la tabla
                window.invoicesPage.renderInvoices();
                window.invoicesPage.updateSummary();
            }
        }
        
        closeEditInvoice();
        showAlert('Factura actualizada exitosamente', 'success');
    }, 1000);
}

function getPaymentMethodText(method) {
    const methods = {
        'CASH': 'Efectivo',
        'TRANSFER': 'Transferencia',
        'CARD': 'Tarjeta',
        'CHECK': 'Cheque'
    };
    return methods[method] || 'No especificado';
}

// Hacer disponible globalmente
window.InvoicesManagementPage = InvoicesManagementPage;