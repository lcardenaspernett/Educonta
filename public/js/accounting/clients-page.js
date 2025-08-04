// ===================================
// EDUCONTA - Página de Gestión de Clientes
// ===================================

/**
 * Controlador para la página dedicada de gestión de clientes
 */
class ClientsManagementPage {
    constructor() {
        this.clients = [];
        this.filteredClients = [];
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        
        this.init();
    }

    init() {
        console.log('👥 Inicializando página de gestión de clientes');
        this.loadData();
        this.setupEventListeners();
        this.setupSearch();
    }

    async loadData() {
        try {
            console.log('🔄 Cargando datos de clientes...');
            
            // Esperar un poco para asegurar que null esté disponible
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Intentar cargar desde null primero
            if (null && typeof null.getClients === 'function') {
                console.log('📊 Cargando desde null...');
                try {
                    const clientsResponse = await null.getClients();
                    this.clients = clientsResponse.data || [];
                    console.log('✅ Clientes cargados desde null:', this.clients.length);
                } catch (demoError) {
                    console.error('❌ Error en null.getClients:', demoError);
                    this.clients = this.generateSampleClients();
                    console.log('⚠️ Usando datos de ejemplo por error en null');
                }
            } else {
                console.log('⚠️ null no disponible, usando datos de ejemplo...');
                this.clients = this.generateSampleClients();
                console.log('✅ Clientes generados:', this.clients.length);
            }
            
            this.filteredClients = [...this.clients];
            
            // Asegurar que los elementos DOM existan antes de renderizar
            if (document.getElementById('clientsTableBody')) {
                this.renderClients();
                this.updateStats();
                console.log('✅ Datos de clientes renderizados exitosamente');
            } else {
                console.log('⚠️ Elementos DOM no encontrados, reintentando...');
                setTimeout(() => {
                    if (document.getElementById('clientsTableBody')) {
                        this.renderClients();
                        this.updateStats();
                        console.log('✅ Datos de clientes renderizados en segundo intento');
                    }
                }, 500);
            }
            
        } catch (error) {
            console.error('❌ Error cargando clientes:', error);
            
            // Fallback a datos de ejemplo
            console.log('🔄 Usando datos de ejemplo como fallback...');
            this.clients = this.generateSampleClients();
            this.filteredClients = [...this.clients];
            
            this.renderClients();
            this.updateStats();
            
            showAlert('Usando datos de ejemplo (error en carga principal)', 'warning');
        }
    }

    generateSampleClients() {
        return [
            {
                id: '1',
                name: 'Juan Pérez García',
                email: 'juan.perez@email.com',
                phone: '+57 300 123 4567',
                document: '12345678',
                documentType: 'CC',
                address: 'Calle 123 #45-67, Bogotá',
                city: 'Bogotá',
                status: 'ACTIVE',
                totalInvoices: 15,
                totalAmount: 2500000,
                lastInvoice: new Date('2025-07-20').toISOString(),
                createdAt: new Date('2024-01-15').toISOString(),
                category: 'REGULAR'
            },
            {
                id: '2',
                name: 'María González López',
                email: 'maria.gonzalez@email.com',
                phone: '+57 301 234 5678',
                document: '23456789',
                documentType: 'CC',
                address: 'Carrera 45 #12-34, Medellín',
                city: 'Medellín',
                status: 'ACTIVE',
                totalInvoices: 8,
                totalAmount: 1200000,
                lastInvoice: new Date('2025-07-25').toISOString(),
                createdAt: new Date('2024-03-10').toISOString(),
                category: 'PREMIUM'
            },
            {
                id: '3',
                name: 'Carlos Rodríguez Martín',
                email: 'carlos.rodriguez@email.com',
                phone: '+57 302 345 6789',
                document: '34567890',
                documentType: 'CC',
                address: 'Avenida 80 #23-45, Cali',
                city: 'Cali',
                status: 'INACTIVE',
                totalInvoices: 3,
                totalAmount: 450000,
                lastInvoice: new Date('2025-05-15').toISOString(),
                createdAt: new Date('2024-06-20').toISOString(),
                category: 'BASIC'
            },
            {
                id: '4',
                name: 'Ana Sofía Herrera',
                email: 'ana.herrera@email.com',
                phone: '+57 303 456 7890',
                document: '45678901',
                documentType: 'CC',
                address: 'Calle 72 #11-25, Barranquilla',
                city: 'Barranquilla',
                status: 'ACTIVE',
                totalInvoices: 22,
                totalAmount: 3800000,
                lastInvoice: new Date('2025-07-28').toISOString(),
                createdAt: new Date('2023-11-05').toISOString(),
                category: 'VIP'
            },
            {
                id: '5',
                name: 'Luis Fernando Castro',
                email: 'luis.castro@email.com',
                phone: '+57 304 567 8901',
                document: '56789012',
                documentType: 'CC',
                address: 'Transversal 15 #67-89, Bucaramanga',
                city: 'Bucaramanga',
                status: 'ACTIVE',
                totalInvoices: 12,
                totalAmount: 1800000,
                lastInvoice: new Date('2025-07-22').toISOString(),
                createdAt: new Date('2024-02-28').toISOString(),
                category: 'REGULAR'
            }
        ];
    }

    setupEventListeners() {
        // Configurar filtros
        const filters = ['statusFilter', 'categoryFilter', 'cityFilter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => {
                    this.filterClients();
                });
            }
        });

        // Configurar paginación
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderClients();
            });
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('clientSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchClients(e.target.value);
                }, 300);
            });
        }
    }

    searchClients(query) {
        if (!query.trim()) {
            this.filteredClients = [...this.clients];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredClients = this.clients.filter(client => 
                client.name.toLowerCase().includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm) ||
                client.document.includes(searchTerm) ||
                client.phone.includes(searchTerm)
            );
        }
        
        this.currentPage = 1;
        this.renderClients();
        this.updateStats();
    }

    filterClients() {
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const cityFilter = document.getElementById('cityFilter')?.value || '';

        this.filteredClients = this.clients.filter(client => {
            const matchesStatus = !statusFilter || client.status === statusFilter;
            const matchesCategory = !categoryFilter || client.category === categoryFilter;
            const matchesCity = !cityFilter || client.city === cityFilter;
            
            return matchesStatus && matchesCategory && matchesCity;
        });

        this.currentPage = 1;
        this.renderClients();
        this.updateStats();
    }

    sortClients(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredClients.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            // Manejar diferentes tipos de datos
            if (column === 'totalAmount' || column === 'totalInvoices') {
                valueA = parseFloat(valueA) || 0;
                valueB = parseFloat(valueB) || 0;
            } else if (column === 'lastInvoice' || column === 'createdAt') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            } else {
                valueA = valueA?.toString().toLowerCase() || '';
                valueB = valueB?.toString().toLowerCase() || '';
            }

            if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderClients();
        this.updateSortIndicators();
    }

    updateSortIndicators() {
        // Remover indicadores existentes
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.remove();
        });

        // Agregar indicador al column actual
        const headerCell = document.querySelector(`[data-sort="${this.sortColumn}"]`);
        if (headerCell) {
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.textContent = this.sortDirection === 'asc' ? ' ↑' : ' ↓';
            headerCell.appendChild(indicator);
        }
    }

    renderClients() {
        const tbody = document.getElementById('clientsTableBody');
        if (!tbody) return;

        // Calcular paginación
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedClients = this.filteredClients.slice(startIndex, endIndex);

        if (paginatedClients.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="8">
                        <div class="empty-state">
                            <svg width="48" height="48" fill="currentColor" class="empty-icon">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <h3>No hay clientes</h3>
                            <p>No se encontraron clientes con los filtros aplicados</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = paginatedClients.map(client => {
            const statusClass = client.status === 'ACTIVE' ? 'active' : 'inactive';
            const statusText = client.status === 'ACTIVE' ? 'Activo' : 'Inactivo';
            const categoryClass = client.category.toLowerCase();
            
            return `
                <tr class="client-row">
                    <td>
                        <div class="client-info">
                            <div class="client-avatar">
                                ${client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div class="client-details">
                                <strong class="client-name">${client.name}</strong>
                                <span class="client-document">${client.documentType}: ${client.document}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="contact-info">
                            <div class="email">${client.email}</div>
                            <div class="phone">${client.phone}</div>
                        </div>
                    </td>
                    <td>
                        <div class="address-info">
                            <div class="address">${client.address}</div>
                            <div class="city">${client.city}</div>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <span class="category-badge ${categoryClass}">
                            ${client.category}
                        </span>
                    </td>
                    <td class="text-center">
                        <strong>${client.totalInvoices}</strong>
                    </td>
                    <td class="text-right">
                        <strong class="amount">${formatCurrency(client.totalAmount)}</strong>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-info btn-sm" 
                                    onclick="viewClient('${client.id}')" 
                                    title="Ver detalles">
                                👁️
                            </button>
                            <button class="btn btn-warning btn-sm" 
                                    onclick="editClient('${client.id}')" 
                                    title="Editar cliente">
                                ✏️
                            </button>
                            <button class="btn btn-success btn-sm" 
                                    onclick="viewClientInvoices('${client.id}')" 
                                    title="Ver facturas">
                                📄
                            </button>
                            <button class="btn btn-danger btn-sm" 
                                    onclick="toggleClientStatus('${client.id}')" 
                                    title="${client.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}">
                                ${client.status === 'ACTIVE' ? '🚫' : '✅'}
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.renderPagination();
    }

    renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="clientsPage.changePage(${this.currentPage - 1})"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                ‹ Anterior
            </button>
        `;

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="clientsPage.changePage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="clientsPage.changePage(${this.currentPage + 1})"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                Siguiente ›
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderClients();
    }

    updateStats() {
        const totalClients = this.filteredClients.length;
        const activeClients = this.filteredClients.filter(c => c.status === 'ACTIVE').length;
        const totalRevenue = this.filteredClients.reduce((sum, c) => sum + c.totalAmount, 0);
        const avgInvoices = totalClients > 0 ? 
            this.filteredClients.reduce((sum, c) => sum + c.totalInvoices, 0) / totalClients : 0;

        // Actualizar elementos del DOM
        const elements = {
            'totalClients': totalClients,
            'activeClients': activeClients,
            'totalRevenue': formatCurrency(totalRevenue),
            'avgInvoices': Math.round(avgInvoices * 10) / 10
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    clearFilters() {
        // Limpiar filtros
        document.getElementById('statusFilter').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('cityFilter').value = '';
        document.getElementById('clientSearch').value = '';
        
        // Resetear datos
        this.filteredClients = [...this.clients];
        this.currentPage = 1;
        
        this.renderClients();
        this.updateStats();
    }

    exportClients() {
        showAlert('Exportando lista de clientes...', 'info');
        
        // Simular exportación
        setTimeout(() => {
            showAlert('Lista de clientes exportada exitosamente', 'success');
        }, 2000);
    }

    showNewClientModal() {
        showAlert('Modal de nuevo cliente en desarrollo', 'info');
    }
}

// Funciones globales para interactuar con clientes
function viewClient(clientId) {
    console.log('👁️ Ver cliente:', clientId);
    
    if (!window.clientsPage) {
        showAlert('Error: Sistema no inicializado correctamente', 'error');
        return;
    }
    
    const client = window.clientsPage.clients.find(c => c.id === clientId);
    if (!client) {
        showAlert('No se encontró el cliente', 'error');
        return;
    }
    
    // Crear modal con detalles del cliente
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'clientDetailsModal';
    modal.innerHTML = `
        <div class="modal-content client-details">
            <div class="modal-header">
                <h3 class="modal-title">👁️ Detalles del Cliente</h3>
                <button class="modal-close" onclick="closeClientDetails()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="client-info-grid">
                    <div class="info-section">
                        <h4>Información Personal</h4>
                        <div class="info-item">
                            <span class="label">Nombre:</span>
                            <span class="value">${client.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Documento:</span>
                            <span class="value">${client.documentType}: ${client.document}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Email:</span>
                            <span class="value">${client.email}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Teléfono:</span>
                            <span class="value">${client.phone}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Estado:</span>
                            <span class="value ${client.status.toLowerCase()}">${client.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</span>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Información Comercial</h4>
                        <div class="info-item">
                            <span class="label">Categoría:</span>
                            <span class="value category ${client.category.toLowerCase()}">${client.category}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Total Facturas:</span>
                            <span class="value">${client.totalInvoices}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Monto Total:</span>
                            <span class="value amount">${formatCurrency(client.totalAmount)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Última Factura:</span>
                            <span class="value">${formatDate(client.lastInvoice)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Cliente desde:</span>
                            <span class="value">${formatDate(client.createdAt)}</span>
                        </div>
                    </div>
                    
                    <div class="info-section full-width">
                        <h4>Dirección</h4>
                        <div class="info-item">
                            <span class="label">Dirección:</span>
                            <span class="value">${client.address}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Ciudad:</span>
                            <span class="value">${client.city}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeClientDetails()">Cerrar</button>
                <button class="btn btn-warning" onclick="editClient('${client.id}')">
                    ✏️ Editar
                </button>
                <button class="btn btn-success" onclick="viewClientInvoices('${client.id}')">
                    📄 Ver Facturas
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function editClient(clientId) {
    console.log('✏️ Editar cliente:', clientId);
    showAlert('Modal de edición de cliente en desarrollo', 'info');
}

function viewClientInvoices(clientId) {
    console.log('📄 Ver facturas del cliente:', clientId);
    showAlert('Redirigiendo a facturas del cliente...', 'info');
}

function toggleClientStatus(clientId) {
    console.log('🔄 Cambiar estado del cliente:', clientId);
    
    if (!window.clientsPage) {
        showAlert('Error: Sistema no inicializado correctamente', 'error');
        return;
    }
    
    const client = window.clientsPage.clients.find(c => c.id === clientId);
    if (!client) {
        showAlert('No se encontró el cliente', 'error');
        return;
    }
    
    const newStatus = client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de que deseas ${action} a ${client.name}?`)) {
        client.status = newStatus;
        
        // Actualizar en filteredClients también
        const filteredClient = window.clientsPage.filteredClients.find(c => c.id === clientId);
        if (filteredClient) {
            filteredClient.status = newStatus;
        }
        
        window.clientsPage.renderClients();
        window.clientsPage.updateStats();
        
        showAlert(`Cliente ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`, 'success');
    }
}

function closeClientDetails() {
    const modal = document.getElementById('clientDetailsModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Hacer disponible globalmente
window.ClientsManagementPage = ClientsManagementPage;