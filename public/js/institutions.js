// institutions.js - Script para gestión de instituciones
console.log('🚀 Script de instituciones cargado');

let currentUser = null;
let currentInstitutions = [];
let currentPage = 1;
let totalPages = 1;
let editingInstitution = null;
let viewingInstitution = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, iniciando verificación de autenticación');
    initializeTheme();
    checkAuth();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeLabels();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeLabels();
}

function updateThemeLabels() {
    const theme = document.documentElement.getAttribute('data-theme');
    const lightLabel = document.getElementById('light-label');
    const darkLabel = document.getElementById('dark-label');
    
    if (theme === 'dark') {
        lightLabel.classList.remove('active');
        darkLabel.classList.add('active');
    } else {
        lightLabel.classList.add('active');
        darkLabel.classList.remove('active');
    }
}

// Authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
    
    if (!token) {
        console.log('❌ No hay token, redirigiendo a login');
        window.location.href = '/login.html';
        return;
    }

    try {
        console.log('🔍 Verificando token con el servidor...');
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📡 Respuesta del servidor:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            console.log('👤 Usuario autenticado:', currentUser);
            
            // Verificar que sea SUPER_ADMIN
            if (currentUser.role !== 'SUPER_ADMIN') {
                console.log('❌ Usuario no es SUPER_ADMIN:', currentUser.role);
                showAccessDenied();
                return;
            }
            
            console.log('✅ Usuario es SUPER_ADMIN, cargando página');
            initializePage();
        } else {
            console.log('❌ Token inválido, limpiando y redirigiendo');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        window.location.href = '/login.html';
    }
}

function showAccessDenied() {
    document.querySelector('.main').innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border);">
            <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🔒</div>
            <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: var(--text);">Acceso Denegado</h3>
            <p style="color: var(--text-light); margin-bottom: 2rem;">
                Solo los Super Administradores pueden gestionar instituciones.<br>
                Tu rol actual es: <strong>${currentUser.role}</strong>
            </p>
            <a href="/dashboard.html" class="btn btn-secondary">
                <svg width="16" height="16" fill="currentColor">
                    <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Volver al Dashboard
            </a>
        </div>
    `;
}

// Page Initialization
function initializePage() {
    console.log('🏗️ Inicializando página de instituciones');
    loadDepartments();
    loadStats();
    loadInstitutions();
}

// Load Departments for filter
async function loadDepartments() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/institutions/departments', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const departmentFilter = document.getElementById('department-filter');
            
            data.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                departmentFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Load Statistics
async function loadStats() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/institutions/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateStats(data.data);
        } else {
            console.error('Error loading stats');
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStats(stats) {
    document.getElementById('total-institutions').textContent = stats.total || 0;
    document.getElementById('active-institutions').textContent = stats.active || 0;
    document.getElementById('with-students').textContent = stats.withStudents || 0;
    document.getElementById('recent-institutions').textContent = stats.recentInstitutions || 0;
}

// Load Institutions
async function loadInstitutions(page = 1) {
    const token = localStorage.getItem('token');
    const searchInput = document.getElementById('search-input');
    const departmentFilter = document.getElementById('department-filter');
    const educationLevelFilter = document.getElementById('education-level-filter');
    const statusFilter = document.getElementById('status-filter');
    
    // Show loading
    document.getElementById('table-loading').style.display = 'flex';
    
    try {
        const params = new URLSearchParams({
            page: page,
            limit: 10
        });

        if (searchInput.value.trim()) {
            params.append('search', searchInput.value.trim());
        }
        if (departmentFilter.value) {
            params.append('department', departmentFilter.value);
        }
        if (educationLevelFilter.value) {
            params.append('educationLevel', educationLevelFilter.value);
        }
        if (statusFilter.value !== 'all') {
            params.append('isActive', statusFilter.value);
        }

        const response = await fetch(`/api/institutions?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentInstitutions = data.data;
            currentPage = data.pagination.currentPage;
            totalPages = data.pagination.totalPages;
            
            updateInstitutionsTable();
            updatePagination();
        } else {
            showAlert('Error cargando instituciones', 'error');
        }
    } catch (error) {
        console.error('Error loading institutions:', error);
        showAlert('Error de conexión', 'error');
    } finally {
        document.getElementById('table-loading').style.display = 'none';
    }
}

function updateInstitutionsTable() {
    const tbody = document.getElementById('institutions-table-body');
    
    if (currentInstitutions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    No se encontraron instituciones
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = currentInstitutions.map(institution => `
        <tr class="fade-in">
            <td>
                <div style="font-weight: 600;">${institution.name}</div>
            </td>
            <td>${institution.nit}</td>
            <td>${institution.city}</td>
            <td>${institution.department}</td>
            <td>
                <span class="education-level">${institution.educationLevel}</span>
            </td>
            <td>
                <div style="font-weight: 600; color: var(--primary);">
                    ${institution._count?.students || 0}
                </div>
            </td>
            <td>
                <span class="status-badge ${institution.isActive ? 'status-active' : 'status-inactive'}">
                    ${institution.isActive ? 'Activa' : 'Inactiva'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-secondary" onclick="viewInstitution('${institution.id}')" title="Ver detalles">
                        <svg width="14" height="14" fill="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span class="btn-text">Ver</span>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editInstitution('${institution.id}')" title="Editar">
                        <svg width="14" height="14" fill="currentColor">
                            <path d="M11 4a2 2 0 114 4l-9 9-4 1 1-4 9-9z"/>
                        </svg>
                        <span class="btn-text">Editar</span>
                    </button>
                    <button class="btn btn-sm ${institution.isActive ? 'btn-danger' : 'btn-success'}" onclick="toggleInstitutionStatus('${institution.id}')" title="${institution.isActive ? 'Desactivar' : 'Activar'}">
                        <svg width="14" height="14" fill="currentColor">
                            ${institution.isActive ? 
                                '<path d="M18 6L6 18M6 6l12 12"/>' : 
                                '<path d="M20 6L9 17l-5-5"/>'
                            }
                        </svg>
                        <span class="btn-text">${institution.isActive ? 'Desactivar' : 'Activar'}</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="loadInstitutions(${currentPage - 1})">
            <svg width="16" height="16" fill="currentColor">
                <path d="M15 18l-6-6 6-6"/>
            </svg>
        </button>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadInstitutions(${i})">
                ${i}
            </button>
        `;
    }

    // Next button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="loadInstitutions(${currentPage + 1})">
            <svg width="16" height="16" fill="currentColor">
                <path d="M9 18l6-6-6-6"/>
            </svg>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// Modal Management
function openInstitutionModal() {
    editingInstitution = null;
    document.getElementById('modal-title').textContent = 'Nueva Institución';
    document.getElementById('institution-form').reset();
    document.getElementById('institution-modal').classList.add('show');
}

function closeInstitutionModal() {
    document.getElementById('institution-modal').classList.remove('show');
    editingInstitution = null;
}

function closeViewInstitutionModal() {
    document.getElementById('view-institution-modal').classList.remove('show');
    viewingInstitution = null;
}

// Institution Actions
async function viewInstitution(institutionId) {
    const institution = currentInstitutions.find(i => i.id === institutionId);
    if (!institution) return;

    viewingInstitution = institution;

    // Populate view modal
    document.getElementById('view-institution-name').textContent = institution.name || '-';
    document.getElementById('view-institution-nit').textContent = institution.nit || '-';
    document.getElementById('view-institution-city').textContent = institution.city || '-';
    document.getElementById('view-institution-department').textContent = institution.department || '-';
    document.getElementById('view-institution-education-level').textContent = institution.educationLevel || '-';
    document.getElementById('view-institution-phone').textContent = institution.phone || '-';
    document.getElementById('view-institution-email').textContent = institution.email || '-';
    document.getElementById('view-institution-website').textContent = institution.website || '-';
    document.getElementById('view-institution-address').textContent = institution.address || '-';
    document.getElementById('view-institution-description').textContent = institution.description || '-';
    document.getElementById('view-institution-status').innerHTML = `
        <span class="status-badge ${institution.isActive ? 'status-active' : 'status-inactive'}">
            ${institution.isActive ? 'Activa' : 'Inactiva'}
        </span>
    `;
    document.getElementById('view-institution-students').textContent = institution._count?.students || '0';
    document.getElementById('view-institution-created').textContent = institution.createdAt ? 
        new Date(institution.createdAt).toLocaleDateString('es-ES') : '-';
    document.getElementById('view-institution-updated').textContent = institution.updatedAt ? 
        new Date(institution.updatedAt).toLocaleDateString('es-ES') : '-';

    document.getElementById('view-institution-modal').classList.add('show');
}

function editFromView() {
    if (!viewingInstitution) return;
    
    closeViewInstitutionModal();
    editInstitution(viewingInstitution.id);
}

function editInstitution(institutionId) {
    const institution = currentInstitutions.find(i => i.id === institutionId);
    if (!institution) return;

    editingInstitution = institution;
    document.getElementById('modal-title').textContent = 'Editar Institución';

    // Populate form
    document.getElementById('institution-name').value = institution.name || '';
    document.getElementById('institution-nit').value = institution.nit || '';
    document.getElementById('institution-city').value = institution.city || '';
    document.getElementById('institution-department').value = institution.department || '';
    document.getElementById('institution-education-level').value = institution.educationLevel || '';
    document.getElementById('institution-phone').value = institution.phone || '';
    document.getElementById('institution-email').value = institution.email || '';
    document.getElementById('institution-website').value = institution.website || '';
    document.getElementById('institution-address').value = institution.address || '';
    document.getElementById('institution-description').value = institution.description || '';

    document.getElementById('institution-modal').classList.add('show');
}

async function toggleInstitutionStatus(institutionId) {
    const institution = currentInstitutions.find(i => i.id === institutionId);
    if (!institution) return;

    const action = institution.isActive ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de que quieres ${action} esta institución?`)) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/institutions/${institutionId}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showAlert(`Institución ${action}da exitosamente`, 'success');
            loadInstitutions(currentPage);
            loadStats();
        } else {
            const error = await response.json();
            showAlert(error.message || `Error al ${action} institución`, 'error');
        }
    } catch (error) {
        console.error('Error toggling institution status:', error);
        showAlert('Error de conexión', 'error');
    }
}

// Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const institutionForm = document.getElementById('institution-form');
    if (institutionForm) {
        institutionForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const token = localStorage.getItem('token');
            const saveBtn = document.getElementById('save-btn');
            const saveText = document.getElementById('save-text');
            const saveLoading = document.getElementById('save-loading');

            // Show loading
            saveBtn.disabled = true;
            saveText.style.display = 'none';
            saveLoading.style.display = 'inline-block';

            const formData = {
                name: document.getElementById('institution-name').value.trim(),
                nit: document.getElementById('institution-nit').value.trim(),
                city: document.getElementById('institution-city').value.trim(),
                department: document.getElementById('institution-department').value.trim(),
                educationLevel: document.getElementById('institution-education-level').value,
                phone: document.getElementById('institution-phone').value.trim() || null,
                email: document.getElementById('institution-email').value.trim() || null,
                website: document.getElementById('institution-website').value.trim() || null,
                address: document.getElementById('institution-address').value.trim(),
                description: document.getElementById('institution-description').value.trim() || null
            };

            try {
                const isEditing = editingInstitution !== null;
                const url = isEditing ? `/api/institutions/${editingInstitution.id}` : '/api/institutions';
                const method = isEditing ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const action = isEditing ? 'actualizada' : 'creada';
                    showAlert(`Institución ${action} exitosamente`, 'success');
                    closeInstitutionModal();
                    loadInstitutions(currentPage);
                    loadStats();
                } else {
                    const error = await response.json();
                    showAlert(error.message || 'Error guardando institución', 'error');
                }
            } catch (error) {
                console.error('Error saving institution:', error);
                showAlert('Error de conexión', 'error');
            } finally {
                // Hide loading
                saveBtn.disabled = false;
                saveText.style.display = 'inline';
                saveLoading.style.display = 'none';
            }
        });
    }
});

// Utility Functions
function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    const alertMessage = document.getElementById('alert-message');
    
    alert.className = `alert ${type} show`;
    alertMessage.textContent = message;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'institution-modal') {
            closeInstitutionModal();
        } else if (e.target.id === 'view-institution-modal') {
            closeViewInstitutionModal();
        }
    }
});

// Search on Enter key
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadInstitutions(1);
            }
        });
    }
});