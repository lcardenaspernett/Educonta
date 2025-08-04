// ===================================
// SISTEMA DE FILTROS DINÁMICOS
// ===================================

class DynamicFilters {
    constructor() {
        this.grades = [];
        this.courses = [];
        this.init();
    }

    async init() {
        console.log('🔧 Inicializando filtros dinámicos...');
        await this.loadFilterConfig();
        this.updateFilterOptions();
    }

    async loadFilterConfig() {
        try {
            // Intentar cargar configuración desde archivo
            if (window.FILTER_CONFIG) {
                this.grades = window.FILTER_CONFIG.grades || [];
                this.courses = window.FILTER_CONFIG.courses || [];
                console.log('✅ Configuración de filtros cargada desde archivo');
                return;
            }

            // Si no hay configuración, obtener desde los datos de estudiantes
            if (window.STUDENTS_DATA && Array.isArray(window.STUDENTS_DATA)) {
                this.extractFiltersFromData();
                console.log('✅ Filtros extraídos desde datos de estudiantes');
                return;
            }

            // Fallback: obtener desde API
            await this.loadFiltersFromAPI();
            
        } catch (error) {
            console.error('❌ Error cargando configuración de filtros:', error);
            this.setDefaultFilters();
        }
    }

    extractFiltersFromData() {
        const gradesSet = new Set();
        const coursesSet = new Set();

        window.STUDENTS_DATA.forEach(student => {
            if (student.grade) gradesSet.add(student.grade);
            if (student.course) coursesSet.add(student.course);
        });

        // Convertir a arrays ordenados
        this.grades = Array.from(gradesSet).sort().map(g => ({
            value: g,
            label: `${g}° (${this.getGradeName(g)})`
        }));

        this.courses = Array.from(coursesSet).sort().map(c => ({
            value: c,
            label: `Curso ${c}`
        }));

        console.log('📚 Grados encontrados:', this.grades);
        console.log('📖 Cursos encontrados:', this.courses);
    }

    async loadFiltersFromAPI() {
        try {
            const institutionId = localStorage.getItem('institutionId') || 'cmdt7n66m00003t1jy17ay313';
            const response = await fetch(`/api/students/${institutionId}/filters`);
            
            if (response.ok) {
                const data = await response.json();
                this.grades = data.grades || [];
                this.courses = data.courses || [];
                console.log('✅ Filtros cargados desde API');
            } else {
                throw new Error('API no disponible');
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar filtros desde API:', error.message);
            this.setDefaultFilters();
        }
    }

    setDefaultFilters() {
        console.log('🔧 Usando filtros por defecto...');
        this.grades = [
            { value: '6', label: '6° (Sexto)' },
            { value: '7', label: '7° (Séptimo)' },
            { value: '8', label: '8° (Octavo)' },
            { value: '9', label: '9° (Noveno)' },
            { value: '10', label: '10° (Décimo)' },
            { value: '11', label: '11° (Undécimo)' }
        ];

        this.courses = [
            { value: '01', label: 'Curso 01' },
            { value: '02', label: 'Curso 02' },
            { value: '03', label: 'Curso 03' }
        ];
    }

    updateFilterOptions() {
        console.log('🔄 Actualizando opciones de filtros...');
        
        // Actualizar filtro de grados
        const gradeFilter = document.getElementById('gradeFilter');
        if (gradeFilter) {
            const currentValue = gradeFilter.value;
            gradeFilter.innerHTML = '<option value="">Todos los grados</option>';
            
            this.grades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade.value;
                option.textContent = grade.label;
                if (grade.value === currentValue) {
                    option.selected = true;
                }
                gradeFilter.appendChild(option);
            });
            
            console.log('✅ Filtro de grados actualizado con', this.grades.length, 'opciones');
        }

        // Actualizar filtro de cursos
        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter) {
            const currentValue = courseFilter.value;
            courseFilter.innerHTML = '<option value="">Todos los cursos</option>';
            
            this.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.value;
                option.textContent = course.label;
                if (course.value === currentValue) {
                    option.selected = true;
                }
                courseFilter.appendChild(option);
            });
            
            console.log('✅ Filtro de cursos actualizado con', this.courses.length, 'opciones');
        }
    }

    getGradeName(grade) {
        const names = {
            '6': 'Sexto',
            '7': 'Séptimo',
            '8': 'Octavo',
            '9': 'Noveno',
            '10': 'Décimo',
            '11': 'Undécimo'
        };
        return names[grade] || `Grado ${grade}`;
    }

    // Método para refrescar filtros cuando cambien los datos
    async refresh() {
        console.log('🔄 Refrescando filtros dinámicos...');
        await this.loadFilterConfig();
        this.updateFilterOptions();
    }

    // Obtener estadísticas de filtros
    getFilterStats() {
        return {
            totalGrades: this.grades.length,
            totalCourses: this.courses.length,
            grades: this.grades.map(g => g.value),
            courses: this.courses.map(c => c.value)
        };
    }
}

// Instancia global
window.dynamicFilters = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para asegurar que otros scripts se hayan cargado
    setTimeout(() => {
        window.dynamicFilters = new DynamicFilters();
    }, 500);
});

// Función global para refrescar filtros
function refreshFilters() {
    if (window.dynamicFilters) {
        window.dynamicFilters.refresh();
    }
}

console.log('📦 Sistema de filtros dinámicos cargado');