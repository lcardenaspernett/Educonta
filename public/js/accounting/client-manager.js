// ===================================
// EDUCONTA - Gestor de Clientes
// ===================================

/**
 * Sistema para gestionar clientes/proveedores para facturas
 */
class ClientManager {
    constructor() {
        this.clients = this.loadClients();
        this.init();
    }

    init() {
        console.log('👥 Inicializando gestor de clientes');
        this.setupClientModal();
        this.generateSampleClients();
    }

    /**
     * Generar clientes de ejemplo
     */
    generateSampleClients() {
        if (this.clients.length > 0) return;

        const sampleClients = [
            {
                id: 'client-1',
                type: 'STUDENT', // STUDENT, SUPPLIER, OTHER
                name: 'Ana María González Pérez',
                document: '1234567890',
                documentType: 'CC',
                email: 'ana.gonzalez@email.com',
                phone: '3001234567',
                address: 'Calle 123 #45-67, Bogotá',
                grade: '10°A',
                parentName: 'Carlos González',
                parentPhone: '3009876543',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'client-2',
                type: 'STUDENT',
                name: 'Pedro Ramírez Silva',
                document: '0987654321',
                documentType: 'TI',
                email: 'pedro.ramirez@email.com',
                phone: '3002345678',
                address: 'Carrera 45 #12-34, Medellín',
                grade: '11°B',
                parentName: 'María Silva',
                parentPhone: '3008765432',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'client-3',
                type: 'SUPPLIER',
                name: 'Papelería El Estudiante Ltda.',
                document: '900123456-7',
                documentType: 'NIT',
                email: 'ventas@papelestudiante.com',
                phone: '6012345678',
                address: 'Av. Principal #67-89, Cali',
                contactPerson: 'Luis Martínez',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'client-4',
                type: 'SUPPLIER',
                name: 'Transportes Escolares S.A.S.',
                document: '800987654-3',
                documentType: 'NIT',
                email: 'info@transportesescolares.com',
                phone: '6019876543',
                address: 'Calle 89 #23-45, Barranquilla',
                contactPerson: 'Sandra López',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'client-5',
                type: 'OTHER',
                name: 'Juan Carlos Pérez',
                document: '5678901234',
                documentType: 'CC',
                email: 'juancarlos@email.com',
                phone: '3003456789',
                address: 'Transversal 12 #34-56, Bucaramanga',
                description: 'Instructor curso vacacional',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];

        this.clients = sampleClients;
        this.saveClients();
    }

    /**
     * Mostrar modal de gestión de clientes
     */
    showClientModal() {
        const modal = this.createClientModal();
        document.body.appendChild(modal);
    }

    /**
     * Crear modal de clientes
     */
    createClientModal() {
        const modal = document.createElement('div');
        modal.className = 'client-modal';
        modal.innerHTML = `
            <div class="client-modal-content">
                <div class="client-header">
                    <h2>👥 Gestión de Clientes</h2>
                    <div class="client-actions">
                        <button class="btn btn-primary" onclick="clientManager.showNewClientForm()">
                            <svg width="16" height="16" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                            Nuevo Cliente
                        </button>
                        <button class="close-btn" onclick="this.closest('.client-modal').remove()">×</button>
                    </div>
                </div>
                
                <div class="client-filters">
                    <div class="filter-group">
                        <label>Tipo:</label>
                        <select id="clientTypeFilter" onchange="clientManager.filterClients()">
                            <option value="">Todos</option>
                            <option value="STUDENT">Estudiantes</option>
                            <option value="SUPPLIER">Proveedores</option>
                            <option value="OTHER">Otros</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Buscar:</label>
                        <input type="text" id="clientSearchFilter" placeholder="Nombre, documento..." 
                               onkeyup="clientManager.filterClients()">
                    </div>
                </div>
                
                <div class="client-body">
                    <div class="clients-grid" id="clientsGrid">
                        ${this.renderClientsList()}
                    </div>
                </div>
            </div>
        `;

        this.addClientModalStyles();
        return modal;
    }

    /**
     * Renderizar lista de clientes
     */
    renderClientsList() {
        if (this.clients.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>No hay clientes registrados</h3>
                    <p>Agrega clientes para generar facturas</p>
                </div>
            `;
        }

        return this.clients.map(client => this.renderClientCard(client)).join('');
    }

    /**
     * Renderizar tarjeta de cliente
     */
    renderClientCard(client) {
        const typeConfig = {
            STUDENT: { icon: '🎓', label: 'Estudiante', color: 'var(--primary)' },
            SUPPLIER: { icon: '🏢', label: 'Proveedor', color: 'var(--secondary)' },
            OTHER: { icon: '👤', label: 'Otro', color: 'var(--info)' }
        };

        const config = typeConfig[client.type] || typeConfig.OTHER;

        return `
            <div class="client-card" data-client-id="${client.id}" data-type="${client.type}">
                <div class="client-card-header">
                    <div class="client-type" style="color: ${config.color}">
                        ${config.icon} ${config.label}
                    </div>
                    <div class="client-actions">
                        <button class="btn-icon" onclick="clientManager.editClient('${client.id}')" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-icon" onclick="clientManager.deleteClient('${client.id}')" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="client-card-body">
                    <h4 class="client-name">${client.name}</h4>
                    <div class="client-details">
                        <div class="detail-row">
                            <span class="label">${client.documentType}:</span>
                            <span class="value">${client.document}</span>
                        </div>
                        ${client.email ? `
                            <div class="detail-row">
                                <span class="label">Email:</span>
                                <span class="value">${client.email}</span>
                            </div>
                        ` : ''}
                        ${client.phone ? `
                            <div class="detail-row">
                                <span class="label">Teléfono:</span>
                                <span class="value">${client.phone}</span>
                            </div>
                        ` : ''}
                        ${client.grade ? `
                            <div class="detail-row">
                                <span class="label">Grado:</span>
                                <span class="value">${client.grade}</span>
                            </div>
                        ` : ''}
                        ${client.contactPerson ? `
                            <div class="detail-row">
                                <span class="label">Contacto:</span>
                                <span class="value">${client.contactPerson}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="client-card-footer">
                    <button class="btn btn-outline btn-small" onclick="clientManager.selectClientForInvoice('${client.id}')">
                        📄 Crear Factura
                    </button>
                    <button class="btn btn-ghost btn-small" onclick="clientManager.viewClientHistory('${client.id}')">
                        📊 Historial
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Mostrar formulario de nuevo cliente
     */
    showNewClientForm() {
        const formModal = this.createClientFormModal();
        document.body.appendChild(formModal);
    }

    /**
     * Crear modal de formulario de cliente
     */
    createClientFormModal(client = null) {
        const isEdit = client !== null;
        const modal = document.createElement('div');
        modal.className = 'client-form-modal';
        modal.innerHTML = `
            <div class="client-form-content">
                <div class="form-header">
                    <h3>${isEdit ? 'Editar' : 'Nuevo'} Cliente</h3>
                    <button class="close-btn" onclick="this.closest('.client-form-modal').remove()">×</button>
                </div>
                
                <form id="clientForm" onsubmit="clientManager.saveClient(event)">
                    ${isEdit ? `<input type="hidden" name="id" value="${client.id}">` : ''}
                    
                    <div class="form-section">
                        <h4>Información Básica</h4>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="clientType">Tipo de Cliente *</label>
                                <select name="type" id="clientType" required onchange="clientManager.toggleClientFields()">
                                    <option value="">Seleccionar...</option>
                                    <option value="STUDENT" ${client?.type === 'STUDENT' ? 'selected' : ''}>🎓 Estudiante</option>
                                    <option value="SUPPLIER" ${client?.type === 'SUPPLIER' ? 'selected' : ''}>🏢 Proveedor</option>
                                    <option value="OTHER" ${client?.type === 'OTHER' ? 'selected' : ''}>👤 Otro</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="clientName">Nombre Completo *</label>
                                <input type="text" name="name" id="clientName" required 
                                       value="${client?.name || ''}" placeholder="Nombre completo">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="documentType">Tipo Documento *</label>
                                <select name="documentType" id="documentType" required>
                                    <option value="CC" ${client?.documentType === 'CC' ? 'selected' : ''}>Cédula de Ciudadanía</option>
                                    <option value="TI" ${client?.documentType === 'TI' ? 'selected' : ''}>Tarjeta de Identidad</option>
                                    <option value="CE" ${client?.documentType === 'CE' ? 'selected' : ''}>Cédula de Extranjería</option>
                                    <option value="NIT" ${client?.documentType === 'NIT' ? 'selected' : ''}>NIT</option>
                                    <option value="PP" ${client?.documentType === 'PP' ? 'selected' : ''}>Pasaporte</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="clientDocument">Número Documento *</label>
                                <input type="text" name="document" id="clientDocument" required 
                                       value="${client?.document || ''}" placeholder="Número de documento">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Información de Contacto</h4>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="clientEmail">Email</label>
                                <input type="email" name="email" id="clientEmail" 
                                       value="${client?.email || ''}" placeholder="correo@ejemplo.com">
                            </div>
                            <div class="form-group">
                                <label for="clientPhone">Teléfono</label>
                                <input type="tel" name="phone" id="clientPhone" 
                                       value="${client?.phone || ''}" placeholder="3001234567">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="clientAddress">Dirección</label>
                                <textarea name="address" id="clientAddress" rows="2" 
                                          placeholder="Dirección completa">${client?.address || ''}</textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Campos específicos para estudiantes -->
                    <div class="form-section student-fields" style="display: none;">
                        <h4>Información Académica</h4>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="studentGrade">Grado</label>
                                <select name="grade" id="studentGrade">
                                    <option value="">Seleccionar grado...</option>
                                    <option value="Pre-Jardín" ${client?.grade === 'Pre-Jardín' ? 'selected' : ''}>Pre-Jardín</option>
                                    <option value="Jardín" ${client?.grade === 'Jardín' ? 'selected' : ''}>Jardín</option>
                                    <option value="Transición" ${client?.grade === 'Transición' ? 'selected' : ''}>Transición</option>
                                    <option value="1°" ${client?.grade === '1°' ? 'selected' : ''}>1°</option>
                                    <option value="2°" ${client?.grade === '2°' ? 'selected' : ''}>2°</option>
                                    <option value="3°" ${client?.grade === '3°' ? 'selected' : ''}>3°</option>
                                    <option value="4°" ${client?.grade === '4°' ? 'selected' : ''}>4°</option>
                                    <option value="5°" ${client?.grade === '5°' ? 'selected' : ''}>5°</option>
                                    <option value="6°" ${client?.grade === '6°' ? 'selected' : ''}>6°</option>
                                    <option value="7°" ${client?.grade === '7°' ? 'selected' : ''}>7°</option>
                                    <option value="8°" ${client?.grade === '8°' ? 'selected' : ''}>8°</option>
                                    <option value="9°" ${client?.grade === '9°' ? 'selected' : ''}>9°</option>
                                    <option value="10°" ${client?.grade === '10°' ? 'selected' : ''}>10°</option>
                                    <option value="11°" ${client?.grade === '11°' ? 'selected' : ''}>11°</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="parentName">Nombre del Acudiente</label>
                                <input type="text" name="parentName" id="parentName" 
                                       value="${client?.parentName || ''}" placeholder="Nombre del padre/madre/acudiente">
                            </div>
                            <div class="form-group">
                                <label for="parentPhone">Teléfono del Acudiente</label>
                                <input type="tel" name="parentPhone" id="parentPhone" 
                                       value="${client?.parentPhone || ''}" placeholder="3009876543">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Campos específicos para proveedores -->
                    <div class="form-section supplier-fields" style="display: none;">
                        <h4>Información Comercial</h4>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactPerson">Persona de Contacto</label>
                                <input type="text" name="contactPerson" id="contactPerson" 
                                       value="${client?.contactPerson || ''}" placeholder="Nombre del contacto">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Campos específicos para otros -->
                    <div class="form-section other-fields" style="display: none;">
                        <h4>Información Adicional</h4>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="clientDescription">Descripción</label>
                                <textarea name="description" id="clientDescription" rows="2" 
                                          placeholder="Descripción del cliente">${client?.description || ''}</textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.client-form-modal').remove()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Actualizar' : 'Guardar'} Cliente
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Mostrar campos según tipo después de crear el modal
        setTimeout(() => {
            this.toggleClientFields();
        }, 100);

        return modal;
    }

    /**
     * Mostrar/ocultar campos según tipo de cliente
     */
    toggleClientFields() {
        const clientType = document.getElementById('clientType')?.value;
        const studentFields = document.querySelector('.student-fields');
        const supplierFields = document.querySelector('.supplier-fields');
        const otherFields = document.querySelector('.other-fields');

        if (studentFields) studentFields.style.display = clientType === 'STUDENT' ? 'block' : 'none';
        if (supplierFields) supplierFields.style.display = clientType === 'SUPPLIER' ? 'block' : 'none';
        if (otherFields) otherFields.style.display = clientType === 'OTHER' ? 'block' : 'none';
    }

    /**
     * Guardar cliente
     */
    saveClient(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const clientData = Object.fromEntries(formData);
        
        const isEdit = clientData.id;
        
        if (isEdit) {
            // Actualizar cliente existente
            const index = this.clients.findIndex(c => c.id === clientData.id);
            if (index !== -1) {
                this.clients[index] = {
                    ...this.clients[index],
                    ...clientData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Crear nuevo cliente
            const newClient = {
                id: 'client-' + Date.now(),
                ...clientData,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            this.clients.push(newClient);
        }
        
        this.saveClients();
        this.updateClientsList();
        
        // Cerrar modal
        document.querySelector('.client-form-modal')?.remove();
        
        this.showNotification(
            `Cliente ${isEdit ? 'actualizado' : 'creado'} exitosamente`, 
            'success'
        );
    }

    /**
     * Editar cliente
     */
    editClient(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            const formModal = this.createClientFormModal(client);
            document.body.appendChild(formModal);
        }
    }

    /**
     * Eliminar cliente
     */
    deleteClient(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client && confirm(`¿Eliminar cliente ${client.name}?`)) {
            this.clients = this.clients.filter(c => c.id !== clientId);
            this.saveClients();
            this.updateClientsList();
            this.showNotification('Cliente eliminado', 'success');
        }
    }

    /**
     * Seleccionar cliente para factura
     */
    selectClientForInvoice(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            // Cerrar modal de clientes
            document.querySelector('.client-modal')?.remove();
            
            // Abrir formulario de factura con cliente preseleccionado
            this.openInvoiceFormWithClient(client);
        }
    }

    /**
     * Abrir formulario de factura con cliente
     */
    openInvoiceFormWithClient(client) {
        // Aquí se integraría con el sistema de facturas existente
        console.log('📄 Abriendo formulario de factura para:', client.name);
        
        // Por ahora, mostrar información
        this.showNotification(
            `Funcionalidad de facturación para ${client.name} en desarrollo`, 
            'info'
        );
    }

    /**
     * Filtrar clientes
     */
    filterClients() {
        const typeFilter = document.getElementById('clientTypeFilter')?.value || '';
        const searchFilter = document.getElementById('clientSearchFilter')?.value.toLowerCase() || '';
        
        let filteredClients = this.clients;
        
        if (typeFilter) {
            filteredClients = filteredClients.filter(c => c.type === typeFilter);
        }
        
        if (searchFilter) {
            filteredClients = filteredClients.filter(c => 
                c.name.toLowerCase().includes(searchFilter) ||
                c.document.includes(searchFilter) ||
                (c.email && c.email.toLowerCase().includes(searchFilter))
            );
        }
        
        const grid = document.getElementById('clientsGrid');
        if (grid) {
            grid.innerHTML = filteredClients.map(client => this.renderClientCard(client)).join('');
        }
    }

    /**
     * Actualizar lista de clientes
     */
    updateClientsList() {
        const grid = document.getElementById('clientsGrid');
        if (grid) {
            grid.innerHTML = this.renderClientsList();
        }
    }

    /**
     * Obtener cliente por ID
     */
    getClient(clientId) {
        return this.clients.find(c => c.id === clientId);
    }

    /**
     * Obtener clientes por tipo
     */
    getClientsByType(type) {
        return this.clients.filter(c => c.type === type);
    }

    /**
     * Configurar modal inicial
     */
    setupClientModal() {
        // Agregar botón de clientes al header si no existe
        setTimeout(() => {
            this.addClientButton();
        }, 2000);
    }

    /**
     * Agregar botón de clientes al header
     */
    addClientButton() {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions && !document.getElementById('clientsBtn')) {
            const button = document.createElement('button');
            button.id = 'clientsBtn';
            button.className = 'btn btn-outline';
            button.innerHTML = `
                <svg width="16" height="16" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Clientes (${this.clients.length})
            `;
            button.onclick = () => this.showClientModal();
            
            headerActions.insertBefore(button, headerActions.firstChild);
        }
    }

    // Persistencia
    saveClients() {
        localStorage.setItem('educonta-clients', JSON.stringify(this.clients));
    }

    loadClients() {
        try {
            const stored = localStorage.getItem('educonta-clients');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error cargando clientes:', error);
            return [];
        }
    }

    // Utilidades
    showNotification(message, type = 'info') {
        if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Agregar estilos del modal
     */
    addClientModalStyles() {
        if (document.getElementById('client-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'client-modal-styles';
        styles.textContent = `
            .client-modal, .client-form-modal {
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

            .client-modal-content, .client-form-content {
                background: var(--bg-card);
                border-radius: 16px;
                width: 90%;
                max-width: 1000px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
            }

            .client-form-content {
                max-width: 600px;
            }

            .client-header, .form-header {
                padding: 1.5rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--primary);
                color: white;
            }

            .client-header h2, .form-header h3 {
                margin: 0;
            }

            .client-actions {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .client-filters {
                padding: 1rem 1.5rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                gap: 1rem;
                align-items: center;
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
            }

            .filter-group select, .filter-group input {
                padding: 0.375rem 0.75rem;
                border: 1px solid var(--border);
                border-radius: 6px;
                background: var(--bg);
                color: var(--text);
            }

            .client-body {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
            }

            .clients-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1rem;
            }

            .client-card {
                border: 1px solid var(--border);
                border-radius: 12px;
                background: var(--bg-secondary);
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .client-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            }

            .client-card-header {
                padding: 1rem;
                background: var(--bg);
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .client-type {
                font-size: 0.875rem;
                font-weight: 600;
            }

            .client-actions {
                display: flex;
                gap: 0.25rem;
            }

            .btn-icon {
                background: none;
                border: none;
                padding: 0.25rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
                transition: background 0.2s;
            }

            .btn-icon:hover {
                background: var(--bg-hover);
            }

            .client-card-body {
                padding: 1rem;
            }

            .client-name {
                margin: 0 0 0.75rem 0;
                color: var(--text);
                font-size: 1.125rem;
            }

            .client-details {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.875rem;
            }

            .detail-row .label {
                color: var(--text-light);
                font-weight: 500;
            }

            .detail-row .value {
                color: var(--text);
                font-weight: 600;
            }

            .client-card-footer {
                padding: 1rem;
                border-top: 1px solid var(--border);
                display: flex;
                gap: 0.5rem;
            }

            /* Formulario */
            .form-section {
                margin-bottom: 1.5rem;
            }

            .form-section h4 {
                margin: 0 0 1rem 0;
                color: var(--primary);
                font-size: 1rem;
                border-bottom: 1px solid var(--border);
                padding-bottom: 0.5rem;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .form-row:last-child {
                margin-bottom: 0;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .form-group label {
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--text);
            }

            .form-group input, .form-group select, .form-group textarea {
                padding: 0.75rem;
                border: 1px solid var(--border);
                border-radius: 8px;
                background: var(--bg);
                color: var(--text);
                font-size: 0.875rem;
            }

            .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }

            .form-actions {
                padding: 1.5rem;
                border-top: 1px solid var(--border);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
            }

            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .clients-grid {
                    grid-template-columns: 1fr;
                }
                
                .client-filters {
                    flex-direction: column;
                    align-items: stretch;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.clientManager = new ClientManager();
    }, 2000);
});

console.log('👥 Sistema de gestión de clientes cargado');