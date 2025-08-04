// ===================================
// EDUCONTA - Sidebar Unificado
// ===================================

/**
 * Sidebar estándar para todas las páginas del sistema
 */
class UnifiedSidebar {
    constructor() {
        this.init();
    }

    init() {
        this.createSidebar();
        this.setupEventListeners();
        this.setActivePage();
    }

    createSidebar() {
        const sidebarHTML = `
            <div class="sidebar-header">
                <div class="logo">
                    <svg width="32" height="32" fill="currentColor" class="logo-icon">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span class="logo-text">Educonta</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <a href="accounting-dashboard.html" class="nav-item" data-page="accounting-dashboard.html">
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                    <span>Dashboard</span>
                </a>

                <a href="movements-management.html" class="nav-item" data-page="movements-management.html">
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>Movimientos</span>
                </a>

                <a href="invoices.html" class="nav-item" data-page="invoices.html">
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                    </svg>
                    <span>Facturas</span>
                </a>

                <a href="students-management.html" class="nav-item" data-page="students-management.html">
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-1c0-1.1.9-2 2-2h2l1.5-4.5L7.91 8.5C7.66 8.04 7.66 7.96 7.91 7.5L9.5 5H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1h-1.5L12.09 7.5c.25.46.25.54 0 1L10.5 10.5 12 15h2c1.1 0 2 .9 2 2v1H4z"/>
                    </svg>
                    <span>Estudiantes</span>
                </a>

                <a href="events-management.html" class="nav-item" data-page="events-management.html">
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    <span>Eventos</span>
                </a>

                <a href="clients-management.html" class="nav-item" data-page="clients-management.html">
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span>Clientes</span>
                </a>

                <a href="debts-management.html" class="nav-item" data-page="debts-management.html">
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                    <span>Deudas</span>
                </a>

                <a href="reports.html" class="nav-item" data-page="reports.html">
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                    <span>Reportes</span>
                </a>

                <a href="settings.html" class="nav-item" data-page="settings.html">
                    <svg width="20" height="20" fill="currentColor">
                        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                    </svg>
                    <span>Configuración</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <!-- THEME TOGGLE -->
                <div class="theme-toggle-container">
                    <span class="theme-label" id="light-label">CLARO</span>
                    <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" aria-label="Cambiar tema"></button>
                    <span class="theme-label" id="dark-label">OSCURO</span>
                </div>

                <div class="user-section">
                    <div class="user-info">
                        <div class="user-avatar">
                            <svg width="20" height="20" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>
                        <div class="user-details">
                            <span class="user-name">Contador</span>
                            <span class="user-role">Auxiliar Contable</span>
                        </div>
                    </div>
                    <button class="logout-btn" onclick="logout()">
                        <svg width="18" height="18" fill="currentColor">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Insertar el sidebar en el elemento .sidebar
        const sidebarElement = document.querySelector('.sidebar');
        if (sidebarElement) {
            sidebarElement.innerHTML = sidebarHTML;
        }
    }

    setupEventListeners() {
        // No necesitamos listeners complejos para submenús
        // Solo navegación simple
    }

    setActivePage() {
        // Marcar la página activa
        const currentPage = window.location.pathname.split('/').pop() || 'accounting-dashboard.html';
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const itemPage = item.getAttribute('data-page');
            if (itemPage === currentPage) {
                item.classList.add('active');
            }
        });
    }
}

// Funciones globales necesarias
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Cambiar tema inmediatamente
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
    
    // Guardar preferencia
    localStorage.setItem('theme', newTheme);
    
    console.log(`🎨 Tema cambiado a: ${newTheme}`);
}

function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        window.location.href = 'login.html';
    }
}

// Inicializar sidebar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    
    // Inicializar sidebar unificado
    new UnifiedSidebar();
});

// Exportar para uso global
window.UnifiedSidebar = UnifiedSidebar;