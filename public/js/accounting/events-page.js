// ===================================
// EDUCONTA - Sistema de Gestión de Eventos
// ===================================

/**
 * Controlador para la gestión completa de eventos (rifas, bingos, derecho a grado, etc.)
 */
class EventsManagementPage {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentEvent = null;
        this.currentEventId = null;
        this.currentParticipants = [];
        this.currentTransactionEventId = null;

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
            { id: 'planning', name: 'En Planificación', color: '#ffc107' },
            { id: 'active', name: 'Activo', color: '#28a745' },
            { id: 'completed', name: 'Completado', color: '#6c757d' },
            { id: 'cancelled', name: 'Cancelado', color: '#dc3545' }
        ];

        this.init();
    }

    async init() {
        try {
            this.cleanupModals();
            this.setupEventListeners();
            await this.loadEvents();
            this.renderEventsList();
            this.updateStats();
        } catch (error) {
            console.error('Error initializing events page:', error);
            this.showNotification('Error al inicializar la página de eventos', 'error');
        }
    }

    cleanupModals() {
        const modalIds = ['eventModal', 'eventDetailsModal', 'transactionModal', 'participantsModal'];
        modalIds.forEach(modalId => {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const existingModal = bootstrap.Modal.getInstance(modalElement);
                if (existingModal) {
                    existingModal.dispose();
                }
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');
                modalElement.removeAttribute('role');
            }
        });

        // Limpiar todos los backdrops residuales
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Restaurar el estado del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        // Limpiar cualquier overlay residual
        const overlays = document.querySelectorAll('.modal-backdrop, .fade.show');
        overlays.forEach(overlay => {
            if (overlay.classList.contains('modal-backdrop')) {
                overlay.remove();
            }
        });
    }

    setupEventListeners() {
        const newEventBtn = document.getElementById('newEventBtn');
        if (newEventBtn) {
            newEventBtn.addEventListener('click', () => this.showEventModal());
        }

        const searchInput = document.getElementById('eventSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterEvents(e.target.value));
        }

        const typeFilter = document.getElementById('eventTypeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => this.filterByType(e.target.value));
        }

        const statusFilter = document.getElementById('eventStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => this.filterByStatus(e.target.value));
        }

        const eventModal = document.getElementById('eventModal');
        if (eventModal) {
            eventModal.addEventListener('hidden.bs.modal', () => {
                this.resetEventForm();
                this.cleanupModalBackdrop();
            });
        }

        const eventDetailsModal = document.getElementById('eventDetailsModal');
        if (eventDetailsModal) {
            eventDetailsModal.addEventListener('hidden.bs.modal', () => {
                this.cleanupModalBackdrop();
            });
        }

        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));
        }

        // Event listener para formulario de pago
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePaymentSubmit(e));
        }

        // Event listener para cambio de tipo de evento
        const eventTypeSelect = document.getElementById('eventType');
        if (eventTypeSelect) {
            eventTypeSelect.addEventListener('change', (e) => this.showSpecificFields(e.target.value));
        }
    }

    cleanupModalBackdrop() {
        // Limpiar backdrops residuales
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Restaurar el estado del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    async loadEvents() {
        console.log('Cargando eventos de demostración...');
        this.events = this.getDemoEvents();
        this.filteredEvents = [...this.events];
        console.log('Eventos cargados:', this.events.length);
    }

    getDemoEvents() {
        return [
            {
                id: 1,
                name: 'Rifa Navideña 2024',
                type: 'raffle',
                status: 'active',
                startDate: '2024-12-01',
                endDate: '2024-12-24',
                targetAmount: 5000000,
                currentAmount: 2500000,
                description: 'Rifa navideña para recaudar fondos para mejoras institucionales',
                participants: 150,
                prizes: ['TV 55"', 'Bicicleta', 'Electrodomésticos'],
                ticketPrice: 10000,
                maxTickets: 500,
                soldTickets: 250,
                createdAt: '2024-11-15',
                updatedAt: '2024-12-15',
                createdBy: 'admin@educonta.com',
                paymentHistory: [
                    { date: '2024-12-01', amount: 500000, description: 'Pagos iniciales' },
                    { date: '2024-12-08', amount: 750000, description: 'Ventas semana 1' },
                    { date: '2024-12-15', amount: 1250000, description: 'Ventas semana 2' }
                ]
            },
            {
                id: 2,
                name: 'Bingo Familiar Enero',
                type: 'bingo',
                status: 'planning',
                startDate: '2025-01-15',
                endDate: '2025-01-15',
                targetAmount: 1000000,
                currentAmount: 0,
                description: 'Bingo familiar para recaudar fondos para actividades estudiantiles del primer semestre',
                participants: 0,
                cardPrice: 5000,
                maxCards: 200,
                createdAt: '2024-12-10',
                updatedAt: '2024-12-10',
                createdBy: 'coordinador@educonta.com',
                paymentHistory: []
            },
            {
                id: 3,
                name: 'Derecho a Grado 2024-2',
                type: 'graduation',
                status: 'completed',
                startDate: '2024-11-01',
                endDate: '2024-11-30',
                targetAmount: 15000000,
                currentAmount: 15000000,
                description: 'Cobro de derechos de grado para estudiantes de último semestre',
                participants: 75,
                feeAmount: 200000,
                createdAt: '2024-10-15',
                updatedAt: '2024-11-30',
                createdBy: 'tesoreria@educonta.com',
                paymentHistory: [
                    { date: '2024-11-01', amount: 5000000, description: 'Pagos primera quincena' },
                    { date: '2024-11-15', amount: 6000000, description: 'Pagos segunda quincena' },
                    { date: '2024-11-30', amount: 4000000, description: 'Pagos finales' }
                ]
            },
            {
                id: 4,
                name: 'Festival Cultural 2025',
                type: 'cultural',
                status: 'planning',
                startDate: '2025-03-15',
                endDate: '2025-03-17',
                targetAmount: 3000000,
                currentAmount: 450000,
                description: 'Festival cultural anual con presentaciones artísticas y gastronómicas',
                participants: 85,
                ticketPrice: 15000,
                maxTickets: 200,
                soldTickets: 30,
                createdAt: '2024-12-01',
                updatedAt: '2024-12-16',
                createdBy: 'cultura@educonta.com',
                paymentHistory: [
                    { date: '2024-12-05', amount: 225000, description: 'Venta anticipada boletos' },
                    { date: '2024-12-12', amount: 225000, description: 'Venta segunda semana' }
                ]
            },
            {
                id: 5,
                name: 'Torneo Deportivo Inter-Cursos',
                type: 'sports',
                status: 'active',
                startDate: '2025-02-01',
                endDate: '2025-02-28',
                targetAmount: 800000,
                currentAmount: 320000,
                description: 'Torneo deportivo inter-cursos con múltiples disciplinas',
                participants: 120,
                registrationFee: 8000,
                maxParticipants: 150,
                createdAt: '2024-12-05',
                updatedAt: '2024-12-16',
                createdBy: 'deportes@educonta.com',
                paymentHistory: [
                    { date: '2024-12-10', amount: 160000, description: 'Inscripciones primera semana' },
                    { date: '2024-12-16', amount: 160000, description: 'Inscripciones segunda semana' }
                ]
            }
        ];
    }

    renderEventsList() {
        const container = document.getElementById('eventsContainer');
        if (!container) return;

        if (this.filteredEvents.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No hay eventos registrados</h5>
                        <p class="text-muted">Comienza creando tu primer evento</p>
                        <button class="btn btn-primary" onclick="eventsPage.showEventModal()">
                            <i class="fas fa-plus"></i> Crear Evento
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const eventsHTML = this.filteredEvents.map(event => this.renderEventCard(event)).join('');
        container.innerHTML = eventsHTML;
    }

    renderEventCard(event) {
        const eventType = this.eventTypes.find(t => t.id === event.type);
        const eventStatus = this.eventStatuses.find(s => s.id === event.status);
        const progress = event.targetAmount > 0 ? (event.currentAmount / event.targetAmount) * 100 : 0;

        return `
            <div class="col-md-6 col-lg-4 mb-4 animate-fade-in-up">
                <div class="card event-card-enterprise h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <span class="event-type-icon">${eventType?.icon || '📅'}</span>
                            <span class="badge-enterprise badge-${this.getStatusBadgeClass(event.status)}">
                                ${eventStatus?.name || 'Desconocido'}
                            </span>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                    data-bs-toggle="dropdown" aria-label="Opciones del evento">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#" onclick="eventsPage.viewEvent(${event.id})">
                                    <i class="fas fa-eye me-2"></i> Ver Detalles
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="eventsPage.editEvent(${event.id})">
                                    <i class="fas fa-edit me-2"></i> Editar
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="eventsPage.showParticipantsModal()">
                                    <i class="fas fa-users me-2"></i> Participantes
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" onclick="eventsPage.exportEventReport(${event.id})">
                                    <i class="fas fa-download me-2"></i> Exportar
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="eventsPage.deleteEvent(${event.id})">
                                    <i class="fas fa-trash me-2"></i> Eliminar
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="event-title">${event.name}</h5>
                        <p class="event-description">${event.description}</p>
                        
                        <div class="event-dates">
                            <small>
                                <i class="fas fa-calendar me-1"></i> 
                                ${this.formatDate(event.startDate)} - ${this.formatDate(event.endDate)}
                            </small>
                        </div>

                        <div class="progress-container">
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" 
                                     style="width: ${progress}%" 
                                     aria-valuenow="${progress}" 
                                     aria-valuemin="0" 
                                     aria-valuemax="100">
                                </div>
                            </div>
                        </div>
                        
                        <div class="event-amounts">
                            <div>
                                <span class="amount-raised">${this.formatCurrency(event.currentAmount)}</span>
                                <span class="amount-target">/ ${this.formatCurrency(event.targetAmount)}</span>
                            </div>
                            <div class="participants-count">
                                <i class="fas fa-users"></i>
                                <span>${event.participants || 0}</span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center text-sm">
                            <span class="performance-indicator">
                                ${Math.round(progress)}% completado
                            </span>
                            <span class="text-muted">
                                ${this.getDaysRemaining(event.endDate)} días restantes
                            </span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="action-buttons">
                            <button class="btn btn-enterprise btn-outline" 
                                    onclick="eventsPage.viewEvent(${event.id})"
                                    title="Ver detalles completos">
                                <i class="fas fa-eye me-1"></i> Ver
                            </button>
                            <button class="btn btn-enterprise btn-success" 
                                    onclick="eventsPage.recordTransaction(${event.id})"
                                    title="Registrar nuevo pago">
                                <i class="fas fa-plus me-1"></i> Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getStatusBadgeClass(status) {
        const classes = {
            'planning': 'warning',
            'active': 'success',
            'completed': 'info',
            'cancelled': 'danger'
        };
        return classes[status] || 'secondary';
    }

    getDaysRemaining(endDate) {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    showEventModal(eventId = null) {
        this.currentEvent = eventId ? this.events.find(e => e.id === eventId) : null;

        const modalElement = document.getElementById('eventModal');
        const modalTitle = document.getElementById('eventModalTitle');

        if (!modalElement) {
            console.error('Modal element not found');
            return;
        }

        if (this.currentEvent) {
            modalTitle.textContent = 'Editar Evento';
            this.populateEventForm(this.currentEvent);
        } else {
            modalTitle.textContent = 'Nuevo Evento';
            this.resetEventForm();
        }

        // Limpiar cualquier modal existente
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            existingModal.dispose();
        }

        // Limpiar backdrop residual
        const existingBackdrop = document.querySelector('.modal-backdrop');
        if (existingBackdrop) {
            existingBackdrop.remove();
        }

        // Asegurar que el body no tenga clases residuales
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        // Crear nuevo modal con configuración correcta
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: true, // Permitir cerrar haciendo clic fuera
            keyboard: true,
            focus: true
        });

        modal.show();
    }

    populateEventForm(event) {
        document.getElementById('eventName').value = event.name || '';
        document.getElementById('eventType').value = event.type || '';
        document.getElementById('eventStatus').value = event.status || '';
        document.getElementById('eventStartDate').value = event.startDate || '';
        document.getElementById('eventEndDate').value = event.endDate || '';
        document.getElementById('eventTargetAmount').value = event.targetAmount || '';
        document.getElementById('eventDescription').value = event.description || '';

        // Mostrar campos específicos
        this.showSpecificFields(event.type);

        // Campos específicos según el tipo
        if (event.type === 'raffle') {
            document.getElementById('ticketPrice').value = event.ticketPrice || '';
            document.getElementById('maxTickets').value = event.maxTickets || '';
        } else if (event.type === 'bingo') {
            document.getElementById('cardPrice').value = event.cardPrice || '';
            document.getElementById('maxCards').value = event.maxCards || '';
        } else if (event.type === 'graduation') {
            document.getElementById('feeAmount').value = event.feeAmount || '';
        }
    }

    resetEventForm() {
        const form = document.getElementById('eventForm');
        if (form) {
            form.reset();
        }
        this.currentEvent = null;
        this.hideSpecificFields();
    }

    showSpecificFields(eventType) {
        this.hideSpecificFields();

        if (eventType === 'raffle') {
            const raffleFields = document.getElementById('raffleFields');
            if (raffleFields) raffleFields.style.display = 'block';
        } else if (eventType === 'bingo') {
            const bingoFields = document.getElementById('bingoFields');
            if (bingoFields) bingoFields.style.display = 'block';
        } else if (eventType === 'graduation') {
            const graduationFields = document.getElementById('graduationFields');
            if (graduationFields) graduationFields.style.display = 'block';
        }
    }

    hideSpecificFields() {
        const raffleFields = document.getElementById('raffleFields');
        const bingoFields = document.getElementById('bingoFields');
        const graduationFields = document.getElementById('graduationFields');

        if (raffleFields) raffleFields.style.display = 'none';
        if (bingoFields) bingoFields.style.display = 'none';
        if (graduationFields) graduationFields.style.display = 'none';
    }

    async handleEventSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const eventData = {
            name: formData.get('name'),
            type: formData.get('type'),
            status: formData.get('status'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            targetAmount: parseFloat(formData.get('targetAmount')) || 0,
            description: formData.get('description'),
            currentAmount: this.currentEvent?.currentAmount || 0,
            participants: this.currentEvent?.participants || 0
        };

        // Agregar campos específicos según el tipo
        if (eventData.type === 'raffle') {
            eventData.ticketPrice = parseFloat(formData.get('ticketPrice')) || 0;
            eventData.maxTickets = parseInt(formData.get('maxTickets')) || 0;
            eventData.soldTickets = this.currentEvent?.soldTickets || 0;
        } else if (eventData.type === 'bingo') {
            eventData.cardPrice = parseFloat(formData.get('cardPrice')) || 0;
            eventData.maxCards = parseInt(formData.get('maxCards')) || 0;
        } else if (eventData.type === 'graduation') {
            eventData.feeAmount = parseFloat(formData.get('feeAmount')) || 0;
        }

        try {
            if (this.currentEvent) {
                const index = this.events.findIndex(e => e.id === this.currentEvent.id);
                eventData.id = this.currentEvent.id;
                this.events[index] = eventData;
            } else {
                eventData.id = Math.max(...this.events.map(e => e.id), 0) + 1;
                eventData.createdAt = new Date().toISOString().split('T')[0];
                eventData.paymentHistory = [];
                this.events.push(eventData);
            }

            this.filteredEvents = [...this.events];
            this.renderEventsList();
            this.updateStats();

            const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
            if (modal) {
                modal.hide();
                // Asegurar limpieza después de un breve delay
                setTimeout(() => {
                    this.cleanupModalBackdrop();
                }, 300);
            }

            this.showNotification(
                this.currentEvent ? 'Evento actualizado correctamente' : 'Evento creado correctamente',
                'success'
            );

        } catch (error) {
            console.error('Error saving event:', error);
            this.showNotification('Error al guardar el evento', 'error');
        }
    }

    editEvent(eventId) {
        this.showEventModal(eventId);
    }

    async deleteEvent(eventId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return;

        try {
            this.events = this.events.filter(e => e.id !== eventId);
            this.filteredEvents = this.filteredEvents.filter(e => e.id !== eventId);

            this.renderEventsList();
            this.updateStats();
            this.showNotification('Evento eliminado correctamente', 'success');

        } catch (error) {
            console.error('Error deleting event:', error);
            this.showNotification('Error al eliminar el evento', 'error');
        }
    }

    viewEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.currentEventId = eventId;
        this.populateEventDetails(event);

        const modalElement = document.getElementById('eventDetailsModal');
        if (modalElement) {
            // Limpiar modal existente
            const existingModal = bootstrap.Modal.getInstance(modalElement);
            if (existingModal) {
                existingModal.dispose();
            }

            // Limpiar backdrop residual
            const existingBackdrop = document.querySelector('.modal-backdrop');
            if (existingBackdrop) {
                existingBackdrop.remove();
            }

            const modal = new bootstrap.Modal(modalElement, {
                backdrop: true, // Permitir cerrar haciendo clic fuera
                keyboard: true,
                focus: true
            });
            modal.show();
        }
    }

    populateEventDetails(event) {
        const eventType = this.eventTypes.find(t => t.id === event.type);
        const eventStatus = this.eventStatuses.find(s => s.id === event.status);
        const progress = event.targetAmount > 0 ? (event.currentAmount / event.targetAmount) * 100 : 0;

        document.getElementById('detailEventName').textContent = event.name;
        document.getElementById('detailEventType').innerHTML = `${eventType?.icon || '📅'} ${eventType?.name || 'Desconocido'}`;

        const statusBadge = document.getElementById('detailEventStatus');
        statusBadge.className = `badge bg-${this.getStatusColor(event.status)}`;
        statusBadge.textContent = eventStatus?.name || 'Desconocido';

        document.getElementById('detailEventDates').textContent =
            `${this.formatDate(event.startDate)} - ${this.formatDate(event.endDate)}`;
        document.getElementById('detailEventDescription').textContent = event.description || 'Sin descripción';

        document.getElementById('detailEventProgress').innerHTML = `
            <div class="progress mb-2" style="height: 10px;">
                <div class="progress-bar bg-success" style="width: ${progress}%"></div>
            </div>
            <div class="d-flex justify-content-between">
                <span class="fw-bold text-success">${this.formatCurrency(event.currentAmount)}</span>
                <span class="text-muted">de ${this.formatCurrency(event.targetAmount)}</span>
            </div>
            <div class="text-center mt-1">
                <small class="text-muted">${Math.round(progress)}% completado</small>
            </div>
        `;

        const participantsData = this.generateParticipantsData(event);

        document.getElementById('detailEventParticipants').textContent = participantsData.total;
        document.getElementById('detailPaidCount').textContent = participantsData.paid;
        document.getElementById('detailPendingCount').textContent = participantsData.pending;
        document.getElementById('detailCollectionRate').textContent = `${Math.round((participantsData.paid / participantsData.total) * 100) || 0}%`;
        document.getElementById('detailAvgAmount').textContent = this.formatCurrency(participantsData.avgAmount);

        this.renderParticipantsByGrade(participantsData.byGrade);
        this.renderSpecificEventInfo(event);
        this.renderRecentTransactions(event);
    }

    generateParticipantsData(event) {
        const grades = ['6°', '7°', '8°', '9°', '10°', '11°'];
        const total = event.participants || Math.floor(Math.random() * 200) + 50;
        const paid = Math.floor(total * 0.7);
        const pending = total - paid;
        const avgAmount = event.targetAmount / total;

        const byGrade = grades.map(grade => {
            const gradeTotal = Math.floor(Math.random() * 40) + 10;
            const gradePaid = Math.floor(gradeTotal * (0.6 + Math.random() * 0.3));
            return {
                grade,
                total: gradeTotal,
                paid: gradePaid,
                pending: gradeTotal - gradePaid,
                percentage: Math.round((gradePaid / gradeTotal) * 100)
            };
        });

        return {
            total,
            paid,
            pending,
            avgAmount,
            byGrade
        };
    }

    renderParticipantsByGrade(gradeData) {
        const container = document.getElementById('participantsByGrade');
        const html = gradeData.map(grade => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                <div>
                    <strong>${grade.grade}</strong>
                    <small class="text-muted d-block">${grade.paid}/${grade.total} estudiantes</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-${grade.percentage >= 80 ? 'success' : grade.percentage >= 50 ? 'warning' : 'danger'}">
                        ${grade.percentage}%
                    </span>
                </div>
            </div>
        `).join('');
        container.innerHTML = html;
    }

    renderSpecificEventInfo(event) {
        const specificInfo = document.getElementById('detailSpecificInfo');
        let html = '';

        if (event.type === 'raffle') {
            html = `
                <div class="text-center p-3 bg-light rounded">
                    <strong>Precio por boleto</strong>
                    <div class="h5 text-primary mb-0">${this.formatCurrency(event.ticketPrice || 10000)}</div>
                    <small class="text-muted">${event.soldTickets || 0} / ${event.maxTickets || 500} vendidos</small>
                </div>
            `;
        } else if (event.type === 'bingo') {
            html = `
                <div class="text-center p-3 bg-light rounded">
                    <strong>Precio por cartón</strong>
                    <div class="h5 text-primary mb-0">${this.formatCurrency(event.cardPrice || 5000)}</div>
                    <small class="text-muted">Máximo ${event.maxCards || 200} cartones</small>
                </div>
            `;
        } else if (event.type === 'graduation') {
            html = `
                <div class="text-center p-3 bg-light rounded">
                    <strong>Valor del derecho</strong>
                    <div class="h4 text-primary mb-0">${this.formatCurrency(event.feeAmount || 200000)}</div>
                </div>
            `;
        }

        specificInfo.innerHTML = html;
    }

    renderRecentTransactions(event) {
        const container = document.getElementById('recentTransactions');

        const transactions = event.paymentHistory || [];

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No hay transacciones registradas</p>';
            return;
        }

        const recentTransactions = transactions.slice(-5).reverse();

        const html = recentTransactions.map(tx => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div>
                    <div class="fw-semibold">${tx.description}</div>
                    <small class="text-muted">${this.formatDate(tx.date)}</small>
                </div>
                <div class="text-success fw-bold">
                    ${this.formatCurrency(tx.amount)}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    getStatusColor(status) {
        const colors = {
            'planning': 'warning',
            'active': 'success',
            'completed': 'secondary',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    recordTransaction(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.currentTransactionEventId = eventId;

        this.populateStudentSelect(event);

        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];

        const modalElement = document.getElementById('transactionModal');
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            existingModal.dispose();
        }

        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: true,
            focus: true
        });
        modal.show();

        const form = document.getElementById('transactionForm');
        form.onsubmit = (e) => this.handleTransactionSubmit(e);
    }

    populateStudentSelect(event) {
        const select = document.getElementById('transactionStudent');
        const participants = this.generateParticipantsList(event);

        select.innerHTML = '<option value="">Seleccionar estudiante</option>';

        participants.forEach(participant => {
            const option = document.createElement('option');
            option.value = participant.id;
            option.textContent = `${participant.name} - ${participant.grade}`;
            option.dataset.currentAmount = participant.amount;
            select.appendChild(option);
        });
    }

    generateParticipantsList(event) {
        const names = [
            'Ana García Rodríguez', 'Carlos López Martínez', 'María Rodríguez Silva', 'Juan Pérez González',
            'Laura Martínez López', 'Diego Sánchez Ruiz', 'Sofía González Pérez', 'Andrés Ruiz García',
            'Valentina Silva Martín', 'Santiago Martín López', 'Isabella López Sánchez', 'Mateo García Silva',
            'Camila Pérez Ruiz', 'Nicolás Ruiz González', 'Gabriela Sánchez García', 'Alejandro González López',
            'Daniela Torres Vega', 'Felipe Morales Castro', 'Natalia Herrera Díaz', 'Sebastián Jiménez Rojas',
            'Valeria Castillo Mendoza', 'Emilio Vargas Ortiz', 'Lucía Ramírez Flores', 'Joaquín Delgado Peña'
        ];

        const grades = ['6°A', '6°B', '7°A', '7°B', '8°A', '8°B', '9°A', '9°B', '10°A', '10°B', '11°A', '11°B'];
        const statuses = ['paid', 'pending', 'partial'];
        const participants = [];

        const totalParticipants = event.participants || 80;

        for (let i = 0; i < totalParticipants; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const baseAmount = event.feeAmount || event.ticketPrice || event.cardPrice || event.registrationFee || 50000;
            let amount = 0;
            let paymentDate = null;

            if (status === 'paid') {
                amount = baseAmount;
                paymentDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            } else if (status === 'partial') {
                amount = Math.floor(baseAmount * (0.3 + Math.random() * 0.4));
                paymentDate = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            }

            participants.push({
                id: i + 1,
                name: names[Math.floor(Math.random() * names.length)] + ` ${i + 1}`,
                grade: grades[Math.floor(Math.random() * grades.length)],
                status: status,
                amount: amount,
                paymentDate: paymentDate,
                phone: `300${Math.floor(Math.random() * 9000000) + 1000000}`,
                email: `estudiante${i + 1}@educonta.com`
            });
        }

        return participants;
    }

    async handleTransactionSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const studentId = formData.get('student');
        const amount = parseFloat(formData.get('amount'));
        const date = formData.get('date');
        const description = formData.get('description') || 'Pago registrado';

        const event = this.events.find(e => e.id === this.currentTransactionEventId);
        if (!event) return;

        try {
            const maxAmount = event.feeAmount || event.ticketPrice || event.cardPrice || 50000;
            if (amount > maxAmount) {
                this.showNotification(`El monto no puede exceder ${this.formatCurrency(maxAmount)}`, 'error');
                return;
            }

            event.currentAmount += amount;
            if (!event.paymentHistory) {
                event.paymentHistory = [];
            }

            event.paymentHistory.push({
                date: date,
                amount: amount,
                description: description,
                studentId: studentId
            });

            this.renderEventsList();
            this.updateStats();

            const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
            modal.hide();

            this.showNotification('Pago registrado correctamente', 'success');

        } catch (error) {
            console.error('Error registering transaction:', error);
            this.showNotification('Error al registrar el pago', 'error');
        }
    }

    async showParticipantsModal(eventId = null) {
        console.log('🎯 Mostrando modal de participantes para evento:', eventId || this.currentEventId);
        
        const targetEventId = eventId || this.currentEventId;
        const event = this.events.find(e => e.id === targetEventId);
        
        if (!event) {
            console.error('❌ Evento no encontrado:', targetEventId);
            this.showNotification('Evento no encontrado', 'error');
            return;
        }

        this.currentEventId = targetEventId;
        
        // Actualizar título del modal
        const eventNameElement = document.getElementById('participantsEventName');
        if (eventNameElement) {
            eventNameElement.textContent = event.name;
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
        await this.loadEventParticipants(targetEventId);
    }

    async loadEventParticipants(eventId) {
        console.log('📊 Cargando participantes del evento:', eventId);
        
        try {
            const institutionId = this.getInstitutionId();
            const response = await fetch(`/api/events/${eventId}/participants`);
            const data = await response.json();

            if (data.success) {
                this.currentParticipants = data.participants || [];
                console.log(`✅ Cargados ${this.currentParticipants.length} participantes desde el backend`);
            } else {
                console.warn('⚠️ No se pudieron cargar participantes del backend, usando datos de demostración');
                this.currentParticipants = this.generateDemoParticipants(eventId);
            }
        } catch (error) {
            console.error('❌ Error cargando participantes del backend:', error);
            console.log('📊 Usando participantes de demostración...');
            this.currentParticipants = this.generateDemoParticipants(eventId);
        }

        this.renderParticipantsList();
        this.updateParticipantsStats();
        this.setupParticipantFilters();
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
        const numParticipants = event.participants || 50;

        for (let i = 1; i <= numParticipants; i++) {
            const nombre = nombres[Math.floor(Math.random() * nombres.length)];
            const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
            const grado = grados[Math.floor(Math.random() * grados.length)];
            const curso = cursos[Math.floor(Math.random() * cursos.length)];
            const estado = estados[Math.floor(Math.random() * estados.length)];
            
            let montoEsperado = 50000; // Valor por defecto
            if (event.type === 'raffle') {
                montoEsperado = event.ticketPrice || 10000;
            } else if (event.type === 'bingo') {
                montoEsperado = event.cardPrice || 5000;
            } else if (event.type === 'graduation') {
                montoEsperado = event.feeAmount || 200000;
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

    getInstitutionId() {
        // Obtener de localStorage o URL params
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('institutionId') || localStorage.getItem('institutionId') || '1';
    }

    renderParticipantsList() {
        console.log('🎨 Renderizando lista de participantes...');
        
        const tbody = document.getElementById('participantsTableBody');
        if (!tbody) {
            console.warn('⚠️ Tabla de participantes no encontrada');
            return;
        }

        if (!this.currentParticipants || this.currentParticipants.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="fas fa-users-slash fa-2x text-muted mb-2"></i>
                        <p class="text-muted mb-0">No hay participantes registrados en este evento</p>
                        <button class="btn btn-primary btn-sm mt-2" onclick="eventsPage.addParticipants()">
                            <i class="fas fa-user-plus"></i> Agregar Participantes
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        const participantsHTML = this.currentParticipants.map(participant => this.renderParticipantRow(participant)).join('');
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
                                onclick="eventsPage.showPaymentModal(${participant.eventId}, ${participant.studentId})"
                                title="Registrar pago"
                                ${participant.estado === 'paid' ? 'disabled' : ''}>
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                        <button class="btn btn-outline-primary" 
                                onclick="eventsPage.viewParticipantHistory(${participant.studentId})"
                                title="Ver historial">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-outline-danger" 
                                onclick="eventsPage.removeParticipant(${participant.eventId}, ${participant.studentId})"
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
        if (!this.currentParticipants) return;

        const total = this.currentParticipants.length;
        const paid = this.currentParticipants.filter(p => p.estado === 'paid').length;
        const partial = this.currentParticipants.filter(p => p.estado === 'partial').length;
        const pending = this.currentParticipants.filter(p => p.estado === 'pending').length;

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

    clearParticipantFilters() {
        // Limpiar filtros de participantes
        const searchInput = document.getElementById('participantSearch');
        if (searchInput) searchInput.value = '';

        const gradeFilter = document.getElementById('participantGradeFilter');
        if (gradeFilter) gradeFilter.value = '';

        const courseFilter = document.getElementById('participantCourseFilter');
        if (courseFilter) courseFilter.value = '';

        const statusFilter = document.getElementById('participantStatusFilter');
        if (statusFilter) statusFilter.value = '';

        this.renderParticipantsList();
    }

    // Funciones adicionales para participantes
    showPaymentModal(eventId, studentId) {
        console.log('💰 Mostrando modal de pago para:', { eventId, studentId });
        
        const participant = this.currentParticipants.find(p => 
            p.eventId === eventId && p.studentId === studentId
        );
        
        if (!participant) {
            this.showNotification('Participante no encontrado', 'error');
            return;
        }

        // Poblar modal de pago
        document.getElementById('paymentStudentName').value = 
            `${participant.student.nombre} ${participant.student.apellido}`;
        document.getElementById('paymentStudentId').value = studentId;
        document.getElementById('paymentEventId').value = eventId;
        document.getElementById('expectedAmount').textContent = 
            this.formatCurrency(participant.montoEsperado);
        document.getElementById('alreadyPaid').textContent = 
            this.formatCurrency(participant.montoPagado);

        // Calcular monto sugerido
        const remainingAmount = participant.montoEsperado - participant.montoPagado;
        document.getElementById('paymentAmount').value = remainingAmount > 0 ? remainingAmount : 0;

        // Mostrar modal
        const modalElement = document.getElementById('paymentModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    viewParticipantHistory(studentId) {
        console.log('📋 Ver historial del participante:', studentId);
        this.showNotification('Función de historial en desarrollo', 'info');
    }

    removeParticipant(eventId, studentId) {
        console.log('🗑️ Remover participante:', { eventId, studentId });
        
        if (!confirm('¿Estás seguro de que deseas remover este participante del evento?')) {
            return;
        }

        // Remover de la lista actual
        this.currentParticipants = this.currentParticipants.filter(p => 
            !(p.eventId === eventId && p.studentId === studentId)
        );

        this.renderParticipantsList();
        this.updateParticipantsStats();
        this.showNotification('Participante removido del evento', 'success');
    }

    addParticipants() {
        console.log('➕ Agregar participantes al evento');
        this.showNotification('Función de agregar participantes en desarrollo', 'info');
    }

    exportParticipants() {
        console.log('📥 Exportar lista de participantes');
        this.showNotification('Función de exportar participantes en desarrollo', 'info');
    }

    async handlePaymentSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const paymentData = {
            eventId: document.getElementById('paymentEventId').value,
            studentId: document.getElementById('paymentStudentId').value,
            monto: parseFloat(document.getElementById('paymentAmount').value),
            descripcion: document.getElementById('paymentDescription').value,
            referencia: document.getElementById('paymentReference').value
        };

        console.log('💰 Procesando pago:', paymentData);

        try {
            // Simular llamada al backend
            const response = await fetch(`/api/events/${paymentData.eventId}/participants/${paymentData.studentId}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (result.success) {
                // Actualizar participante en la lista local
                const participantIndex = this.currentParticipants.findIndex(p => 
                    p.eventId == paymentData.eventId && p.studentId == paymentData.studentId
                );

                if (participantIndex !== -1) {
                    this.currentParticipants[participantIndex].montoPagado += paymentData.monto;
                    
                    // Actualizar estado
                    const participant = this.currentParticipants[participantIndex];
                    if (participant.montoPagado >= participant.montoEsperado) {
                        participant.estado = 'paid';
                        participant.fechaPago = new Date().toISOString().split('T')[0];
                    } else {
                        participant.estado = 'partial';
                    }
                }

                // Actualizar vistas
                this.renderParticipantsList();
                this.updateParticipantsStats();

                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
                if (modal) {
                    modal.hide();
                }

                this.showNotification('Pago registrado exitosamente', 'success');

            } else {
                throw new Error(result.message || 'Error registrando pago');
            }

        } catch (error) {
            console.error('❌ Error registrando pago:', error);
            
            // Para demostración, simular éxito
            const participantIndex = this.currentParticipants.findIndex(p => 
                p.eventId == paymentData.eventId && p.studentId == paymentData.studentId
            );

            if (participantIndex !== -1) {
                this.currentParticipants[participantIndex].montoPagado += paymentData.monto;
                
                const participant = this.currentParticipants[participantIndex];
                if (participant.montoPagado >= participant.montoEsperado) {
                    participant.estado = 'paid';
                    participant.fechaPago = new Date().toISOString().split('T')[0];
                } else {
                    participant.estado = 'partial';
                }
            }

            this.renderParticipantsList();
            this.updateParticipantsStats();

            const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
            if (modal) {
                modal.hide();
            }

            this.showNotification('Pago registrado exitosamente (modo demostración)', 'success');
        }
    }

    setupParticipantFilters() {
        const searchInput = document.getElementById('participantSearch');
        const gradeFilter = document.getElementById('participantGradeFilter');
        const statusFilter = document.getElementById('participantStatusFilter');

        if (searchInput && !searchInput.hasEventListener) {
            searchInput.addEventListener('input', () => this.filterParticipants());
            searchInput.hasEventListener = true;
        }

        if (gradeFilter && !gradeFilter.hasEventListener) {
            gradeFilter.addEventListener('change', () => this.filterParticipants());
            gradeFilter.hasEventListener = true;
        }

        if (statusFilter && !statusFilter.hasEventListener) {
            statusFilter.addEventListener('change', () => this.filterParticipants());
            statusFilter.hasEventListener = true;
        }
    }

    filterParticipants() {
        if (!this.currentParticipants) return;

        const searchTerm = document.getElementById('participantSearch')?.value.toLowerCase() || '';
        const gradeFilter = document.getElementById('participantGradeFilter')?.value || '';
        const statusFilter = document.getElementById('participantStatusFilter')?.value || '';

        const filtered = this.currentParticipants.filter(participant => {
            const matchesSearch = participant.name.toLowerCase().includes(searchTerm) ||
                participant.email.toLowerCase().includes(searchTerm);
            const matchesGrade = !gradeFilter || participant.grade.startsWith(gradeFilter);
            const matchesStatus = !statusFilter || participant.status === statusFilter;

            return matchesSearch && matchesGrade && matchesStatus;
        });

        this.renderParticipantsList(filtered);
    }

    getStatusBadgeColor(status) {
        const colors = {
            'paid': 'success',
            'pending': 'danger',
            'partial': 'warning'
        };
        return colors[status] || 'secondary';
    }

    getStatusText(status) {
        const statusMap = {
            'paid': 'Pagado',
            'pending': 'Pendiente',
            'partial': 'Parcial'
        };
        return statusMap[status] || 'Desconocido';
    }

    editParticipant(participantId) {
        const participant = this.currentParticipants?.find(p => p.id === participantId);
        if (!participant) return;

        this.showNotification(`Editando participante: ${participant.name}`, 'info');
    }

    recordParticipantPayment(participantId) {
        const participant = this.currentParticipants?.find(p => p.id === participantId);
        if (!participant) return;

        const studentSelect = document.getElementById('transactionStudent');
        if (studentSelect) {
            studentSelect.value = participantId;
        }

        const participantsModal = bootstrap.Modal.getInstance(document.getElementById('participantsModal'));
        if (participantsModal) {
            participantsModal.hide();
        }

        setTimeout(() => {
            this.recordTransaction(this.currentEventId);
        }, 300);
    }

    contactParticipant(participantId) {
        const participant = this.currentParticipants?.find(p => p.id === participantId);
        if (!participant) return;

        const message = `Hola ${participant.name}, te recordamos sobre el evento. Para más información contacta a la institución.`;
        const whatsappUrl = `https://wa.me/57${participant.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
        this.showNotification(`Abriendo WhatsApp para contactar a ${participant.name}`, 'info');
    }

    addParticipant() {
        this.showNotification('Función de agregar participante en desarrollo', 'info');
    }

    exportEventReport(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const participants = this.generateParticipantsData(event);
        const eventType = this.eventTypes.find(t => t.id === event.type);

        const csvData = [
            ['REPORTE DE EVENTO - EDUCONTA'],
            [''],
            ['Información General'],
            ['Nombre del Evento', event.name],
            ['Tipo', eventType?.name || 'N/A'],
            ['Estado', event.status],
            ['Fecha Inicio', event.startDate],
            ['Fecha Fin', event.endDate],
            ['Meta de Recaudación', this.formatCurrency(event.targetAmount)],
            ['Monto Recaudado', this.formatCurrency(event.currentAmount)],
            ['Porcentaje Completado', `${Math.round((event.currentAmount / event.targetAmount) * 100)}%`],
            [''],
            ['Estadísticas de Participación'],
            ['Total Participantes', participants.total],
            ['Participantes que Pagaron', participants.paid],
            ['Participantes Pendientes', participants.pending],
            ['Tasa de Cobro', `${Math.round((participants.paid / participants.total) * 100)}%`],
            ['Promedio por Participante', this.formatCurrency(participants.avgAmount)],
            [''],
            ['Historial de Pagos']
        ];

        if (event.paymentHistory && event.paymentHistory.length > 0) {
            csvData.push(['Fecha', 'Monto', 'Descripción']);
            event.paymentHistory.forEach(payment => {
                csvData.push([payment.date, this.formatCurrency(payment.amount), payment.description]);
            });
        } else {
            csvData.push(['No hay pagos registrados']);
        }

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        this.downloadCSV(csvContent, `reporte_evento_${event.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);

        this.showNotification('Reporte exportado correctamente', 'success');
    }

    sendReminders(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const participants = this.generateParticipantsData(event);
        const pendingCount = participants.pending;

        if (pendingCount === 0) {
            this.showNotification('No hay participantes pendientes de pago', 'info');
            return;
        }

        this.showNotification(`Enviando recordatorios a ${pendingCount} participantes...`, 'info');

        setTimeout(() => {
            this.showNotification(`Recordatorios enviados exitosamente a ${pendingCount} participantes`, 'success');
        }, 2000);
    }

    exportParticipants() {
        if (!this.currentParticipants) return;

        const csvData = [
            ['LISTA DE PARTICIPANTES - EDUCONTA'],
            [''],
            ['Estudiante', 'Grado', 'Estado', 'Monto Pagado', 'Fecha Pago', 'Teléfono']
        ];

        this.currentParticipants.forEach(participant => {
            csvData.push([
                participant.name,
                participant.grade,
                this.getStatusText(participant.status),
                this.formatCurrency(participant.amount),
                participant.paymentDate || 'N/A',
                participant.phone || 'N/A'
            ]);
        });

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        this.downloadCSV(csvContent, `participantes_${new Date().toISOString().split('T')[0]}.csv`);

        this.showNotification('Lista de participantes exportada', 'success');
    }

    exportEvents() {
        const csvData = [
            ['REPORTE GENERAL DE EVENTOS - EDUCONTA'],
            ['Generado el:', new Date().toLocaleDateString()],
            [''],
            ['Nombre', 'Tipo', 'Estado', 'Fecha Inicio', 'Fecha Fin', 'Meta', 'Recaudado', '% Completado', 'Participantes']
        ];

        this.events.forEach(event => {
            const eventType = this.eventTypes.find(t => t.id === event.type);
            const progress = event.targetAmount > 0 ? Math.round((event.currentAmount / event.targetAmount) * 100) : 0;

            csvData.push([
                event.name,
                eventType?.name || 'N/A',
                event.status,
                event.startDate,
                event.endDate,
                this.formatCurrency(event.targetAmount),
                this.formatCurrency(event.currentAmount),
                `${progress}%`,
                event.participants || 0
            ]);
        });

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        this.downloadCSV(csvContent, `eventos_general_${new Date().toISOString().split('T')[0]}.csv`);

        this.showNotification('Reporte general exportado correctamente', 'success');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    filterEvents(searchTerm) {
        this.filteredEvents = this.events.filter(event =>
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderEventsList();
    }

    filterByType(type) {
        if (!type) {
            this.filteredEvents = [...this.events];
        } else {
            this.filteredEvents = this.events.filter(event => event.type === type);
        }
        this.renderEventsList();
    }

    filterByStatus(status) {
        if (!status) {
            this.filteredEvents = [...this.events];
        } else {
            this.filteredEvents = this.events.filter(event => event.status === status);
        }
        this.renderEventsList();
    }

    updateStats() {
        const totalEvents = this.events.length;
        const activeEvents = this.events.filter(e => e.status === 'active').length;
        const completedEvents = this.events.filter(e => e.status === 'completed').length;
        const planningEvents = this.events.filter(e => e.status === 'planning').length;

        const totalTarget = this.events.reduce((sum, e) => sum + (e.targetAmount || 0), 0);
        const totalRaised = this.events.reduce((sum, e) => sum + (e.currentAmount || 0), 0);
        const totalPending = totalTarget - totalRaised;
        const collectionPercentage = totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0;
        const pendingPercentage = 100 - collectionPercentage;

        const avgEventTarget = totalEvents > 0 ? totalTarget / totalEvents : 0;
        const avgEventRaised = totalEvents > 0 ? totalRaised / totalEvents : 0;
        const totalParticipants = this.events.reduce((sum, e) => sum + (e.participants || 0), 0);

        this.animateCounter('totalEvents', totalEvents);
        this.animateCounter('activeEvents', activeEvents);
        this.updateElement('totalTarget', this.formatCurrency(totalTarget));
        this.updateElement('totalRaised', this.formatCurrency(totalRaised));
        this.updateElement('totalPending', this.formatCurrency(totalPending));
        this.updateElement('collectionPercentage', `${collectionPercentage}%`);
        this.updateElement('pendingPercentage', `${pendingPercentage}%`);

        const progressBar = document.getElementById('overallProgress');
        if (progressBar) {
            setTimeout(() => {
                progressBar.style.width = `${collectionPercentage}%`;
                progressBar.setAttribute('aria-valuenow', collectionPercentage);
            }, 100);
        }

        this.updateElement('completedEvents', completedEvents);
        this.updateElement('planningEvents', planningEvents);
        this.updateElement('avgEventTarget', this.formatCurrency(avgEventTarget));
        this.updateElement('avgEventRaised', this.formatCurrency(avgEventRaised));
        this.updateElement('totalParticipants', totalParticipants);

        this.updatePerformanceIndicators(collectionPercentage, activeEvents, completedEvents);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((targetValue - currentValue) / 20);

        if (currentValue < targetValue) {
            element.textContent = Math.min(currentValue + increment, targetValue);
            setTimeout(() => this.animateCounter(elementId, targetValue), 50);
        } else {
            element.textContent = targetValue;
        }
    }

    updatePerformanceIndicators(collectionPercentage, activeEvents, completedEvents) {
        const indicators = document.querySelectorAll('.performance-indicator');
        indicators.forEach(indicator => {
            if (collectionPercentage >= 80) {
                indicator.className = 'performance-indicator text-success';
            } else if (collectionPercentage >= 50) {
                indicator.className = 'performance-indicator text-warning';
            } else {
                indicator.className = 'performance-indicator text-danger';
            }
        });
    }

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    showNotification(message, type = 'info') {
        // Crear contenedor de notificaciones si no existe
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} border-0`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        container.appendChild(notification);

        // Mostrar notificación
        const toast = new bootstrap.Toast(notification, {
            autohide: true,
            delay: 5000
        });
        toast.show();

        // Remover del DOM después de que se oculte
        notification.addEventListener('hidden.bs.toast', () => {
            notification.remove();
        });
    }
}

// Inicializar la página cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    window.eventsPage = new EventsManagementPage();
});

// Función global para exportar eventos (para el botón en el HTML)
function exportEventsReport() {
    if (window.eventsPage) {
        window.eventsPage.exportEvents();
    }
}