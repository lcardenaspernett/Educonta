/**
 * Gestor de Estudiantes con Carga CSV
 * Maneja la carga masiva de estudiantes desde archivos CSV
 */

class StudentsCSVManager {
    constructor() {
        this.students = [];
        this.filteredStudents = [];
        this.currentPage = 1;
        this.studentsPerPage = 12;
        this.institutionId = this.getInstitutionId();
        
        this.init();
    }

    getInstitutionId() {
        // Obtener de localStorage o URL params
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('institutionId') || localStorage.getItem('institutionId') || '1';
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadStudents();
            this.renderStudents();
            this.updateStats();
            console.log('✅ StudentsCSVManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando StudentsCSVManager:', error);
            this.showNotification('Error al inicializar la gestión de estudiantes', 'error');
        }
    }

    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterStudents());
        }

        // Filtros
        const filters = ['gradeFilter', 'courseFilter', 'statusFilter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.filterStudents());
            }
        });

        // Drag and drop para CSV
        const uploadArea = document.getElementById('uploadArea');
        const csvFile = document.getElementById('csvFile');

        if (uploadArea && csvFile) {
            uploadArea.addEventListener('click', () => csvFile.click());
            uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
            uploadArea.addEventListener('drop', this.handleDrop.bind(this));
            csvFile.addEventListener('change', this.handleFileSelect.bind(this));
        }
    }

    async loadStudents() {
        try {
            const response = await fetch(`/api/students/${this.institutionId}`);
            const data = await response.json();

            if (data.success) {
                this.students = data.students || [];
                this.filteredStudents = [...this.students];
                console.log(`📚 Cargados ${this.students.length} estudiantes`);
            } else {
                throw new Error(data.message || 'Error cargando estudiantes');
            }
        } catch (error) {
            console.error('Error cargando estudiantes:', error);
            this.students = [];
            this.filteredStudents = [];
        }
    }

    renderStudents() {
        const container = document.getElementById('studentsContainer');
        if (!container) return;

        if (this.filteredStudents.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="fas fa-user-graduate fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No hay estudiantes registrados</h5>
                        <p class="text-muted">Comienza cargando estudiantes desde un archivo CSV</p>
                        <button class="btn btn-primary" onclick="showUploadModal()">
                            <i class="fas fa-upload"></i> Cargar CSV
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // Paginación
        const startIndex = (this.currentPage - 1) * this.studentsPerPage;
        const endIndex = startIndex + this.studentsPerPage;
        const studentsToShow = this.filteredStudents.slice(startIndex, endIndex);

        const studentsHTML = studentsToShow.map(student => this.renderStudentCard(student)).join('');
        container.innerHTML = studentsHTML;

        this.renderPagination();
    }

    renderStudentCard(student) {
        const gradeColors = {
            '6': 'primary', '7': 'success', '8': 'info',
            '9': 'warning', '10': 'danger', '11': 'dark'
        };

        return `
            <div class="col-md-4 mb-3">
                <div class="card student-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${student.nombre} ${student.apellido}</h6>
                            <span class="badge bg-${gradeColors[student.grado] || 'secondary'} grade-badge">
                                ${student.grado}°${student.curso}
                            </span>
                        </div>
                        
                        <div class="student-info">
                            <small class="text-muted d-block">
                                <i class="fas fa-id-card me-1"></i> ${student.documento}
                            </small>
                            ${student.email ? `
                                <small class="text-muted d-block">
                                    <i class="fas fa-envelope me-1"></i> ${student.email}
                                </small>
                            ` : ''}
                            ${student.telefono ? `
                                <small class="text-muted d-block">
                                    <i class="fas fa-phone me-1"></i> ${student.telefono}
                                </small>
                            ` : ''}
                            ${student.acudienteNombre ? `
                                <small class="text-muted d-block">
                                    <i class="fas fa-user me-1"></i> ${student.acudienteNombre}
                                </small>
                            ` : ''}
                        </div>
                        
                        <div class="mt-3">
                            <span class="badge bg-${student.estado === 'activo' ? 'success' : 'secondary'}">
                                ${student.estado}
                            </span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-outline-primary btn-sm" onclick="viewStudent('${student.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" onclick="editStudent('${student.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-info btn-sm" onclick="viewEvents('${student.id}')">
                                <i class="fas fa-calendar"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredStudents.length / this.studentsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Botón anterior
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="studentsManager.changePage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="studentsManager.changePage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Botón siguiente
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="studentsManager.changePage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredStudents.length / this.studentsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderStudents();
        }
    }

    filterStudents() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const gradeFilter = document.getElementById('gradeFilter')?.value || '';
        const courseFilter = document.getElementById('courseFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        this.filteredStudents = this.students.filter(student => {
            const matchesSearch = !searchTerm || 
                student.nombre.toLowerCase().includes(searchTerm) ||
                student.apellido.toLowerCase().includes(searchTerm) ||
                student.documento.includes(searchTerm);

            const matchesGrade = !gradeFilter || student.grado === gradeFilter;
            const matchesCourse = !courseFilter || student.curso === courseFilter;
            const matchesStatus = !statusFilter || student.estado === statusFilter;

            return matchesSearch && matchesGrade && matchesCourse && matchesStatus;
        });

        this.currentPage = 1;
        this.renderStudents();
        this.updateStats();
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('gradeFilter').value = '';
        document.getElementById('courseFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.filterStudents();
    }

    updateStats() {
        const totalStudents = this.students.length;
        const activeStudents = this.students.filter(s => s.estado === 'activo').length;
        const grades = [...new Set(this.students.map(s => s.grado))].length;
        const courses = [...new Set(this.students.map(s => `${s.grado}${s.curso}`))].length;

        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('totalGrades').textContent = grades;
        document.getElementById('totalCourses').textContent = courses;
        document.getElementById('activeStudents').textContent = activeStudents;
    }

    // Manejo de archivos CSV
    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        if (!file.name.endsWith('.csv')) {
            this.showNotification('Por favor selecciona un archivo CSV válido', 'error');
            return;
        }

        // Mostrar información del archivo
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = `${(file.size / 1024).toFixed(2)} KB`;
        document.getElementById('fileInfo').style.display = 'block';
        document.getElementById('uploadBtn').disabled = false;

        // Guardar archivo para upload
        this.selectedFile = file;
    }

    async uploadCSV() {
        if (!this.selectedFile) {
            this.showNotification('Por favor selecciona un archivo CSV', 'error');
            return;
        }

        const uploadBtn = document.getElementById('uploadBtn');
        const progressContainer = document.getElementById('uploadProgress');
        const progressBar = progressContainer.querySelector('.progress-bar');

        try {
            // Mostrar progreso
            uploadBtn.disabled = true;
            progressContainer.style.display = 'block';
            progressBar.style.width = '10%';

            // Crear FormData
            const formData = new FormData();
            formData.append('csvFile', this.selectedFile);

            progressBar.style.width = '30%';

            // Enviar archivo
            const response = await fetch(`/api/csv/import/${this.institutionId}`, {
                method: 'POST',
                body: formData
            });

            progressBar.style.width = '70%';

            const result = await response.json();
            progressBar.style.width = '100%';

            // Mostrar resultados
            this.showUploadResults(result);

            if (result.success) {
                // Recargar estudiantes
                await this.loadStudents();
                this.renderStudents();
                this.updateStats();
            }

        } catch (error) {
            console.error('Error uploading CSV:', error);
            this.showUploadResults({
                success: false,
                message: 'Error al procesar el archivo CSV',
                error: error.message
            });
        } finally {
            uploadBtn.disabled = false;
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
            }, 2000);
        }
    }

    showUploadResults(result) {
        const resultsContainer = document.getElementById('uploadResults');
        const successAlert = document.getElementById('successAlert');
        const warningAlert = document.getElementById('warningAlert');
        const errorAlert = document.getElementById('errorAlert');

        // Ocultar todas las alertas
        successAlert.style.display = 'none';
        warningAlert.style.display = 'none';
        errorAlert.style.display = 'none';

        if (result.success) {
            if (result.duplicateErrors && result.duplicateErrors.length > 0) {
                // Éxito con advertencias
                warningAlert.style.display = 'block';
                document.getElementById('warningMessage').innerHTML = `
                    Se importaron <strong>${result.imported}</strong> estudiantes correctamente.<br>
                    <strong>${result.duplicates}</strong> estudiantes ya existían y fueron omitidos.
                `;
            } else {
                // Éxito completo
                successAlert.style.display = 'block';
                document.getElementById('successMessage').innerHTML = `
                    Se importaron <strong>${result.imported}</strong> estudiantes correctamente.
                `;
            }
        } else {
            // Error
            errorAlert.style.display = 'block';
            let errorHTML = `<p>${result.message}</p>`;
            
            if (result.errors && result.errors.length > 0) {
                errorHTML += '<ul class="mb-0">';
                result.errors.forEach(error => {
                    errorHTML += `<li>Fila ${error.row} (${error.documento}): ${error.errors.join(', ')}</li>`;
                });
                errorHTML += '</ul>';
            }
            
            document.getElementById('errorList').innerHTML = errorHTML;
        }

        resultsContainer.style.display = 'block';
    }

    showNotification(message, type = 'info') {
        // Crear notificación toast
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Funciones globales
function showUploadModal() {
    const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
    modal.show();
}

async function downloadTemplate() {
    try {
        const response = await fetch('/api/csv/template');
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla-estudiantes.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        studentsManager.showNotification('Plantilla descargada correctamente', 'success');
    } catch (error) {
        console.error('Error downloading template:', error);
        studentsManager.showNotification('Error al descargar la plantilla', 'error');
    }
}

function viewStudent(studentId) {
    studentsManager.showNotification('Función de ver estudiante en desarrollo', 'info');
}

function editStudent(studentId) {
    studentsManager.showNotification('Función de editar estudiante en desarrollo', 'info');
}

function viewEvents(studentId) {
    // Redirigir a eventos con filtro del estudiante
    window.location.href = `events-management.html?studentId=${studentId}`;
}

function exportStudents() {
    studentsManager.showNotification('Función de exportar en desarrollo', 'info');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('institutionId');
    window.location.href = '/login.html';
}

// Inicializar cuando se carga la página
let studentsManager;
document.addEventListener('DOMContentLoaded', () => {
    studentsManager = new StudentsCSVManager();
});