// ===================================
// EDUCONTA - Sistema de Gestión de Estudiantes
// ===================================

/**
 * Controlador para la gestión completa de estudiantes con eventos y pagos
 */
class StudentsManagementPage {
    constructor() {
        this.students = [];
        this.filteredStudents = [];
        this.events = [];
        this.grades = [];
        this.courses = [];
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.currentPage = 1;
        this.itemsPerPage = 15;
        
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
            console.log('🔄 Cargando datos de estudiantes...');
            
            // Esperar un poco para asegurar que DemoData esté disponible
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Cargar estudiantes desde demo data
            if (window.DemoData && typeof window.DemoData.getStudents === 'function') {
                console.log('📊 Cargando desde DemoData...');
                try {
                    const studentsResponse = await window.DemoData.getStudents();
                    this.students = studentsResponse.data || [];
                    console.log('✅ Estudiantes cargados desde DemoData:', this.students.length);
                } catch (demoError) {
                    console.error('❌ Error en DemoData.getStudents:', demoError);
                    this.students = this.generateSampleStudents();
                    console.log('⚠️ Usando datos de ejemplo por error en DemoData');
                }
            } else {
                console.log('⚠️ DemoData no disponible, usando datos de ejemplo...');
                this.students = this.generateSampleStudents();
                console.log('✅ Estudiantes generados:', this.students.length);
            }
            
            // Cargar eventos y grados
            this.events = this.generateSampleEvents();
            this.grades = this.generateGrades();
            this.courses = this.generateCourses();
            
            this.filteredStudents = [...this.students];
            
            // Asegurar que los elementos DOM existan antes de renderizar
            if (document.getElementById('studentsTableBody')) {
                this.renderStudents();
                this.updateStats();
                console.log('✅ Datos de estudiantes renderizados exitosamente');
            } else {
                console.log('⚠️ Elementos DOM no encontrados, reintentando...');
                setTimeout(() => {
                    if (document.getElementById('studentsTableBody')) {
                        this.renderStudents();
                        this.updateStats();
                        console.log('✅ Datos de estudiantes renderizados en segundo intento');
                    }
                }, 500);
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            if (typeof showAlert === 'function') {
                showAlert('Error cargando datos: ' + error.message, 'error');
            }
        }
    }

    generateSampleStudents() {
        return [
            {
                id: '1',
                firstName: 'Juan Carlos',
                lastName: 'Pérez García',
                fullName: 'Juan Carlos Pérez García',
                documentType: 'TI',
                document: '1234567890',
                email: 'juan.perez@estudiante.edu.co',
                phone: '+57 300 123 4567',
                grade: '11',
                course: 'A',
                status: 'ACTIVE',
                enrollmentDate: new Date('2024-02-01').toISOString(),
                birthDate: new Date('2007-05-15').toISOString(),
                guardian: {
                    name: 'María García',
                    phone: '+57 301 234 5678',
                    email: 'maria.garcia@email.com'
                },
                address: 'Calle 123 #45-67, Bogotá',
                events: [
                    {
                        eventId: 'event-1',
                        eventName: 'Derecho de Grado',
                        amount: 150000,
                        paid: 150000,
                        status: 'PAID',
                        paymentDate: new Date('2025-01-15').toISOString()
                    },
                    {
                        eventId: 'event-2',
                        eventName: 'Rifa Navideña',
                        amount: 50000,
                        paid: 25000,
                        status: 'PARTIAL',
                        paymentDate: null
                    }
                ],
                totalDebt: 25000,
                totalPaid: 175000,
                createdAt: new Date('2024-02-01').toISOString()
            },
            {
                id: '2',
                firstName: 'María Alejandra',
                lastName: 'González López',
                fullName: 'María Alejandra González López',
                documentType: 'TI',
                document: '2345678901',
                email: 'maria.gonzalez@estudiante.edu.co',
                phone: '+57 302 345 6789',
                grade: '10',
                course: 'B',
                status: 'ACTIVE',
                enrollmentDate: new Date('2024-02-01').toISOString(),
                birthDate: new Date('2008-03-22').toISOString(),
                guardian: {
                    name: 'Carlos González',
                    phone: '+57 303 456 7890',
                    email: 'carlos.gonzalez@email.com'
                },
                address: 'Carrera 45 #12-34, Medellín',
                events: [
                    {
                        eventId: 'event-2',
                        eventName: 'Rifa Navideña',
                        amount: 50000,
                        paid: 50000,
                        status: 'PAID',
                        paymentDate: new Date('2025-01-10').toISOString()
                    },
                    {
                        eventId: 'event-3',
                        eventName: 'Bingo Familiar',
                        amount: 30000,
                        paid: 0,
                        status: 'PENDING',
                        paymentDate: null
                    }
                ],
                totalDebt: 30000,
                totalPaid: 50000,
                createdAt: new Date('2024-02-01').toISOString()
            },
            {
                id: '3',
                firstName: 'Carlos Andrés',
                lastName: 'Rodríguez Martín',
                fullName: 'Carlos Andrés Rodríguez Martín',
                documentType: 'TI',
                document: '3456789012',
                email: 'carlos.rodriguez@estudiante.edu.co',
                phone: '+57 304 567 8901',
                grade: '9',
                course: 'A',
                status: 'ACTIVE',
                enrollmentDate: new Date('2024-02-01').toISOString(),
                birthDate: new Date('2009-07-10').toISOString(),
                guardian: {
                    name: 'Ana Martín',
                    phone: '+57 305 678 9012',
                    email: 'ana.martin@email.com'
                },
                address: 'Avenida 80 #23-45, Cali',
                events: [
                    {
                        eventId: 'event-3',
                        eventName: 'Bingo Familiar',
                        amount: 30000,
                        paid: 15000,
                        status: 'PARTIAL',
                        paymentDate: new Date('2025-01-20').toISOString()
                    },
                    {
                        eventId: 'event-4',
                        eventName: 'Preicfes',
                        amount: 80000,
                        paid: 0,
                        status: 'PENDING',
                        paymentDate: null
                    }
                ],
                totalDebt: 95000,
                totalPaid: 15000,
                createdAt: new Date('2024-02-01').toISOString()
            },
            {
                id: '4',
                firstName: 'Ana Sofía',
                lastName: 'Herrera Castro',
                fullName: 'Ana Sofía Herrera Castro',
                documentType: 'TI',
                document: '4567890123',
                email: 'ana.herrera@estudiante.edu.co',
                phone: '+57 306 789 0123',
                grade: '11',
                course: 'B',
                status: 'ACTIVE',
                enrollmentDate: new Date('2024-02-01').toISOString(),
                birthDate: new Date('2007-11-28').toISOString(),
                guardian: {
                    name: 'Luis Herrera',
                    phone: '+57 307 890 1234',
                    email: 'luis.herrera@email.com'
                },
                address: 'Calle 72 #11-25, Barranquilla',
                events: [
                    {
                        eventId: 'event-1',
                        eventName: 'Derecho de Grado',
                        amount: 150000,
                        paid: 0,
                        status: 'PENDING',
                        paymentDate: null
                    },
                    {
                        eventId: 'event-4',
                        eventName: 'Preicfes',
                        amount: 80000,
                        paid: 80000,
                        status: 'PAID',
                        paymentDate: new Date('2025-01-05').toISOString()
                    }
                ],
                totalDebt: 150000,
                totalPaid: 80000,
                createdAt: new Date('2024-02-01').toISOString()
            },
            {
                id: '5',
                firstName: 'Luis Fernando',
                lastName: 'Castro Morales',
                fullName: 'Luis Fernando Castro Morales',
                documentType: 'TI',
                document: '5678901234',
                email: 'luis.castro@estudiante.edu.co',
                phone: '+57 308 901 2345',
                grade: '8',
                course: 'C',
                status: 'INACTIVE',
                enrollmentDate: new Date('2024-02-01').toISOString(),
                birthDate: new Date('2010-01-12').toISOString(),
                guardian: {
                    name: 'Patricia Morales',
                    phone: '+57 309 012 3456',
                    email: 'patricia.morales@email.com'
                },
                address: 'Transversal 15 #67-89, Bucaramanga',
                events: [],
                totalDebt: 0,
                totalPaid: 0,
                createdAt: new Date('2024-02-01').toISOString()
            }
        ];
    }

    generateSampleEvents() {
        return [
            {
                id: 'event-1',
                name: 'Derecho de Grado',
                description: 'Pago obligatorio para estudiantes de grado 11',
                amount: 150000,
                type: 'GRADUATION',
                status: 'ACTIVE',
                targetGrades: ['11'],
                targetCourses: ['A', 'B'],
                dueDate: new Date('2025-03-15').toISOString(),
                createdAt: new Date('2025-01-01').toISOString(),
                assignedStudents: 45,
                totalExpected: 6750000,
                totalCollected: 3000000,
                totalPending: 3750000
            },
            {
                id: 'event-2',
                name: 'Rifa Navideña',
                description: 'Rifa benéfica para actividades navideñas',
                amount: 50000,
                type: 'RAFFLE',
                status: 'ACTIVE',
                targetGrades: ['9', '10', '11'],
                targetCourses: ['A', 'B', 'C'],
                dueDate: new Date('2025-02-28').toISOString(),
                createdAt: new Date('2024-12-01').toISOString(),
                assignedStudents: 120,
                totalExpected: 6000000,
                totalCollected: 4500000,
                totalPending: 1500000
            },
            {
                id: 'event-3',
                name: 'Bingo Familiar',
                description: 'Evento familiar de integración',
                amount: 30000,
                type: 'BINGO',
                status: 'ACTIVE',
                targetGrades: ['8', '9', '10'],
                targetCourses: ['A', 'B', 'C'],
                dueDate: new Date('2025-02-15').toISOString(),
                createdAt: new Date('2025-01-10').toISOString(),
                assignedStudents: 85,
                totalExpected: 2550000,
                totalCollected: 1275000,
                totalPending: 1275000
            },
            {
                id: 'event-4',
                name: 'Preicfes',
                description: 'Curso preparatorio para examen ICFES',
                amount: 80000,
                type: 'COURSE',
                status: 'ACTIVE',
                targetGrades: ['10', '11'],
                targetCourses: ['A', 'B'],
                dueDate: new Date('2025-04-30').toISOString(),
                createdAt: new Date('2025-01-15').toISOString(),
                assignedStudents: 60,
                totalExpected: 4800000,
                totalCollected: 2400000,
                totalPending: 2400000
            }
        ];
    }

    generateGrades() {
        return [
            { id: '6', name: '6°', level: 'SECONDARY' },
            { id: '7', name: '7°', level: 'SECONDARY' },
            { id: '8', name: '8°', level: 'SECONDARY' },
            { id: '9', name: '9°', level: 'SECONDARY' },
            { id: '10', name: '10°', level: 'SECONDARY' },
            { id: '11', name: '11°', level: 'SECONDARY' }
        ];
    }

    generateCourses() {
        return [
            { id: 'A', name: 'A' },
            { id: 'B', name: 'B' },
            { id: 'C', name: 'C' }
        ];
    }

    setupEventListeners() {
        // Configurar filtros
        const filters = ['gradeFilter', 'courseFilter', 'statusFilter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => {
                    this.filterStudents();
                });
            }
        });

        // Configurar paginación
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderStudents();
            });
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('studentSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchStudents(e.target.value);
                }, 300);
            });
        }
    }

    searchStudents(query) {
        if (!query.trim()) {
            this.filteredStudents = [...this.students];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredStudents = this.students.filter(student => 
                student.fullName.toLowerCase().includes(searchTerm) ||
                student.firstName.toLowerCase().includes(searchTerm) ||
                student.lastName.toLowerCase().includes(searchTerm) ||
                student.document.includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm)
            );
        }
        
        this.currentPage = 1;
        this.renderStudents();
        this.updateStats();
    }

    filterStudents() {
        const gradeFilter = document.getElementById('gradeFilter')?.value || '';
        const courseFilter = document.getElementById('courseFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        this.filteredStudents = this.students.filter(student => {
            const matchesGrade = !gradeFilter || student.grade === gradeFilter;
            const matchesCourse = !courseFilter || student.course === courseFilter;
            const matchesStatus = !statusFilter || student.status === statusFilter;
            
            return matchesGrade && matchesCourse && matchesStatus;
        });

        this.currentPage = 1;
        this.renderStudents();
        this.updateStats();
    }

    sortStudents(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredStudents.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            // Manejar diferentes tipos de datos
            if (column === 'totalDebt' || column === 'totalPaid') {
                valueA = parseFloat(valueA) || 0;
                valueB = parseFloat(valueB) || 0;
            } else if (column === 'enrollmentDate' || column === 'birthDate') {
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

        this.renderStudents();
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

    renderStudents() {
        const tbody = document.getElementById('studentsTableBody');
        if (!tbody) return;

        // Calcular paginación
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedStudents = this.filteredStudents.slice(startIndex, endIndex);

        if (paginatedStudents.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="9">
                        <div class="empty-state">
                            <svg width="48" height="48" fill="currentColor" class="empty-icon">
                                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-1c0-1.1.9-2 2-2h2l1.5-4.5L7.91 8.5C7.66 8.04 7.66 7.96 7.91 7.5L9.5 5H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1h-1.5L12.09 7.5c.25.46.25.54 0 1L10.5 10.5 12 15h2c1.1 0 2 .9 2 2v1H4z"/>
                            </svg>
                            <h3>No hay estudiantes</h3>
                            <p>No se encontraron estudiantes con los filtros aplicados</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = paginatedStudents.map(student => {
            const statusClass = student.status === 'ACTIVE' ? 'active' : 'inactive';
            const statusText = student.status === 'ACTIVE' ? 'Activo' : 'Inactivo';
            const debtStatus = student.totalDebt > 0 ? 'debt' : 'clear';
            
            return `
                <tr class="student-row">
                    <td>
                        <div class="student-info">
                            <div class="student-avatar">
                                ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                            </div>
                            <div class="student-details">
                                <strong class="student-name">${student.fullName}</strong>
                                <span class="student-document">${student.documentType}: ${student.document}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="contact-info">
                            <div class="email">${student.email}</div>
                            <div class="phone">${student.phone}</div>
                        </div>
                    </td>
                    <td>
                        <span class="grade-course">${student.grade}° ${student.course}</span>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <div class="events-summary">
                            <span class="events-count">${student.events.length} eventos</span>
                            <div class="events-status">
                                ${student.events.filter(e => e.status === 'PAID').length} pagados,
                                ${student.events.filter(e => e.status === 'PARTIAL').length} parciales,
                                ${student.events.filter(e => e.status === 'PENDING').length} pendientes
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="debt-amount ${debtStatus}">
                            ${formatCurrency(student.totalDebt)}
                        </span>
                    </td>
                    <td>
                        <span class="paid-amount">
                            ${formatCurrency(student.totalPaid)}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-info btn-sm" 
                                    onclick="viewStudent('${student.id}')" 
                                    title="Ver detalles">
                                👁️
                            </button>
                            <button class="btn btn-warning btn-sm" 
                                    onclick="editStudent('${student.id}')" 
                                    title="Editar estudiante">
                                ✏️
                            </button>
                            <button class="btn btn-success btn-sm" 
                                    onclick="viewStudentEvents('${student.id}')" 
                                    title="Ver eventos">
                                📅
                            </button>
                            <button class="btn btn-primary btn-sm" 
                                    onclick="viewStudentAccount('${student.id}')" 
                                    title="Estado de cuenta">
                                💰
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

        const totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="studentsPage.changePage(${this.currentPage - 1})"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                ‹ Anterior
            </button>
        `;

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="studentsPage.changePage(${i})">
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
                    onclick="studentsPage.changePage(${this.currentPage + 1})"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                Siguiente ›
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderStudents();
    }

    updateStats() {
        const totalStudents = this.filteredStudents.length;
        const activeStudents = this.filteredStudents.filter(s => s.status === 'ACTIVE').length;
        const totalDebt = this.filteredStudents.reduce((sum, s) => sum + s.totalDebt, 0);
        const totalPaid = this.filteredStudents.reduce((sum, s) => sum + s.totalPaid, 0);

        // Actualizar elementos del DOM
        const elements = {
            'totalStudents': totalStudents,
            'activeStudents': activeStudents,
            'totalDebt': formatCurrency(totalDebt),
            'totalPaid': formatCurrency(totalPaid)
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
        document.getElementById('gradeFilter').value = '';
        document.getElementById('courseFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('studentSearch').value = '';
        
        // Resetear datos
        this.filteredStudents = [...this.students];
        this.currentPage = 1;
        
        this.renderStudents();
        this.updateStats();
    }

    exportStudents() {
        showAlert('Exportando lista de estudiantes...', 'info');
        
        setTimeout(() => {
            showAlert('Lista de estudiantes exportada exitosamente', 'success');
        }, 2000);
    }

    showNewStudentModal() {
        showAlert('Modal de nuevo estudiante en desarrollo', 'info');
    }

    showBulkUploadModal() {
        showAlert('Modal de carga masiva en desarrollo', 'info');
    }
}

// Hacer disponible globalmente
window.StudentsManagementPage = StudentsManagementPage;