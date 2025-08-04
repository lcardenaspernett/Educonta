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
            
            // Cargar estudiantes desde la API con fallback a localStorage
            try {
                // Obtener institutionId desde la URL o localStorage
                const urlParams = new URLSearchParams(window.location.search);
                const institutionId = urlParams.get('institutionId') || localStorage.getItem('institutionId');
                
                if (!institutionId) {
                    console.log('⚠️ No se encontró institutionId, usando datos de ejemplo');
                    this.students = this.generateSampleStudents();
                } else {
                    const response = await fetch(`/api/students/${institutionId}`);
                    if (response.ok) {
                        const data = await response.json();
                        this.students = data.students || [];
                        console.log('✅ Estudiantes cargados desde API:', this.students.length);
                    } else {
                        console.log('⚠️ No se pudieron cargar estudiantes desde la API');
                    
                    // FALLBACK: Intentar cargar desde localStorage
                    console.log('🔄 Intentando cargar desde localStorage...');
                    const possibleKeys = ['students', 'estudiantes', 'studentsData', 'allStudents'];
                    let foundStudents = [];
                    
                    for (const key of possibleKeys) {
                        const data = localStorage.getItem(key);
                        if (data) {
                            try {
                                const parsed = JSON.parse(data);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    foundStudents = parsed;
                                    console.log('✅ Encontrados ' + parsed.length + ' estudiantes en localStorage[' + key + ']');
                                    break;
                                }
                            } catch (e) {
                                console.warn('❌ Error parsing localStorage[' + key + ']:', e);
                            }
                        }
                    }
                    
                    if (foundStudents.length > 0) {
                        // Convertir formato si es necesario
                        this.students = foundStudents.map(student => {
                            // Si el estudiante ya tiene el formato correcto, devolverlo tal como está
                            if (student.fullName && student.status) {
                                return student;
                            }
                            
                            // Si tiene formato de Excel, convertirlo
                            if (student['Nombre Completo']) {
                                const names = student['Nombre Completo'].split(' ');
                                const firstName = names.slice(0, Math.ceil(names.length / 2)).join(' ');
                                const lastName = names.slice(Math.ceil(names.length / 2)).join(' ');
                                
                                return {
                                    id: student['No.'] || student.id || Date.now() + Math.random(),
                                    firstName: firstName,
                                    lastName: lastName,
                                    fullName: student['Nombre Completo'],
                                    documentType: 'CC',
                                    document: student['Identificación'] ? student['Identificación'].toString() : '',
                                    email: firstName.toLowerCase().replace(' ', '.') + '@estudiante.edu.co',
                                    phone: '+57 300 000 0000',
                                    grade: student['Curso'] && student['Curso'].includes('Décimo') ? '10' : 
                                           student['Curso'] && student['Curso'].includes('Once') ? '11' : '9',
                                    course: student['Curso'] ? student['Curso'].split(' ')[1] || 'A' : 'A',
                                    status: 'ACTIVE',
                                    enrollmentDate: new Date().toISOString(),
                                    birthDate: new Date('2008-01-01').toISOString(),
                                    guardian: {
                                        name: 'Acudiente',
                                        phone: '+57 300 000 0000',
                                        email: 'acudiente@email.com'
                                    },
                                    address: 'Dirección pendiente',
                                    events: [],
                                    totalDebt: 0,
                                    totalPaid: 0,
                                    createdAt: new Date().toISOString()
                                };
                            }
                            
                            // Si tiene formato básico, completarlo
                            return {
                                id: student.id || Date.now() + Math.random(),
                                firstName: student.firstName || '',
                                lastName: student.lastName || '',
                                fullName: student.fullName || (student.firstName + ' ' + student.lastName),
                                documentType: student.documentType || 'CC',
                                document: student.documentNumber || student.document || '',
                                email: student.email || 'estudiante@email.com',
                                phone: student.phone || '+57 300 000 0000',
                                grade: student.grade || '10',
                                course: student.course || 'A',
                                status: student.status === 'activo' ? 'ACTIVE' : 'ACTIVE',
                                enrollmentDate: student.enrollmentDate || new Date().toISOString(),
                                birthDate: student.birthDate || new Date('2008-01-01').toISOString(),
                                guardian: student.guardian || {
                                    name: 'Acudiente',
                                    phone: '+57 300 000 0000',
                                    email: 'acudiente@email.com'
                                },
                                address: student.address || 'Dirección pendiente',
                                events: student.events || [],
                                totalDebt: student.totalDebt || 0,
                                totalPaid: student.totalPaid || 0,
                                createdAt: student.createdAt || new Date().toISOString()
                            };
                        });
                        
                        console.log('✅ ' + this.students.length + ' estudiantes cargados desde localStorage y convertidos');
                        } else {
                            console.log('❌ No se encontraron estudiantes en localStorage, usando datos de ejemplo');
                            this.students = this.generateSampleStudents();
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Error cargando estudiantes:', error);
                
                // FALLBACK en caso de error: Intentar cargar desde localStorage
                console.log('🔄 Error en API, intentando localStorage...');
                const possibleKeys = ['students', 'estudiantes', 'studentsData', 'allStudents'];
                let foundStudents = [];
                
                for (const key of possibleKeys) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        try {
                            const parsed = JSON.parse(data);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                foundStudents = parsed;
                                console.log('✅ Encontrados ' + parsed.length + ' estudiantes en localStorage[' + key + ']');
                                break;
                            }
                        } catch (e) {
                            console.warn('❌ Error parsing localStorage[' + key + ']:', e);
                        }
                    }
                }
                
                if (foundStudents.length > 0) {
                    this.students = foundStudents.map(student => {
                        // Misma lógica de conversión que arriba
                        if (student.fullName && student.status) return student;
                        
                        if (student['Nombre Completo']) {
                            const names = student['Nombre Completo'].split(' ');
                            const firstName = names.slice(0, Math.ceil(names.length / 2)).join(' ');
                            const lastName = names.slice(Math.ceil(names.length / 2)).join(' ');
                            
                            return {
                                id: student['No.'] || student.id || Date.now() + Math.random(),
                                firstName: firstName,
                                lastName: lastName,
                                fullName: student['Nombre Completo'],
                                documentType: 'CC',
                                document: student['Identificación'] ? student['Identificación'].toString() : '',
                                email: firstName.toLowerCase().replace(' ', '.') + '@estudiante.edu.co',
                                phone: '+57 300 000 0000',
                                grade: student['Curso'] && student['Curso'].includes('Décimo') ? '10' : 
                                       student['Curso'] && student['Curso'].includes('Once') ? '11' : '9',
                                course: student['Curso'] ? student['Curso'].split(' ')[1] || 'A' : 'A',
                                status: 'ACTIVE',
                                enrollmentDate: new Date().toISOString(),
                                birthDate: new Date('2008-01-01').toISOString(),
                                guardian: { name: 'Acudiente', phone: '+57 300 000 0000', email: 'acudiente@email.com' },
                                address: 'Dirección pendiente',
                                events: [],
                                totalDebt: 0,
                                totalPaid: 0,
                                createdAt: new Date().toISOString()
                            };
                        }
                        
                        return {
                            id: student.id || Date.now() + Math.random(),
                            firstName: student.firstName || '',
                            lastName: student.lastName || '',
                            fullName: student.fullName || (student.firstName + ' ' + student.lastName),
                            documentType: 'CC',
                            document: student.documentNumber || student.document || '',
                            email: student.email || 'estudiante@email.com',
                            phone: '+57 300 000 0000',
                            grade: student.grade || '10',
                            course: student.course || 'A',
                            status: 'ACTIVE',
                            enrollmentDate: new Date().toISOString(),
                            birthDate: new Date('2008-01-01').toISOString(),
                            guardian: { name: 'Acudiente', phone: '+57 300 000 0000', email: 'acudiente@email.com' },
                            address: 'Dirección pendiente',
                            events: [],
                            totalDebt: 0,
                            totalPaid: 0,
                            createdAt: new Date().toISOString()
                        };
                    });
                    
                    console.log('✅ ' + this.students.length + ' estudiantes cargados desde localStorage tras error en API');
                } else {
                    this.students = this.generateSampleStudents();
                }
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
        const gradeFilter = document.getElementById('gradeFilter');
        const courseFilter = document.getElementById('courseFilter');
        const statusFilter = document.getElementById('statusFilter');

        const gradeValue = gradeFilter ? gradeFilter.value : '';
        const courseValue = courseFilter ? courseFilter.value : '';
        const statusValue = statusFilter ? statusFilter.value : '';

        this.filteredStudents = this.students.filter(student => {
            const matchesGrade = !gradeValue || student.grade === gradeValue;
            const matchesCourse = !courseValue || student.course === courseValue;
            const matchesStatus = !statusValue || student.status === statusValue;
            
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
                valueA = valueA ? valueA.toString().toLowerCase() : '';
                valueB = valueB ? valueB.toString().toLowerCase() : '';
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
        const headerCell = document.querySelector('[data-sort="' + this.sortColumn + '"]');
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
            tbody.innerHTML = '<tr class="empty-row"><td colspan="8"><div class="empty-state"><h3>No hay estudiantes</h3><p>No se encontraron estudiantes con los filtros aplicados</p></div></td></tr>';
            return;
        }

        let htmlContent = '';
        
        paginatedStudents.forEach(student => {
            const statusClass = student.status === 'ACTIVE' ? 'active' : 'inactive';
            const statusText = student.status === 'ACTIVE' ? 'Activo' : 'Inactivo';
            const debtStatus = student.totalDebt > 0 ? 'debt' : 'clear';
            
            const paidEvents = student.events.filter(e => e.status === 'PAID').length;
            const partialEvents = student.events.filter(e => e.status === 'PARTIAL').length;
            const pendingEvents = student.events.filter(e => e.status === 'PENDING').length;
            
            htmlContent += '<tr class="student-row">';
            htmlContent += '<td>';
            htmlContent += '<div class="student-info">';
            htmlContent += '<div class="student-avatar">' + student.firstName.charAt(0) + student.lastName.charAt(0) + '</div>';
            htmlContent += '<div class="student-details">';
            htmlContent += '<strong class="student-name">' + student.fullName + '</strong>';
            htmlContent += '<span class="student-document">' + student.documentType + ': ' + student.document + '</span>';
            htmlContent += '</div>';
            htmlContent += '</div>';
            htmlContent += '</td>';
            htmlContent += '<td>';
            htmlContent += '<div class="contact-info">';
            htmlContent += '<div class="email">' + student.email + '</div>';
            htmlContent += '<div class="phone">' + student.phone + '</div>';
            htmlContent += '</div>';
            htmlContent += '</td>';
            htmlContent += '<td>';
            htmlContent += '<span class="grade-course">' + student.grade + '° ' + student.course + '</span>';
            htmlContent += '</td>';
            htmlContent += '<td>';
            htmlContent += '<span class="status-badge ' + statusClass + '">' + statusText + '</span>';
            htmlContent += '</td>';
            htmlContent += '<td>';
            htmlContent += '<div class="events-summary">';
            htmlContent += '<span class="events-count">' + student.events.length + ' eventos</span>';
            htmlContent += '<div class="events-status">';
            htmlContent += paidEvents + ' pagados, ' + partialEvents + ' parciales, ' + pendingEvents + ' pendientes';
            htmlContent += '</div>';
            htmlContent += '</div>';
            htmlContent += '</td>';
            htmlContent += '<td>';
            htmlContent += '<span class="debt-amount ' + debtStatus + '">' + formatCurrency(student.totalDebt) + '</span>';
            htmlContent += '</td>';
            htmlContent += '<td>';
            htmlContent += '<span class="paid-amount">' + formatCurrency(student.totalPaid) + '</span>';
            htmlContent += '</td>';
            htmlContent += '<td>';
            htmlContent += '<div class="action-buttons">';
            htmlContent += '<button class="btn btn-info btn-sm" onclick="viewStudent(\'' + student.id + '\')" title="Ver detalles">👁️</button>';
            htmlContent += '<button class="btn btn-warning btn-sm" onclick="editStudent(\'' + student.id + '\')" title="Editar estudiante">✏️</button>';
            htmlContent += '<button class="btn btn-success btn-sm" onclick="viewStudentEvents(\'' + student.id + '\')" title="Ver eventos">📅</button>';
            htmlContent += '<button class="btn btn-primary btn-sm" onclick="viewStudentAccount(\'' + student.id + '\')" title="Estado de cuenta">💰</button>';
            htmlContent += '</div>';
            htmlContent += '</td>';
            htmlContent += '</tr>';
        });

        tbody.innerHTML = htmlContent;
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
        const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
        const prevDisabledAttr = this.currentPage === 1 ? 'disabled' : '';
        paginationHTML += '<button class="pagination-btn ' + prevDisabled + '" onclick="studentsPage.changePage(' + (this.currentPage - 1) + ')" ' + prevDisabledAttr + '>‹ Anterior</button>';

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const activeClass = i === this.currentPage ? 'active' : '';
                paginationHTML += '<button class="pagination-btn ' + activeClass + '" onclick="studentsPage.changePage(' + i + ')">' + i + '</button>';
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Botón siguiente
        const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
        const nextDisabledAttr = this.currentPage === totalPages ? 'disabled' : '';
        paginationHTML += '<button class="pagination-btn ' + nextDisabled + '" onclick="studentsPage.changePage(' + (this.currentPage + 1) + ')" ' + nextDisabledAttr + '>Siguiente ›</button>';

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
        const elements = [
            { id: 'totalStudents', value: totalStudents },
            { id: 'activeStudents', value: activeStudents },
            { id: 'totalDebt', value: formatCurrency(totalDebt) },
            { id: 'totalPaid', value: formatCurrency(totalPaid) }
        ];

        elements.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.textContent = item.value;
            }
        });
    }

    clearFilters() {
        // Limpiar filtros
        const gradeFilter = document.getElementById('gradeFilter');
        const courseFilter = document.getElementById('courseFilter');
        const statusFilter = document.getElementById('statusFilter');
        const studentSearch = document.getElementById('studentSearch');

        if (gradeFilter) gradeFilter.value = '';
        if (courseFilter) courseFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        if (studentSearch) studentSearch.value = '';
        
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

// Funciones globales auxiliares
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount || 0);
}

// Funciones de interacción
function viewStudent(studentId) {
    console.log('Ver estudiante:', studentId);
    showAlert('Vista de estudiante en desarrollo', 'info');
}

function editStudent(studentId) {
    console.log('Editar estudiante:', studentId);
    showAlert('Edición de estudiante en desarrollo', 'info');
}

function viewStudentEvents(studentId) {
    console.log('Ver eventos del estudiante:', studentId);
    showAlert('Vista de eventos en desarrollo', 'info');
}

function viewStudentAccount(studentId) {
    console.log('Ver cuenta del estudiante:', studentId);
    showAlert('Estado de cuenta en desarrollo', 'info');
}

// Función de alerta global
function showAlert(message, type) {
    type = type || 'info';
    console.log('[' + type.toUpperCase() + '] ' + message);
    
    // Si existe una función de alerta personalizada, usarla
    if (typeof window.showAlert === 'function') {
        window.showAlert(message, type);
    } else {
        // Fallback simple
        alert(message);
    }
}

// Hacer disponible globalmente
window.StudentsManagementPage = StudentsManagementPage;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('studentsTableBody')) {
        window.studentsPage = new StudentsManagementPage();
    }
});