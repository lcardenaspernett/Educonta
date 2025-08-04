// ===================================
// EDUCONTA - Sistema de Gestión de Estudiantes (Versión Simplificada)
// ===================================

class StudentsManagementPage {
    constructor() {
        console.log('🎓 Inicializando sistema de gestión de estudiantes (versión simple)');
        this.students = [];
        this.filteredStudents = [];
        this.init();
    }

    async init() {
        try {
            console.log('🔄 Iniciando carga de datos...');
            await this.loadData();
            console.log('✅ Inicialización completada');
        } catch (error) {
            console.error('❌ Error en inicialización:', error);
            this.showError('Error inicializando la página: ' + error.message);
        }
    }

    async loadData() {
        try {
            console.log('🔄 Cargando datos de estudiantes...');
            
            // Obtener institutionId
            const urlParams = new URLSearchParams(window.location.search);
            const institutionId = urlParams.get('institutionId') || localStorage.getItem('institutionId') || 'cmdt7n66m00003t1jy17ay313';
            
            console.log('🏫 Usando institutionId:', institutionId);
            
            // Intentar cargar desde API
            try {
                console.log('📡 Intentando cargar desde API...');
                const response = await fetch(`/api/students/${institutionId}`);
                console.log('📊 Respuesta API:', response.status, response.statusText);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('📦 Datos recibidos:', data);
                    
                    if (data.students && Array.isArray(data.students)) {
                        this.students = data.students;
                        console.log('✅ Estudiantes cargados desde API:', this.students.length);
                    } else {
                        console.log('⚠️ Formato de respuesta inesperado, usando datos de ejemplo');
                        this.students = this.generateSampleStudents();
                    }
                } else {
                    console.log('⚠️ API no disponible, usando datos de ejemplo');
                    this.students = this.generateSampleStudents();
                }
            } catch (apiError) {
                console.log('❌ Error en API:', apiError.message);
                console.log('🔄 Usando datos de ejemplo como fallback');
                this.students = this.generateSampleStudents();
            }
            
            this.filteredStudents = [...this.students];
            
            // Renderizar datos
            this.renderStudents();
            this.updateStats();
            
            console.log('✅ Datos cargados y renderizados exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            this.showError('Error cargando datos: ' + error.message);
        }
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
                events: [],
                totalDebt: 25000,
                totalPaid: 175000
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
                events: [],
                totalDebt: 30000,
                totalPaid: 50000
            }
        ];
    }

    renderStudents() {
        console.log('🎨 Renderizando estudiantes...');
        const tbody = document.getElementById('studentsTableBody');
        
        if (!tbody) {
            console.error('❌ No se encontró el elemento studentsTableBody');
            return;
        }

        if (this.filteredStudents.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="8">
                        <div class="empty-state">
                            <h3>No hay estudiantes</h3>
                            <p>No se encontraron estudiantes</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let htmlContent = '';
        
        this.filteredStudents.forEach(student => {
            const statusClass = student.status === 'ACTIVE' ? 'active' : 'inactive';
            const statusText = student.status === 'ACTIVE' ? 'Activo' : 'Inactivo';
            
            htmlContent += `
                <tr class="student-row">
                    <td>
                        <div class="student-info">
                            <div class="student-avatar">${student.firstName.charAt(0)}${student.lastName.charAt(0)}</div>
                            <div class="student-details">
                                <strong class="student-name">${student.fullName}</strong>
                                <span class="student-document">${student.documentType}: ${student.document}</span>
                            </div>
                        </div>
                    </td>
                    <td>${student.document}</td>
                    <td><span class="grade-course">${student.grade}° ${student.course}</span></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td><span class="events-count">${student.events ? student.events.length : 0} eventos</span></td>
                    <td><span class="debt-amount">$${student.totalDebt.toLocaleString()}</span></td>
                    <td><span class="paid-amount">$${student.totalPaid.toLocaleString()}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-info btn-sm" onclick="viewStudent('${student.id}')" title="Ver detalles">👁️</button>
                            <button class="btn btn-warning btn-sm" onclick="editStudent('${student.id}')" title="Editar">✏️</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = htmlContent;
        console.log('✅ Estudiantes renderizados:', this.filteredStudents.length);
    }

    updateStats() {
        console.log('📊 Actualizando estadísticas...');
        
        const totalStudents = this.students.length;
        const activeStudents = this.students.filter(s => s.status === 'ACTIVE').length;
        const studentsWithDebt = this.students.filter(s => s.totalDebt > 0).length;
        const studentsWithPayments = this.students.filter(s => s.totalPaid > 0).length;

        // Actualizar elementos del DOM
        this.updateElement('totalStudents', totalStudents);
        this.updateElement('currentStudents', activeStudents);
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
                            <h3>Error</h3>
                            <p>${message}</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    // Métodos de búsqueda y filtrado simplificados
    searchStudents() {
        console.log('🔍 Función de búsqueda llamada');
        // Implementación básica
        this.renderStudents();
    }

    clearSearch() {
        console.log('🧹 Limpiando búsqueda');
        this.filteredStudents = [...this.students];
        this.renderStudents();
    }

    showNewStudentModal() {
        console.log('➕ Mostrar modal nuevo estudiante');
        alert('Modal de nuevo estudiante en desarrollo');
    }

    showBulkUploadModal() {
        console.log('📤 Mostrar modal carga masiva');
        alert('Modal de carga masiva en desarrollo');
    }

    exportReport() {
        console.log('📊 Exportar reporte');
        alert('Exportación en desarrollo');
    }
}

// Funciones globales
function viewStudent(studentId) {
    console.log('👁️ Ver estudiante:', studentId);
    alert('Vista de estudiante en desarrollo');
}

function editStudent(studentId) {
    console.log('✏️ Editar estudiante:', studentId);
    alert('Edición de estudiante en desarrollo');
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