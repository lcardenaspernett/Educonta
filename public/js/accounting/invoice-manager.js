// ===================================
// EDUCONTA - Gestor de Facturas
// ===================================

/**
 * Gestor para el historial y manejo de facturas generadas
 */
class InvoiceManager {
    constructor() {
        this.invoices = this.loadInvoicesFromStorage();
        this.init();
    }
    
    init() {
        console.log('🧾 Inicializando gestor de facturas');
        this.setupInvoiceHistoryButton();
    }
    
    setupInvoiceHistoryButton() {
        // Esperar a que el DOM esté listo
        setTimeout(() => {
            const headerActions = document.querySelector('.header-actions');
            if (headerActions && !document.getElementById('invoiceHistoryBtn')) {
                const button = document.createElement('button');
                button.id = 'invoiceHistoryBtn';
                button.className = 'btn btn-outline';
                button.innerHTML = `
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                    </svg>
                    Facturas (${this.invoices.length})
                `;
                button.onclick = () => this.showInvoiceHistory();
                
                headerActions.insertBefore(button, headerActions.firstChild);
                console.log('✅ Botón de historial de facturas agregado');
            }
        }, 2000);
    }
    
    /**
     * Guardar factura en el historial
     */
    saveInvoice(invoiceData, pdfInfo, transactionId = null) {
        const invoice = {
            id: Date.now().toString(),
            ...invoiceData,
            pdfFileName: pdfInfo.fileName,
            pdfUrl: pdfInfo.url,
            transactionId: transactionId, // Asociar con la transacción
            createdAt: new Date().toISOString(),
            status: 'generated'
        };
        
        this.invoices.unshift(invoice);
        this.saveInvoicesToStorage();
        this.updateInvoiceHistoryButton();
        
        console.log('💾 Factura guardada en historial:', invoice);
        return invoice;
    }
    
    /**
     * Mostrar historial de facturas
     */
    showInvoiceHistory() {
        const modal = this.createInvoiceHistoryModal();
        document.body.appendChild(modal);
    }
    
    createInvoiceHistoryModal() {
        const modal = document.createElement('div');
        modal.className = 'invoice-history-modal';
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
            <div class="invoice-history-content" style="
                background: var(--bg-card);
                border-radius: 16px;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div class="invoice-history-header" style="
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--primary);
                    color: white;
                ">
                    <h2 style="margin: 0; font-size: 1.25rem;">📄 Historial de Facturas</h2>
                    <button onclick="this.closest('.invoice-history-modal').remove()" style="
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
                    ">×</button>
                </div>
                <div class="invoice-history-body" style="
                    padding: 1.5rem;
                    max-height: 60vh;
                    overflow-y: auto;
                ">
                    ${this.renderInvoiceList()}
                </div>
            </div>
        `;
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }
    
    renderInvoiceList() {
        if (this.invoices.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                    <h3>No hay facturas generadas</h3>
                    <p>Las facturas que generes aparecerán aquí</p>
                </div>
            `;
        }
        
        return `
            <div class="invoice-grid" style="display: grid; gap: 1rem;">
                ${this.invoices.map(invoice => this.renderInvoiceCard(invoice)).join('')}
            </div>
        `;
    }
    
    renderInvoiceCard(invoice) {
        const date = new Date(invoice.createdAt).toLocaleDateString('es-CO');
        const time = new Date(invoice.createdAt).toLocaleTimeString('es-CO');
        
        return `
            <div class="invoice-card" style="
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 1rem;
                background: var(--bg-secondary);
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                    <div>
                        <h4 style="margin: 0; color: var(--primary); font-size: 1rem;">
                            ${invoice.invoiceNumber || 'Sin número'}
                        </h4>
                        <p style="margin: 0.25rem 0; font-size: 0.875rem; color: var(--text-light);">
                            ${date} a las ${time}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.125rem; font-weight: 600; color: var(--success);">
                            ${this.formatCurrency(invoice.amount || 0)}
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 0.75rem;">
                    <p style="margin: 0; font-size: 0.875rem;">
                        <strong>Cliente:</strong> ${invoice.student?.name || 'No especificado'}
                    </p>
                    <p style="margin: 0; font-size: 0.875rem;">
                        <strong>Concepto:</strong> ${invoice.concept || 'Servicio educativo'}
                    </p>
                </div>
                
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button onclick="window.open('${invoice.pdfUrl}', '_blank')" style="
                        background: var(--primary);
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.75rem;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                    ">
                        👁️ Ver PDF
                    </button>
                    <button onclick="invoiceManager.downloadInvoice('${invoice.id}')" style="
                        background: var(--secondary);
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.75rem;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                    ">
                        💾 Descargar
                    </button>
                    <button onclick="invoiceManager.deleteInvoice('${invoice.id}')" style="
                        background: var(--error);
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.75rem;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                    ">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Descargar factura específica
     */
    downloadInvoice(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (invoice && invoice.pdfUrl) {
            // Crear enlace temporal para descarga
            const link = document.createElement('a');
            link.href = invoice.pdfUrl;
            link.download = invoice.pdfFileName || `Factura_${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('💾 Descargando factura:', invoice.pdfFileName);
        }
    }
    
    /**
     * Eliminar factura del historial
     */
    deleteInvoice(invoiceId) {
        if (confirm('¿Estás seguro de eliminar esta factura del historial?')) {
            this.invoices = this.invoices.filter(inv => inv.id !== invoiceId);
            this.saveInvoicesToStorage();
            this.updateInvoiceHistoryButton();
            
            // Actualizar modal si está abierto
            const modal = document.querySelector('.invoice-history-modal');
            if (modal) {
                const body = modal.querySelector('.invoice-history-body');
                body.innerHTML = this.renderInvoiceList();
            }
            
            console.log('🗑️ Factura eliminada del historial');
        }
    }
    
    /**
     * Actualizar botón del historial
     */
    updateInvoiceHistoryButton() {
        const button = document.getElementById('invoiceHistoryBtn');
        if (button) {
            button.innerHTML = `
                <svg width="20" height="20" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                </svg>
                Facturas (${this.invoices.length})
            `;
        }
    }
    
    /**
     * Guardar facturas en localStorage
     */
    saveInvoicesToStorage() {
        try {
            localStorage.setItem('educonta-invoices', JSON.stringify(this.invoices));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el historial de facturas:', error);
        }
    }
    
    /**
     * Cargar facturas desde localStorage
     */
    loadInvoicesFromStorage() {
        try {
            const stored = localStorage.getItem('educonta-invoices');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el historial de facturas:', error);
            return [];
        }
    }
    
    /**
     * Formatear moneda
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    /**
     * Ver factura específica
     */
    viewInvoice(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            console.error('❌ Factura no encontrada:', invoiceId);
            return;
        }

        console.log('👁️ Abriendo factura:', invoice.pdfFileName);
        
        // Abrir PDF en nueva ventana
        if (invoice.pdfUrl) {
            window.open(invoice.pdfUrl, '_blank');
        } else {
            console.error('❌ URL del PDF no disponible para la factura:', invoiceId);
            alert('Error: El archivo PDF de esta factura no está disponible.');
        }
    }
}

// Crear instancia global
window.invoiceManager = new InvoiceManager();

// Exportar para uso en módulos
window.InvoiceManager = InvoiceManager;