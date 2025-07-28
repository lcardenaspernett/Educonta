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
            this.cleanupModals(); // Limpiar modales previos
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
        // Limpiar cualquier instancia de modal previa
        const modalIds = ['eventModal', 'eventDetailsModal', 'transactionModal', 'participantsModal'];
        modalIds.forEach(modalId => {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const existingModal = bootstrap.Modal.getInstance(modalElement);
                if (existingModal) {
                    existingModal.dispose();
                }
                // Remover clases de Bootstrap que puedan causar problemas
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');
            }
        });
        
        // Limpiar backdrop si existe
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        // Restaurar scroll del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    setupEventListeners() {
        // Botón nuevo evento
        const newEventBtn = document.getElementById('newEventBtn');
        if (newEventBtn) {
            newEventBtn.addEventListener('click', () => this.showEventModal());
        }

        // Filtros
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

        // Modal events
        const eventModal = document.getElementById('eventModal');
        if (eventModal) {
            eventModal.addEventListener('hidden.bs.modal', () => this.resetEventForm());
        }

        // Form submission
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));
        }
    }

    async loadEvents() {
        // Usar datos de demostración directamente
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
                soldTickets: 250
            },
            {
                id: 2,
                name: 'Bingo Familiar',
                type: 'bingo',
                status: 'planning',
                startDate: '2025-01-15',
                endDate: '2025-01-15',
                targetAmount: 1000000,
                currentAmount: 0,
                description: 'Bingo familiar para recaudar fondos para actividades estudiantiles',
                participants: 0,
                cardPrice: 5000,
                maxCards: 200
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
                feeAmount: 200000
            }
        ];
    }

    renderEventsList() {
        const container = document.getElementById('eventsContainer');
        if (!container) return;

        if (this.filteredEvents.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No hay eventos registrados</h5>
                    <p class="text-muted">Comienza creando tu primer evento</p>
                    <button class="btn btn-primary" onclick="eventsPage.showEventModal()">
                        <i class="fas fa-plus"></i> Crear Evento
                    </button>
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
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card event-card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <span class="event-type-icon me-2">${eventType?.icon || '📅'}</span>
                            <span class="badge" style="background-color: ${eventStatus?.color || '#6c757d'}">
                                ${eventStatus?.name || 'Desconocido'}
                            </span>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                    data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="eventsPage.viewEvent(${event.id})">
                                    <i class="fas fa-eye"></i> Ver Detalles
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="eventsPage.editEvent(${event.id})">
                                    <i class="fas fa-edit"></i> Editar
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="eventsPage.manageParticipants(${event.id})">
                                    <i class="fas fa-users"></i> Participantes
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="eventsPage.deleteEvent(${event.id})">
                                    <i class="fas fa-trash"></i> Eliminar
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${event.name}</h5>
                        <p class="card-text text-muted small">${event.description}</p>
                        
                        <div class="event-dates mb-3">
                            <small class="text-muted">
                                <i class="fas fa-calendar"></i> 
                                ${this.formatDate(event.startDate)} - ${this.formatDate(event.endDate)}
                            </small>
                        </div>

                        <div class="progress mb-2" style="height: 8px;">
                            <div class="progress-bar" role="progressbar" 
                                 style="width: ${progress}%" 
                                 aria-valuenow="${progress}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${this.formatCurrency(event.currentAmount)}</strong>
                                <small class="text-muted">/ ${this.formatCurrency(event.targetAmount)}</small>
                            </div>
                            <small class="text-muted">
                                <i class="fas fa-users"></i> ${event.participants || 0}
                            </small>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="eventsPage.viewEvent(${event.id})">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button class="btn btn-outline-success btn-sm" 
                                    onclick="eventsPage.recordTransaction(${event.id})">
                                <i class="fas fa-plus"></i> Registrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showEventModal(eventId = null) {
        this.currentEvent = eventId ? this.events.find(e => e.id === eventId) : null;
        
        const modalElement = document.getElementById('eventModal');
        const modalTitle = document.getElementById('eventModalTitle');
        
        if (this.currentEvent) {
            modalTitle.textContent = 'Editar Evento';
            this.populateEventForm(this.currentEvent);
        } else {
            modalTitle.textContent = 'Nuevo Evento';
            this.resetEventForm();
        }
        
        // Limpiar instancia previa y crear nueva
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
    }

    populateEventForm(event) {
        document.getElementById('eventName').value = event.name || '';
        document.getElementById('eventType').value = event.type || '';
        document.getElementById('eventStatus').value = event.status || '';
        document.getElementById('eventStartDate').value = event.startDate || '';
        document.getElementById('eventEndDate').value = event.endDate || '';
        document.getElementById('eventTargetAmount').value = event.targetAmount || '';
        document.getElementById('eventDescription').value = event.description || '';
        
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
            // Simular guardado local
            if (this.currentEvent) {
                // Actualizar evento existente
                const index = this.events.findIndex(e => e.id === this.currentEvent.id);
                eventData.id = this.currentEvent.id;
                this.events[index] = eventData;
            } else {
                // Crear nuevo evento
                eventData.id = Math.max(...this.events.map(e => e.id), 0) + 1;
                this.events.push(eventData);
            }

            this.filteredEvents = [...this.events];
            this.renderEventsList();
            this.updateStats();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
            modal.hide();
            
            this.showNotification(
                this.currentEvent ? 'Evento actualizado correctamente' : 'Evento creado correctamente',
                'success'
            );
            
        } catch (error) {
            console.error('Error saving event:', error);
            this.showNotification('Error al guardar el evento', 'error');
        }
    }   
 async deleteEvent(eventId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return;

        try {
            // Eliminar localmente
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
        
        // Usar jQuery/Bootstrap para mostrar el modal sin problemas de backdrop
        const modalElement = document.getElementById('eventDetailsModal');
        if (modalElement) {
            // Limpiar cualquier instancia previa
            const existingModal = bootstrap.Modal.getInstance(modalElement);
            if (existingModal) {
                existingModal.dispose();
            }
            
            // Crear nueva instancia del modal
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
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

        // Información básica
        document.getElementById('detailEventName').textContent = event.name;
        document.getElementById('detailEventType').innerHTML = `${eventType?.icon || '📅'} ${eventType?.name || 'Desconocido'}`;
        
        const statusBadge = document.getElementById('detailEventStatus');
        statusBadge.className = `badge bg-${this.getStatusColor(event.status)}`;
        statusBadge.textContent = eventStatus?.name || 'Desconocido';
        
        document.getElementById('detailEventDates').textContent = 
            `${this.formatDate(event.startDate)} - ${this.formatDate(event.endDate)}`;
        document.getElementById('detailEventDescription').textContent = event.description || 'Sin descripción';
        
        // Progreso de recaudación
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

        // Generar datos de participantes simulados
        const participantsData = this.generateParticipantsData(event);
        
        // Estadísticas
        document.getElementById('detailEventParticipants').textContent = participantsData.total;
        document.getElementById('detailPaidCount').textContent = participantsData.paid;
        document.getElementById('detailPendingCount').textContent = participantsData.pending;
        document.getElementById('detailCollectionRate').textContent = `${Math.round((participantsData.paid / participantsData.total) * 100) || 0}%`;
        document.getElementById('detailAvgAmount').textContent = this.formatCurrency(participantsData.avgAmount);

        // Participantes por grado
        this.renderParticipantsByGrade(participantsData.byGrade);

        // Información específica según el tipo
        this.renderSpecificEventInfo(event);

        // Últimas transacciones
        this.renderRecentTransactions(event);
    }

    generateParticipantsData(event) {
        const grades = ['6°', '7°', '8°', '9°', '10°', '11°'];
        const courses = ['A', 'B', 'C'];
        const total = event.participants || Math.floor(Math.random() * 200) + 50;
        const paid = Math.floor(total * 0.7); // 70% han pagado
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
                <div class="row">
                    <div class="col-6">
                        <div class="text-center p-2 bg-light rounded">
                            <strong>Precio por boleto</strong>
                            <div class="h5 text-primary mb-0">${this.formatCurrency(event.ticketPrice || 10000)}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="text-center p-2 bg-light rounded">
                            <strong>Boletos vendidos</strong>
                            <div class="h5 text-success mb-0">${event.soldTickets || 0} / ${event.maxTickets || 500}</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (event.type === 'bingo') {
            html = `
                <div class="row">
                    <div class="col-6">
                        <div class="text-center p-2 bg-light rounded">
                            <strong>Precio por cartón</strong>
                            <div class="h5 text-primary mb-0">${this.formatCurrency(event.cardPrice || 5000)}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="text-center p-2 bg-light rounded">
                            <strong>Cartones máximos</strong>
                            <div class="h5 text-info mb-0">${event.maxCards || 200}</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (event.type === 'graduation') {
            html = `
                <div class="text-center p-3 bg-light rounded">
                    <strong>Valor del derecho a grado</strong>
                    <div class="h4 text-primary mb-0">${this.formatCurrency(event.feeAmount || 200000)}</div>
                </div>
            `;
        }

        specificInfo.innerHTML = html;
    }

    renderRecentTransactions(event) {
        const container = document.getElementById('recentTransactions');
        // Generar transacciones simuladas
        const transactions = [
            { student: 'Ana García', amount: 50000, date: '2024-12-15', grade: '11°A' },
            { student: 'Carlos López', amount: 50000, date: '2024-12-14', grade: '10°B' },
            { student: 'María Rodríguez', amount: 25000, date: '2024-12-13', grade: '9°C' },
            { student: 'Juan Pérez', amount: 50000, date: '2024-12-12', grade: '11°A' }
        ];

        const html = transactions.map(tx => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div>
                    <div class="fw-semibold">${tx.student}</div>
                    <small class="text-muted">${tx.grade} - ${tx.date}</small>
                </div>
                <div class="text-success fw-bold">
                    ${this.formatCurrency(tx.amount)}
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<p class="text-muted text-center">No hay transacciones recientes</p>';
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

    // Nuevos métodos para las acciones del modal
    showParticipantsModal() {
        const event = this.events.find(e => e.id === this.currentEventId);
        if (!event) return;

        document.getElementById('participantsEventName').textContent = event.name;
        
        // Generar lista de participantes simulada
        this.currentParticipants = this.generateParticipantsList(event);
        this.renderParticipantsList(this.currentParticipants);
        
        // Mostrar modal de participantes
        const modalElement = document.getElementById('participantsModal');
        if (modalElement) {
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
        }
    }

    generateParticipantsList(event) {
        const names = [
            'Ana García Rodríguez', 'Carlos López Martínez', 'María Rodríguez Silva', 'Juan Pérez González',
            'Laura Martínez López', 'Diego Sánchez Ruiz', 'Sofía González Pérez', 'Andrés Ruiz García',
            'Valentina Silva Martín', 'Santiago Martín López', 'Isabella López Sánchez', 'Mateo García Silva',
            'Camila Pérez Ruiz', 'Nicolás Ruiz González', 'Gabriela Sánchez García', 'Alejandro González López'
        ];
        
        const grades = ['6°A', '6°B', '7°A', '7°B', '8°A', '8°B', '9°A', '9°B', '10°A', '10°B', '11°A', '11°B'];
        const statuses = ['paid', 'pending', 'partial'];
        const participants = [];

        const totalParticipants = event.participants || 80;
        
        for (let i = 0; i < totalParticipants; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const baseAmount = event.feeAmount || event.ticketPrice || event.cardPrice || 50000;
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
                email: `estudiante${i + 1}@colegio.edu.co`
            });
        }

        return participants.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderParticipantsList(participants) {
        const tbody = document.getElementById('participantsTableBody');
        
        const html = participants.map(participant => {
            const statusBadge = this.getParticipantStatusBadge(participant.status);
            const actionButtons = this.getParticipantActionButtons(participant);
            
            return `
                <tr>
                    <td>
                        <div class="fw-semibold">${participant.name}</div>
                        <small class="text-muted">${participant.email}</small>
                    </td>
                    <td><span class="badge bg-secondary">${participant.grade}</span></td>
                    <td>${statusBadge}</td>
                    <td class="fw-bold ${participant.amount > 0 ? 'text-success' : 'text-muted'}">
                        ${participant.amount > 0 ? this.formatCurrency(participant.amount) : '-'}
                    </td>
                    <td class="text-muted">
                        ${participant.paymentDate || '-'}
                    </td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = html;
        this.updateParticipantsSummary(participants);
    }

    getParticipantStatusBadge(status) {
        const badges = {
            'paid': '<span class="badge bg-success">Pagado</span>',
            'pending': '<span class="badge bg-warning">Pendiente</span>',
            'partial': '<span class="badge bg-info">Parcial</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Desconocido</span>';
    }

    getParticipantActionButtons(participant) {
        if (participant.status === 'paid') {
            return `
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary btn-sm" onclick="eventsPage.viewParticipantDetails(${participant.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-info btn-sm" onclick="eventsPage.sendReceipt(${participant.id})" title="Enviar comprobante">
                        <i class="fas fa-receipt"></i>
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-success btn-sm" onclick="eventsPage.recordParticipantPayment(${participant.id})" title="Registrar pago">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-outline-warning btn-sm" onclick="eventsPage.sendReminder(${participant.id})" title="Enviar recordatorio">
                        <i class="fas fa-bell"></i>
                    </button>
                </div>
            `;
        }
    }

    updateParticipantsSummary(participants) {
        const paid = participants.filter(p => p.status === 'paid').length;
        const pending = participants.filter(p => p.status === 'pending').length;
        const total = participants.length;
        const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0);

        document.getElementById('summaryPaid').textContent = paid;
        document.getElementById('summaryPending').textContent = pending;
        document.getElementById('summaryTotal').textContent = total;
        document.getElementById('summaryAmount').textContent = this.formatCurrency(totalAmount);
    }

    // Métodos para acciones de participantes
    viewParticipantDetails(participantId) {
        const participant = this.currentParticipants.find(p => p.id === participantId);
        if (participant) {
            alert(`Detalles de ${participant.name}:\nGrado: ${participant.grade}\nTeléfono: ${participant.phone}\nEmail: ${participant.email}`);
        }
    }

    recordParticipantPayment(participantId) {
        this.showNotification('Funcionalidad de registro de pago en desarrollo', 'info');
    }

    sendReceipt(participantId) {
        this.showNotification('Comprobante enviado correctamente', 'success');
    }

    sendReminder(participantId) {
        this.showNotification('Recordatorio enviado correctamente', 'success');
    }

    exportParticipantsList() {
        if (!this.currentParticipants) return;

        const headers = ['Nombre', 'Grado', 'Estado', 'Monto', 'Fecha Pago', 'Teléfono', 'Email'];
        const rows = this.currentParticipants.map(p => [
            p.name,
            p.grade,
            p.status === 'paid' ? 'Pagado' : p.status === 'pending' ? 'Pendiente' : 'Parcial',
            p.amount,
            p.paymentDate || '',
            p.phone,
            p.email
        ]);

        const csvContent = [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `participantes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Lista de participantes exportada correctamente', 'success');
    }

    sendBulkReminders() {
        const pendingCount = this.currentParticipants?.filter(p => p.status !== 'paid').length || 0;
        this.showNotification(`Recordatorios enviados a ${pendingCount} participantes`, 'success');
    }

    sendReminders(eventId) {
        this.showNotification('Recordatorios enviados correctamente', 'success');
    }

    exportEventReport(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Generar reporte CSV específico del evento
        const csvContent = this.generateEventCSV(event);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_${event.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Reporte exportado correctamente', 'success');
    }

    generateEventCSV(event) {
        const headers = ['Evento', 'Tipo', 'Estado', 'Meta', 'Recaudado', 'Participantes', 'Porcentaje'];
        const progress = event.targetAmount > 0 ? Math.round((event.currentAmount / event.targetAmount) * 100) : 0;
        const eventType = this.eventTypes.find(t => t.id === event.type);
        const eventStatus = this.eventStatuses.find(s => s.id === event.status);
        
        const row = [
            event.name,
            eventType?.name || event.type,
            eventStatus?.name || event.status,
            event.targetAmount,
            event.currentAmount,
            event.participants || 0,
            `${progress}%`
        ];

        return [headers, row].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    editEvent(eventId) {
        this.showEventModal(eventId);
    }

    async recordTransaction(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const modalElement = document.getElementById('transactionModal');
        document.getElementById('transactionEventName').textContent = event.name;
        document.getElementById('transactionEventId').value = eventId;
        
        // Configurar campos según el tipo de evento
        this.setupTransactionForm(event);
        
        // Limpiar instancia previa y crear nueva
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
    }

    setupTransactionForm(event) {
        const amountField = document.getElementById('transactionAmount');
        const descriptionField = document.getElementById('transactionDescription');
        const participantField = document.getElementById('transactionParticipant');

        if (event.type === 'raffle') {
            amountField.value = event.ticketPrice || '';
            descriptionField.value = 'Venta de boleto de rifa';
        } else if (event.type === 'bingo') {
            amountField.value = event.cardPrice || '';
            descriptionField.value = 'Venta de cartón de bingo';
        } else if (event.type === 'graduation') {
            amountField.value = event.feeAmount || '';
            descriptionField.value = 'Pago de derecho a grado';
        } else {
            amountField.value = '';
            descriptionField.value = `Pago para ${event.name}`;
        }
    }

    async handleTransactionSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const transactionData = {
            eventId: parseInt(formData.get('eventId')),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description'),
            participant: formData.get('participant'),
            date: new Date().toISOString()
        };

        try {
            // Procesar transacción localmente
            const event = this.events.find(e => e.id === transactionData.eventId);
            if (event) {
                event.currentAmount += transactionData.amount;
                event.participants = (event.participants || 0) + 1;
                
                if (event.type === 'raffle') {
                    event.soldTickets = (event.soldTickets || 0) + 1;
                }
            }

            this.renderEventsList();
            this.updateStats();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
            modal.hide();
            
            this.showNotification('Transacción registrada correctamente', 'success');
            
        } catch (error) {
            console.error('Error recording transaction:', error);
            this.showNotification('Error al registrar la transacción', 'error');
        }
    }

    manageParticipants(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Aquí se podría abrir un modal para gestionar participantes
        this.showNotification('Funcionalidad de gestión de participantes en desarrollo', 'info');
    }

    filterEvents(searchTerm) {
        this.filteredEvents = this.events.filter(event => 
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderEventsList();
    }

    filterByType(type) {
        if (type === '') {
            this.filteredEvents = [...this.events];
        } else {
            this.filteredEvents = this.events.filter(event => event.type === type);
        }
        this.renderEventsList();
    }

    filterByStatus(status) {
        if (status === '') {
            this.filteredEvents = [...this.events];
        } else {
            this.filteredEvents = this.events.filter(event => event.status === status);
        }
        this.renderEventsList();
    }

    updateStats() {
        const totalEvents = this.events.length;
        const activeEvents = this.events.filter(e => e.status === 'active').length;
        const totalRaised = this.events.reduce((sum, event) => sum + (event.currentAmount || 0), 0);
        const totalTarget = this.events.reduce((sum, event) => sum + (event.targetAmount || 0), 0);
        const totalPending = totalTarget - totalRaised;

        // Calcular porcentajes
        const collectionPercentage = totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0;
        const pendingPercentage = totalTarget > 0 ? Math.round((totalPending / totalTarget) * 100) : 0;

        // Actualizar elementos del DOM
        const totalEventsEl = document.getElementById('totalEvents');
        if (totalEventsEl) totalEventsEl.textContent = totalEvents;

        const activeEventsEl = document.getElementById('activeEvents');
        if (activeEventsEl) activeEventsEl.textContent = activeEvents;

        const totalRaisedEl = document.getElementById('totalRaised');
        if (totalRaisedEl) totalRaisedEl.textContent = this.formatCurrency(totalRaised);

        const totalTargetEl = document.getElementById('totalTarget');
        if (totalTargetEl) totalTargetEl.textContent = this.formatCurrency(totalTarget);

        const totalPendingEl = document.getElementById('totalPending');
        if (totalPendingEl) totalPendingEl.textContent = this.formatCurrency(totalPending);

        // Actualizar porcentajes
        const collectionPercentageEl = document.getElementById('collectionPercentage');
        if (collectionPercentageEl) collectionPercentageEl.textContent = `${collectionPercentage}%`;

        const pendingPercentageEl = document.getElementById('pendingPercentage');
        if (pendingPercentageEl) pendingPercentageEl.textContent = `${pendingPercentage}%`;

        // Actualizar gráfico de progreso general
        const progressBar = document.getElementById('overallProgress');
        if (progressBar) {
            progressBar.style.width = `${collectionPercentage}%`;
            progressBar.setAttribute('aria-valuenow', collectionPercentage);
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

    showSpecificFields(eventType) {
        this.hideSpecificFields();
        
        const fieldsMap = {
            'raffle': 'raffleFields',
            'bingo': 'bingoFields',
            'graduation': 'graduationFields'
        };

        const fieldsId = fieldsMap[eventType];
        if (fieldsId) {
            const fields = document.getElementById(fieldsId);
            if (fields) fields.style.display = 'block';
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
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

    showNotification(message, type = 'info') {
        // Crear notificación toast
        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remover el toast después de que se oculte
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999'; // Aumentar z-index para que esté por encima de todo
        document.body.appendChild(container);
        return container;
    }

    // Método para exportar datos de eventos
    exportEvents() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `eventos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    generateCSV() {
        const headers = ['Nombre', 'Tipo', 'Estado', 'Fecha Inicio', 'Fecha Fin', 'Meta', 'Recaudado', 'Participantes'];
        const rows = this.events.map(event => [
            event.name,
            this.eventTypes.find(t => t.id === event.type)?.name || event.type,
            this.eventStatuses.find(s => s.id === event.status)?.name || event.status,
            event.startDate,
            event.endDate,
            event.targetAmount,
            event.currentAmount,
            event.participants || 0
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }
}

// Inicializar la página cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('eventsContainer')) {
        window.eventsPage = new EventsManagementPage();
    }
});

// Event listeners adicionales para campos dinámicos
document.addEventListener('DOMContentLoaded', () => {
    const eventTypeSelect = document.getElementById('eventType');
    if (eventTypeSelect) {
        eventTypeSelect.addEventListener('change', (e) => {
            if (window.eventsPage) {
                window.eventsPage.showSpecificFields(e.target.value);
            }
        });
    }

    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', (e) => {
            if (window.eventsPage) {
                window.eventsPage.handleTransactionSubmit(e);
            }
        });
    }
});