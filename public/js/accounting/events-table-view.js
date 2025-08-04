// ===================================
// EDUCONTA - Vista de Tabla de Eventos (Estilo Hoja de Cálculo)
// ===================================

console.log('🚀 Cargando vista de tabla de eventos...');

class EventsTableView {
    constructor() {
        console.log('📝 Inicializando EventsTableView...');

        this.events = [];
        this.selectedEvent = null;
        this.participants = [];
        this.filteredParticipants = [];

        this.eventTypes = [
            { id: 'raffle', name: 'Rifa', icon: '🎟️' },
            { id: 'bingo', name: 'Bingo', icon: '🎱' },
            { id: 'graduation', name: 'Derecho a Grado', icon: '🎓' },
            { id: 'fundraising', name: 'Recaudación de Fondos', icon: '💰' },
            { id: 'cultural', name: 'Evento Cultural', icon: '🎭' },
            { id: 'sports', name: 'Evento Deportivo', icon: '⚽' },
            { id: 'academic', name: 'Evento Académico', icon: '📚' },
            { id: 'other', name: 'Otro', icon: '📅' }
        ];

        this.eventStatuses = [
            { id: 'planning', name: 'En Planificación', color: '#ffc107', class: 'planning' },
            { id: 'active', name: 'Activo', color: '#28a745', class: 'active' },
            { id: 'completed', name: 'Completado', color: '#6c757d', class: 'completed' },
            { id: 'cancelled', name: 'Cancelado', color: '#dc3545', class: 'cancelled' }
        ];

        this.init();
    }

    async init() {
        console.log('🔧 Inicializando sistema...');

        try {
            this.setupEventListeners();
            await this.loadEvents();
            this.renderEventsTable();
            this.updateStats();
            console.log('✅ Sistema inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando:', error);
            this.showNotification('Error al inicializar la página de eventos', 'error');
        }
    }

    setupEventListeners() {
        console.log('🎯 Configurando event listeners...');

        // Botones nuevo evento (hay dos en la página)
        const newEventBtnHeader = document.getElementById('newEventBtnHeader');
        if (newEventBtnHeader) {
            newEventBtnHeader.addEventListener('click', () => this.showEventModal());
        }

        const newEventBtn = document.getElementById('newEventBtn');
        if (newEventBtn) {
            newEventBtn.addEventListener('click', () => this.showEventModal());
        }

        // Filtros de eventos principales
        const eventSearch = document.getElementById('eventSearch');
        if (eventSearch) {
            eventSearch.addEventListener('input', (e) => this.filterEvents());
        }

        const eventTypeFilter = document.getElementById('eventTypeFilter');
        if (eventTypeFilter) {
            eventTypeFilter.addEventListener('change', () => this.filterEvents());
        }

        const eventStatusFilter = document.getElementById('eventStatusFilter');
        if (eventStatusFilter) {
            eventStatusFilter.addEventListener('change', () => this.filterEvents());
        }
    }

    async loadEvents() {
        console.log('📊 Cargando eventos desde el backend...');

        try {
            const institutionId = this.getInstitutionId();
            const response = await fetch(`/api/events/${institutionId}`);
            const data = await response.json();

            if (data.success) {
                this.events = data.events || [];
                console.log(`✅ Cargados ${this.events.length} eventos desde el backend`);
            } else {
                console.warn('⚠️ No se pudieron cargar eventos del backend, usando datos de demostración');
                this.events = this.getDemoEvents();
            }
        } catch (error) {
            console.error('❌ Error cargando eventos del backend:', error);
            console.log('📊 Usando eventos de demostración...');
            this.events = this.getDemoEvents();
        }

        this.filteredEvents = [...this.events];
    }

    getInstitutionId() {
        // Obtener de localStorage o URL params
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('institutionId') || localStorage.getItem('institutionId') || '1';
    }

    getDemoEvents() {
        // Retornar array vacío - los eventos se cargarán desde la API
        return [];
    }

    renderEventsTable() {
        console.log('🎨 Renderizando tabla de eventos...');

        const tbody = document.getElementById('eventsTableBody');
        if (!tbody) {
            console.warn('⚠️ Tabla de eventos no encontrada');
            return;
        }

        if (this.filteredEvents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                        <p class="text-muted mb-0">No hay eventos que coincidan con los filtros</p>
                    </td>
                </tr>
            `;
            return;
        }

        const eventsHTML = this.filteredEvents.map(event => this.renderEventRow(event)).join('');
        tbody.innerHTML = eventsHTML;
    }

    renderEventRow(event) {
        const eventType = this.eventTypes.find(t => t.id === (event.tipo || event.type));
        const eventStatus = this.eventStatuses.find(s => s.id === (event.estado || event.status));
        const progress = event.metaRecaudacion > 0 ? ((event.montoRecaudado || 0) / event.metaRecaudacion) * 100 : 0;

        return `
            <tr class="event-row ${eventStatus?.class || ''}" onclick="eventsPage.selectEvent(${event.id})" data-event-id="${event.id}">
                <td>
                    <div class="d-flex align-items-center">
                        <span class="me-2">${eventType?.icon || '📅'}</span>
                        <div>
                            <div class="fw-semibold">${event.nombre || event.name}</div>
                            <small class="text-muted">${eventType?.name || 'Desconocido'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-${this.getStatusColor(event.estado || event.status)}">${eventStatus?.name || 'Desconocido'}</span>
                </td>
                <td>
                    <small>${this.formatDate(event.fechaInicio || event.startDate)} - ${this.formatDate(event.fechaFin || event.endDate)}</small>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="me-2">${event.stats?.totalParticipants || 0}</span>
                        <div class="progress flex-grow-1" style="height: 4px;">
                            <div class="progress-bar bg-info" style="width: ${Math.min(100, ((event.stats?.paidParticipants || 0) / (event.stats?.totalParticipants || 1)) * 100)}%"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        <div class="fw-semibold text-success">${this.formatCurrency(event.montoRecaudado || 0)}</div>
                        <small class="text-muted">de ${this.formatCurrency(event.metaRecaudacion || 0)}</small>
                    </div>
                    <div class="progress mt-1" style="height: 4px;">
                        <div class="progress-bar bg-success" style="width: ${Math.min(100, progress)}%"></div>
                    </div>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="event.stopPropagation(); eventsPage.viewEvent(${event.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="event.stopPropagation(); eventsPage.editEvent(${event.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="event.stopPropagation(); eventsPage.showParticipantsModal(${event.id})" title="Ver participantes">
                            <i class="fas fa-users"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getStatusColor(status) {
        const colors = {
            'planning': 'warning',
            'active': 'success',
            'completed': 'info',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    selectEvent(eventId) {
        console.log(`🎯 Seleccionando evento ${eventId}`);

        // Remover selección anterior
        document.querySelectorAll('.event-row').forEach(row => {
            row.classList.remove('selected');
        });

        // Agregar selección actual
        const row = document.querySelector(`[data-event-id="${eventId}"]`);
        if (row) {
            row.classList.add('selected');
        }

        this.selectedEvent = this.events.find(e => e.id === eventId);

        // Mostrar modal de participantes directamente
        this.showParticipantsModal(eventId);
    }

    showEventDetails() {
        // Implementar vista de detalles del evento
        console.log('📋 Mostrando detalles del evento:', this.selectedEvent);
    }

    async showParticipantsModal(eventId) {
        console.log('🎯 Mostrando modal de participantes para evento:', eventId);

        const event = this.events.find(e => e.id === eventId);

        if (!event) {
            console.error('❌ Evento no encontrado:', eventId);
            this.showNotification('Evento no encontrado', 'error');
            return;
        }

        // Actualizar título del modal
        const eventNameElement = document.getElementById('participantsEventName');
        if (eventNameElement) {
            eventNameElement.textContent = event.nombre || event.name;
        }

        // Mostrar modal
        const modalElement = document.getElementById('participantsModal');
        if (!modalElement) {
            console.error('❌ Modal de participantes no encontrado');
            this.showNotification('Error: Modal de participantes no encontrado', 'error');
            return;
        }

        // Limpiar modal existente
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            existingModal.dispose();
        }

        const modal = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
        });

        modal.show();

        // Cargar participantes
        await this.loadEventParticipants(eventId);
    }

    async loadEventParticipants(eventId) {
        console.log('📊 Cargando participantes del evento:', eventId);

        try {
            const institutionId = this.getInstitutionId();
            const response = await fetch(`/api/events/${eventId}/participants`);
            const data = await response.json();

            if (data.success) {
                this.participants = data.participants || [];
                console.log(`✅ Cargados ${this.participants.length} participantes desde el backend`);
            } else {
                console.warn('⚠️ No se pudieron cargar participantes del backend, usando datos de demostración');
                this.participants = this.generateDemoParticipants(eventId);
            }
        } catch (error) {
            console.error('❌ Error cargando participantes del backend:', error);
            console.log('📊 Usando participantes de demostración...');
            this.participants = this.generateDemoParticipants(eventId);
        }

        this.renderParticipantsList();
        this.updateParticipantsStats();
    }

    generateDemoParticipants(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return [];

        const nombres = ['Ana', 'Carlos', 'María', 'José', 'Laura', 'Diego', 'Sofía', 'Miguel', 'Valentina', 'Andrés'];
        const apellidos = ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Torres'];
        const grados = ['6', '7', '8', '9', '10', '11'];
        const cursos = ['A', 'B', 'C'];
        const estados = ['paid', 'partial', 'pending'];

        const participants = [];
        const numParticipants = event.stats?.totalParticipants || 50;

        for (let i = 1; i <= numParticipants; i++) {
            const nombre = nombres[Math.floor(Math.random() * nombres.length)];
            const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
            const grado = grados[Math.floor(Math.random() * grados.length)];
            const curso = cursos[Math.floor(Math.random() * cursos.length)];
            const estado = estados[Math.floor(Math.random() * estados.length)];

            let montoEsperado = 50000; // Valor por defecto
            if (event.tipo === 'raffle' || event.type === 'raffle') {
                montoEsperado = event.precioBoletaRifa || event.ticketPrice || 10000;
            } else if (event.tipo === 'bingo' || event.type === 'bingo') {
                montoEsperado = event.precioCartonBingo || event.cardPrice || 5000;
            } else if (event.tipo === 'graduation' || event.type === 'graduation') {
                montoEsperado = event.valorDerecho || event.feeAmount || 200000;
            }

            let montoPagado = 0;
            if (estado === 'paid') {
                montoPagado = montoEsperado;
            } else if (estado === 'partial') {
                montoPagado = Math.floor(montoEsperado * (0.3 + Math.random() * 0.4));
            }

            participants.push({
                id: i,
                eventId: eventId,
                studentId: i,
                student: {
                    id: i,
                    nombre: nombre,
                    apellido: apellido,
                    codigo: `EST${String(i).padStart(3, '0')}`,
                    grado: grado,
                    curso: curso
                },
                estado: estado,
                montoEsperado: montoEsperado,
                montoPagado: montoPagado,
                fechaPago: estado === 'paid' ? new Date().toISOString().split('T')[0] : null,
                createdAt: new Date().toISOString()
            });
        }

        return participants;
    }

    renderParticipantsList() {
        console.log('🎨 Renderizando lista de participantes...');

        const tbody = document.getElementById('participantsTableBody');
        if (!tbody) {
            console.warn('⚠️ Tabla de participantes no encontrada');
            return;
        }

        if (!this.participants || this.participants.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="fas fa-users-slash fa-2x text-muted mb-2"></i>
                        <p class="text-muted mb-0">No hay participantes registrados en este evento</p>
                    </td>
                </tr>
            `;
            return;
        }

        const participantsHTML = this.participants.map(participant => this.renderParticipantRow(participant)).join('');
        tbody.innerHTML = participantsHTML;
    }

    renderParticipantRow(participant) {
        const student = participant.student;
        const statusClass = this.getParticipantStatusClass(participant.estado);
        const statusText = this.getParticipantStatusText(participant.estado);

        return `
            <tr class="participant-row" data-participant-id="${participant.id}">
                <td>
                    <div>
                        <div class="fw-semibold">${student.nombre} ${student.apellido}</div>
                        <small class="text-muted">${student.codigo}</small>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${student.grado}° ${student.curso}</span>
                </td>
                <td>
                    <span class="badge bg-${statusClass}">${statusText}</span>
                </td>
                <td>
                    <span class="fw-semibold">${this.formatCurrency(participant.montoEsperado)}</span>
                </td>
                <td>
                    <span class="fw-semibold text-success">${this.formatCurrency(participant.montoPagado)}</span>
                    ${participant.montoPagado < participant.montoEsperado ?
                `<br><small class="text-danger">Falta: ${this.formatCurrency(participant.montoEsperado - participant.montoPagado)}</small>` :
                ''}
                </td>
                <td>
                    ${participant.fechaPago ?
                `<small>${this.formatDate(participant.fechaPago)}</small>` :
                '<small class="text-muted">Sin pago</small>'}
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-success" 
                                onclick="eventsPage.showPaymentModal && eventsPage.showPaymentModal(${participant.eventId}, ${participant.studentId})"
                                title="Registrar pago"
                                ${participant.estado === 'paid' ? 'disabled' : ''}>
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                        <button class="btn btn-outline-primary" 
                                title="Ver historial">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-outline-danger" 
                                title="Remover del evento">
                            <i class="fas fa-user-minus"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getParticipantStatusClass(status) {
        const classes = {
            'paid': 'success',
            'partial': 'warning',
            'pending': 'danger'
        };
        return classes[status] || 'secondary';
    }

    getParticipantStatusText(status) {
        const texts = {
            'paid': 'Pagado',
            'partial': 'Parcial',
            'pending': 'Pendiente'
        };
        return texts[status] || 'Desconocido';
    }

    updateParticipantsStats() {
        if (!this.participants) return;

        const total = this.participants.length;
        const paid = this.participants.filter(p => p.estado === 'paid').length;
        const partial = this.participants.filter(p => p.estado === 'partial').length;
        const pending = this.participants.filter(p => p.estado === 'pending').length;

        // Actualizar elementos del DOM
        const totalEl = document.getElementById('totalParticipants');
        if (totalEl) totalEl.textContent = total;

        const paidEl = document.getElementById('paidParticipants');
        if (paidEl) paidEl.textContent = paid;

        const partialEl = document.getElementById('partialParticipants');
        if (partialEl) partialEl.textContent = partial;

        const pendingEl = document.getElementById('pendingParticipants');
        if (pendingEl) pendingEl.textContent = pending;
    }

    filterEvents() {
        console.log('🔍 Filtrando eventos...');

        const searchTerm = document.getElementById('eventSearch')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('eventTypeFilter')?.value || '';
        const statusFilter = document.getElementById('eventStatusFilter')?.value || '';

        this.filteredEvents = this.events.filter(event => {
            const matchesSearch = !searchTerm ||
                (event.nombre || event.name || '').toLowerCase().includes(searchTerm) ||
                (event.descripcion || event.description || '').toLowerCase().includes(searchTerm);

            const matchesType = !typeFilter || (event.tipo || event.type) === typeFilter;
            const matchesStatus = !statusFilter || (event.estado || event.status) === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });

        this.renderEventsTable();
        this.updateStats();
    }

    updateStats() {
        const totalEvents = this.events.length;
        const activeEvents = this.events.filter(e => (e.estado || e.status) === 'active').length;
        const totalRaised = this.events.reduce((sum, e) => sum + (e.montoRecaudado || 0), 0);
        const totalTarget = this.events.reduce((sum, e) => sum + (e.metaRecaudacion || 0), 0);

        // Actualizar elementos del DOM si existen
        const totalEventsEl = document.getElementById('totalEvents');
        if (totalEventsEl) totalEventsEl.textContent = totalEvents;

        const activeEventsEl = document.getElementById('activeEvents');
        if (activeEventsEl) activeEventsEl.textContent = activeEvents;

        const totalRaisedEl = document.getElementById('totalRaised');
        if (totalRaisedEl) totalRaisedEl.textContent = this.formatCurrency(totalRaised);

        const totalTargetEl = document.getElementById('totalTarget');
        if (totalTargetEl) totalTargetEl.textContent = this.formatCurrency(totalTarget);
    }

    showEventModal(eventId = null) {
        console.log('📝 Mostrando modal de evento...', { eventId });

        this.currentEvent = eventId ? this.events.find(e => e.id === eventId) : null;

        const modalElement = document.getElementById('eventModal');
        const modalTitle = document.getElementById('eventModalTitle');

        console.log('🔍 Elementos encontrados:', {
            modalElement: !!modalElement,
            modalTitle: !!modalTitle
        });

        if (!modalElement) {
            console.error('❌ Modal eventModal no encontrado');
            this.showNotification('Error: Modal no encontrado', 'error');
            return;
        }

        if (modalTitle) {
            modalTitle.textContent = this.currentEvent ? 'Editar Evento' : 'Nuevo Evento';
        }

        // Limpiar formulario
        this.resetEventForm();

        // Si estamos editando, poblar el formulario
        if (this.currentEvent) {
            this.populateEventForm(this.currentEvent);
        }

        // Mostrar modal con método simplificado y robusto
        try {
            console.log('🔧 Mostrando modal con método simplificado...');

            // Método 1: Intentar con Bootstrap normal
            try {
                const modal = new bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });

                modal.show();
                console.log('✅ Modal mostrado con Bootstrap normal');
                return;

            } catch (bootstrapError) {
                console.warn('⚠️ Bootstrap normal falló, intentando método alternativo:', bootstrapError);
            }

            // Método 2: Mostrar modal manualmente
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
            modalElement.setAttribute('aria-modal', 'true');
            modalElement.removeAttribute('aria-hidden');

            // Agregar backdrop simple
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.style.zIndex = '1040';
            document.body.appendChild(backdrop);

            // Agregar clase al body
            document.body.classList.add('modal-open');

            // Manejar cierre con Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Manejar cierre con backdrop
            backdrop.addEventListener('click', () => {
                this.closeModal();
            });

            // Manejar botón de cerrar
            const closeBtn = modalElement.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal();
                }, { once: true });
            }

            console.log('✅ Modal mostrado manualmente');

        } catch (error) {
            console.error('❌ Error mostrando modal:', error);
            this.showNotification('Error al mostrar el modal: ' + error.message, 'error');
        }
    }

    resetEventForm() {
        console.log('🧹 Limpiando formulario de evento...');

        const form = document.getElementById('eventForm');
        if (form) {
            form.reset();
            console.log('✅ Formulario reseteado');
        } else {
            console.warn('⚠️ Formulario eventForm no encontrado');
        }

        this.currentEvent = null;

        // Ocultar secciones específicas si existen
        try {
            this.hideAllAssignmentSections();
        } catch (e) {
            console.log('⚠️ hideAllAssignmentSections no disponible');
        }

        try {
            this.hideAllEventTypeFields();
        } catch (e) {
            console.log('⚠️ hideAllEventTypeFields no disponible');
        }
    }

    hideAllAssignmentSections() {
        const sections = ['gradesSelection', 'coursesSelection', 'customSelection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
    }

    hideAllEventTypeFields() {
        const fields = ['raffleFields', 'bingoFields', 'graduationFields'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.style.display = 'none';
            }
        });
    }

    closeModal() {
        console.log('🔒 Cerrando modal...');

        const modalElement = document.getElementById('eventModal');
        if (modalElement) {
            // Ocultar modal
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');

            // Remover backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }

            // Restaurar body
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

            console.log('✅ Modal cerrado correctamente');
        }
    }

    populateEventForm(event) {
        // Implementar población del formulario
        console.log('📝 Poblando formulario con:', event);
    }

    viewEvent(eventId) {
        console.log(`👁️ Ver evento ${eventId}`);
        this.selectEvent(eventId);
    }

    editEvent(eventId) {
        console.log(`✏️ Editar evento ${eventId}`);
        this.showEventModal(eventId);
    }

    registerPayment(eventId) {
        console.log(`💰 Registrar pago para evento ${eventId}`);
        this.showNotification('Función de registro de pago en desarrollo', 'info');
    }

    showNotification(message, type = 'info') {
        console.log(`🔔 Notificación (${type}): ${message}`);

        // Crear notificación visual
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    console.log('📄 DOM listo, inicializando EventsTableView...');

    try {
        window.eventsPage = new EventsTableView();
        console.log('✅ EventsTableView inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando EventsTableView:', error);
    }
});

console.log('📦 Archivo events-table-view.js cargado completamente');