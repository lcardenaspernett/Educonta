// ===================================
// EDUCONTA - Sistema de Notificaciones
// ===================================

/**
 * Sistema de notificaciones para alertar sobre facturas y transacciones pendientes
 */
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.userRole = this.getCurrentUserRole();
        this.init();
    }

    init() {
        console.log('🔔 Inicializando sistema de notificaciones');
        this.createNotificationCenter();
        this.setupNotificationChecks();
        this.generateInitialNotifications();
    }

    /**
     * Crear centro de notificaciones en el header
     */
    createNotificationCenter() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions || document.getElementById('notificationCenter')) return;

        const notificationCenter = document.createElement('div');
        notificationCenter.id = 'notificationCenter';
        notificationCenter.className = 'notification-center';
        notificationCenter.innerHTML = `
            <button class="notification-btn" onclick="notificationSystem.toggleNotifications()">
                <svg width="20" height="20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.91 32.91 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z"/>
                </svg>
                <span class="notification-badge" id="notificationBadge">0</span>
            </button>
            <div class="notification-dropdown" id="notificationDropdown">
                <div class="notification-header">
                    <h3>🔔 Notificaciones</h3>
                    <button class="btn-text" onclick="notificationSystem.markAllAsRead()">
                        Marcar todas como leídas
                    </button>
                </div>
                <div class="notification-list" id="notificationList">
                    <!-- Las notificaciones se cargarán aquí -->
                </div>
                <div class="notification-footer">
                    <button class="btn btn-outline btn-small" onclick="notificationSystem.showAllNotifications()">
                        Ver todas
                    </button>
                </div>
            </div>
        `;

        headerActions.insertBefore(notificationCenter, headerActions.firstChild);
        this.addNotificationStyles();
    }

    /**
     * Generar notificaciones iniciales
     */
    generateInitialNotifications() {
        // Notificaciones para facturas pendientes
        if (window.pendingInvoicesManager) {
            const pendingInvoices = window.pendingInvoicesManager.pendingInvoices || [];
            const myPendingCount = this.getMyPendingInvoicesCount(pendingInvoices);

            if (myPendingCount > 0) {
                this.addNotification({
                    id: 'pending-invoices',
                    type: 'warning',
                    title: 'Facturas Pendientes de Aprobación',
                    message: `Tienes ${myPendingCount} factura${myPendingCount > 1 ? 's' : ''} esperando tu aprobación`,
                    action: () => window.pendingInvoicesManager.showApprovalInterface(),
                    actionText: 'Ver Facturas',
                    priority: 'high',
                    persistent: true
                });
            }
        }

        // Notificaciones para transacciones pendientes
        if (null) {
            const pendingTransactions = null.transactions.filter(t => t.status === 'PENDING');
            const myPendingTransactions = this.getMyPendingTransactionsCount(pendingTransactions);

            if (myPendingTransactions > 0) {
                this.addNotification({
                    id: 'pending-transactions',
                    type: 'info',
                    title: 'Transacciones Pendientes',
                    message: `${myPendingTransactions} transacción${myPendingTransactions > 1 ? 'es' : ''} esperando aprobación`,
                    action: () => this.navigateToMovements(),
                    actionText: 'Ver Movimientos',
                    priority: 'medium'
                });
            }
        }

        // Notificaciones específicas para Rector
        if (this.userRole === 'RECTOR') {
            this.generateRectorNotifications();
        }

        this.updateNotificationDisplay();
    }

    /**
     * Generar notificaciones específicas para el Rector
     */
    generateRectorNotifications() {
        // Notificación de bienvenida para Rector
        this.addNotification({
            id: 'rector-welcome',
            type: 'success',
            title: '🎓 Bienvenido, Rector',
            message: 'Tienes permisos completos para aprobar todas las facturas y transacciones',
            priority: 'low',
            autoHide: true,
            hideAfter: 10000
        });

        // Verificar facturas de alto valor
        if (window.pendingInvoicesManager) {
            const highValueInvoices = window.pendingInvoicesManager.pendingInvoices.filter(inv =>
                inv.amount > 1000000 ||
                ['MATRICULA', 'EXCURSION', 'GRADO'].includes(this.normalizeConceptType(inv.concept))
            );

            if (highValueInvoices.length > 0) {
                this.addNotification({
                    id: 'high-value-invoices',
                    type: 'error',
                    title: '🚨 Facturas de Alto Valor',
                    message: `${highValueInvoices.length} factura${highValueInvoices.length > 1 ? 's' : ''} requieren tu aprobación exclusiva`,
                    action: () => window.pendingInvoicesManager.showApprovalInterface(),
                    actionText: 'Revisar Ahora',
                    priority: 'urgent',
                    persistent: true
                });
            }
        }

        // Notificación sobre responsabilidades
        this.addNotification({
            id: 'rector-responsibilities',
            type: 'info',
            title: '📋 Recordatorio',
            message: 'Como Rector, solo tú puedes aprobar matrículas, excursiones y montos superiores a $1,000,000',
            priority: 'low',
            autoHide: true,
            hideAfter: 15000
        });
    }

    /**
     * Agregar notificación
     */
    addNotification(notification) {
        const newNotification = {
            id: notification.id || 'notif-' + Date.now(),
            type: notification.type || 'info',
            title: notification.title,
            message: notification.message,
            action: notification.action,
            actionText: notification.actionText,
            priority: notification.priority || 'medium',
            persistent: notification.persistent || false,
            autoHide: notification.autoHide || false,
            hideAfter: notification.hideAfter || 5000,
            read: false,
            createdAt: new Date().toISOString()
        };

        // Evitar duplicados
        const existingIndex = this.notifications.findIndex(n => n.id === newNotification.id);
        if (existingIndex !== -1) {
            this.notifications[existingIndex] = newNotification;
        } else {
            this.notifications.unshift(newNotification);
        }

        // Auto-ocultar si está configurado
        if (newNotification.autoHide) {
            setTimeout(() => {
                this.removeNotification(newNotification.id);
            }, newNotification.hideAfter);
        }

        this.updateNotificationDisplay();
        this.showToastNotification(newNotification);
    }

    /**
     * Mostrar notificación toast
     */
    showToastNotification(notification) {
        if (notification.priority === 'urgent' || notification.priority === 'high') {
            const toast = document.createElement('div');
            toast.className = `notification-toast ${notification.type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <div class="toast-header">
                        <strong>${notification.title}</strong>
                        <button class="toast-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                    </div>
                    <div class="toast-message">${notification.message}</div>
                    ${notification.action ? `
                        <div class="toast-actions">
                            <button class="btn btn-small btn-primary" onclick="notificationSystem.executeNotificationAction('${notification.id}')">
                                ${notification.actionText || 'Ver'}
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;

            document.body.appendChild(toast);

            // Auto-remover después de 8 segundos
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 8000);
        }
    }

    /**
     * Ejecutar acción de notificación
     */
    executeNotificationAction(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && notification.action) {
            notification.action();
            this.markAsRead(notificationId);

            // Cerrar toast si existe
            const toast = document.querySelector('.notification-toast');
            if (toast) toast.remove();
        }
    }

    /**
     * Alternar dropdown de notificaciones
     */
    toggleNotifications() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';

            if (!isVisible) {
                this.renderNotificationList();
            }
        }
    }

    /**
     * Renderizar lista de notificaciones
     */
    renderNotificationList() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <div class="empty-icon">🔔</div>
                    <p>No hay notificaciones</p>
                </div>
            `;
            return;
        }

        const sortedNotifications = this.notifications
            .sort((a, b) => {
                // Prioridad: urgent > high > medium > low
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                const aPriority = priorityOrder[a.priority] || 2;
                const bPriority = priorityOrder[b.priority] || 2;

                if (aPriority !== bPriority) return bPriority - aPriority;

                // Luego por fecha
                return new Date(b.createdAt) - new Date(a.createdAt);
            })
            .slice(0, 10); // Mostrar solo las 10 más recientes

        list.innerHTML = sortedNotifications.map(notification =>
            this.renderNotificationItem(notification)
        ).join('');
    }

    /**
     * Renderizar item de notificación
     */
    renderNotificationItem(notification) {
        const typeIcons = {
            success: '✅',
            warning: '⚠️',
            error: '🚨',
            info: 'ℹ️'
        };

        const priorityClasses = {
            urgent: 'priority-urgent',
            high: 'priority-high',
            medium: 'priority-medium',
            low: 'priority-low'
        };

        return `
            <div class="notification-item ${notification.read ? 'read' : 'unread'} ${priorityClasses[notification.priority]}" 
                 data-notification-id="${notification.id}">
                <div class="notification-icon ${notification.type}">
                    ${typeIcons[notification.type] || 'ℹ️'}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatTimeAgo(notification.createdAt)}</div>
                </div>
                <div class="notification-actions">
                    ${notification.action ? `
                        <button class="btn-notification-action" onclick="notificationSystem.executeNotificationAction('${notification.id}')">
                            ${notification.actionText || 'Ver'}
                        </button>
                    ` : ''}
                    <button class="btn-notification-close" onclick="notificationSystem.removeNotification('${notification.id}')">
                        ×
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Marcar notificación como leída
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationDisplay();
        }
    }

    /**
     * Marcar todas como leídas
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationDisplay();
        this.renderNotificationList();
    }

    /**
     * Remover notificación
     */
    removeNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationDisplay();
        this.renderNotificationList();
    }

    /**
     * Actualizar display de notificaciones
     */
    updateNotificationDisplay() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    /**
     * Configurar verificaciones periódicas
     */
    setupNotificationChecks() {
        // Verificar cada 30 segundos
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000);
    }

    /**
     * Verificar nuevas notificaciones
     */
    checkForNewNotifications() {
        // Verificar facturas pendientes
        if (window.pendingInvoicesManager) {
            const pendingCount = this.getMyPendingInvoicesCount(window.pendingInvoicesManager.pendingInvoices);
            const existingNotification = this.notifications.find(n => n.id === 'pending-invoices');

            if (pendingCount > 0 && !existingNotification) {
                this.addNotification({
                    id: 'pending-invoices',
                    type: 'warning',
                    title: 'Nuevas Facturas Pendientes',
                    message: `${pendingCount} factura${pendingCount > 1 ? 's' : ''} esperando tu aprobación`,
                    action: () => window.pendingInvoicesManager.showApprovalInterface(),
                    actionText: 'Ver Facturas',
                    priority: 'high'
                });
            }
        }
    }

    /**
     * Navegar a movimientos
     */
    navigateToMovements() {
        // Cambiar a la sección de movimientos
        if (window.accountingNavigation) {
            window.accountingNavigation.showSection('movements');
        } else {
            // Fallback manual
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('movements-section')?.classList.add('active');

            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector('[data-section="movements"]')?.classList.add('active');
        }

        // Cerrar dropdown
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) dropdown.style.display = 'none';
    }

    // Métodos auxiliares
    getCurrentUserRole() {
        if (window.AccountingState) {
            const user = window.AccountingState.get('user');
            if (user && user.role) return user.role;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role || 'AUXILIARY_ACCOUNTANT';
    }

    getMyPendingInvoicesCount(invoices) {
        if (!invoices) return 0;

        return invoices.filter(invoice => {
            const approvalInfo = this.getApprovalRequirement(invoice);
            return approvalInfo.canApprove;
        }).length;
    }

    getMyPendingTransactionsCount(transactions) {
        if (!transactions) return 0;

        return transactions.filter(transaction => {
            const approvalInfo = this.getTransactionApprovalRequirement(transaction);
            return approvalInfo.canApprove;
        }).length;
    }

    getApprovalRequirement(invoice) {
        const concept = this.normalizeConceptType(invoice.concept);
        const amount = invoice.amount || 0;

        // Lógica simplificada de aprobación
        if (amount > 1000000 || ['MATRICULA', 'EXCURSION', 'GRADO'].includes(concept)) {
            return { canApprove: this.userRole === 'RECTOR' };
        } else {
            return { canApprove: ['AUXILIARY_ACCOUNTANT', 'RECTOR'].includes(this.userRole) };
        }
    }

    getTransactionApprovalRequirement(transaction) {
        const amount = transaction.amount || 0;
        const description = (transaction.description || '').toUpperCase();

        if (amount > 1000000 || description.includes('MATRICULA') || description.includes('EXCURSION')) {
            return { canApprove: this.userRole === 'RECTOR' };
        } else {
            return { canApprove: ['AUXILIARY_ACCOUNTANT', 'RECTOR'].includes(this.userRole) };
        }
    }

    normalizeConceptType(concept) {
        if (!concept) return 'OTRO';

        const normalized = concept.toUpperCase();

        if (normalized.includes('MATRICULA')) return 'MATRICULA';
        if (normalized.includes('EXCURSION')) return 'EXCURSION';
        if (normalized.includes('GRADO')) return 'GRADO';
        if (normalized.includes('MENSUALIDAD')) return 'MENSUALIDAD';

        return 'OTRO';
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;

        return date.toLocaleDateString('es-CO');
    }

    /**
     * Agregar estilos de notificaciones
     */
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification-center {
                position: relative;
            }

            .notification-btn {
                position: relative;
                background: none;
                border: none;
                padding: 0.5rem;
                border-radius: 8px;
                cursor: pointer;
                color: var(--text);
                transition: all 0.3s ease;
            }

            .notification-btn:hover {
                background: var(--bg-hover);
                color: var(--primary);
            }

            .notification-badge {
                position: absolute;
                top: 0;
                right: 0;
                background: var(--error);
                color: white;
                font-size: 0.625rem;
                font-weight: 600;
                padding: 0.125rem 0.375rem;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                display: none;
                animation: pulse 2s infinite;
            }

            .notification-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                width: 400px;
                max-width: 90vw;
                background: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.25);
                z-index: 9998;
                display: none;
                margin-top: 0.5rem;
                opacity: 1;
            }
            
            [data-theme="dark"] .notification-dropdown {
                background: #2d3748;
                border-color: #4a5568;
                color: #ffffff;
            }

            .notification-header {
                padding: 1rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .notification-header h3 {
                margin: 0;
                font-size: 1rem;
                color: var(--text);
            }

            .btn-text {
                background: none;
                border: none;
                color: var(--primary);
                font-size: 0.75rem;
                cursor: pointer;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .btn-text:hover {
                background: var(--bg-hover);
            }

            .notification-list {
                max-height: 400px;
                overflow-y: auto;
            }

            .notification-item {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                padding: 1rem;
                border-bottom: 1px solid #e5e7eb;
                transition: background 0.2s;
                background: #ffffff;
                opacity: 1;
            }

            .notification-item:hover {
                background: #f8fafc;
            }

            .notification-item.unread {
                background: #eff6ff;
                border-left: 3px solid #3b82f6;
            }

            .notification-item.priority-urgent {
                border-left: 3px solid #ef4444;
                background: #fef2f2;
            }

            .notification-item.priority-high {
                border-left: 3px solid #f59e0b;
                background: #fffbeb;
            }
            
            [data-theme="dark"] .notification-item {
                background: #374151;
                border-bottom-color: #4b5563;
                color: #ffffff;
            }
            
            [data-theme="dark"] .notification-item:hover {
                background: #4b5563;
            }
            
            [data-theme="dark"] .notification-item.unread {
                background: #1e3a8a;
            }

            .notification-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                flex-shrink: 0;
            }

            .notification-icon.success {
                background: rgba(16, 185, 129, 0.1);
                color: var(--success);
            }

            .notification-icon.warning {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning);
            }

            .notification-icon.error {
                background: rgba(239, 68, 68, 0.1);
                color: var(--error);
            }

            .notification-icon.info {
                background: rgba(59, 130, 246, 0.1);
                color: var(--primary);
            }

            .notification-content {
                flex: 1;
            }

            .notification-title {
                font-weight: 600;
                color: var(--text);
                margin-bottom: 0.25rem;
                font-size: 0.875rem;
            }

            .notification-message {
                color: var(--text-light);
                font-size: 0.8125rem;
                line-height: 1.4;
                margin-bottom: 0.5rem;
            }

            .notification-time {
                color: var(--text-light);
                font-size: 0.75rem;
            }

            .notification-actions {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                align-items: flex-end;
            }

            .btn-notification-action {
                background: var(--primary);
                color: white;
                border: none;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                cursor: pointer;
                transition: background 0.2s;
            }

            .btn-notification-action:hover {
                background: var(--primary-dark);
            }

            .btn-notification-close {
                background: none;
                border: none;
                color: var(--text-light);
                font-size: 1rem;
                cursor: pointer;
                padding: 0.125rem;
                border-radius: 4px;
                transition: all 0.2s;
            }

            .btn-notification-close:hover {
                background: var(--bg-hover);
                color: var(--error);
            }

            .notification-footer {
                padding: 0.75rem 1rem;
                border-top: 1px solid var(--border);
                text-align: center;
            }

            .notification-empty {
                padding: 2rem;
                text-align: center;
                color: var(--text-light);
            }

            .notification-empty .empty-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
                opacity: 0.5;
            }

            /* Toast notifications */
            .notification-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                max-width: 90vw;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.25);
                z-index: 10001;
                animation: slideInRight 0.3s ease-out;
                opacity: 1;
                color: #1f2937;
            }

            .notification-toast.error {
                border-left: 4px solid #ef4444;
                background: #fef2f2;
            }

            .notification-toast.warning {
                border-left: 4px solid #f59e0b;
                background: #fffbeb;
            }

            .notification-toast.success {
                border-left: 4px solid #10b981;
                background: #f0fdf4;
            }
            
            [data-theme="dark"] .notification-toast {
                background: #374151;
                border-color: #4b5563;
                color: #ffffff;
            }
            
            [data-theme="dark"] .notification-toast.error {
                background: #7f1d1d;
            }
            
            [data-theme="dark"] .notification-toast.warning {
                background: #78350f;
            }
            
            [data-theme="dark"] .notification-toast.success {
                background: #14532d;
            }

            .notification-toast.info {
                border-left: 4px solid var(--primary);
            }

            .toast-content {
                padding: 1rem;
            }

            .toast-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .toast-header strong {
                color: #1f2937;
                font-size: 0.875rem;
                font-weight: 600;
            }
            
            [data-theme="dark"] .toast-header strong {
                color: #ffffff;
            }
            }

            .toast-close {
                background: none;
                border: none;
                color: var(--text-light);
                font-size: 1.25rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }

            .toast-close:hover {
                background: var(--bg-hover);
                color: var(--error);
            }

            .toast-message {
                color: #6b7280;
                font-size: 0.8125rem;
                line-height: 1.4;
            }
            
            [data-theme="dark"] .toast-message {
                color: #d1d5db;
            }
                line-height: 1.4;
                margin-bottom: 0.75rem;
            }

            .toast-actions {
                display: flex;
                justify-content: flex-end;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            /* Responsive */
            @media (max-width: 768px) {
                .notification-dropdown {
                    width: 300px;
                }
                
                .notification-toast {
                    width: 300px;
                    top: 10px;
                    right: 10px;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.notificationSystem = new NotificationSystem();
    }, 4000); // Después de que se carguen otros sistemas
});

console.log('🔔 Sistema de notificaciones cargado');