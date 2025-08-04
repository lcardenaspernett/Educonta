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

    loadAvailableEvents(student) {
        const container = document.getElementById('availableEventsList');
        // Simular eventos disponibles
        const availableEvents = [
            { id: 'event1', name: 'Derecho de Grado 2025', amount: 150000, targetGrades: ['11'] },
            { id: 'event2', name: 'Rifa Navideña', amount: 50000, targetGrades: ['6', '7', '8', '9', '10', '11'] },
            { id: 'event3', name: 'Bingo Familiar', amount: 30000, targetGrades: ['6', '7', '8', '9', '10', '11'] }
        ];
        
        const eligibleEvents = availableEvents.filter(event => 
            event.targetGrades.includes(student.grade)
        );
        
        if (eligibleEvents.length > 0) {
            container.innerHTML = eligibleEvents.map(event => `
                <div class="event-card available">
                    <div class="event-info">
                        <h4>${event.name}</h4>
                        <p>Monto: $${event.amount.toLocaleString()}</p>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-sm btn-success" onclick="window.studentActions.assignEvent('${event.id}')">
                            ➕ Asignar
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-state"><p>No hay eventos disponibles para este grado</p></div>';
        }
    }

    loadEventsHistory(student) {
        const container = document.getElementById('historyEventsList');
        container.innerHTML = '<div class="empty-state"><p>Historial de eventos en desarrollo</p></div>';
    }

    loadMovements(student) {
        const container = document.getElementById('movementsList');
        container.innerHTML = '<div class="empty-state"><p>Historial de movimientos en desarrollo</p></div>';
    }

    loadPayments(student) {
        const container = document.getElementById('paymentsList');
        container.innerHTML = '<div class="empty-state"><p>Historial de pagos en desarrollo</p></div>';
    }

    loadDebts(student) {
        const container = document.getElementById('debtsList');
        container.innerHTML = '<div class="empty-state"><p>Gestión de deudas en desarrollo</p></div>';
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
    saveStudent() {
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
        
        // Simular guardado
        this.showAlert('Estudiante actualizado exitosamente', 'success');
        this.closeModal('editStudentModal');
        
        // Actualizar datos del estudiante actual
        Object.assign(this.currentStudent, formData);
        this.currentStudent.fullName = `${formData.firstName} ${formData.lastName}`;
        
        // Actualizar en la lista principal si existe
        if (window.studentsPage && window.studentsPage.renderStudents) {
            window.studentsPage.renderStudents();
        }
    }

    assignEvent(eventId) {
        console.log('➕ Asignando evento:', eventId);
        this.showAlert('Evento asignado exitosamente', 'success');
        
        // Refrescar la vista de eventos
        if (this.currentStudent) {
            this.loadAssignedEvents(this.currentStudent);
            this.loadAvailableEvents(this.currentStudent);
        }
    }

    manageEventPayment(eventId) {
        console.log('💳 Gestionando pago del evento:', eventId);
        this.showAlert('Gestión de pagos en desarrollo', 'info');
    }

    registerPayment() {
        console.log('💳 Registrando nuevo pago...');
        this.showAlert('Registro de pagos en desarrollo', 'info');
    }

    generateStatement() {
        console.log('📄 Generando estado de cuenta...');
        this.showAlert('Generación de estados de cuenta en desarrollo', 'info');
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
            `;
            document.head.appendChild(styles);
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