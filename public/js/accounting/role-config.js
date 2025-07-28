// ===================================
// EDUCONTA - Configuración de Roles para Demo
// ===================================

/**
 * Configurador de roles para demostración del sistema de aprobaciones
 */
class RoleConfigurator {
    constructor() {
        this.init();
    }

    init() {
        console.log('👤 Inicializando configurador de roles');
        this.setupRoleSelector();
        this.setDefaultRole();
    }

    /**
     * Crear selector de rol en el dashboard
     */
    setupRoleSelector() {
        // Esperar a que el dashboard esté listo
        setTimeout(() => {
            this.createRoleSelector();
        }, 2000);
    }

    /**
     * Crear selector de rol
     */
    createRoleSelector() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions || document.getElementById('roleSelector')) return;

        const roleSelector = document.createElement('div');
        roleSelector.className = 'role-selector';
        roleSelector.innerHTML = `
            <div class="role-selector-container">
                <label for="roleSelect" class="role-label">
                    <svg width="16" height="16" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Rol:
                </label>
                <select id="roleSelect" class="role-select" onchange="roleConfigurator.changeRole(this.value)">
                    <option value="AUXILIARY_ACCOUNTANT">Contador Auxiliar</option>
                    <option value="RECTOR">Rector</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                </select>
            </div>
        `;

        headerActions.insertBefore(roleSelector, headerActions.firstChild);
        this.addRoleSelectorStyles();
    }

    /**
     * Cambiar rol del usuario
     */
    changeRole(newRole) {
        console.log(`👤 Cambiando rol a: ${newRole}`);

        // Actualizar en AccountingState
        if (window.AccountingState) {
            const currentUser = window.AccountingState.get('user') || {};
            currentUser.role = newRole;
            window.AccountingState.set('user', currentUser);
        }

        // Actualizar en localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.role = newRole;
        localStorage.setItem('user', JSON.stringify(user));

        // Actualizar sistema de aprobaciones
        if (window.approvalSystem) {
            window.approvalSystem.userRole = newRole;
        }

        // Actualizar displays
        this.updateRoleDisplay(newRole);
        this.updateApprovalCapabilities();

        // Mostrar notificación
        this.showRoleChangeNotification(newRole);

        // Recargar facturas pendientes si existe el manager
        if (window.pendingInvoicesManager) {
            setTimeout(() => {
                window.pendingInvoicesManager.updateAllDisplays();
            }, 500);
        }
    }

    /**
     * Actualizar display del rol
     */
    updateRoleDisplay(role) {
        const roleLabels = {
            'AUXILIARY_ACCOUNTANT': 'Contador Auxiliar',
            'RECTOR': 'Rector',
            'SUPER_ADMIN': 'Super Administrador'
        };

        // Actualizar nombre de usuario en sidebar
        const userRole = document.querySelector('.user-role');
        if (userRole) {
            userRole.textContent = roleLabels[role] || role;
        }

        // Actualizar información del usuario
        const userName = document.querySelector('.user-name');
        if (userName && role === 'RECTOR') {
            userName.textContent = 'Dr. Rector';
        } else if (userName && role === 'AUXILIARY_ACCOUNTANT') {
            userName.textContent = 'Contador';
        } else if (userName && role === 'SUPER_ADMIN') {
            userName.textContent = 'Administrador';
        }
    }

    /**
     * Actualizar capacidades de aprobación
     */
    updateApprovalCapabilities() {
        // Mostrar/ocultar botones según el rol
        const approvalButtons = document.querySelectorAll('[data-requires-role]');
        approvalButtons.forEach(button => {
            const requiredRoles = button.dataset.requiresRole.split(',');
            const currentRole = this.getCurrentRole();
            
            if (requiredRoles.includes(currentRole)) {
                button.style.display = '';
                button.disabled = false;
            } else {
                button.style.display = 'none';
                button.disabled = true;
            }
        });
    }

    /**
     * Mostrar notificación de cambio de rol
     */
    showRoleChangeNotification(role) {
        const roleLabels = {
            'AUXILIARY_ACCOUNTANT': 'Contador Auxiliar',
            'RECTOR': 'Rector',
            'SUPER_ADMIN': 'Super Administrador'
        };

        const capabilities = this.getRoleCapabilities(role);
        
        const message = `Rol cambiado a: ${roleLabels[role]}\n\nCapacidades:\n${capabilities.join('\n')}`;
        
        if (window.showAlert) {
            window.showAlert(`Ahora eres: ${roleLabels[role]}`, 'info');
        } else {
            console.log(message);
        }

        // Mostrar capacidades en consola para demo
        console.log('👤 Capacidades del rol:', capabilities);
    }

    /**
     * Obtener capacidades del rol
     */
    getRoleCapabilities(role) {
        const capabilities = {
            'AUXILIARY_ACCOUNTANT': [
                '• Aprobar mensualidades hasta $500.000',
                '• Aprobar rifas hasta $100.000',
                '• Aprobar uniformes y carnets',
                '• Aprobar certificados automáticamente',
                '• Ver todas las facturas pendientes'
            ],
            'RECTOR': [
                '• Aprobar TODAS las facturas',
                '• Aprobar matrículas (exclusivo)',
                '• Aprobar excursiones (exclusivo)',
                '• Aprobar ceremonias de grado (exclusivo)',
                '• Rechazar cualquier factura',
                '• Aprobar montos sin límite'
            ],
            'SUPER_ADMIN': [
                '• Todas las capacidades del Rector',
                '• Gestión completa del sistema',
                '• Configuración de reglas de aprobación',
                '• Acceso a todas las instituciones'
            ]
        };

        return capabilities[role] || [];
    }

    /**
     * Establecer rol por defecto
     */
    setDefaultRole() {
        const currentRole = this.getCurrentRole();
        const roleSelect = document.getElementById('roleSelect');
        
        if (roleSelect) {
            roleSelect.value = currentRole;
        }

        this.updateRoleDisplay(currentRole);
    }

    /**
     * Obtener rol actual
     */
    getCurrentRole() {
        if (window.AccountingState) {
            const user = window.AccountingState.get('user');
            if (user && user.role) return user.role;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role || 'AUXILIARY_ACCOUNTANT';
    }

    /**
     * Crear demo de aprobaciones por rol
     */
    createApprovalDemo() {
        const demoData = {
            'AUXILIARY_ACCOUNTANT': {
                canApprove: [
                    'Mensualidad ($350.000)',
                    'Uniforme ($120.000)',
                    'Rifa ($75.000)',
                    'Certificado ($25.000)'
                ],
                cannotApprove: [
                    'Matrícula ($800.000) - Solo Rector',
                    'Excursión ($450.000) - Solo Rector'
                ]
            },
            'RECTOR': {
                canApprove: [
                    'TODAS las facturas',
                    'Matrícula ($800.000)',
                    'Excursión ($450.000)',
                    'Mensualidad con descuento',
                    'Cualquier monto'
                ],
                cannotApprove: []
            }
        };

        return demoData;
    }

    /**
     * Agregar estilos del selector de rol
     */
    addRoleSelectorStyles() {
        const styles = `
            <style>
                .role-selector {
                    margin-right: 1rem;
                }

                .role-selector-container {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .role-selector-container:hover {
                    background: var(--bg-hover);
                    border-color: var(--primary);
                }

                .role-label {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text);
                    margin: 0;
                    cursor: pointer;
                }

                .role-select {
                    background: transparent;
                    border: none;
                    color: var(--text);
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    outline: none;
                    padding: 0.25rem;
                    border-radius: 4px;
                }

                .role-select:focus {
                    background: var(--bg);
                    box-shadow: 0 0 0 2px var(--primary);
                }

                .role-select option {
                    background: var(--bg-card);
                    color: var(--text);
                    padding: 0.5rem;
                }

                /* Indicador visual del rol activo */
                .role-selector-container::before {
                    content: '';
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--success);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .role-selector {
                        margin-right: 0.5rem;
                    }
                    
                    .role-label {
                        font-size: 0.75rem;
                    }
                    
                    .role-select {
                        font-size: 0.75rem;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.roleConfigurator = new RoleConfigurator();
    }, 1000);
});

console.log('👤 Configurador de roles cargado');