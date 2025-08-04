// ===================================
// EDUCONTA - Sistema de Gestión de Estudiantes (Versión Corregida)
// ===================================

class StudentsManagementPage {
    constructor() {
        console.log('🎓 Inicializando sistema de gestión de estudiantes (versión corregida)');
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
            
            // Obtener institutionId desde la URL o localStorage
            const urlParams = new URLSearchParams(window.location.search);
            const institutionId = urlParams.get('institutionId') || localStorage.getItem('institutionId') || 'cmdt7n66m00003t1jy17ay313';
            
            console.log('🏫 Usando institutionId:', institutionId);
            
            // Intentar cargar desde la API
            try {
                console.log('📡 Intentando cargar desde API...');
                const response = await fetch(`/api/students/${institutionId}`);
                console.log('📊 Respuesta API:', response.status, response.statusText);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('📦 Datos recibidos:', data);
                    
                    if (data.success && data.students && Array.isArray(data.students)) {
                        this.students = data.students;
                        console.log('✅ Estudiantes cargados desde API:', this.students.length);
                    } else {
                        console.log('⚠️ Formato de respuesta inesperado, usando fallback');
                        await this.loadFromFallback();
                    }
                } else {
                    console.log('⚠️ API no disponible, usando fallback');
                    await this.loadFromFallback();
                }
            } catch (apiError) {
                console.log('❌ Error en API:', apiError.message);
                console.log('🔄 Usando fallback...');
                await this.loadFromFallback();
            }
            
            this.filteredStudents = [...this.students];
            
            // Cargar eventos y grados
            this.events = this.generateSampleEvents();
            this.grades = this.generateGrades();
            this.courses = this.generateCourses();
            
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
            this.showError('Error cargando datos: ' + error.message);
        }
    }

    async loadFromFallback() {
        console.log('🔄 Cargando desde fallback...');
        
        // IMPORTANTE: Solo usar archivo de datos si la API falló completamente
        // Esto evita que los datos estáticos sobrescriban los datos actualizados en BD
        console.log('⚠️ API no disponible, usando datos estáticos como último recurso');
        
        // Primero intentar cargar desde el archivo de datos generado
        if (window.STUDENTS_DATA && Array.isArray(window.STUDENTS_DATA) && window.STUDENTS_DATA.length > 0) {
            console.log('📁 Encontrados ' + window.STUDENTS_DATA.length + ' estudiantes en archivo de datos estático');
            console.log('⚠️ ADVERTENCIA: Estos datos pueden estar desactualizados');
            this.students = window.STUDENTS_DATA.map(student => this.normalizeStudent(student));
            console.log('✅ ' + this.students.length + ' estudiantes cargados desde archivo de datos');
            return;
        }
        
        // Si no hay archivo de datos, intentar localStorage
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
            this.students = foundStudents.map(student => this.normalizeStudent(student));
            console.log('✅ ' + this.students.length + ' estudiantes cargados desde localStorage y convertidos');
        } else {
            console.log('❌ No se encontraron estudiantes, usando datos de ejemplo');
            this.students = this.generateSampleStudents();
        }
    }

    normalizeStudent(student) {
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
            firstName: student.firstName || student.nombre || '',
            lastName: student.lastName || student.apellido || '',
            fullName: student.fullName || `${student.firstName || student.nombre || ''} ${student.lastName || student.apellido || ''}`.trim(),
            documentType: student.documentType || 'CC',
            document: student.documentNumber || student.document || student.documento || '',
            email: student.email || 'estudiante@email.com',
            phone: student.phone || student.telefono || '+57 300 000 0000',
            grade: student.grade || student.grado || '10',
            course: student.course || student.curso || 'A',
            status: (student.status === 'activo' || student.estado === 'activo') ? 'ACTIVE' : 'ACTIVE',
            enrollmentDate: student.enrollmentDate || student.createdAt || new Date().toISOString(),
            birthDate: student.birthDate || student.fechaNacimiento || new Date('2008-01-01').toISOString(),
            guardian: student.guardian || {
                name: student.acudienteNombre || 'Acudiente',
                phone: student.acudienteTelefono || '+57 300 000 0000',
                email: student.acudienteEmail || 'acudiente@email.com'
            },
            address: student.address || student.direccion || 'Dirección pendiente',
            events: student.events || [],
            totalDebt: Number(student.totalDebt) || 0,
            totalPaid: Number(student.totalPaid) || 0,
            createdAt: student.createdAt || new Date().toISOString()
        };
    }

    generateSampleStudents() {
        console.log('🎭 Generando estudiantes de ejemplo...');
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
        // Si hay filtros dinámicos disponibles, usarlos
        if (window.dynamicFilters && window.dynamicFilters.courses.length > 0) {
            return window.dynamicFilters.courses.map(course => ({
                id: course.value,
                name: course.value
            }));
        }
        
        // Extraer cursos únicos de los datos de estudiantes
        if (this.students && this.students.length > 0) {
            const uniqueCourses = [...new Set(this.students.map(s => s.course))].filter(Boolean).sort();
            return uniqueCourses.map(course => ({
                id: course,
                name: course
            }));
        }
        
        // Fallback por defecto
        return [
            { id: '01', name: '01' },
            { id: '02', name: '02' },
            { id: '03', name: '03' }
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
        // Si no hay query, aplicar solo los filtros
        if (!query || !query.trim()) {
            this.filterStudents();
            return;
        }
        
        // Primero aplicar búsqueda de texto
        const searchTerm = query.toLowerCase();
        let searchResults = this.students.filter(student => 
            student.fullName.toLowerCase().includes(searchTerm) ||
            student.firstName.toLowerCase().includes(searchTerm) ||
            student.lastName.toLowerCase().includes(searchTerm) ||
            student.document.includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
        
        // Luego aplicar filtros adicionales
        const gradeFilter = document.getElementById('gradeFilter');
        const courseFilter = document.getElementById('courseFilter');
        const statusFilter = document.getElementById('statusFilter');

        const gradeValue = gradeFilter ? gradeFilter.value : '';
        const courseValue = courseFilter ? courseFilter.value : '';
        const statusValue = statusFilter ? statusFilter.value : '';

        if (gradeValue || courseValue || statusValue) {
            searchResults = searchResults.filter(student => {
                const matchesGrade = !gradeValue || student.grade === gradeValue;
                const matchesCourse = !courseValue || student.course === courseValue;
                
                let matchesStatus = true;
                if (statusValue) {
                    if (statusValue === 'current') {
                        matchesStatus = (student.totalDebt || 0) === 0;
                    } else if (statusValue === 'partial') {
                        matchesStatus = (student.totalPaid || 0) > 0 && (student.totalDebt || 0) > 0;
                    } else if (statusValue === 'overdue') {
                        matchesStatus = (student.totalDebt || 0) > 0;
                    }
                }
                
                return matchesGrade && matchesCourse && matchesStatus;
            });
        }
        
        this.filteredStudents = searchResults;
        this.currentPage = 1;
        this.renderStudents();
        this.updateStats();
    }

    clearSearch() {
        const searchInput = document.getElementById('studentSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        this.filteredStudents = [...this.students];
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

        console.log('🔍 Filtrando con:', { gradeValue, courseValue, statusValue });

        this.filteredStudents = this.students.filter(student => {
            // Comparar grados - asegurar que ambos valores tengan el mismo formato
            const matchesGrade = !gradeValue || student.grade === gradeValue;
            const matchesCourse = !courseValue || student.course === courseValue;
            
            let matchesStatus = true;
            if (statusValue) {
                if (statusValue === 'current') {
                    matchesStatus = (student.totalDebt || 0) === 0;
                } else if (statusValue === 'partial') {
                    matchesStatus = (student.totalPaid || 0) > 0 && (student.totalDebt || 0) > 0;
                } else if (statusValue === 'overdue') {
                    matchesStatus = (student.totalDebt || 0) > 0;
                }
            }
            
            return matchesGrade && matchesCourse && matchesStatus;
        });

        console.log('📊 Estudiantes filtrados:', this.filteredStudents.length);

        this.currentPage = 1;
        this.renderStudents();
        this.updateStats();
    }

    renderStudents() {
        console.log('🎨 Renderizando estudiantes...');
        const tbody = document.getElementById('studentsTableBody');
        
        if (!tbody) {
            console.error('❌ No se encontró el elemento studentsTableBody');
            return;
        }

        // Calcular paginación
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedStudents = this.filteredStudents.slice(startIndex, endIndex);

        if (paginatedStudents.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="8">
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
                            <div class="student-avatar" title="${student.fullName}">${student.firstName.charAt(0)}${student.lastName.charAt(0)}</div>
                            <div class="student-details">
                                <div class="student-name" title="${student.fullName}">${student.fullName}</div>
                                <div class="student-document">${student.documentType}: ${student.document}</div>
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
                        <span class="debt-amount ${debtStatus}" title="Deuda total: $${(student.totalDebt || 0).toLocaleString()}">
                            $${(student.totalDebt || 0).toLocaleString()}
                        </span>
                    </td>
                    <td role="cell">
                        <span class="paid-amount" title="Total pagado: $${(student.totalPaid || 0).toLocaleString()}">
                            $${(student.totalPaid || 0).toLocaleString()}
                        </span>
                    </td>
                    <td role="cell">
                        <div class="action-buttons" role="group" aria-label="Acciones para ${student.fullName}">
                            <button class="btn btn-info" onclick="viewStudent('${student.id}')" title="Ver detalles de ${student.fullName}" aria-label="Ver detalles">
                                👁️
                            </button>
                            <button class="btn btn-warning" onclick="editStudent('${student.id}')" title="Editar ${student.fullName}" aria-label="Editar">
                                ✏️
                            </button>
                            <button class="btn btn-success" onclick="viewStudentEvents('${student.id}')" title="Ver eventos de ${student.fullName}" aria-label="Ver eventos">
                                📅
                            </button>
                            <button class="btn btn-primary" onclick="viewStudentAccount('${student.id}')" title="Estado de cuenta de ${student.fullName}" aria-label="Estado de cuenta">
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
        paginationHTML += `<button class="pagination-btn ${prevDisabled}" onclick="studentsPage.changePage(${this.currentPage - 1})" ${prevDisabled ? 'disabled' : ''}>‹ Anterior</button>`;

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const activeClass = i === this.currentPage ? 'active' : '';
                paginationHTML += `<button class="pagination-btn ${activeClass}" onclick="studentsPage.changePage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Botón siguiente
        const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
        paginationHTML += `<button class="pagination-btn ${nextDisabled}" onclick="studentsPage.changePage(${this.currentPage + 1})" ${nextDisabled ? 'disabled' : ''}>Siguiente ›</button>`;

        paginationContainer.innerHTML = paginationHTML;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredStudents.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderStudents();
        }
    }

    updateStats() {
        console.log('📊 Actualizando estadísticas...');
        
        const totalStudents = this.students.length;
        const activeStudents = this.students.filter(s => s.status === 'ACTIVE').length;
        const studentsWithDebt = this.students.filter(s => s.totalDebt > 0).length;
        const studentsWithPayments = this.students.filter(s => s.totalPaid > 0).length;

        // Actualizar elementos del DOM
        this.updateElement('totalStudents', totalStudents);
        this.updateElement('currentStudents', activeStudents - studentsWithDebt);
        this.updateElement('partialStudents', studentsWithPayments);
        this.updateElement('overdueStudents', studentsWithDebt);
        
        console.log('✅ Estadísticas actualizadas');
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`⚠️ Elemento ${id} no encontrado`);
        }
    }

    showError(message) {
        console.error('❌ Error:', message);
        const tbody = document.getElementById('studentsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr class="error-row">
                    <td colspan="8">
                        <div class="error-state">
                            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                            <h3>Error al cargar datos</h3>
                            <p>${message}</p>
                            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 16px;">
                                🔄 Reintentar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    // Métodos de interacción
    showNewStudentModal() {
        console.log('➕ Mostrar modal nuevo estudiante');
        if (typeof showAlert === 'function') {
            showAlert('Modal de nuevo estudiante en desarrollo', 'info');
        } else {
            alert('Modal de nuevo estudiante en desarrollo');
        }
    }

    showBulkUploadModal() {
        console.log('📤 Mostrar modal carga masiva');
        if (typeof showAlert === 'function') {
            showAlert('Modal de carga masiva en desarrollo', 'info');
        } else {
            alert('Modal de carga masiva en desarrollo');
        }
    }

    exportReport() {
        console.log('📊 Exportar reporte');
        if (typeof showAlert === 'function') {
            showAlert('Exportación en desarrollo', 'info');
        } else {
            alert('Exportación en desarrollo');
        }
    }

    viewStudent(studentId) {
        console.log('👁️ Ver estudiante:', studentId);
        if (typeof showAlert === 'function') {
            showAlert('Vista de estudiante en desarrollo', 'info');
        } else {
            alert('Vista de estudiante en desarrollo');
        }
    }

    editStudent(studentId) {
        console.log('✏️ Editar estudiante:', studentId);
        if (typeof showAlert === 'function') {
            showAlert('Edición de estudiante en desarrollo', 'info');
        } else {
            alert('Edición de estudiante en desarrollo');
        }
    }

    viewStudentEvents(studentId) {
        console.log('📅 Ver eventos del estudiante:', studentId);
        if (typeof showAlert === 'function') {
            showAlert('Vista de eventos en desarrollo', 'info');
        } else {
            alert('Vista de eventos en desarrollo');
        }
    }

    viewStudentAccount(studentId) {
        console.log('💰 Ver cuenta del estudiante:', studentId);
        if (typeof showAlert === 'function') {
            showAlert('Estado de cuenta en desarrollo', 'info');
        } else {
            alert('Estado de cuenta en desarrollo');
        }
    }
}

// Funciones globales
function viewStudent(studentId) {
    if (window.studentsPage) {
        window.studentsPage.viewStudent(studentId);
    }
}

function editStudent(studentId) {
    if (window.studentsPage) {
        window.studentsPage.editStudent(studentId);
    }
}

function viewStudentEvents(studentId) {
    if (window.studentsPage) {
        window.studentsPage.viewStudentEvents(studentId);
    }
}

function viewStudentAccount(studentId) {
    if (window.studentsPage) {
        window.studentsPage.viewStudentAccount(studentId);
    }
}

function searchStudents() {
    if (window.studentsPage) {
        window.studentsPage.searchStudents();
    }
}

function clearSearch() {
    if (window.studentsPage) {
        window.studentsPage.clearSearch();
    }
}

function showNewStudentModal() {
    if (window.studentsPage) {
        window.studentsPage.showNewStudentModal();
    }
}

function showBulkUploadModal() {
    if (window.studentsPage) {
        window.studentsPage.showBulkUploadModal();
    }
}

function exportStudentsReport() {
    if (window.studentsPage) {
        window.studentsPage.exportReport();
    }
}

function sortStudents(column) {
    if (window.studentsPage) {
        window.studentsPage.sortStudents(column);
    }
}

function previousPage() {
    if (window.studentsPage) {
        window.studentsPage.changePage(window.studentsPage.currentPage - 1);
    }
}

function nextPage() {
    if (window.studentsPage) {
        window.studentsPage.changePage(window.studentsPage.currentPage + 1);
    }
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
    console.log('🚀 DOM cargado, inicializando StudentsManagementPage...');
    
    if (document.getElementById('studentsTableBody')) {
        window.studentsPage = new StudentsManagementPage();
        console.log('✅ StudentsManagementPage inicializada');
    } else {
        console.error('❌ No se encontró studentsTableBody, no se puede inicializar');
    }
});