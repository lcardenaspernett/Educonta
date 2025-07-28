// ===================================
// EDUCONTA - Visualizador de Facturas
// ===================================

/**
 * Sistema para visualizar facturas generadas
 */
class InvoiceViewer {
    constructor() {
        this.invoices = this.loadInvoices();
        this.init();
    }

    init() {
        console.log('🧾 Inicializando visualizador de facturas');
        this.generateSampleInvoices();
    }

    /**
     * Generar facturas de ejemplo
     */
    generateSampleInvoices() {
        if (this.invoices.length > 0) return;

        const sampleInvoices = [
            {
                id: 'inv-001',
                invoiceNumber: 'FAC-2024-001',
                studentName: 'Ana María González Pérez',
                studentId: 'EST-001',
                studentGrade: '11°A',
                concept: 'Derecho de Grado',
                amount: 150000,
                discount: 15000,
                finalAmount: 135000,
                status: 'PAID',
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                paidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                paymentMethod: 'Efectivo',
                transactionId: 'trans-001'
            },
            {
                id: 'inv-002',
                invoiceNumber: 'FAC-2024-002',
                studentName: 'Carlos Andrés López Silva',
                studentId: 'EST-002',
                studentGrade: '10°B',
                concept: 'Mensualidad Febrero',
                amount: 350000,
                discount: 0,
                finalAmount: 350000,
                status: 'PENDING',
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                dueDate: new Date(Date.now() + 86400000 * 7).toISOString()
            },
            {
                id: 'inv-003',
                invoiceNumber: 'FAC-2024-003',
                studentName: 'María José Rodríguez Castro',
                studentId: 'EST-003',
                studentGrade: '9°C',
                concept: 'Rifa Navideña',
                amount: 75000,
                discount: 0,
                finalAmount: 75000,
                status: 'PAID',
                createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                paidAt: new Date().toISOString(),
                paymentMethod: 'Transferencia',
                transactionId: 'trans-002'
            }
        ];

        this.invoices = sampleInvoices;
        this.saveInvoices();
    }

    /**
     * Mostrar modal de historial de facturas
     */
    showInvoiceHistory() {
        const modal = this.createInvoiceHistoryModal();
        document.body.appendChild(modal);
    }

    /**
     * Crear modal de historial
     */
    createInvoiceHistoryModal() {
        const modal = document.createElement('div');
        modal.className = 'invoice-history-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📋 Historial de Facturas</h3>
                    <button class="close-btn" onclick="this.closest('.invoice-history-modal').remove()">×</button>
                </div>
                
                <div class="modal-filters">
                    <div class="filter-group">
                        <label>Estado:</label>
                        <select id="historyStatusFilter" onchange="invoiceViewer.filterHistory()">
                            <option value="">Todas</option>
                            <option value="PAID">Pagadas</option>
                            <option value="PENDING">Pendientes</option>
                            <option value="OVERDUE">Vencidas</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Buscar:</label>
                        <input type="text" id="historySearchFilter" placeholder="Estudiante o número..." onkeyup="invoiceViewer.filterHistory()">
                    </div>
                </div>
                
                <div class="modal-body">
                    <div class="invoices-list" id="invoiceHistoryList">
                        ${this.renderInvoiceHistory()}
                    </div>
                </div>
            </div>
        `;

        this.addInvoiceHistoryStyles();
        return modal;
    }

    /**
     * Renderizar historial de facturas
     */
    renderInvoiceHistory() {
        if (this.invoices.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No hay facturas</h3>
                    <p>No se han generado facturas aún</p>
                </div>
            `;
        }

        return this.invoices.map(invoice => this.renderInvoiceHistoryItem(invoice)).join('');
    }

    /**
     * Renderizar item de historial
     */
    renderInvoiceHistoryItem(invoice) {
        const statusConfig = {
            'PAID': { icon: '✅', label: 'Pagada', class: 'paid' },
            'PENDING': { icon: '⏳', label: 'Pendiente', class: 'pending' },
            'OVERDUE': { icon: '🚨', label: 'Vencida', class: 'overdue' }
        };

        const config = statusConfig[invoice.status] || statusConfig.PENDING;

        return `
            <div class="invoice-history-item ${config.class}">
                <div class="invoice-info">
                    <div class="invoice-header">
                        <h4>${invoice.invoiceNumber}</h4>
                        <span class="invoice-status ${config.class}">
                            ${config.icon} ${config.label}
                        </span>
                    </div>
                    <div class="invoice-details">
                        <p class="student-name">${invoice.studentName} - ${invoice.studentGrade}</p>
                        <p class="invoice-concept">${invoice.concept}</p>
                        <div class="invoice-amounts">
                            <span class="amount">Monto: ${this.formatCurrency(invoice.amount)}</span>
                            ${invoice.discount > 0 ? `<span class="discount">Desc: ${this.formatCurrency(invoice.discount)}</span>` : ''}
                            <span class="final-amount">Total: ${this.formatCurrency(invoice.finalAmount)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="invoice-dates">
                    <div class="date-item">
                        <span class="date-label">Creada:</span>
                        <span class="date-value">${this.formatDate(invoice.createdAt)}</span>
                    </div>
                    ${invoice.paidAt ? `
                        <div class="date-item">
                            <span class="date-label">Pagada:</span>
                            <span class="date-value">${this.formatDate(invoice.paidAt)}</span>
                        </div>
                    ` : ''}
                    ${invoice.dueDate ? `
                        <div class="date-item">
                            <span class="date-label">Vence:</span>
                            <span class="date-value ${this.isOverdue(invoice.dueDate) ? 'overdue' : ''}">${this.formatDate(invoice.dueDate)}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="invoice-actions">
                    <button class="btn btn-outline btn-sm" onclick="invoiceViewer.viewInvoice('${invoice.id}')">
                        👁️ Ver
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="invoiceViewer.printInvoice('${invoice.id}')">
                        🖨️ Imprimir
                    </button>
                    ${invoice.status === 'PENDING' ? `
                        <button class="btn btn-success btn-sm" onclick="invoiceViewer.markAsPaid('${invoice.id}')">
                            💰 Marcar Pagada
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Ver factura individual
     */
    viewInvoice(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            this.showNotification('Factura no encontrada', 'error');
            return;
        }

        // Cerrar modal de historial si está abierto
        const historyModal = document.querySelector('.invoice-history-modal');
        if (historyModal) historyModal.remove();

        // Mostrar modal de factura
        const modal = this.createInvoiceViewModal(invoice);
        document.body.appendChild(modal);
    }

    /**
     * Crear modal de visualización de factura
     */
    createInvoiceViewModal(invoice) {
        const modal = document.createElement('div');
        modal.className = 'invoice-view-modal';
        modal.innerHTML = `
            <div class="modal-content invoice-document">
                <div class="modal-header">
                    <h3>🧾 Factura ${invoice.invoiceNumber}</h3>
                    <div class="header-actions">
                        <button class="btn btn-outline btn-sm" onclick="invoiceViewer.printInvoice('${invoice.id}')">
                            🖨️ Imprimir
                        </button>
                        <button class="close-btn" onclick="this.closest('.invoice-view-modal').remove()">×</button>
                    </div>
                </div>
                
                <div class="invoice-content">
                    <!-- HEADER DE LA INSTITUCIÓN -->
                    <div class="institution-header">
                        <div class="institution-logo">
                            <svg width="48" height="48" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        </div>
                        <div class="institution-info">
                            <h2>Institución Educativa Demo</h2>
                            <p>NIT: 123.456.789-0</p>
                            <p>Dirección: Calle 123 #45-67, Ciudad</p>
                            <p>Teléfono: (123) 456-7890</p>
                        </div>
                        <div class="invoice-number">
                            <h3>FACTURA</h3>
                            <p>${invoice.invoiceNumber}</p>
                            <p class="invoice-date">${this.formatDate(invoice.createdAt)}</p>
                        </div>
                    </div>
                    
                    <!-- INFORMACIÓN DEL ESTUDIANTE -->
                    <div class="student-section">
                        <h4>INFORMACIÓN DEL ESTUDIANTE</h4>
                        <div class="student-details">
                            <div class="detail-row">
                                <span class="label">Nombre:</span>
                                <span class="value">${invoice.studentName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Código:</span>
                                <span class="value">${invoice.studentId}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Grado:</span>
                                <span class="value">${invoice.studentGrade}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- DETALLE DE LA FACTURA -->
                    <div class="invoice-details-section">
                        <h4>DETALLE</h4>
                        <table class="invoice-table">
                            <thead>
                                <tr>
                                    <th>Concepto</th>
                                    <th>Cantidad</th>
                                    <th>Valor Unitario</th>
                                    <th>Descuento</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${invoice.concept}</td>
                                    <td>1</td>
                                    <td>${this.formatCurrency(invoice.amount)}</td>
                                    <td>${this.formatCurrency(invoice.discount || 0)}</td>
                                    <td>${this.formatCurrency(invoice.finalAmount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- TOTALES -->
                    <div class="invoice-totals">
                        <div class="totals-row">
                            <span class="label">Subtotal:</span>
                            <span class="value">${this.formatCurrency(invoice.amount)}</span>
                        </div>
                        ${invoice.discount > 0 ? `
                            <div class="totals-row">
                                <span class="label">Descuento:</span>
                                <span class="value discount">-${this.formatCurrency(invoice.discount)}</span>
                            </div>
                        ` : ''}
                        <div class="totals-row total">
                            <span class="label">TOTAL A PAGAR:</span>
                            <span class="value">${this.formatCurrency(invoice.finalAmount)}</span>
                        </div>
                    </div>
                    
                    <!-- ESTADO DE PAGO -->
                    <div class="payment-status">
                        ${invoice.status === 'PAID' ? `
                            <div class="paid-stamp">
                                <h3>✅ PAGADO</h3>
                                <p>Fecha: ${this.formatDate(invoice.paidAt)}</p>
                                <p>Método: ${invoice.paymentMethod}</p>
                            </div>
                        ` : `
                            <div class="pending-stamp">
                                <h3>⏳ PENDIENTE DE PAGO</h3>
                                ${invoice.dueDate ? `<p>Vence: ${this.formatDate(invoice.dueDate)}</p>` : ''}
                            </div>
                        `}
                    </div>
                    
                    <!-- FOOTER -->
                    <div class="invoice-footer">
                        <p>Esta factura fue generada electrónicamente por el sistema Educonta</p>
                        <p>Para consultas: contabilidad@institucion.edu.co</p>
                    </div>
                </div>
                
                <div class="modal-actions">
                    ${invoice.status === 'PENDING' ? `
                        <button class="btn btn-success" onclick="invoiceViewer.markAsPaid('${invoice.id}')">
                            💰 Marcar como Pagada
                        </button>
                    ` : ''}
                    <button class="btn btn-outline" onclick="invoiceViewer.downloadPDF('${invoice.id}')">
                        📄 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.invoice-view-modal').remove()">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        this.addInvoiceViewStyles();
        return modal;
    }

    /**
     * Marcar factura como pagada
     */
    markAsPaid(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        // Mostrar modal de pago
        const paymentModal = this.createPaymentModal(invoice);
        document.body.appendChild(paymentModal);
    }

    /**
     * Crear modal de pago
     */
    createPaymentModal(invoice) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💰 Registrar Pago - ${invoice.invoiceNumber}</h3>
                    <button class="close-btn" onclick="this.closest('.payment-modal').remove()">×</button>
                </div>
                
                <div class="payment-info">
                    <div class="info-item">
                        <span class="label">Estudiante:</span>
                        <span class="value">${invoice.studentName}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Concepto:</span>
                        <span class="value">${invoice.concept}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Monto:</span>
                        <span class="value amount">${this.formatCurrency(invoice.finalAmount)}</span>
                    </div>
                </div>
                
                <form id="paymentForm" onsubmit="invoiceViewer.processPayment(event, '${invoice.id}')">
                    <div class="form-group">
                        <label for="paymentMethod">Método de Pago *</label>
                        <select name="paymentMethod" id="paymentMethod" required>
                            <option value="">Seleccionar método...</option>
                            <option value="Efectivo">💵 Efectivo</option>
                            <option value="Transferencia">🏦 Transferencia Bancaria</option>
                            <option value="Tarjeta">💳 Tarjeta</option>
                            <option value="Cheque">📝 Cheque</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="paymentDate">Fecha de Pago</label>
                        <input type="date" name="paymentDate" id="paymentDate" 
                               value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label for="paymentReference">Referencia</label>
                        <input type="text" name="paymentReference" id="paymentReference" 
                               placeholder="Número de transacción, cheque, etc.">
                    </div>
                    
                    <div class="form-group">
                        <label for="paymentNotes">Observaciones</label>
                        <textarea name="paymentNotes" id="paymentNotes" rows="3" 
                                  placeholder="Observaciones adicionales..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.payment-modal').remove()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-success">
                            💰 Registrar Pago
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
    processPayment(event, invoiceId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const paymentData = Object.fromEntries(formData);
        
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;
        
        // Actualizar factura
        invoice.status = 'PAID';
        invoice.paidAt = paymentData.paymentDate || new Date().toISOString();
        invoice.paymentMethod = paymentData.paymentMethod;
        invoice.paymentReference = paymentData.paymentReference;
        invoice.paymentNotes = paymentData.paymentNotes;
        
        // Crear transacción contable
        this.createAccountingTransaction(invoice, paymentData);
        
        // Guardar cambios
        this.saveInvoices();
        
        // Cerrar modales
        document.querySelector('.payment-modal')?.remove();
        document.querySelector('.invoice-view-modal')?.remove();
        document.querySelector('.invoice-history-modal')?.remove();
        
        this.showNotification(`Pago registrado exitosamente para ${invoice.studentName}`, 'success');
    }

    /**
     * Crear transacción contable
     */
    async createAccountingTransaction(invoice, paymentData) {
        const transactionData = {
            date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
            reference: paymentData.paymentReference || invoice.invoiceNumber,
            description: `Pago ${invoice.concept} - ${invoice.studentName}`,
            amount: invoice.finalAmount,
            type: 'INCOME',
            debitAccountId: '1', // Caja
            creditAccountId: '5', // Ingresos por servicios educativos
            status: 'APPROVED'
        };

        if (window.AccountingState) {
            try {
                await window.AccountingState.createTransaction(transactionData);
                console.log('💰 Transacción contable creada por pago de factura:', transactionData);
            } catch (error) {
                console.error('Error creando transacción contable:', error);
            }
        }
    }

    /**
     * Imprimir factura
     */
    printInvoice(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        // Crear ventana de impresión
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generatePrintableInvoice(invoice));
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * Generar HTML imprimible
     */
    generatePrintableInvoice(invoice) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Factura ${invoice.invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .invoice-table th { background-color: #f2f2f2; }
                    .totals { text-align: right; margin-top: 20px; }
                    .paid-stamp { color: green; font-weight: bold; text-align: center; margin: 20px 0; }
                    .pending-stamp { color: orange; font-weight: bold; text-align: center; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Institución Educativa Demo</h1>
                    <p>NIT: 123.456.789-0</p>
                    <h2>FACTURA ${invoice.invoiceNumber}</h2>
                    <p>Fecha: ${this.formatDate(invoice.createdAt)}</p>
                </div>
                
                <div class="student-info">
                    <h3>Información del Estudiante</h3>
                    <p><strong>Nombre:</strong> ${invoice.studentName}</p>
                    <p><strong>Código:</strong> ${invoice.studentId}</p>
                    <p><strong>Grado:</strong> ${invoice.studentGrade}</p>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            <th>Cantidad</th>
                            <th>Valor Unitario</th>
                            <th>Descuento</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${invoice.concept}</td>
                            <td>1</td>
                            <td>${this.formatCurrency(invoice.amount)}</td>
                            <td>${this.formatCurrency(invoice.discount || 0)}</td>
                            <td>${this.formatCurrency(invoice.finalAmount)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="totals">
                    <p><strong>TOTAL A PAGAR: ${this.formatCurrency(invoice.finalAmount)}</strong></p>
                </div>
                
                ${invoice.status === 'PAID' ? `
                    <div class="paid-stamp">
                        <h2>✅ PAGADO</h2>
                        <p>Fecha: ${this.formatDate(invoice.paidAt)}</p>
                        <p>Método: ${invoice.paymentMethod}</p>
                    </div>
                ` : `
                    <div class="pending-stamp">
                        <h2>⏳ PENDIENTE DE PAGO</h2>
                    </div>
                `}
            </body>
            </html>
        `;
    }

    /**
     * Filtrar historial
     */
    filterHistory() {
        const statusFilter = document.getElementById('historyStatusFilter')?.value || '';
        const searchFilter = document.getElementById('historySearchFilter')?.value.toLowerCase() || '';
        
        let filteredInvoices = this.invoices;
        
        if (statusFilter) {
            filteredInvoices = filteredInvoices.filter(inv => inv.status === statusFilter);
        }
        
        if (searchFilter) {
            filteredInvoices = filteredInvoices.filter(inv => 
                inv.studentName.toLowerCase().includes(searchFilter) ||
                inv.invoiceNumber.toLowerCase().includes(searchFilter)
            );
        }
        
        const list = document.getElementById('invoiceHistoryList');
        if (list) {
            list.innerHTML = filteredInvoices.map(inv => this.renderInvoiceHistoryItem(inv)).join('');
        }
    }

    // Métodos auxiliares
    isOverdue(dueDate) {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
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
    saveInvoices() {
        localStorage.setItem('educonta-invoices', JSON.stringify(this.invoices));
    }

    loadInvoices() {
        try {
            const stored = localStorage.getItem('educonta-invoices');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error cargando facturas:', error);
            return [];
        }
    }

    // Estilos
    addInvoiceHistoryStyles() {
        if (document.getElementById('invoice-history-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'invoice-history-styles';
        styles.textContent = `
            .invoice-history-modal {
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

            .invoice-history-modal .modal-content {
                background: var(--bg-card);
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .invoice-history-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border: 1px solid var(--border);
                border-radius: 8px;
                margin-bottom: 0.5rem;
                background: var(--bg-secondary);
            }

            .invoice-history-item.paid {
                border-left: 4px solid var(--success);
            }

            .invoice-history-item.pending {
                border-left: 4px solid var(--warning);
            }

            .invoice-history-item.overdue {
                border-left: 4px solid var(--error);
            }

            .invoice-info {
                flex: 1;
            }

            .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .invoice-status.paid {
                color: var(--success);
            }

            .invoice-status.pending {
                color: var(--warning);
            }

            .invoice-status.overdue {
                color: var(--error);
            }

            .invoice-amounts {
                display: flex;
                gap: 1rem;
                font-size: 0.875rem;
                color: var(--text-light);
            }

            .final-amount {
                font-weight: 600;
                color: var(--text);
            }

            .invoice-dates {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                font-size: 0.75rem;
                color: var(--text-light);
            }

            .invoice-actions {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
        `;
        document.head.appendChild(styles);
    }

    addInvoiceViewStyles() {
        if (document.getElementById('invoice-view-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'invoice-view-styles';
        styles.textContent = `
            .invoice-view-modal {
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

            .invoice-view-modal .modal-content {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }

            .invoice-document {
                color: #333;
            }

            .institution-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2rem;
                border-bottom: 2px solid #333;
                margin-bottom: 2rem;
            }

            .institution-info h2 {
                margin: 0 0 0.5rem 0;
                color: #333;
            }

            .invoice-number {
                text-align: right;
            }

            .invoice-number h3 {
                margin: 0;
                color: #333;
            }

            .student-section, .invoice-details-section {
                margin: 2rem;
            }

            .student-section h4, .invoice-details-section h4 {
                color: #333;
                border-bottom: 1px solid #ddd;
                padding-bottom: 0.5rem;
                margin-bottom: 1rem;
            }

            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
            }

            .invoice-table th,
            .invoice-table td {
                border: 1px solid #ddd;
                padding: 0.75rem;
                text-align: left;
            }

            .invoice-table th {
                background-color: #f8f9fa;
                font-weight: 600;
            }

            .invoice-totals {
                margin: 2rem;
                text-align: right;
            }

            .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #eee;
            }

            .totals-row.total {
                font-size: 1.25rem;
                font-weight: bold;
                border-bottom: 2px solid #333;
                color: #333;
            }

            .payment-status {
                margin: 2rem;
                text-align: center;
            }

            .paid-stamp {
                background: #d4edda;
                color: #155724;
                padding: 1rem;
                border-radius: 8px;
                border: 2px solid #c3e6cb;
            }

            .pending-stamp {
                background: #fff3cd;
                color: #856404;
                padding: 1rem;
                border-radius: 8px;
                border: 2px solid #ffeaa7;
            }

            .invoice-footer {
                margin: 2rem;
                text-align: center;
                font-size: 0.875rem;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 1rem;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Crear instancia global
window.invoiceViewer = new InvoiceViewer();

// Funciones globales
window.showInvoiceHistory = function() {
    window.invoiceViewer.showInvoiceHistory();
};

window.viewInvoice = function(invoiceId) {
    window.invoiceViewer.viewInvoice(invoiceId);
};

console.log('🧾 Visualizador de facturas cargado');