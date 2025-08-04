// ===================================
// EDUCONTA - Sistema de Eventos Simplificado
// ===================================

console.log('🚀 Cargando sistema de eventos simplificado...');

class EventsManagementPage {
    constructor() {
        console.log('📝 Inicializando EventsManagementPage...');
        
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
        console.log('🔧 Inicializando sistema...');
        
        try {
            this.setupEventListeners();
            await this.loadEvents();
            this.renderEventsList();
            this.updateStats();
            console.log('✅ Sistema inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando:', error);
            this.showNotification('Error al inicializar la página de eventos', 'error');
        }
    }

    setupEventListeners() {
        console.log('🎯 Configurando event listeners...');
        
        const newEventBtn = document.getElementById('newEventBtn');
        if (newEventBtn) {
            newEventBtn.addEventListener('click', () => {
                console.log('🔘 Botón Nuevo Evento clickeado');
                this.showEventModal();
            });
            console.log('✅ Event listener del botón configurado');
        } else {
            console.warn('⚠️ Botón newEventBtn no encontrado');
        }

        // Event listener para el tipo de asignación
        const assignmentType = document.getElementById('assignmentType');
        if (assignmentType) {
            assignmentType.addEventListener('change', (e) => this.handleAssignmentTypeChange(e.target.value));
        }

        // Event listener para el formulario
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));
        }
    }

    showEventModal(eventId = null) {
        console.log('📝 Mostrando modal de evento...');
        
        const modalElement = document.getElementById('eventModal');
        if (!modalElement) {
            console.error('❌ Modal eventModal no encontrado');
            return;
        }

        const modalTitle = document.getElementById('eventModalTitle');
        if (modalTitle) {
            modalTitle.textContent = eventId ? 'Editar Evento' : 'Nuevo Evento';
        }

        // Limpiar formulario
        this.resetEventForm();

        // Mostrar modal
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: true,
            focus: true
        });
        modal.show();
    }

    resetEventForm() {
        const form = document.getElementById('eventForm');
        if (form) {
            form.reset();
        }
        
        // Ocultar todas las secciones de asignación
        this.hideAllAssignmentSections();
    }

    handleAssignmentTypeChange(type) {
        console.log('🎯 Tipo de asignación cambiado:', type);
        
        // Ocultar todas las secciones primero
        this.hideAllAssignmentSections();
        
        // Mostrar la sección correspondiente
        switch(type) {
            case 'grades':
                document.getElementById('gradesSelection').style.display = 'block';
                break;
            case 'courses':
                document.getElementById('coursesSelection').style.display = 'block';
                break;
            case 'custom':
                document.getElementById('customSelection').style.display = 'block';
                break;
            case 'all':
                // No mostrar ninguna sección adicional
                break;
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

    async handleEventSubmit(e) {
        e.preventDefault();
        console.log('💾 Guardando evento...');
        
        const formData = new FormData(e.target);
        
        // Recopilar datos básicos
        const eventData = {
            name: formData.get('name'),
            type: formData.get('type'),
            status: formData.get('status'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            targetAmount: parseFloat(formData.get('targetAmount')) || 0,
            description: formData.get('description'),
            assignmentType: formData.get('assignmentType'),
            estimatedParticipants: parseInt(formData.get('estimatedParticipants')) || 0
        };

        // Recopilar datos de asignación
        if (eventData.assignmentType === 'grades') {
            eventData.selectedGrades = Array.from(formData.getAll('selectedGrades'));
        } else if (eventData.assignmentType === 'courses') {
            eventData.selectedCourses = Array.from(formData.getAll('selectedCourses'));
        } else if (eventData.assignmentType === 'custom') {
            eventData.customParticipants = formData.get('customParticipants');
        }

        try {
            // Agregar a la lista de eventos
            eventData.id = Math.max(...this.events.map(e => e.id), 0) + 1;
            eventData.currentAmount = 0;
            eventData.participants = eventData.estimatedParticipants;
            
            this.events.push(eventData);
            this.filteredEvents = [...this.events];
            
            // Actualizar vista
            this.renderEventsList();
            this.updateStats();
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
            modal.hide();
            
            this.showNotification('Evento creado correctamente', 'success');
            console.log('✅ Evento guardado:', eventData);
            
        } catch (error) {
            console.error('❌ Error guardando evento:', error);
            this.showNotification('Error al guardar el evento', 'error');
        }
    }

    async loadEvents() {
        console.log('📊 Cargando eventos de demostración...');
        
        this.events = [
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
                ticketPrice: 10000,
                maxTickets: 500,
                soldTickets: 250
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
        
        this.filteredEvents = [...this.events];
        console.log(`✅ ${this.events.length} eventos cargados`);
    }

    renderEventsList() {
        console.log('🎨 Renderizando lista de eventos...');
        
        const container = document.getElementById('eventsContainer');
        if (!container) {
            console.error('❌ Contenedor eventsContainer no encontrado');
            return;
        }

        if (this.filteredEvents.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No hay eventos registrados</h5>
                        <p class="text-muted">Comienza creando tu primer evento</p>
                    </div>
                </div>
            `;
            console.log('📝 Mensaje de "sin eventos" mostrado');
            return;
        }

        const eventsHTML = this.filteredEvents.map(event => this.renderEventCard(event)).join('');
        container.innerHTML = eventsHTML;
        console.log(`✅ ${this.filteredEvents.length} eventos renderizados`);
    }

    renderEventCard(event) {
        const eventType = this.eventTypes.find(t => t.id === event.type);
        const eventStatus = this.eventStatuses.find(s => s.id === event.status);
        const progress = event.targetAmount > 0 ? (event.currentAmount / event.targetAmount) * 100 : 0;
        
        // Generar información de asignación
        let assignmentInfo = '';
        if (event.assignmentType === 'all') {
            assignmentInfo = '<i class="fas fa-school me-1"></i> Toda la institución';
        } else if (event.assignmentType === 'grades' && event.selectedGrades) {
            assignmentInfo = `<i class="fas fa-layer-group me-1"></i> Grados: ${event.selectedGrades.join(', ')}°`;
        } else if (event.assignmentType === 'courses' && event.selectedCourses) {
            assignmentInfo = `<i class="fas fa-users me-1"></i> Cursos: ${event.selectedCourses.join(', ')}`;
        } else if (event.assignmentType === 'custom') {
            const customCount = event.customParticipants ? event.customParticipants.split('\n').filter(p => p.trim()).length : 0;
            assignmentInfo = `<i class="fas fa-user-check me-1"></i> ${customCount} participantes específicos`;
        } else {
            assignmentInfo = '<i class="fas fa-question me-1"></i> Sin asignar';
        }
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card event-card-enterprise h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <span class="event-type-icon me-2">${eventType?.icon || '📅'}</span>
                            <span class="badge bg-${this.getStatusColor(event.status)}">
                                ${eventStatus?.name || 'Desconocido'}
                            </span>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                    data-bs-toggle="dropdown" aria-label="Opciones">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#" onclick="eventsPage.viewEvent(${event.id})">
                                    <i class="fas fa-eye me-2"></i> Ver Detalles
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="eventsPage.editEvent(${event.id})">
                                    <i class="fas fa-edit me-2"></i> Editar
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
                        <p class="event-description">${event.description || 'Sin descripción'}</p>
                        
                        <!-- Información de asignación -->
                        <div class="assignment-info mb-3 p-2 bg-light rounded">
                            <small class="text-muted d-block">
                                ${assignmentInfo}
                            </small>
                        </div>
                        
                        <div class="event-dates mb-3">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i> 
                                ${this.formatDate(event.startDate)} - ${this.formatDate(event.endDate)}
                            </small>
                        </div>

                        <div class="progress-container mb-3">
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar bg-success" 
                                     style="width: ${progress}%" 
                                     role="progressbar">
                                </div>
                            </div>
                        </div>
                        
                        <div class="event-amounts">
                            <div>
                                <span class="amount-raised fw-bold text-success">${this.formatCurrency(event.currentAmount)}</span>
                                <span class="amount-target text-muted">/ ${this.formatCurrency(event.targetAmount)}</span>
                            </div>
                            <div class="participants-count text-muted">
                                <i class="fas fa-users me-1"></i>
                                <span>${event.participants || 0}</span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="text-primary fw-semibold">
                                ${Math.round(progress)}% completado
                            </span>
                            <span class="text-muted small">
                                ${this.getDaysRemaining(event.endDate)} días restantes
                            </span>
                        </div>
                    </div>
                    <div class="card-footer bg-light">
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary btn-sm flex-fill" 
                                    onclick="eventsPage.viewEvent(${event.id})">
                                <i class="fas fa-eye me-1"></i> Ver
                            </button>
                            <button class="btn btn-success btn-sm flex-fill" 
                                    onclick="eventsPage.recordTransaction(${event.id})">
                                <i class="fas fa-plus me-1"></i> Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
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

    getDaysRemaining(endDate) {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    updateStats() {
        console.log('📈 Actualizando estadísticas...');
        
        const totalEvents = this.events.length;
        const activeEvents = this.events.filter(e => e.status === 'active').length;
        const totalTarget = this.events.reduce((sum, e) => sum + (e.targetAmount || 0), 0);
        const totalRaised = this.events.reduce((sum, e) => sum + (e.currentAmount || 0), 0);
        const totalPending = totalTarget - totalRaised;
        const collectionPercentage = totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0;
        const pendingPercentage = 100 - collectionPercentage;

        this.updateElement('totalEvents', totalEvents);
        this.updateElement('activeEvents', activeEvents);
        this.updateElement('totalTarget', this.formatCurrency(totalTarget));
        this.updateElement('totalRaised', this.formatCurrency(totalRaised));
        this.updateElement('totalPending', this.formatCurrency(totalPending));
        this.updateElement('collectionPercentage', `${collectionPercentage}%`);
        this.updateElement('pendingPercentage', `${pendingPercentage}%`);

        const progressBar = document.getElementById('overallProgress');
        if (progressBar) {
            progressBar.style.width = `${collectionPercentage}%`;
        }
        
        console.log(`✅ Estadísticas actualizadas: ${totalEvents} eventos, ${collectionPercentage}% completado`);
    }

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`⚠️ Elemento ${elementId} no encontrado`);
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

    viewEvent(eventId) {
        console.log(`👁️ Ver evento ${eventId}`);
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.showEventDetails(event);
        } else {
            this.showNotification('Evento no encontrado', 'error');
        }
    }

    showEventDetails(event) {
        const eventType = this.eventTypes.find(t => t.id === event.type);
        const eventStatus = this.eventStatuses.find(s => s.id === event.status);
        
        let assignmentDetails = '';
        if (event.assignmentType === 'all') {
            assignmentDetails = 'Toda la institución';
        } else if (event.assignmentType === 'grades' && event.selectedGrades) {
            assignmentDetails = `Grados: ${event.selectedGrades.join(', ')}°`;
        } else if (event.assignmentType === 'courses' && event.selectedCourses) {
            assignmentDetails = `Cursos: ${event.selectedCourses.join(', ')}`;
        } else if (event.assignmentType === 'custom') {
            const customCount = event.customParticipants ? event.customParticipants.split('\n').filter(p => p.trim()).length : 0;
            assignmentDetails = `${customCount} participantes específicos`;
        }

        const progress = event.targetAmount > 0 ? Math.round((event.currentAmount / event.targetAmount) * 100) : 0;

        const detailsHTML = `
            <div class="modal fade" id="eventDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                ${eventType?.icon || '📅'} ${event.name}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Información General</h6>
                                    <p><strong>Tipo:</strong> ${eventType?.name || 'Desconocido'}</p>
                                    <p><strong>Estado:</strong> 
                                        <span class="badge bg-${this.getStatusColor(event.status)}">
                                            ${eventStatus?.name || 'Desconocido'}
                                        </span>
                                    </p>
                                    <p><strong>Fechas:</strong> ${this.formatDate(event.startDate)} - ${this.formatDate(event.endDate)}</p>
                                    <p><strong>Descripción:</strong> ${event.description || 'Sin descripción'}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Asignación y Participantes</h6>
                                    <p><strong>Asignado a:</strong> ${assignmentDetails}</p>
                                    <p><strong>Participantes estimados:</strong> ${event.participants || 0}</p>
                                    
                                    <h6 class="mt-3">Progreso de Recaudación</h6>
                                    <div class="progress mb-2" style="height: 10px;">
                                        <div class="progress-bar bg-success" style="width: ${progress}%"></div>
                                    </div>
                                    <p><strong>Recaudado:</strong> ${this.formatCurrency(event.currentAmount)}</p>
                                    <p><strong>Meta:</strong> ${this.formatCurrency(event.targetAmount)}</p>
                                    <p><strong>Progreso:</strong> ${progress}%</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-primary" onclick="eventsPage.editEvent(${event.id})" data-bs-dismiss="modal">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const existingModal = document.getElementById('eventDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar nuevo modal al DOM
        document.body.insertAdjacentHTML('beforeend', detailsHTML);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
        modal.show();
    }

    editEvent(eventId) {
        console.log(`✏️ Editar evento ${eventId}`);
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.currentEvent = event;
            this.showEventModal(eventId);
            this.populateEventForm(event);
        } else {
            this.showNotification('Evento no encontrado', 'error');
        }
    }

    populateEventForm(event) {
        // Llenar campos básicos
        document.getElementById('eventName').value = event.name || '';
        document.getElementById('eventType').value = event.type || '';
        document.getElementById('eventStatus').value = event.status || '';
        document.getElementById('eventStartDate').value = event.startDate || '';
        document.getElementById('eventEndDate').value = event.endDate || '';
        document.getElementById('eventTargetAmount').value = event.targetAmount || '';
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('assignmentType').value = event.assignmentType || '';
        document.getElementById('estimatedParticipants').value = event.participants || '';

        // Manejar asignación
        if (event.assignmentType) {
            this.handleAssignmentTypeChange(event.assignmentType);
            
            if (event.assignmentType === 'grades' && event.selectedGrades) {
                event.selectedGrades.forEach(grade => {
                    const checkbox = document.getElementById(`grade${grade}`);
                    if (checkbox) checkbox.checked = true;
                });
            } else if (event.assignmentType === 'courses' && event.selectedCourses) {
                event.selectedCourses.forEach(course => {
                    const checkbox = document.getElementById(`course${course}`);
                    if (checkbox) checkbox.checked = true;
                });
            } else if (event.assignmentType === 'custom' && event.customParticipants) {
                document.getElementById('customParticipants').value = event.customParticipants;
            }
        }
    }

    deleteEvent(eventId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return;

        console.log(`🗑️ Eliminar evento ${eventId}`);
        
        try {
            this.events = this.events.filter(e => e.id !== eventId);
            this.filteredEvents = this.filteredEvents.filter(e => e.id !== eventId);
            
            this.renderEventsList();
            this.updateStats();
            this.showNotification('Evento eliminado correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error eliminando evento:', error);
            this.showNotification('Error al eliminar el evento', 'error');
        }
    }

    recordTransaction(eventId) {
        console.log(`💰 Registrar transacción para evento ${eventId}`);
        this.showNotification(`Registrando pago para evento ${eventId}`, 'info');
    }

    showNotification(message, type = 'info') {
        console.log(`🔔 Notificación (${type}): ${message}`);
        
        // Crear contenedor si no existe
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
        if (typeof bootstrap !== 'undefined') {
            const toast = new bootstrap.Toast(notification, {
                autohide: true,
                delay: 3000
            });
            toast.show();

            notification.addEventListener('hidden.bs.toast', () => {
                notification.remove();
            });
        } else {
            // Fallback si Bootstrap no está disponible
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM listo, inicializando EventsManagementPage...');
    
    try {
        window.eventsPage = new EventsManagementPage();
        console.log('✅ EventsManagementPage inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando EventsManagementPage:', error);
    }
});

console.log('📦 Archivo events-page-simple.js cargado completamente');