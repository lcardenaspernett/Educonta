// ===================================
// EDUCONTA - Acciones de Estudiantes (Versión Corregida)
// ===================================

class StudentActions {
    constructor() {
        this.currentStudent = null;
        console.log('🎯 Inicializando sistema de acciones de estudiantes...');
        this.init();
    }

    init() {
        this.createModals();
        this.setupEventListeners();
        console.log('✅ Sistema de acciones inicializado');
    }

    createModals() {
        this.createViewModal();
        this.createEditModal();
        this.createEventsModal();
        this.createAccountModal();
    }

    createViewModal() {
        const modalHTML = `
            <div id="viewStudentModal" class="modal-overlay" style="display: none;">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>👤 Detalles del Estudiante</h2>
                        <button class="modal-close" onclick="window.studentActions.closeModal('viewStudentModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="student-profile">
                            <div class="profile-avatar" id="viewStudentAvatar"></div>
                            <div class="profile-info">
                                <h3 id="viewStudentName"></h3>
                                <p id="viewStudentGrade"></p>
                            </div>
                        </div>
                        
                        <div class="details-grid">
                            <div class="detail-section">
                                <h4>📋 Información Personal</h4>
                                <div class="detail-item">
                                    <label>Documento:</label>
                                    <span id="viewStudentDocument"></span>
                                </div>
                                <div class="detail-item">
                                    <label>Email:</label>
                                    <span id="viewStudentEmail"></span>
                                </div>
                                <div class="detail-item">
                                    <label>Teléfono:</label>
                                    <span id="viewStudentPhone"></span>
                                </div>
                                <div class="detail-item">
                                    <label>Dirección:</label>
                                    <span id="viewStudentAddress"></span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>👨‍👩‍👧‍👦 Información del Acudiente</h4>
                                <div class="detail-item">
                                    <label>Nombre:</label>
                                    <span id="viewGuardianName"></span>
                                </div>
                                <div class="detail-item">
                                    <label>Teléfono:</label>
                                    <span id="viewGuardianPhone"></span>
                                </div>
                                <div class="detail-item">
                                    <label>Email:</label>
                                    <span id="viewGuardianEmail"></span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>💰 Información Financiera</h4>
                                <div class="detail-item">
                                    <label>Total Pagado:</label>
                                    <span id="viewTotalPaid" class="amount-positive"></span>
                                </div>
                                <div class="detail-item">
                                    <label>Deuda Pendiente:</label>
                                    <span id="viewTotalDebt" class="amount-negative"></span>
                                </div>
                                <div class="detail-item">
                                    <label>Estado:</label>
                                    <span id="viewPaymentStatus"></span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>🎯 Eventos Asignados</h4>
                                <div id="viewStudentEvents"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.studentActions.closeModal('viewStudentModal')">Cerrar</button>
                        <button class="btn btn-primary" onclick="window.studentActions.editStudent(window.studentActions.currentStudent?.id)">✏️ Editar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    createEditModal() {
        const modalHTML = `
            <div id="editStudentModal" class="modal-overlay" style="display: none;">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>✏️ Editar Estudiante</h2>
                        <button class="modal-close" onclick="window.studentActions.closeModal('editStudentModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editStudentForm" class="student-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="editFirstName">Nombres *</label>
                                    <input type="text" id="editFirstName" required>
                                </div>
                                <div class="form-group">
                                    <label for="editLastName">Apellidos *</label>
                                    <input type="text" id="editLastName" required>
                                </div>
                                <div class="form-group">
                                    <label for="editDocumentType">Tipo Documento</label>
                                    <select id="editDocumentType">
                                        <option value="TI">Tarjeta de Identidad</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                        <option value="PP">Pasaporte</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editDocument">Número Documento *</label>
                                    <input type="text" id="editDocument" required>
                                </div>
                                <div class="form-group">
                                    <label for="editGrade">Grado *</label>
                                    <select id="editGrade" required>
                                        <option value="">Seleccionar grado</option>
                                        <option value="6">6° (Sexto)</option>
                                        <option value="7">7° (Séptimo)</option>
                                        <option value="8">8° (Octavo)</option>
                                        <option value="9">9° (Noveno)</option>
                                        <option value="10">10° (Décimo)</option>
                                        <option value="11">11° (Undécimo)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editCourse">Curso *</label>
                                    <select id="editCourse" required>
                                        <option value="">Seleccionar curso</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editEmail">Email</label>
                                    <input type="email" id="editEmail">
                                </div>
                                <div class="form-group">
                                    <label for="editPhone">Teléfono</label>
                                    <input type="tel" id="editPhone">
                                </div>
                                <div class="form-group full-width">
                                    <label for="editAddress">Dirección</label>
                                    <input type="text" id="editAddress">
                                </div>
                            </div>
                            
                            <h4>👨‍👩‍👧‍👦 Información del Acudiente</h4>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="editGuardianName">Nombre del Acudiente</label>
                                    <input type="text" id="editGuardianName">
                                </div>
                                <div class="form-group">
                                    <label for="editGuardianPhone">Teléfono del Acudiente</label>
                                    <input type="tel" id="editGuardianPhone">
                                </div>
                                <div class="form-group">
                                    <label for="editGuardianEmail">Email del Acudiente</label>
                                    <input type="email" id="editGuardianEmail">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.studentActions.closeModal('editStudentModal')">Cancelar</button>
                        <button class="btn btn-primary" onclick="window.studentActions.saveStudent()">💾 Guardar Cambios</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    createEventsModal() {
        const modalHTML = `
            <div id="eventsStudentModal" class="modal-overlay" style="display: none;">
                <div class="modal-container large">
                    <div class="modal-header">
                        <h2>🎯 Eventos del Estudiante</h2>
                        <button class="modal-close" onclick="window.studentActions.closeModal('eventsStudentModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="student-summary">
                            <div class="summary-avatar" id="eventsStudentAvatar"></div>
                            <div class="summary-info">
                                <h3 id="eventsStudentName"></h3>
                                <p id="eventsStudentGrade"></p>
                            </div>
                        </div>
                        
                        <div class="events-tabs">
                            <button class="tab-btn active" onclick="window.studentActions.switchEventsTab('assigned')">📋 Eventos Asignados</button>
                            <button class="tab-btn" onclick="window.studentActions.switchEventsTab('available')">➕ Eventos Disponibles</button>
                            <button class="tab-btn" onclick="window.studentActions.switchEventsTab('history')">📊 Historial</button>
                        </div>
                        
                        <div class="events-content">
                            <div id="assignedEventsTab" class="tab-content active">
                                <div id="assignedEventsList"></div>
                            </div>
                            <div id="availableEventsTab" class="tab-content">
                                <div id="availableEventsList"></div>
                            </div>
                            <div id="historyEventsTab" class="tab-content">
                                <div id="historyEventsList"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.studentActions.closeModal('eventsStudentModal')">Cerrar</button>
                        <button class="btn btn-success" onclick="window.studentActions.assignNewEvent()">➕ Asignar Evento</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    createAccountModal() {
        const modalHTML = `
            <div id="accountStudentModal" class="modal-overlay" style="display: none;">
                <div class="modal-container large">
                    <div class="modal-header">
                        <h2>💰 Estado de Cuenta</h2>
                        <button class="modal-close" onclick="window.studentActions.closeModal('accountStudentModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="account-summary">
                            <div class="summary-avatar" id="accountStudentAvatar"></div>
                            <div class="summary-info">
                                <h3 id="accountStudentName"></h3>
                                <p id="accountStudentGrade"></p>
                            </div>
                            <div class="account-totals">
                                <div class="total-item positive">
                                    <label>Total Pagado:</label>
                                    <span id="accountTotalPaid">$0</span>
                                </div>
                                <div class="total-item negative">
                                    <label>Deuda Pendiente:</label>
                                    <span id="accountTotalDebt">$0</span>
                                </div>
                                <div class="total-item balance">
                                    <label>Balance:</label>
                                    <span id="accountBalance">$0</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="account-tabs">
                            <button class="tab-btn active" onclick="window.studentActions.switchAccountTab('movements')">📊 Movimientos</button>
                            <button class="tab-btn" onclick="window.studentActions.switchAccountTab('payments')">💳 Pagos</button>
                            <button class="tab-btn" onclick="window.studentActions.switchAccountTab('debts')">⚠️ Deudas</button>
                        </div>
                        
                        <div class="account-content">
                            <div id="movementsAccountTab" class="tab-content active">
                                <div id="movementsList"></div>
                            </div>
                            <div id="paymentsAccountTab" class="tab-content">
                                <div id="paymentsList"></div>
                            </div>
                            <div id="debtsAccountTab" class="tab-content">
                                <div id="debtsList"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.studentActions.closeModal('accountStudentModal')">Cerrar</button>
                        <button class="btn btn-success" onclick="window.studentActions.registerPayment()">💳 Registrar Pago</button>
                        <button class="btn btn-primary" onclick="window.studentActions.generateStatement()">📄 Generar Estado de Cuenta</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupEventListeners() {
        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target.id);
            }
        });

        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-overlay[style*="block"]');
                if (openModal) {
                    this.closeModal(openModal.id);
                }
            }
        });
    }

    // Funciones principales de acción
    viewStudent(studentId) {
        console.log('👁️ Viendo detalles del estudiante:', studentId);
        
        const student = this.findStudent(studentId);
        if (!student) {
            this.showAlert('Estudiante no encontrado', 'error');
            return;
        }

        this.currentStudent = student;
        this.populateViewModal(student);
        this.showModal('viewStudentModal');
    }

    editStudent(studentId) {
        console.log('✏️ Editando estudiante:', studentId);
        
        const student = this.findStudent(studentId);
        if (!student) {
            this.showAlert('Estudiante no encontrado', 'error');
            return;
        }

        this.currentStudent = student;
        this.populateEditModal(student);
        this.showModal('editStudentModal');
    }

    viewStudentEvents(studentId) {
        console.log('📅 Viendo eventos del estudiante:', studentId);
        
        const student = this.findStudent(studentId);
        if (!student) {
            this.showAlert('Estudiante no encontrado', 'error');
            return;
        }

        this.currentStudent = student;
        this.populateEventsModal(student);
        this.showModal('eventsStudentModal');
    }

    viewStudentAccount(studentId) {
        console.log('💰 Viendo estado de cuenta del estudiante:', studentId);
        
        const student = this.findStudent(studentId);
        if (!student) {
            this.showAlert('Estudiante no encontrado', 'error');
            return;
        }

        this.currentStudent = student;
        this.populateAccountModal(student);
        this.showModal('accountStudentModal');
    }

    // Funciones auxiliares
    findStudent(studentId) {
        // Buscar en studentsPage primero
        if (window.studentsPage && window.studentsPage.students) {
            const student = window.studentsPage.students.find(s => s.id === studentId);
            if (student) {
                console.log('✅ Estudiante encontrado en studentsPage:', student.fullName);
                return student;
            }
        }
        
        // Buscar en STUDENTS_DATA como fallback
        if (window.STUDENTS_DATA && Array.isArray(window.STUDENTS_DATA)) {
            const student = window.STUDENTS_DATA.find(s => s.id === studentId);
            if (student) {
                console.log('✅ Estudiante encontrado en STUDENTS_DATA:', student.fullName);
                return student;
            }
        }
        
        console.error('❌ Estudiante no encontrado con ID:', studentId);
        return null;
    }

    populateViewModal(student) {
        document.getElementById('viewStudentAvatar').textContent = 
            student.firstName.charAt(0) + student.lastName.charAt(0);
        document.getElementById('viewStudentName').textContent = student.fullName;
        document.getElementById('viewStudentGrade').textContent = `${student.grade}° - Curso ${student.course}`;
        document.getElementById('viewStudentDocument').textContent = `${student.documentType}: ${student.document}`;
        document.getElementById('viewStudentEmail').textContent = student.email;
        document.getElementById('viewStudentPhone').textContent = student.phone;
        document.getElementById('viewStudentAddress').textContent = student.address;
        
        document.getElementById('viewGuardianName').textContent = student.guardian?.name || 'No especificado';
        document.getElementById('viewGuardianPhone').textContent = student.guardian?.phone || 'No especificado';
        document.getElementById('viewGuardianEmail').textContent = student.guardian?.email || 'No especificado';
        
        document.getElementById('viewTotalPaid').textContent = `$${(student.totalPaid || 0).toLocaleString()}`;
        document.getElementById('viewTotalDebt').textContent = `$${(student.totalDebt || 0).toLocaleString()}`;
        
        const paymentStatus = (student.totalDebt || 0) === 0 ? 'Al día' : 'Con deuda pendiente';
        document.getElementById('viewPaymentStatus').textContent = paymentStatus;
        
        // Mostrar eventos
        const eventsContainer = document.getElementById('viewStudentEvents');
        if (student.events && student.events.length > 0) {
            eventsContainer.innerHTML = student.events.map(event => `
                <div class="event-item">
                    <span class="event-name">${event.eventName}</span>
                    <span class="event-status ${event.status.toLowerCase()}">${event.status}</span>
                </div>
            `).join('');
        } else {
            eventsContainer.innerHTML = '<p class="no-events">No hay eventos asignados</p>';
        }
    }

    populateEditModal(student) {
        document.getElementById('editFirstName').value = student.firstName || '';
        document.getElementById('editLastName').value = student.lastName || '';
        document.getElementById('editDocumentType').value = student.documentType || 'TI';
        document.getElementById('editDocument').value = student.document || '';
        document.getElementById('editGrade').value = student.grade || '';
        document.getElementById('editEmail').value = student.email || '';
        document.getElementById('editPhone').value = student.phone || '';
        document.getElementById('editAddress').value = student.address || '';
        
        document.getElementById('editGuardianName').value = student.guardian?.name || '';
        document.getElementById('editGuardianPhone').value = student.guardian?.phone || '';
        document.getElementById('editGuardianEmail').value = student.guardian?.email || '';
        
        // Cargar cursos dinámicamente
        this.loadCoursesInEditModal();
        
        // Establecer valor después de cargar las opciones
        setTimeout(() => {
            document.getElementById('editCourse').value = student.course || '';
        }, 100);
    }

    loadCoursesInEditModal() {
        const courseSelect = document.getElementById('editCourse');
        if (!courseSelect) return;
        
        // Limpiar opciones existentes excepto la primera
        courseSelect.innerHTML = '<option value="">Seleccionar curso</option>';
        
        // Cargar desde configuración de filtros si está disponible
        if (window.FILTER_CONFIG && window.FILTER_CONFIG.courses) {
            window.FILTER_CONFIG.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.value;
                option.textContent = course.label;
                courseSelect.appendChild(option);
            });
            console.log('✅ Cursos cargados en modal de edición desde configuración');
            return;
        }
        
        // Fallback: extraer desde datos de estudiantes
        if (window.studentsPage && window.studentsPage.students) {
            const uniqueCourses = [...new Set(window.studentsPage.students.map(s => s.course))].filter(Boolean).sort();
            uniqueCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course;
                option.textContent = `Curso ${course}`;
                courseSelect.appendChild(option);
            });
            console.log('✅ Cursos cargados en modal de edición desde datos');
            return;
        }
        
        // Fallback final: cursos por defecto
        const defaultCourses = ['01', '02', '03', '04', '05', '06', '07'];
        defaultCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = `Curso ${course}`;
            courseSelect.appendChild(option);
        });
        console.log('✅ Cursos por defecto cargados en modal de edición');
    }

    populateEventsModal(student) {
        document.getElementById('eventsStudentAvatar').textContent = 
            student.firstName.charAt(0) + student.lastName.charAt(0);
        document.getElementById('eventsStudentName').textContent = student.fullName;
        document.getElementById('eventsStudentGrade').textContent = `${student.grade}° - Curso ${student.course}`;
        
        // Cargar eventos asignados
        this.loadAssignedEvents(student);
        this.loadAvailableEvents(student);
        this.loadEventsHistory(student);
    }

    populateAccountModal(student) {
        document.getElementById('accountStudentAvatar').textContent = 
            student.firstName.charAt(0) + student.lastName.charAt(0);
        document.getElementById('accountStudentName').textContent = student.fullName;
        document.getElementById('accountStudentGrade').textContent = `${student.grade}° - Curso ${student.course}`;
        
        const totalPaid = student.totalPaid || 0;
        const totalDebt = student.totalDebt || 0;
        const balance = totalPaid - totalDebt;
        
        document.getElementById('accountTotalPaid').textContent = `$${totalPaid.toLocaleString()}`;
        document.getElementById('accountTotalDebt').textContent = `$${totalDebt.toLocaleString()}`;
        document.getElementById('accountBalance').textContent = `$${balance.toLocaleString()}`;
        
        // Cargar movimientos, pagos y deudas
        this.loadMovements(student);
        this.loadPayments(student);
        this.loadDebts(student);
    }

    // Funciones de carga de datos
    loadAssignedEvents(student) {
        const container = document.getElementById('assignedEventsList');
        if (student.events && student.events.length > 0) {
            container.innerHTML = student.events.map(event => `
                <div class="event-card">
                    <div class="event-info">
                        <h4>${event.eventName}</h4>
                        <p>Monto: $${(event.amount || 0).toLocaleString()}</p>
                        <p>Pagado: $${(event.paid || 0).toLocaleString()}</p>
                    </div>
                    <div class="event-status">
                        <span class="status-badge ${event.status.toLowerCase()}">${event.status}</span>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-sm btn-primary" onclick="window.studentActions.manageEventPayment('${event.eventId}')">
                            💳 Gestionar Pago
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-state"><p>No hay eventos asignados</p></div>';
        }
    }

    async loadAvailableEvents(student) {
        const container = document.getElementById('availableEventsList');
        
        try {
            // Intentar cargar eventos reales desde la API
            const institutionId = localStorage.getItem('institutionId') || 'cmdt7n66m00003t1jy17ay313';
            const response = await fetch(`/api/events/${institutionId}`);
            
            let availableEvents = [];
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.events) {
                    availableEvents = data.events.filter(event => 
                        event.status === 'ACTIVE' && 
                        (!event.targetGrades || event.targetGrades.includes(student.grade))
                    );
                    console.log('✅ Eventos cargados desde API:', availableEvents.length);
                }
            } else {
                console.log('⚠️ API de eventos no disponible, usando eventos por defecto');
            }
            
            // Fallback: eventos por defecto si no hay API
            if (availableEvents.length === 0) {
                availableEvents = [
                    { 
                        id: 'event1', 
                        name: 'Derecho de Grado 2025', 
                        amount: 150000, 
                        targetGrades: ['11'],
                        description: 'Pago obligatorio para estudiantes de grado 11'
                    },
                    { 
                        id: 'event2', 
                        name: 'Rifa Navideña', 
                        amount: 50000, 
                        targetGrades: ['6', '7', '8', '9', '10', '11'],
                        description: 'Rifa benéfica de fin de año'
                    },
                    { 
                        id: 'event3', 
                        name: 'Bingo Familiar', 
                        amount: 30000, 
                        targetGrades: ['6', '7', '8', '9', '10', '11'],
                        description: 'Actividad recreativa familiar'
                    },
                    { 
                        id: 'event4', 
                        name: 'Salida Pedagógica', 
                        amount: 80000, 
                        targetGrades: ['8', '9', '10'],
                        description: 'Visita educativa a museos y centros culturales'
                    },
                    { 
                        id: 'event5', 
                        name: 'Material Didáctico', 
                        amount: 45000, 
                        targetGrades: ['6', '7', '8', '9', '10', '11'],
                        description: 'Compra de material educativo especializado'
                    }
                ];
            }
            
            // Filtrar eventos elegibles para el grado del estudiante
            const eligibleEvents = availableEvents.filter(event => 
                !event.targetGrades || event.targetGrades.includes(student.grade)
            );
            
            // Filtrar eventos que el estudiante ya tiene asignados
            const assignedEventIds = (student.events || []).map(e => e.eventId);
            const unassignedEvents = eligibleEvents.filter(event => 
                !assignedEventIds.includes(event.id)
            );
            
            if (unassignedEvents.length > 0) {
                container.innerHTML = unassignedEvents.map(event => `
                    <div class="event-card available">
                        <div class="event-info">
                            <h4>${event.name}</h4>
                            <p class="event-description">${event.description || 'Sin descripción'}</p>
                            <p class="event-amount">Monto: <strong>$${event.amount.toLocaleString()}</strong></p>
                            <p class="event-target">Dirigido a: ${event.targetGrades ? event.targetGrades.map(g => g + '°').join(', ') : 'Todos los grados'}</p>
                        </div>
                        <div class="event-actions">
                            <button class="btn btn-sm btn-success" onclick="window.studentActions.assignEvent('${event.id}', '${event.name}', ${event.amount})">
                                ➕ Asignar Evento
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="empty-state"><p>No hay eventos disponibles para asignar a este estudiante</p></div>';
            }
            
        } catch (error) {
            console.error('❌ Error cargando eventos disponibles:', error);
            container.innerHTML = '<div class="empty-state error"><p>Error cargando eventos disponibles</p></div>';
        }
    }

    loadEventsHistory(student) {
        const container = document.getElementById('historyEventsList');
        container.innerHTML = '<div class="empty-state"><p>Historial de eventos en desarrollo</p></div>';
    }

    loadMovements(student) {
        const container = document.getElementById('movementsList');
        
        // Generar movimientos basados en eventos y pagos
        const movements = [];
        
        // Agregar movimientos de eventos asignados
        if (student.events && student.events.length > 0) {
            student.events.forEach(event => {
                // Movimiento de asignación de evento (débito)
                movements.push({
                    id: `assign-${event.eventId}`,
                    date: event.assignedDate || new Date().toISOString(),
                    type: 'DEBIT',
                    description: `Asignación: ${event.eventName}`,
                    amount: event.amount,
                    balance: 0, // Se calculará después
                    reference: event.eventId,
                    status: 'CONFIRMED'
                });
                
                // Movimientos de pagos (créditos)
                if (event.paid > 0) {
                    const paymentDate = event.paymentDate || new Date().toISOString();
                    movements.push({
                        id: `payment-${event.eventId}`,
                        date: paymentDate,
                        type: 'CREDIT',
                        description: `Pago: ${event.eventName}`,
                        amount: event.paid,
                        balance: 0, // Se calculará después
                        reference: event.eventId,
                        status: 'CONFIRMED'
                    });
                }
            });
        }
        
        // Ordenar por fecha (más reciente primero)
        movements.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calcular balance acumulado
        let runningBalance = 0;
        movements.reverse().forEach(movement => {
            if (movement.type === 'DEBIT') {
                runningBalance += movement.amount;
            } else {
                runningBalance -= movement.amount;
            }
            movement.balance = runningBalance;
        });
        movements.reverse(); // Volver al orden original (más reciente primero)
        
        if (movements.length > 0) {
            container.innerHTML = `
                <div class="movements-table">
                    <div class="table-header">
                        <div class="header-cell">Fecha</div>
                        <div class="header-cell">Descripción</div>
                        <div class="header-cell">Débito</div>
                        <div class="header-cell">Crédito</div>
                        <div class="header-cell">Balance</div>
                    </div>
                    ${movements.map(movement => `
                        <div class="table-row">
                            <div class="table-cell">
                                <span class="movement-date">${new Date(movement.date).toLocaleDateString()}</span>
                                <span class="movement-time">${new Date(movement.date).toLocaleTimeString()}</span>
                            </div>
                            <div class="table-cell">
                                <span class="movement-description">${movement.description}</span>
                                <span class="movement-reference">Ref: ${movement.reference}</span>
                            </div>
                            <div class="table-cell">
                                ${movement.type === 'DEBIT' ? `<span class="amount debit">$${movement.amount.toLocaleString()}</span>` : '-'}
                            </div>
                            <div class="table-cell">
                                ${movement.type === 'CREDIT' ? `<span class="amount credit">$${movement.amount.toLocaleString()}</span>` : '-'}
                            </div>
                            <div class="table-cell">
                                <span class="balance ${movement.balance > 0 ? 'negative' : 'positive'}">$${movement.balance.toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<div class="empty-state"><p>No hay movimientos registrados</p></div>';
        }
    }

    loadPayments(student) {
        const container = document.getElementById('paymentsList');
        
        // Extraer pagos de los eventos
        const payments = [];
        
        if (student.events && student.events.length > 0) {
            student.events.forEach(event => {
                if (event.paid > 0) {
                    payments.push({
                        id: `payment-${event.eventId}`,
                        eventName: event.eventName,
                        eventId: event.eventId,
                        amount: event.paid,
                        date: event.paymentDate || new Date().toISOString(),
                        method: 'Efectivo', // Por defecto
                        reference: `PAY-${event.eventId}`,
                        status: event.status === 'PAID' ? 'COMPLETED' : 'PARTIAL'
                    });
                }
            });
        }
        
        // Ordenar por fecha (más reciente primero)
        payments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (payments.length > 0) {
            container.innerHTML = `
                <div class="payments-list">
                    ${payments.map(payment => `
                        <div class="payment-card">
                            <div class="payment-header">
                                <div class="payment-event">
                                    <h4>${payment.eventName}</h4>
                                    <span class="payment-reference">${payment.reference}</span>
                                </div>
                                <div class="payment-amount">
                                    <span class="amount-value">$${payment.amount.toLocaleString()}</span>
                                    <span class="payment-status ${payment.status.toLowerCase()}">${payment.status}</span>
                                </div>
                            </div>
                            <div class="payment-details">
                                <div class="payment-info">
                                    <span class="info-label">Fecha:</span>
                                    <span class="info-value">${new Date(payment.date).toLocaleDateString()}</span>
                                </div>
                                <div class="payment-info">
                                    <span class="info-label">Método:</span>
                                    <span class="info-value">${payment.method}</span>
                                </div>
                            </div>
                            <div class="payment-actions">
                                <button class="btn btn-sm btn-outline" onclick="window.studentActions.viewPaymentReceipt('${payment.id}')">
                                    📄 Ver Recibo
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="window.studentActions.addPaymentToEvent('${payment.eventId}')">
                                    💳 Agregar Pago
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No hay pagos registrados</p>
                    <button class="btn btn-primary" onclick="window.studentActions.registerPayment()">
                        💳 Registrar Primer Pago
                    </button>
                </div>
            `;
        }
    }

    loadDebts(student) {
        const container = document.getElementById('debtsList');
        
        // Extraer deudas de los eventos
        const debts = [];
        
        if (student.events && student.events.length > 0) {
            student.events.forEach(event => {
                const pendingAmount = event.amount - (event.paid || 0);
                if (pendingAmount > 0) {
                    debts.push({
                        id: event.eventId,
                        eventName: event.eventName,
                        totalAmount: event.amount,
                        paidAmount: event.paid || 0,
                        pendingAmount: pendingAmount,
                        assignedDate: event.assignedDate || new Date().toISOString(),
                        dueDate: this.calculateDueDate(event.assignedDate),
                        status: event.status,
                        priority: this.calculatePriority(event.assignedDate, pendingAmount)
                    });
                }
            });
        }
        
        // Ordenar por prioridad (más urgente primero)
        debts.sort((a, b) => b.priority - a.priority);
        
        if (debts.length > 0) {
            const totalDebt = debts.reduce((sum, debt) => sum + debt.pendingAmount, 0);
            
            container.innerHTML = `
                <div class="debts-summary">
                    <div class="summary-card">
                        <h4>Resumen de Deudas</h4>
                        <div class="summary-stats">
                            <div class="stat-item">
                                <span class="stat-label">Total Adeudado:</span>
                                <span class="stat-value debt">$${totalDebt.toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Eventos Pendientes:</span>
                                <span class="stat-value">${debts.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="debts-list">
                    ${debts.map(debt => `
                        <div class="debt-card priority-${debt.priority}">
                            <div class="debt-header">
                                <div class="debt-event">
                                    <h4>${debt.eventName}</h4>
                                    <span class="debt-status ${debt.status.toLowerCase()}">${debt.status}</span>
                                </div>
                                <div class="debt-amount">
                                    <span class="pending-amount">$${debt.pendingAmount.toLocaleString()}</span>
                                    <span class="total-amount">de $${debt.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div class="debt-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${(debt.paidAmount / debt.totalAmount) * 100}%"></div>
                                </div>
                                <span class="progress-text">${Math.round((debt.paidAmount / debt.totalAmount) * 100)}% pagado</span>
                            </div>
                            
                            <div class="debt-details">
                                <div class="debt-info">
                                    <span class="info-label">Fecha Asignación:</span>
                                    <span class="info-value">${new Date(debt.assignedDate).toLocaleDateString()}</span>
                                </div>
                                <div class="debt-info">
                                    <span class="info-label">Fecha Límite:</span>
                                    <span class="info-value ${this.isOverdue(debt.dueDate) ? 'overdue' : ''}">${new Date(debt.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div class="debt-actions">
                                <button class="btn btn-sm btn-success" onclick="window.studentActions.payDebt('${debt.id}', ${debt.pendingAmount})">
                                    💳 Pagar Completo
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="window.studentActions.partialPayDebt('${debt.id}')">
                                    💰 Pago Parcial
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="window.studentActions.schedulePayment('${debt.id}')">
                                    📅 Programar Pago
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state success">
                    <div class="success-icon">✅</div>
                    <h3>¡Excelente!</h3>
                    <p>Este estudiante no tiene deudas pendientes</p>
                    <p class="success-message">Todos los eventos asignados han sido pagados completamente</p>
                </div>
            `;
        }
    }
    
    // Funciones auxiliares para el estado de cuenta
    calculateDueDate(assignedDate) {
        const assigned = new Date(assignedDate);
        const dueDate = new Date(assigned);
        dueDate.setMonth(dueDate.getMonth() + 1); // 1 mes para pagar
        return dueDate.toISOString();
    }
    
    calculatePriority(assignedDate, amount) {
        const now = new Date();
        const assigned = new Date(assignedDate);
        const daysSinceAssigned = Math.floor((now - assigned) / (1000 * 60 * 60 * 24));
        
        // Prioridad basada en días transcurridos y monto
        let priority = 1;
        if (daysSinceAssigned > 30) priority += 2;
        if (daysSinceAssigned > 60) priority += 2;
        if (amount > 100000) priority += 1;
        
        return priority;
    }
    
    isOverdue(dueDate) {
        return new Date() > new Date(dueDate);
    }

    // Funciones de modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log('✅ Modal abierto:', modalId);
        } else {
            console.error('❌ Modal no encontrado:', modalId);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            console.log('✅ Modal cerrado:', modalId);
        }
        this.currentStudent = null;
    }

    // Funciones de tabs
    switchEventsTab(tabName) {
        // Remover clase active de todos los tabs
        document.querySelectorAll('#eventsStudentModal .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('#eventsStudentModal .tab-content').forEach(content => content.classList.remove('active'));
        
        // Activar tab seleccionado
        event.target.classList.add('active');
        document.getElementById(`${tabName}EventsTab`).classList.add('active');
    }

    switchAccountTab(tabName) {
        // Remover clase active de todos los tabs
        document.querySelectorAll('#accountStudentModal .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('#accountStudentModal .tab-content').forEach(content => content.classList.remove('active'));
        
        // Activar tab seleccionado
        event.target.classList.add('active');
        document.getElementById(`${tabName}AccountTab`).classList.add('active');
    }

    // Funciones de acción
    async saveStudent() {
        console.log('💾 Guardando cambios del estudiante...');
        
        if (!this.currentStudent) {
            this.showAlert('No hay estudiante seleccionado', 'error');
            return;
        }
        
        // Obtener datos del formulario
        const formData = {
            firstName: document.getElementById('editFirstName').value.trim(),
            lastName: document.getElementById('editLastName').value.trim(),
            documentType: document.getElementById('editDocumentType').value,
            document: document.getElementById('editDocument').value.trim(),
            grade: document.getElementById('editGrade').value,
            course: document.getElementById('editCourse').value,
            email: document.getElementById('editEmail').value.trim(),
            phone: document.getElementById('editPhone').value.trim(),
            address: document.getElementById('editAddress').value.trim(),
            guardian: {
                name: document.getElementById('editGuardianName').value.trim(),
                phone: document.getElementById('editGuardianPhone').value.trim(),
                email: document.getElementById('editGuardianEmail').value.trim()
            }
        };
        
        // Validar campos obligatorios
        if (!formData.firstName || !formData.lastName || !formData.document || !formData.grade || !formData.course) {
            this.showAlert('Por favor complete todos los campos obligatorios', 'error');
            return;
        }
        
        // Mostrar loading
        this.showLoading('Guardando cambios...');
        
        try {
            // Mapear datos del frontend al formato esperado por el backend
            const backendData = {
                nombre: formData.firstName,
                apellido: formData.lastName,
                documento: formData.document,
                email: formData.email,
                telefono: formData.phone,
                grado: formData.grade,
                curso: formData.course,
                direccion: formData.address,
                acudienteNombre: formData.guardian.name,
                acudienteTelefono: formData.guardian.phone,
                acudienteEmail: formData.guardian.email
            };
            
            console.log('📤 Enviando datos al backend:', backendData);
            
            // Intentar guardar en la API
            const response = await fetch(`/api/students/student/${this.currentStudent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(backendData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Estudiante guardado en API exitosamente:', result);
                
                // Actualizar también el archivo de datos estático para evitar conflictos
                this.updateStaticDataFile(this.currentStudent);
                
                this.showAlert('Cambios guardados permanentemente en la base de datos', 'success');
            } else {
                const errorData = await response.json();
                console.log('⚠️ Error en API:', response.status, errorData);
                this.showAlert('Error guardando en la base de datos, cambios solo locales', 'warning');
            }
            
        } catch (error) {
            console.log('⚠️ Error conectando con API:', error.message);
            this.showAlert('Sin conexión al servidor, cambios solo locales', 'warning');
        }
        
        // Actualizar datos del estudiante actual (siempre, independientemente de la API)
        const oldFullName = this.currentStudent.fullName;
        Object.assign(this.currentStudent, formData);
        this.currentStudent.fullName = `${formData.firstName} ${formData.lastName}`;
        
        // Actualizar en la lista principal si existe
        if (window.studentsPage && window.studentsPage.students) {
            const index = window.studentsPage.students.findIndex(s => s.id === this.currentStudent.id);
            if (index !== -1) {
                window.studentsPage.students[index] = { ...this.currentStudent };
                console.log('✅ Estudiante actualizado en lista principal');
                
                // Refrescar la tabla
                if (window.studentsPage.renderStudents) {
                    window.studentsPage.renderStudents();
                }
            }
        }
        
        // Actualizar en STUDENTS_DATA si existe
        if (window.STUDENTS_DATA && Array.isArray(window.STUDENTS_DATA)) {
            const index = window.STUDENTS_DATA.findIndex(s => s.id === this.currentStudent.id);
            if (index !== -1) {
                window.STUDENTS_DATA[index] = { ...this.currentStudent };
                console.log('✅ Estudiante actualizado en STUDENTS_DATA');
            }
        }
        
        this.hideLoading();
        this.showAlert(`Estudiante "${this.currentStudent.fullName}" actualizado exitosamente`, 'success');
        this.closeModal('editStudentModal');
        
        console.log('✅ Cambios guardados:', {
            antes: oldFullName,
            después: this.currentStudent.fullName
        });
    }

    assignEvent(eventId, eventName, eventAmount) {
        console.log('➕ Asignando evento:', eventId, 'al estudiante:', this.currentStudent?.id);
        
        if (!this.currentStudent) {
            this.showAlert('No hay estudiante seleccionado', 'error');
            return;
        }
        
        // Verificar que el evento no esté ya asignado
        const existingEvent = (this.currentStudent.events || []).find(e => e.eventId === eventId);
        if (existingEvent) {
            this.showAlert('Este evento ya está asignado al estudiante', 'warning');
            return;
        }
        
        // Crear nuevo evento asignado
        const newEvent = {
            eventId: eventId,
            eventName: eventName || 'Evento Desconocido',
            amount: eventAmount || 0,
            paid: 0,
            status: 'PENDING',
            paymentDate: null,
            assignedDate: new Date().toISOString()
        };
        
        // Agregar evento al estudiante
        if (!this.currentStudent.events) {
            this.currentStudent.events = [];
        }
        
        this.currentStudent.events.push(newEvent);
        
        // Actualizar totales del estudiante
        this.currentStudent.totalDebt = (this.currentStudent.totalDebt || 0) + newEvent.amount;
        
        // Actualizar en la lista principal si existe
        if (window.studentsPage && window.studentsPage.students) {
            const index = window.studentsPage.students.findIndex(s => s.id === this.currentStudent.id);
            if (index !== -1) {
                window.studentsPage.students[index] = { ...this.currentStudent };
                // Refrescar la tabla principal
                if (window.studentsPage.renderStudents) {
                    window.studentsPage.renderStudents();
                }
            }
        }
        
        // Refrescar las vistas de eventos
        this.loadAssignedEvents(this.currentStudent);
        this.loadAvailableEvents(this.currentStudent);
        
        // Actualizar el modal de estado de cuenta si está abierto
        const accountModal = document.getElementById('accountStudentModal');
        if (accountModal && accountModal.style.display === 'block') {
            this.populateAccountModal(this.currentStudent);
        }
        
        this.showAlert(`Evento "${newEvent.eventName}" asignado exitosamente`, 'success');
    }

    manageEventPayment(eventId) {
        console.log('💳 Gestionando pago del evento:', eventId);
        this.showAlert('Gestión de pagos en desarrollo', 'info');
    }

    registerPayment() {
        console.log('💳 Registrando nuevo pago...');
        
        if (!this.currentStudent) {
            this.showAlert('No hay estudiante seleccionado', 'error');
            return;
        }
        
        // Obtener eventos con deuda pendiente
        const pendingEvents = (this.currentStudent.events || []).filter(event => {
            const pending = event.amount - (event.paid || 0);
            return pending > 0;
        });
        
        if (pendingEvents.length === 0) {
            this.showAlert('Este estudiante no tiene deudas pendientes', 'info');
            return;
        }
        
        this.showPaymentSelectionModal(pendingEvents);
    }

    generateStatement() {
        console.log('📄 Generando estado de cuenta...');
        
        if (!this.currentStudent) {
            this.showAlert('No hay estudiante seleccionado', 'error');
            return;
        }
        
        this.showLoading('Generando estado de cuenta...');
        
        // Simular generación de PDF
        setTimeout(() => {
            this.hideLoading();
            
            // Crear contenido del estado de cuenta
            const statementData = this.generateStatementData();
            
            // En un entorno real, aquí se generaría un PDF
            // Por ahora, mostraremos una vista previa
            this.showStatementPreview(statementData);
            
            this.showAlert('Estado de cuenta generado exitosamente', 'success');
        }, 2000);
    }
    
    // Nuevas funciones para gestión de pagos y deudas
    payDebt(eventId, amount) {
        console.log('💳 Pagando deuda completa:', eventId, amount);
        
        const event = this.currentStudent.events?.find(e => e.eventId === eventId);
        if (!event) {
            this.showAlert('Evento no encontrado', 'error');
            return;
        }
        
        this.showPaymentModal(event, amount);
    }
    
    partialPayDebt(eventId) {
        console.log('💰 Pago parcial de deuda:', eventId);
        
        const event = this.currentStudent.events?.find(e => e.eventId === eventId);
        if (!event) {
            this.showAlert('Evento no encontrado', 'error');
            return;
        }
        
        this.showPaymentModal(event);
    }
    
    schedulePayment(eventId) {
        console.log('📅 Programando pago:', eventId);
        this.showAlert('Funcionalidad de programación de pagos en desarrollo', 'info');
    }
    
    viewPaymentReceipt(paymentId) {
        console.log('📄 Viendo recibo de pago:', paymentId);
        this.showAlert('Visualización de recibos en desarrollo', 'info');
    }
    
    addPaymentToEvent(eventId) {
        console.log('💳 Agregando pago a evento:', eventId);
        
        const event = this.currentStudent.events?.find(e => e.eventId === eventId);
        if (!event) {
            this.showAlert('Evento no encontrado', 'error');
            return;
        }
        
        this.showPaymentModal(event);
    }
    
    showPaymentSelectionModal(pendingEvents) {
        const modalHTML = `
            <div id="paymentSelectionModal" class="modal-overlay" style="display: block;">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>💳 Seleccionar Evento para Pago</h2>
                        <button class="modal-close" onclick="window.studentActions.closeModal('paymentSelectionModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Selecciona el evento al cual deseas registrar un pago:</p>
                        <div class="events-selection">
                            ${pendingEvents.map(event => {
                                const pending = event.amount - (event.paid || 0);
                                return `
                                    <div class="event-selection-card" onclick="window.studentActions.selectEventForPayment('${event.eventId}')">
                                        <div class="event-info">
                                            <h4>${event.eventName}</h4>
                                            <p>Pendiente: <strong>$${pending.toLocaleString()}</strong></p>
                                        </div>
                                        <div class="event-arrow">→</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.studentActions.closeModal('paymentSelectionModal')">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal anterior si existe
        const existingModal = document.getElementById('paymentSelectionModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    selectEventForPayment(eventId) {
        const event = this.currentStudent.events?.find(e => e.eventId === eventId);
        if (event) {
            this.closeModal('paymentSelectionModal');
            this.showPaymentModal(event);
        }
    }
    
    generateStatementData() {
        const student = this.currentStudent;
        const now = new Date();
        
        return {
            student: {
                name: student.fullName,
                document: `${student.documentType}: ${student.document}`,
                grade: `${student.grade}° - Curso ${student.course}`,
                email: student.email
            },
            period: {
                from: new Date(now.getFullYear(), 0, 1).toLocaleDateString(),
                to: now.toLocaleDateString(),
                generated: now.toLocaleDateString()
            },
            summary: {
                totalDebt: student.totalDebt || 0,
                totalPaid: student.totalPaid || 0,
                balance: (student.totalDebt || 0) - (student.totalPaid || 0)
            },
            events: student.events || [],
            movements: this.generateMovementsForStatement(student)
        };
    }
    
    generateMovementsForStatement(student) {
        const movements = [];
        
        if (student.events && student.events.length > 0) {
            student.events.forEach(event => {
                movements.push({
                    date: event.assignedDate || new Date().toISOString(),
                    description: `Asignación: ${event.eventName}`,
                    debit: event.amount,
                    credit: 0
                });
                
                if (event.paid > 0) {
                    movements.push({
                        date: event.paymentDate || new Date().toISOString(),
                        description: `Pago: ${event.eventName}`,
                        debit: 0,
                        credit: event.paid
                    });
                }
            });
        }
        
        return movements.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    showStatementPreview(data) {
        const modalHTML = `
            <div id="statementPreviewModal" class="modal-overlay" style="display: block;">
                <div class="modal-container large">
                    <div class="modal-header">
                        <h2>📄 Vista Previa - Estado de Cuenta</h2>
                        <button class="modal-close" onclick="window.studentActions.closeModal('statementPreviewModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="statement-preview">
                            <div class="statement-header">
                                <h3>ESTADO DE CUENTA</h3>
                                <div class="statement-info">
                                    <p><strong>Estudiante:</strong> ${data.student.name}</p>
                                    <p><strong>Documento:</strong> ${data.student.document}</p>
                                    <p><strong>Grado:</strong> ${data.student.grade}</p>
                                    <p><strong>Período:</strong> ${data.period.from} - ${data.period.to}</p>
                                    <p><strong>Generado:</strong> ${data.period.generated}</p>
                                </div>
                            </div>
                            
                            <div class="statement-summary">
                                <h4>Resumen Financiero</h4>
                                <div class="summary-grid">
                                    <div class="summary-item">
                                        <span>Total Cargado:</span>
                                        <span class="amount debit">$${data.summary.totalDebt.toLocaleString()}</span>
                                    </div>
                                    <div class="summary-item">
                                        <span>Total Pagado:</span>
                                        <span class="amount credit">$${data.summary.totalPaid.toLocaleString()}</span>
                                    </div>
                                    <div class="summary-item total">
                                        <span>Balance:</span>
                                        <span class="amount ${data.summary.balance > 0 ? 'debit' : 'credit'}">$${Math.abs(data.summary.balance).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="statement-movements">
                                <h4>Detalle de Movimientos</h4>
                                <div class="movements-table">
                                    <div class="table-header">
                                        <div>Fecha</div>
                                        <div>Descripción</div>
                                        <div>Débito</div>
                                        <div>Crédito</div>
                                    </div>
                                    ${data.movements.map(movement => `
                                        <div class="table-row">
                                            <div>${new Date(movement.date).toLocaleDateString()}</div>
                                            <div>${movement.description}</div>
                                            <div>${movement.debit > 0 ? '$' + movement.debit.toLocaleString() : '-'}</div>
                                            <div>${movement.credit > 0 ? '$' + movement.credit.toLocaleString() : '-'}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.studentActions.closeModal('statementPreviewModal')">Cerrar</button>
                        <button class="btn btn-primary" onclick="window.studentActions.downloadStatement()">📥 Descargar PDF</button>
                        <button class="btn btn-success" onclick="window.studentActions.emailStatement()">📧 Enviar por Email</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    downloadStatement() {
        console.log('📥 Descargando estado de cuenta...');
        this.showAlert('Descarga de PDF en desarrollo', 'info');
    }
    
    emailStatement() {
        console.log('📧 Enviando estado de cuenta por email...');
        this.showAlert('Envío por email en desarrollo', 'info');
    }

    assignNewEvent() {
        console.log('➕ Asignando nuevo evento...');
        // Cambiar a la pestaña de eventos disponibles
        this.switchEventsTab('available');
    }

    // Funciones de utilidad
    showAlert(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Crear elemento de alerta
        const alertHTML = `
            <div class="alert alert-${type}" id="tempAlert">
                <div class="alert-content">
                    <span class="alert-icon">${this.getAlertIcon(type)}</span>
                    <span class="alert-message">${message}</span>
                </div>
            </div>
        `;
        
        // Remover alerta anterior si existe
        const existingAlert = document.getElementById('tempAlert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Agregar nueva alerta
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        // Agregar estilos si no existen
        this.addAlertStyles();
        
        // Remover después de 4 segundos
        setTimeout(() => {
            const alert = document.getElementById('tempAlert');
            if (alert) {
                alert.remove();
            }
        }, 4000);
    }

    getAlertIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    addAlertStyles() {
        if (!document.getElementById('alertStyles')) {
            const styles = document.createElement('style');
            styles.id = 'alertStyles';
            styles.textContent = `
                .alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1100;
                    padding: 16px 20px;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    animation: slideInRight 0.3s ease;
                    max-width: 400px;
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .alert-success { background: #d1fae5; border: 1px solid #a7f3d0; color: #065f46; }
                .alert-error { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; }
                .alert-warning { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; }
                .alert-info { background: #dbeafe; border: 1px solid #93c5fd; color: #1e40af; }
                .alert-content { display: flex; align-items: center; gap: 12px; }
                .alert-icon { font-size: 18px; flex-shrink: 0; }
                .alert-message { font-weight: 500; font-size: 14px; }
                
                /* Estilos para loading */
                .loading-container {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    text-align: center;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-message {
                    margin: 0;
                    color: #6b7280;
                    font-weight: 500;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    showLoading(message = 'Cargando...') {
        const loadingHTML = `
            <div id="loadingOverlay" class="modal-overlay" style="display: block;">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-message">${message}</p>
                </div>
            </div>
        `;
        
        // Remover loading anterior si existe
        const existingLoading = document.getElementById('loadingOverlay');
        if (existingLoading) {
            existingLoading.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
        console.log('🔄 Loading mostrado:', message);
    }
    
    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.remove();
            console.log('✅ Loading ocultado');
        }
    }
    
    updateStaticDataFile(updatedStudent) {
        try {
            // Actualizar window.STUDENTS_DATA si existe
            if (window.STUDENTS_DATA && Array.isArray(window.STUDENTS_DATA)) {
                const index = window.STUDENTS_DATA.findIndex(s => s.id === updatedStudent.id);
                if (index !== -1) {
                    window.STUDENTS_DATA[index] = { ...updatedStudent };
                    console.log('✅ Archivo de datos estático actualizado para:', updatedStudent.fullName);
                } else {
                    console.log('⚠️ Estudiante no encontrado en archivo de datos estático');
                }
            } else {
                console.log('⚠️ window.STUDENTS_DATA no disponible');
            }
        } catch (error) {
            console.error('❌ Error actualizando archivo de datos estático:', error);
        }
    }
}

// Crear instancia global cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (!window.studentActions) {
        window.studentActions = new StudentActions();
        console.log('🎯 Sistema de acciones de estudiantes inicializado');
    }
});

// Funciones globales para compatibilidad
function viewStudent(studentId) {
    console.log('🔍 Función global viewStudent llamada con ID:', studentId);
    if (window.studentActions) {
        window.studentActions.viewStudent(studentId);
    } else {
        console.error('❌ studentActions no está disponible');
    }
}

function editStudent(studentId) {
    console.log('✏️ Función global editStudent llamada con ID:', studentId);
    if (window.studentActions) {
        window.studentActions.editStudent(studentId);
    } else {
        console.error('❌ studentActions no está disponible');
    }
}

function viewStudentEvents(studentId) {
    console.log('📅 Función global viewStudentEvents llamada con ID:', studentId);
    if (window.studentActions) {
        window.studentActions.viewStudentEvents(studentId);
    } else {
        console.error('❌ studentActions no está disponible');
    }
}

function viewStudentAccount(studentId) {
    console.log('💰 Función global viewStudentAccount llamada con ID:', studentId);
    if (window.studentActions) {
        window.studentActions.viewStudentAccount(studentId);
    } else {
        console.error('❌ studentActions no está disponible');
    }
}

console.log('🎯 Sistema de acciones de estudiantes cargado');