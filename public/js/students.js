// ===================================
// EDUCONTA - JavaScript para Gestión de Estudiantes
// ===================================

// Variables globales
let currentPage = 1;
let totalPages = 1;
let currentStudentId = null;
let studentsData = [];
let filtersData = {
    grades: [],
    sections: [],
    documentTypes: []
};

// ===================================
// INICIALIZACIÓN
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeTheme();
    initializeEventListeners();
});

// ===================================
// AUTENTICACIÓN
// ===================================

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            initializeApp();
        } else {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        window.location.href = '/login.html';
    }
}

// ===================================
// INICIALIZACIÓN DE LA APP
// ===================================

async function initializeApp() {
    try {
        await Promise.all([
            loadStudentStats(),
            loadStudentOptions(),
            loadStudents()
        ]);
    } catch (error) {
        console.error('Error inicializando aplicación:', error);
        showAlert('Error cargando datos iniciales', 'error');
    }
}

// ===================================
// TEMA
// ===================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeLabels();
}

function updateThemeLabels() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const lightLabel = document.getElementById('light-label');
    const darkLabel = document.getElementById('dark-label');
    
    if (currentTheme === 'dark') {
        lightLabel.classList.remove('active');
        darkLabel.classList.add('active');
    } else {
        lightLabel.classList.add('active');
        darkLabel.classList.remove('active');
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeLabels();
}

// ===================================
// EVENT LISTENERS
// ===================================

function initializeEventListeners() {
    // Formulario de estudiante
    document.getElementById('student-form').addEventListener('submit', handleStudentSubmit);
    
    // Búsqueda en tiempo real - Más rápido y fluido
    document.getElementById('search-input').addEventListener('input', debounce(() => loadStudents(1, true), 300));
    
    // Filtros
    document.getElementById('grade-filter').addEventListener('change', () => loadStudents(1));
    document.getElementById('section-filter').addEventListener('change', () => loadStudents(1));
    document.getElementById('status-filter').addEventListener('change', () => loadStudents(1));
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeStudentModal();
            closeViewStudentModal();
        }
    });
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('student-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeStudentModal();
        }
    });
    
    // Cerrar modal de vista al hacer clic fuera
    document.getElementById('view-student-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeViewStudentModal();
        }
    });
}

// ===================================
// ESTADÍSTICAS
// ===================================

async function loadStudentStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/students/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const stats = data.data;
            
            document.getElementById('total-students').textContent = stats.total;
            document.getElementById('active-students').textContent = stats.active;
            document.getElementById('inactive-students').textContent = stats.inactive;
            document.getElementById('recent-enrollments').textContent = stats.recentEnrollments;
        } else {
            throw new Error('Error cargando estadísticas');
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Mostrar valores por defecto
        document.getElementById('total-students').textContent = '0';
        document.getElementById('active-students').textContent = '0';
        document.getElementById('inactive-students').textContent = '0';
        document.getElementById('recent-enrollments').textContent = '0';
    }
}

// ===================================
// OPCIONES PARA FORMULARIOS
// ===================================

async function loadStudentOptions() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/students/options', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            filtersData = data.data;
            
            // Llenar filtros
            populateSelect('grade-filter', filtersData.grades);
            populateSelect('section-filter', filtersData.sections);
        } else {
            throw new Error('Error cargando opciones');
        }
    } catch (error) {
        console.error('Error cargando opciones:', error);
    }
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    // Limpiar opciones existentes (excepto la primera)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Agregar nuevas opciones
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
    
    // Restaurar valor seleccionado
    select.value = currentValue;
}

// ===================================
// CARGA DE ESTUDIANTES
// ===================================

async function loadStudents(page = 1, isSearch = false) {
    try {
        // Solo mostrar loading completo para navegación de páginas, no para búsquedas
        if (!isSearch) {
            showTableLoading(true);
        } else {
            // Para búsquedas, mostrar indicador sutil en el campo de búsqueda
            const searchInput = document.getElementById('search-input');
            searchInput.style.background = 'linear-gradient(90deg, var(--bg) 0%, var(--bg-secondary) 50%, var(--bg) 100%)';
            searchInput.style.backgroundSize = '200% 100%';
            searchInput.style.animation = 'shimmer 1s ease-in-out infinite';
        }
        
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
            page: page,
            limit: 20,
            search: document.getElementById('search-input').value,
            grade: document.getElementById('grade-filter').value,
            section: document.getElementById('section-filter').value,
            isActive: document.getElementById('status-filter').value,
            sortBy: 'lastName',
            sortOrder: 'asc'
        });

        const response = await fetch(`/api/students?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            studentsData = data.data;
            currentPage = data.pagination.currentPage;
            totalPages = data.pagination.totalPages;
            
            renderStudentsTable();
            renderPagination();
        } else {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error cargando estudiantes:', error);
        showAlert('Error cargando estudiantes', 'error');
        renderEmptyTable();
    } finally {
        // Ocultar loading apropiado según el tipo de operación
        if (!isSearch) {
            showTableLoading(false);
        } else {
            // Restaurar estilo normal del campo de búsqueda
            const searchInput = document.getElementById('search-input');
            searchInput.style.background = '';
            searchInput.style.backgroundSize = '';
            searchInput.style.animation = '';
        }
    }
}

function renderStudentsTable() {
    const tbody = document.getElementById('students-table-body');
    
    if (studentsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem;">
                    <p>No se encontraron estudiantes</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = studentsData.map(student => `
        <tr>
            <td><strong>${student.studentCode}</strong></td>
            <td>${student.firstName} ${student.lastName}</td>
            <td><span class="document-type">${student.documentType}</span></td>
            <td>${student.documentNumber}</td>
            <td>${student.grade}</td>
            <td>${student.section || '-'}</td>
            <td>
                <span class="status-badge ${student.isActive ? 'status-active' : 'status-inactive'}">
                    ${student.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="viewStudent('${student.id}')" title="Ver detalles">
                        <svg width="14" height="14" fill="currentColor">
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        <span class="btn-text">Ver</span>
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="editStudent('${student.id}')" title="Editar estudiante">
                        <svg width="14" height="14" fill="currentColor">
                            <path d="M11 4a2 2 0 114 4l-9 9-4 1 1-4 9-9z"/>
                        </svg>
                        <span class="btn-text">Editar</span>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteStudent('${student.id}')" title="Eliminar estudiante">
                        <svg width="14" height="14" fill="currentColor">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        <span class="btn-text">Eliminar</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderEmptyTable() {
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 2rem;">
                <p>Error cargando estudiantes</p>
            </td>
        </tr>
    `;
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Botón anterior
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="loadStudents(${currentPage - 1})">
            Anterior
        </button>
    `;
    
    // Números de página
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="loadStudents(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadStudents(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="loadStudents(${totalPages})">${totalPages}</button>`;
    }
    
    // Botón siguiente
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="loadStudents(${currentPage + 1})">
            Siguiente
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// ===================================
// MODAL DE ESTUDIANTE
// ===================================

function openStudentModal(studentId = null) {
    currentStudentId = studentId;
    const modal = document.getElementById('student-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('student-form');
    
    if (studentId) {
        title.textContent = 'Editar Estudiante';
        loadStudentData(studentId);
    } else {
        title.textContent = 'Nuevo Estudiante';
        form.reset();
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeStudentModal() {
    const modal = document.getElementById('student-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    currentStudentId = null;
    document.getElementById('student-form').reset();
}

async function loadStudentData(studentId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/students/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const student = data.data;
            
            // Llenar formulario
            document.getElementById('student-code').value = student.studentCode;
            document.getElementById('first-name').value = student.firstName;
            document.getElementById('last-name').value = student.lastName;
            document.getElementById('document-type').value = student.documentType;
            document.getElementById('document-number').value = student.documentNumber;
            document.getElementById('grade').value = student.grade;
            document.getElementById('section').value = student.section || '';
            document.getElementById('birth-date').value = student.birthDate ? student.birthDate.split('T')[0] : '';
            document.getElementById('parent-name').value = student.parentName || '';
            document.getElementById('parent-phone').value = student.parentPhone || '';
            document.getElementById('parent-email').value = student.parentEmail || '';
            document.getElementById('address').value = student.address || '';
        } else {
            throw new Error('Error cargando datos del estudiante');
        }
    } catch (error) {
        console.error('Error cargando estudiante:', error);
        showAlert('Error cargando datos del estudiante', 'error');
        closeStudentModal();
    }
}

// ===================================
// GUARDAR ESTUDIANTE
// ===================================

async function handleStudentSubmit(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('save-btn');
    const saveText = document.getElementById('save-text');
    const saveLoading = document.getElementById('save-loading');
    
    // Mostrar loading
    saveBtn.disabled = true;
    saveText.style.display = 'none';
    saveLoading.style.display = 'inline-block';
    
    try {
        // CONSTRUCCIÓN MEJORADA DEL FORM DATA - SIN NULLS (como en instituciones)
        const formData = {};
        
        // Campos requeridos
        formData.studentCode = document.getElementById('student-code').value.trim();
        formData.firstName = document.getElementById('first-name').value.trim();
        formData.lastName = document.getElementById('last-name').value.trim();
        formData.documentType = document.getElementById('document-type').value;
        formData.documentNumber = document.getElementById('document-number').value.trim();
        formData.grade = document.getElementById('grade').value;

        // Campos opcionales - SOLO SI TIENEN VALOR
        const section = document.getElementById('section').value.trim();
        if (section) {
            formData.section = section;
            console.log('✅ Agregando section:', section);
        }

        const birthDate = document.getElementById('birth-date').value;
        if (birthDate) {
            formData.birthDate = birthDate;
            console.log('✅ Agregando birthDate:', birthDate);
        }

        const parentName = document.getElementById('parent-name').value.trim();
        if (parentName) {
            formData.parentName = parentName;
            console.log('✅ Agregando parentName:', parentName);
        }

        const parentPhone = document.getElementById('parent-phone').value.trim();
        if (parentPhone) {
            formData.parentPhone = parentPhone;
            console.log('✅ Agregando parentPhone:', parentPhone);
        }

        const parentEmail = document.getElementById('parent-email').value.trim();
        if (parentEmail) {
            formData.parentEmail = parentEmail;
            console.log('✅ Agregando parentEmail:', parentEmail);
        }

        const address = document.getElementById('address').value.trim();
        if (address) {
            formData.address = address;
            console.log('✅ Agregando address:', address);
        }

        console.log('🔧 STUDENT FORM DATA FINAL (SIN NULLS):', JSON.stringify(formData, null, 2));
        
        const token = localStorage.getItem('token');
        const url = currentStudentId ? `/api/students/${currentStudentId}` : '/api/students';
        const method = currentStudentId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert(data.message, 'success');
            closeStudentModal();
            await Promise.all([
                loadStudents(currentPage),
                loadStudentStats(),
                loadStudentOptions()
            ]);
        } else {
            throw new Error(data.error || 'Error guardando estudiante');
        }
    } catch (error) {
        console.error('Error guardando estudiante:', error);
        showAlert(error.message, 'error');
    } finally {
        // Ocultar loading
        saveBtn.disabled = false;
        saveText.style.display = 'inline';
        saveLoading.style.display = 'none';
    }
}

// ===================================
// ACCIONES DE ESTUDIANTE
// ===================================

function viewStudent(studentId) {
    openViewStudentModal(studentId);
}

function editStudent(studentId) {
    openStudentModal(studentId);
}

// ===================================
// MODAL DE VISTA (SOLO LECTURA)
// ===================================

async function openViewStudentModal(studentId) {
    try {
        const modal = document.getElementById('view-student-modal');
        
        // Mostrar modal con loading
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/students/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const student = data.data;
            
            // Llenar datos de vista
            document.getElementById('view-student-code').textContent = student.studentCode || '-';
            document.getElementById('view-first-name').textContent = student.firstName || '-';
            document.getElementById('view-last-name').textContent = student.lastName || '-';
            document.getElementById('view-document-type').textContent = getDocumentTypeLabel(student.documentType) || '-';
            document.getElementById('view-document-number').textContent = student.documentNumber || '-';
            document.getElementById('view-grade').textContent = student.grade || '-';
            document.getElementById('view-section').textContent = student.section || '-';
            document.getElementById('view-birth-date').textContent = student.birthDate ? formatDate(student.birthDate) : '-';
            document.getElementById('view-parent-name').textContent = student.parentName || '-';
            document.getElementById('view-parent-phone').textContent = student.parentPhone || '-';
            document.getElementById('view-parent-email').textContent = student.parentEmail || '-';
            document.getElementById('view-address').textContent = student.address || '-';
            document.getElementById('view-status').innerHTML = `
                <span class="status-badge ${student.isActive ? 'status-active' : 'status-inactive'}">
                    ${student.isActive ? 'Activo' : 'Inactivo'}
                </span>
            `;
            document.getElementById('view-enrollment-date').textContent = student.enrollmentDate ? formatDate(student.enrollmentDate) : '-';
            
            // Guardar ID para función de editar
            currentStudentId = studentId;
        } else {
            throw new Error('Error cargando datos del estudiante');
        }
    } catch (error) {
        console.error('Error cargando estudiante:', error);
        showAlert('Error cargando datos del estudiante', 'error');
        closeViewStudentModal();
    }
}

function closeViewStudentModal() {
    const modal = document.getElementById('view-student-modal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    currentStudentId = null;
}

function editFromView() {
    if (currentStudentId) {
        closeViewStudentModal();
        setTimeout(() => {
            openStudentModal(currentStudentId);
        }, 300);
    }
}

// ===================================
// FUNCIONES HELPER
// ===================================

function getDocumentTypeLabel(type) {
    const types = {
        'TI': 'Tarjeta de Identidad',
        'CC': 'Cédula de Ciudadanía',
        'CE': 'Cédula de Extranjería',
        'PP': 'Pasaporte',
        'RC': 'Registro Civil'
    };
    return types[type] || type;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

async function deleteStudent(studentId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/students/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert(data.message, 'success');
            await Promise.all([
                loadStudents(currentPage),
                loadStudentStats()
            ]);
        } else {
            throw new Error(data.error || 'Error eliminando estudiante');
        }
    } catch (error) {
        console.error('Error eliminando estudiante:', error);
        showAlert(error.message, 'error');
    }
}

// ===================================
// UTILIDADES
// ===================================

function showTableLoading(show) {
    const loading = document.getElementById('table-loading');
    loading.style.display = show ? 'flex' : 'none';
}

function showAlert(message, type = 'error') {
    const alert = document.getElementById('alert');
    const alertMessage = document.getElementById('alert-message');
    
    alert.className = `alert ${type}`;
    alertMessage.textContent = message;
    alert.classList.add('show');
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}