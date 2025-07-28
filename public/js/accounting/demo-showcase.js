// ===================================
// EDUCONTA - Demostración del Sistema de Aprobaciones
// ===================================

/**
 * Script para demostrar las capacidades del sistema de aprobaciones
 */
class ApprovalSystemDemo {
    constructor() {
        this.init();
    }

    init() {
        console.log('🎭 Inicializando demostración del sistema de aprobaciones');
        this.setupDemoControls();
        this.showWelcomeMessage();
    }

    /**
     * Configurar controles de demostración
     */
    setupDemoControls() {
        // Agregar botón de demo en el dashboard
        setTimeout(() => {
            this.createDemoButton();
        }, 4000);
    }

    /**
     * Crear botón de demostración
     */
    createDemoButton() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions || document.getElementById('demoButton')) return;

        const demoButton = document.createElement('button');
        demoButton.id = 'demoButton';
        demoButton.className = 'btn btn-secondary';
        demoButton.innerHTML = `
            <svg width="16" height="16" fill="currentColor">
                <path d="M13 2L3 14l4 4 10-12z"/>
            </svg>
            Demo Sistema
        `;
        demoButton.onclick = () => this.startDemo();

        headerActions.appendChild(demoButton);
    }

    /**
     * Iniciar demostración guiada
     */
    startDemo() {
        this.showDemoModal();
    }

    /**
     * Mostrar modal de demostración
     */
    showDemoModal() {
        const modal = document.createElement('div');
        modal.className = 'demo-modal';
        modal.innerHTML = `
            <div class="demo-modal-content">
                <div class="demo-header">
                    <h2>🎭 Demostración del Sistema de Aprobaciones</h2>
                    <button class="close-btn" onclick="this.closest('.demo-modal').remove()">×</button>
                </div>
                
                <div class="demo-body">
                    <div class="demo-section">
                        <h3>🎯 ¿Qué puedes probar?</h3>
                        <div class="demo-features">
                            <div class="feature-item">
                                <span class="feature-icon">👥</span>
                                <div class="feature-content">
                                    <h4>Cambio de Roles</h4>
                                    <p>Usa el selector de rol para cambiar entre Contador Auxiliar, Rector y Super Admin</p>
                                </div>
                            </div>
                            
                            <div class="feature-item">
                                <span class="feature-icon">📋</span>
                                <div class="feature-content">
                                    <h4>Facturas Pendientes</h4>
                                    <p>Ve cómo cambian las facturas que puedes aprobar según tu rol</p>
                                </div>
                            </div>
                            
                            <div class="feature-item">
                                <span class="feature-icon">✅</span>
                                <div class="feature-content">
                                    <h4>Aprobaciones</h4>
                                    <p>Aprueba facturas y ve cómo se crean transacciones automáticamente</p>
                                </div>
                            </div>
                            
                            <div class="feature-item">
                                <span class="feature-icon">🚨</span>
                                <div class="feature-content">
                                    <h4>Prioridades</h4>
                                    <p>Observa facturas urgentes, vencidas y de alta prioridad</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="demo-section">
                        <h3>🎮 Escenarios de Prueba</h3>
                        <div class="demo-scenarios">
                            <button class="scenario-btn" onclick="demoShowcase.runScenario('contador')">
                                🧮 Como Contador Auxiliar
                            </button>
                            <button class="scenario-btn" onclick="demoShowcase.runScenario('rector')">
                                🎓 Como Rector
                            </button>
                            <button class="scenario-btn" onclick="demoShowcase.runScenario('comparison')">
                                ⚖️ Comparar Roles
                            </button>
                            <button class="scenario-btn" onclick="demoShowcase.runScenario('workflow')">
                                🔄 Flujo Completo
                            </button>
                        </div>
                    </div>
                    
                    <div class="demo-section">
                        <h3>📊 Datos de Ejemplo</h3>
                        <div class="demo-data">
                            <div class="data-item">
                                <strong>5 Facturas Pendientes:</strong>
                                <ul>
                                    <li>Matrícula $800.000 (Solo Rector)</li>
                                    <li>Mensualidad $350.000 (Contador/Rector)</li>
                                    <li>Rifa $75.000 (Contador/Rector)</li>
                                    <li>Excursión $450.000 (Solo Rector)</li>
                                    <li>Uniforme $120.000 (Contador/Rector)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="demo-footer">
                    <button class="btn btn-outline" onclick="this.closest('.demo-modal').remove()">
                        Cerrar
                    </button>
                    <button class="btn btn-primary" onclick="demoShowcase.startGuidedTour()">
                        🚀 Iniciar Tour Guiado
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addDemoStyles();
    }

    /**
     * Ejecutar escenario específico
     */
    runScenario(scenario) {
        // Cerrar modal
        const modal = document.querySelector('.demo-modal');
        if (modal) modal.remove();

        switch (scenario) {
            case 'contador':
                this.runContadorScenario();
                break;
            case 'rector':
                this.runRectorScenario();
                break;
            case 'comparison':
                this.runComparisonScenario();
                break;
            case 'workflow':
                this.runWorkflowScenario();
                break;
        }
    }

    /**
     * Escenario: Contador Auxiliar
     */
    async runContadorScenario() {
        this.showNotification('🧮 Cambiando a rol de Contador Auxiliar...', 'info');
        
        // Cambiar rol
        if (window.roleConfigurator) {
            window.roleConfigurator.changeRole('AUXILIARY_ACCOUNTANT');
        }

        await this.delay(1000);

        this.showNotification('✅ Como Contador Auxiliar puedes aprobar:\n• Mensualidades hasta $500k\n• Rifas hasta $100k\n• Uniformes\n• Certificados', 'success');

        // Resaltar facturas que puede aprobar
        this.highlightApprovableInvoices();
    }

    /**
     * Escenario: Rector
     */
    async runRectorScenario() {
        this.showNotification('🎓 Cambiando a rol de Rector...', 'info');
        
        // Cambiar rol
        if (window.roleConfigurator) {
            window.roleConfigurator.changeRole('RECTOR');
        }

        await this.delay(1000);

        this.showNotification('✅ Como Rector puedes aprobar:\n• TODAS las facturas\n• Matrículas (exclusivo)\n• Excursiones (exclusivo)\n• Sin límites de monto', 'success');

        // Resaltar todas las facturas
        this.highlightAllInvoices();
    }

    /**
     * Escenario: Comparación de roles
     */
    async runComparisonScenario() {
        this.showNotification('⚖️ Comparando capacidades de roles...', 'info');

        const comparison = `
📊 COMPARACIÓN DE ROLES:

🧮 CONTADOR AUXILIAR:
✅ Mensualidades ($350k) - SÍ
✅ Rifas ($75k) - SÍ  
✅ Uniformes ($120k) - SÍ
❌ Matrículas ($800k) - NO
❌ Excursiones ($450k) - NO

🎓 RECTOR:
✅ Mensualidades ($350k) - SÍ
✅ Rifas ($75k) - SÍ
✅ Uniformes ($120k) - SÍ
✅ Matrículas ($800k) - SÍ
✅ Excursiones ($450k) - SÍ
        `;

        console.log(comparison);
        this.showNotification('Ver consola para comparación detallada', 'info');
    }

    /**
     * Escenario: Flujo completo
     */
    async runWorkflowScenario() {
        this.showNotification('🔄 Iniciando flujo completo de aprobación...', 'info');

        // Paso 1: Contador intenta aprobar matrícula
        if (window.roleConfigurator) {
            window.roleConfigurator.changeRole('AUXILIARY_ACCOUNTANT');
        }
        
        await this.delay(2000);
        this.showNotification('❌ Contador no puede aprobar matrícula de $800k', 'warning');

        // Paso 2: Cambiar a rector
        await this.delay(2000);
        if (window.roleConfigurator) {
            window.roleConfigurator.changeRole('RECTOR');
        }
        
        await this.delay(1000);
        this.showNotification('✅ Rector puede aprobar la matrícula', 'success');

        // Paso 3: Mostrar creación de transacción
        await this.delay(2000);
        this.showNotification('💰 Al aprobar se crearía transacción contable automáticamente', 'info');
    }

    /**
     * Iniciar tour guiado
     */
    startGuidedTour() {
        // Cerrar modal
        const modal = document.querySelector('.demo-modal');
        if (modal) modal.remove();

        this.showNotification('🚀 Iniciando tour guiado...', 'info');
        this.guidedTourStep1();
    }

    /**
     * Tour guiado - Paso 1
     */
    async guidedTourStep1() {
        this.showNotification('👀 Paso 1: Observa el selector de rol en la esquina superior derecha', 'info');
        
        // Resaltar selector de rol
        const roleSelector = document.querySelector('.role-selector');
        if (roleSelector) {
            roleSelector.style.animation = 'pulse 1s infinite';
            roleSelector.style.border = '2px solid var(--primary)';
        }

        await this.delay(3000);
        this.guidedTourStep2();
    }

    /**
     * Tour guiado - Paso 2
     */
    async guidedTourStep2() {
        // Limpiar resaltado anterior
        const roleSelector = document.querySelector('.role-selector');
        if (roleSelector) {
            roleSelector.style.animation = '';
            roleSelector.style.border = '';
        }

        this.showNotification('📋 Paso 2: Mira la tarjeta de Facturas Pendientes en el dashboard', 'info');
        
        // Resaltar tarjeta de facturas pendientes
        const pendingCard = document.querySelector('.pending-invoices-card');
        if (pendingCard) {
            pendingCard.style.animation = 'pulse 1s infinite';
            pendingCard.style.border = '2px solid var(--warning)';
        }

        await this.delay(3000);
        this.guidedTourStep3();
    }

    /**
     * Tour guiado - Paso 3
     */
    async guidedTourStep3() {
        // Limpiar resaltado anterior
        const pendingCard = document.querySelector('.pending-invoices-card');
        if (pendingCard) {
            pendingCard.style.animation = '';
            pendingCard.style.border = '';
        }

        this.showNotification('🔄 Paso 3: Cambia el rol y observa cómo cambian las capacidades', 'info');
        
        if (window.roleConfigurator) {
            window.roleConfigurator.changeRole('AUXILIARY_ACCOUNTANT');
        }

        await this.delay(2000);
        
        if (window.roleConfigurator) {
            window.roleConfigurator.changeRole('RECTOR');
        }

        await this.delay(2000);
        this.guidedTourStep4();
    }

    /**
     * Tour guiado - Paso 4
     */
    guidedTourStep4() {
        this.showNotification('🎉 ¡Tour completado! Ahora puedes explorar libremente el sistema', 'success');
        
        setTimeout(() => {
            this.showNotification('💡 Tip: Haz clic en "Aprobar Facturas" para ver la interfaz completa', 'info');
        }, 2000);
    }

    /**
     * Resaltar facturas que se pueden aprobar
     */
    highlightApprovableInvoices() {
        const invoiceItems = document.querySelectorAll('.pending-invoice-item');
        invoiceItems.forEach(item => {
            const approveBtn = item.querySelector('.btn-action.approve');
            if (approveBtn) {
                item.style.border = '2px solid var(--success)';
                item.style.background = 'rgba(16, 185, 129, 0.1)';
            }
        });

        setTimeout(() => {
            invoiceItems.forEach(item => {
                item.style.border = '';
                item.style.background = '';
            });
        }, 3000);
    }

    /**
     * Resaltar todas las facturas
     */
    highlightAllInvoices() {
        const invoiceItems = document.querySelectorAll('.pending-invoice-item');
        invoiceItems.forEach(item => {
            item.style.border = '2px solid var(--primary)';
            item.style.background = 'rgba(59, 130, 246, 0.1)';
        });

        setTimeout(() => {
            invoiceItems.forEach(item => {
                item.style.border = '';
                item.style.background = '';
            });
        }, 3000);
    }

    /**
     * Mostrar mensaje de bienvenida
     */
    showWelcomeMessage() {
        setTimeout(() => {
            console.log(`
🎭 ¡SISTEMA DE APROBACIONES LISTO!

🎯 Funcionalidades implementadas:
✅ Aprobaciones por rol y concepto
✅ Auto-aprobación para servicios rutinarios  
✅ Prioridades y urgencias
✅ Creación automática de transacciones
✅ Interfaz completa de gestión

🎮 Para probar:
1. Cambia roles con el selector superior
2. Ve facturas pendientes en el dashboard
3. Haz clic en "Demo Sistema" para tour guiado

👥 Roles disponibles:
• Contador Auxiliar (limitado)
• Rector (sin límites)
• Super Admin (completo)
            `);

            this.showNotification('🎉 Sistema de aprobaciones cargado! Haz clic en "Demo Sistema" para empezar', 'success');
        }, 5000);
    }

    // Utilidades
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message, type = 'info') {
        if (window.showAlert) {
            window.showAlert(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Agregar estilos de la demostración
     */
    addDemoStyles() {
        const styles = `
            <style>
                .demo-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                }

                .demo-modal-content {
                    background: var(--bg-card);
                    border-radius: 16px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                    display: flex;
                    flex-direction: column;
                }

                .demo-header {
                    padding: 1.5rem;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .demo-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .demo-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                }

                .demo-section {
                    margin-bottom: 2rem;
                }

                .demo-section h3 {
                    color: var(--primary);
                    margin-bottom: 1rem;
                    font-size: 1.25rem;
                }

                .demo-features {
                    display: grid;
                    gap: 1rem;
                }

                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    border-left: 4px solid var(--primary);
                }

                .feature-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .feature-content h4 {
                    margin: 0 0 0.5rem 0;
                    color: var(--text);
                    font-size: 1rem;
                }

                .feature-content p {
                    margin: 0;
                    color: var(--text-light);
                    font-size: 0.875rem;
                    line-height: 1.4;
                }

                .demo-scenarios {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .scenario-btn {
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border: 2px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                    color: var(--text);
                }

                .scenario-btn:hover {
                    border-color: var(--primary);
                    background: var(--primary);
                    color: white;
                    transform: translateY(-2px);
                }

                .demo-data {
                    background: var(--bg-secondary);
                    padding: 1rem;
                    border-radius: 8px;
                    border-left: 4px solid var(--success);
                }

                .data-item strong {
                    color: var(--primary);
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .data-item ul {
                    margin: 0;
                    padding-left: 1.5rem;
                    color: var(--text-light);
                }

                .data-item li {
                    margin-bottom: 0.25rem;
                    font-size: 0.875rem;
                }

                .demo-footer {
                    padding: 1.5rem;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.demoShowcase = new ApprovalSystemDemo();
    }, 5000);
});

console.log('🎭 Sistema de demostración cargado');