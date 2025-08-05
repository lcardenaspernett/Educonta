// ===================================
// EDUCONTA - Sistema de Gestión de Estudiantes (Solo API)
// ===================================

class StudentsManagementPage {
    constructor() {
        console.log('🎓 Inicializando sistema de gestión de estudiantes (Solo API)');
        this.students = [];
        this.filteredStudents = [];
        this.events = [];
        this.grades = [];
        this.courses = [];
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.pagination = null;
        
        this.init();
    }

    init() {
        console.log('🎓 Inicializando sistema de gestión de estudiantes');
        this.loadData();
        this.setupEventListeners();
        this.setupSearch();
    }

    async loadData() {
        try {
            console.log('🔄 Cargando datos de estudiantes desde API...');
            
            // Obtener institutionId
            const urlParams = new URLSearchParams(window.location.search);
            const institutionId = urlParams.get('institutionId') || localStorage.getItem('institutionId') || 'cmdt7n66m00003t1jy17ay313';
            
            console.log('🏫 Usando institutionId:', institutionId);
            
            // Cargar desde la API
            const response = await fetch(`/api/students/${institutionId}`);
            console.log('📊 Respuesta API:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📦 Datos recibidos:', data);
                
                if (data.success && data.students && Array.isArray(data.students)) {
                    this.students = data.students;
                    console.log('✅ Estudiantes cargados desde API:', this.students.length);
                } else {
                    throw new Error('Formato de respuesta inesperado');
                }
            } else {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            this.filteredStudents = [...this.students];
            
            // Cargar eventos y grados
            this.events = this.generateSampleEvents();
            this.grades = this.generateGrades();
            this.courses = this.generateCourses();
            
            // Inicializar paginación
            if (!this.pagination) {
                this.pagination = new PaginationManager({
                    itemsPerPage: this.itemsPerPage,
                    containerId: 'studentsPagination',
                    onPageChange: (page) => {
                        this.currentPage = page;
                        this.renderStudents();
                    }
                });
            }
            
            // Renderizar datos
            this.renderStudents();
            this.updateStats();
            console.log('✅ Datos de estudiantes renderizados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            this.showError('Error cargando datos: ' + error.message);
            
            // En caso de error, mostrar mensaje pero no cargar datos estáticos
            this.students = [];
            this.filteredStudents = [];
            this.renderStudents();
        }
    }

    // Método para actualizar un estudiante
    async updateStudent(studentId, updateData) {
        try {
            console.log('🔧 Actualizando estudiante:', studentId, updateData);
            
            const response = await fetch(`/api/students/student/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Estudiante actualizado:', result);
                
                // Recargar datos para mostrar cambios
                await this.loadData();
                
                return result;
            } else {
                const error = await response.text();
                throw new Error(`Error ${response.status}: ${error}`);
            }
        } catch (error) {
            console.error('❌ Error actualizando estudiante:', error);
            throw error;
        }
    }

    // Método para crear un estudiante
    async createStudent(studentData) {
        try {
            console.log('➕ Creando estudiante:', studentData);
            
            const institutionId = localStorage.getItem('institutionId') || 'cmdt7n66m00003t1jy17ay313';
            
            const response = await fetch(`/api/students/${institutionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Estudiante creado:', result);
                
                // Recargar datos para mostrar el nuevo estudiante
                await this.loadData();
                
                return result;
            } else {
                const error = await response.text();
                throw new Error(`Error ${response.status}: ${error}`);
            }
        } catch (error) {
            console.error('❌ Error creando estudiante:', error);
            throw error;
        }
    }

    // Método para eliminar un estudiante
    async deleteStudent(studentId) {
        try {
            console.log('🗑️ Eliminando estudiante:', studentId);
            
            const response = await fetch(`/api/students/student/${studentId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                console.log('✅ Estudiante eliminado');
                
                // Recargar datos para reflejar la eliminación
                await this.loadData();
                
                return true;
            } else {
                const error = await response.text();
                throw new Error(`Error ${response.status}: ${error}`);
            }
        } catch (error) {
            console.error('❌ Error eliminando estudiante:', error);
            throw error;
        }
    }

    generateSampleEvents() {
        return [
            { id: 1, name: 'Matrícula 2024', type: 'MATRICULA', amount: 150000 },
            { id: 2, name: 'Mensualidad Enero', type: 'MENSUALIDAD', amount: 80000 },
            { id: 3, name: 'Rifa Navideña', type: 'RIFA', amount: 5000 }
        ];
    }

    generateGrades() {
        const gradeNames = {
            '6': 'Sexto',
            '7': 'Séptimo', 
            '8': 'Octavo',
            '9': 'Noveno',
            '10': 'Décimo',
            '11': 'Undécimo'
        };
        
        return Object.keys(gradeNames).map(grade => ({
            value: grade,
            label: `${grade}° (${gradeNames[grade]})`
        }));
    }

    generateCourses() {
        return ['A', 'B', 'C', 'D'].map(course => ({
            value: course,
            label: `Curso ${course}`
        }));
    }

    setupEventListeners() {
        // Configurar event listeners para la interfaz
        const searchInput = document.getElementById('studentSearch') || document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleSearch());
        }

        const gradeFilter = document.getElementById('gradeFilter');
        if (gradeFilter) {
            gradeFilter.addEventListener('change', () => this.applyFilters());
        }

        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter) {
            courseFilter.addEventListener('change', () => this.applyFilters());
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    setupSearch() {
        // Configurar búsqueda
        this.searchTerm = '';
    }

    handleSearch() {
        const searchInput = document.getElementById('studentSearch') || document.getElementById('searchInput');
        if (searchInput) {
            this.searchTerm = searchInput.value.toLowerCase();
            this.applyFilters();
        }
    }

    applyFilters() {
        let filtered = [...this.students];

        // Filtro de búsqueda
        if (this.searchTerm) {
            filtered = filtered.filter(student => 
                student.firstName.toLowerCase().includes(this.searchTerm) ||
                student.lastName.toLowerCase().includes(this.searchTerm) ||
                student.document.toLowerCase().includes(this.searchTerm) ||
                (student.email && student.email.toLowerCase().includes(this.searchTerm))
            );
        }

        // Filtro de grado
        const gradeFilter = document.getElementById('gradeFilter');
        if (gradeFilter && gradeFilter.value) {
            filtered = filtered.filter(student => student.grade == gradeFilter.value);
        }

        // Filtro de curso
        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter && courseFilter.value) {
            filtered = filtered.filter(student => student.course === courseFilter.value);
        }

        // Filtro de estado
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter && statusFilter.value) {
            switch (statusFilter.value) {
                case 'current':
                    filtered = filtered.filter(student => (student.totalDebt || 0) === 0);
                    break;
                case 'partial':
                    filtered = filtered.filter(student => (student.totalPaid || 0) > 0 && (student.totalDebt || 0) > 0);
                    break;
                case 'overdue':
                    filtered = filtered.filter(student => (student.totalDebt || 0) > 0);
                    break;
            }
        }

        this.filteredStudents = filtered;
        this.currentPage = 1;
        
        // Actualizar paginación
        if (this.pagination) {
            this.pagination.updateTotal(filtered.length);
        }
        
        this.renderStudents();
        this.updateStats();
        
        console.log(`🔍 Filtros aplicados: ${filtered.length} de ${this.students.length} estudiantes`);
    }

    renderStudents() {
        console.log('🎨 Renderizando estudiantes...');
        const tbody = document.getElementById('studentsTableBody');
        
        if (!tbody) {
            console.error('❌ No se encontró el elemento studentsTableBody');
            return;
        }

        // Obtener estudiantes paginados
        const paginatedStudents = this.pagination ? 
            this.pagination.getPageItems(this.filteredStudents) : 
            this.filteredStudents.slice(0, this.itemsPerPage);

        if (paginatedStudents.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="9">
                        <div class="empty-state">
                            <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                            <h3>No hay estudiantes</h3>
                            <p>No se encontraron estudiantes con los filtros aplicados</p>
                            <button onclick="clearSearch()" class="btn btn-primary" style="margin-top: 16px;">
                                Limpiar filtros
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let htmlContent = '';
        
        paginatedStudents.forEach(student => {
            const statusClass = student.status === 'ACTIVE' ? 'active' : 'inactive';
            const statusText = student.status === 'ACTIVE' ? 'Activo' : 'Inactivo';
            const debtStatus = student.totalDebt > 0 ? 'debt' : 'clear';
            
            const paidEvents = student.events ? student.events.filter(e => e.status === 'PAID').length : 0;
            const partialEvents = student.events ? student.events.filter(e => e.status === 'PARTIAL').length : 0;
            const pendingEvents = student.events ? student.events.filter(e => e.status === 'PENDING').length : 0;
            
            htmlContent += `
                <tr class="student-row" role="row">
                    <td role="cell">
                        <div class="student-info">
                            <div class="student-avatar" title="${student.firstName} ${student.lastName}">${student.firstName.charAt(0)}${student.lastName.charAt(0)}</div>
                            <div class="student-details">
                                <div class="student-name" title="${student.firstName} ${student.lastName}">${student.firstName} ${student.lastName}</div>
                                <div class="student-document">${student.documentType || 'TI'}: ${student.document}</div>
                            </div>
                        </div>
                    </td>
                    <td role="cell">
                        <div class="contact-info">
                            <div class="email" title="${student.email}">${student.email}</div>
                            <div class="phone" title="${student.phone}">${student.phone}</div>
                        </div>
                    </td>
                    <td role="cell">
                        <span class="grade-course" title="Grado ${student.grade}, Curso ${student.course}">${student.grade}°-${student.course}</span>
                    </td>
                    <td role="cell">
                        <span class="status-badge ${statusClass}" title="Estado: ${statusText}">${statusText}</span>
                    </td>
                    <td role="cell">
                        <div class="events-summary">
                            <span class="events-count">${student.events ? student.events.length : 0} eventos</span>
                            <div class="events-status">
                                ${paidEvents} pagados, ${partialEvents} parciales, ${pendingEvents} pendientes
                            </div>
                        </div>
                    </td>
                    <td role="cell">
                        <span class="debt-amount ${debtStatus}" title="Deuda total: ${(student.totalDebt || 0).toLocaleString()}">
                            ${(student.totalDebt || 0).toLocaleString()}
                        </span>
                    </td>
                    <td role="cell">
                        <span class="paid-amount" title="Total pagado: ${(student.totalPaid || 0).toLocaleString()}">
                            ${(student.totalPaid || 0).toLocaleString()}
                        </span>
                    </td>
                    <td role="cell">
                        <div class="action-buttons" role="group" aria-label="Acciones para ${student.firstName} ${student.lastName}">
                            <button class="btn btn-info" onclick="viewStudent('${student.id}')" title="Ver detalles de ${student.firstName} ${student.lastName}" aria-label="Ver detalles">
                                👁️
                            </button>
                            <button class="btn btn-warning" onclick="editStudent('${student.id}')" title="Editar ${student.firstName} ${student.lastName}" aria-label="Editar">
                                ✏️
                            </button>
                            <button class="btn btn-success" onclick="viewStudentEvents('${student.id}')" title="Ver eventos de ${student.firstName} ${student.lastName}" aria-label="Ver eventos">
                                📅
                            </button>
                            <button class="btn btn-primary" onclick="viewStudentAccount('${student.id}')" title="Estado de cuenta de ${student.firstName} ${student.lastName}" aria-label="Estado de cuenta">
                                💰
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = htmlContent;
        this.renderPagination();
        console.log('✅ Estudiantes renderizados:', paginatedStudents.length);
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
        const paginationContainer = document.getElementById('pagination');
        
        if (!paginationContainer || totalPages <= 1) return;

        let paginationHTML = '';
        
        // Botón anterior
        if (this.currentPage > 1) {
            paginationHTML += `
                <button onclick="studentsPage.goToPage(${this.currentPage - 1})" 
                        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">
                    Anterior
                </button>
            `;
        }

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `
                    <button class="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600">
                        ${i}
                    </button>
                `;
            } else {
                paginationHTML += `
                    <button onclick="studentsPage.goToPage(${i})" 
                            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50">
                        ${i}
                    </button>
                `;
            }
        }

        // Botón siguiente
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <button onclick="studentsPage.goToPage(${this.currentPage + 1})" 
                        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">
                    Siguiente
                </button>
            `;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderStudents();
    }

    updateStats() {
        const totalStudentsEl = document.getElementById('totalStudents');
        const activeStudentsEl = document.getElementById('activeStudents');
        const totalDebtEl = document.getElementById('totalDebt');

        if (totalStudentsEl) {
            totalStudentsEl.textContent = this.students.length;
        }

        if (activeStudentsEl) {
            const activeCount = this.students.filter(s => s.status === 'ACTIVE').length;
            activeStudentsEl.textContent = activeCount;
        }

        if (totalDebtEl) {
            const totalDebt = this.students.reduce((sum, s) => sum + (s.totalDebt || 0), 0);
            totalDebtEl.textContent = '$' + totalDebt.toLocaleString();
        }
    }

    showError(message) {
        console.error('❌ Error:', message);
        
        // Mostrar error en la interfaz
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> ${message}
                </div>
            `;
        }
    }
}

// Funciones globales para la interfaz
function editStudent(studentId) {
    console.log('✏️ Editando estudiante:', studentId);
    // Implementar lógica de edición
    alert('Función de edición en desarrollo');
}

function viewStudent(studentId) {
    console.log('👁️ Viendo estudiante:', studentId);
    // Implementar lógica de visualización
    alert('Función de visualización en desarrollo');
}

function viewStudentEvents(studentId) {
    console.log('📅 Viendo eventos del estudiante:', studentId);
    // Implementar lógica de eventos
    alert('Función de eventos en desarrollo');
}

function viewStudentAccount(studentId) {
    console.log('💰 Viendo estado de cuenta del estudiante:', studentId);
    // Implementar lógica de estado de cuenta
    alert('Función de estado de cuenta en desarrollo');
}

function deleteStudentConfirm(studentId) {
    if (confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
        studentsPage.deleteStudent(studentId);
    }
}

function searchStudents() {
    if (window.studentsPage) {
        studentsPage.handleSearch();
    }
}

function clearSearch() {
    const searchInput = document.getElementById('studentSearch') || document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    const gradeFilter = document.getElementById('gradeFilter');
    if (gradeFilter) {
        gradeFilter.value = '';
    }
    
    const courseFilter = document.getElementById('courseFilter');
    if (courseFilter) {
        courseFilter.value = '';
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.value = '';
    }
    
    if (window.studentsPage) {
        studentsPage.searchTerm = '';
        studentsPage.applyFilters();
    }
    
    console.log('🧹 Filtros limpiados');
}

function addNewStudent() {
    console.log('➕ Agregando nuevo estudiante');
    // Implementar lógica para agregar estudiante
    alert('Función de agregar estudiante en desarrollo');
}

function sortStudents(column) {
    if (window.studentsPage) {
        if (studentsPage.sortColumn === column) {
            studentsPage.sortDirection = studentsPage.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            studentsPage.sortColumn = column;
            studentsPage.sortDirection = 'asc';
        }
        
        // Aplicar ordenamiento
        studentsPage.filteredStudents.sort((a, b) => {
            let aValue = a[column];
            let bValue = b[column];
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (studentsPage.sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        studentsPage.renderStudents();
    }
}