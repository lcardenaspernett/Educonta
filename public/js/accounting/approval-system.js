// ===================================
// EDUCONTA - Sistema de Aprobaciones de Facturas
// ===================================

/**
 * Sistema de aprobaciones basado en roles y conceptos
 */
class ApprovalSystem {
    constructor() {
        this.approvalRules = this.defineApprovalRules();
        this.userRole = this.getCurrentUserRole();
        this.init();
    }

    init() {
        console.log('🔐 Inicializando sistema de aprobaciones');
        console.log('👤 Rol actual:', this.userRole);
    }

    /**
     * Definir reglas de aprobación simplificadas
     */
    defineApprovalRules() {
        return {
            // Regla simple: Monto alto o conceptos importantes = Rector
            // Todo lo demás = Contador Auxiliar
            AMOUNT_THRESHOLD: 1000000, // $1,000,000
            
            // Conceptos que SIEMPRE requieren Rector
            RECTOR_ONLY_CONCEPTS: [
                'MATRICULA', 'EXCURSION', 'GRADO', 'CURSO_VACACIONAL'
            ],
            
            // Conceptos que pueden aprobar Contador Auxiliar
            AUXILIARY_CONCEPTS: [
                'MENSUALIDAD', 'RIFA', 'UNIFORME', 'TRANSPORTE', 
                'CERTIFICADO', 'CARNET', 'NIVELACION'
            ]
        };
    }

    /**
     * Determinar si una factura requiere aprobación (SIMPLIFICADO)
     */
    requiresApproval(invoice) {
        const concept = this.normalizeConceptType(invoice.concept);
        const rules = this.approvalRules;
        
        // Regla 1: Montos superiores a $1,000,000 = Rector
        if (invoice.amount > rules.AMOUNT_THRESHOLD) {
            return {
                required: true,
                reason: `Monto superior a ${this.formatCurrency(rules.AMOUNT_THRESHOLD)} requiere aprobación del Rector`,
                approvers: ['RECTOR'],
                priority: 'high'
            };
        }
        
        // Regla 2: Conceptos importantes = Rector
        if (rules.RECTOR_ONLY_CONCEPTS.includes(concept)) {
            return {
                required: true,
                reason: `${concept} requiere aprobación del Rector por política institucional`,
                approvers: ['RECTOR'],
                priority: 'high'
            };
        }
        
        // Regla 3: Conceptos regulares = Contador Auxiliar
        if (rules.AUXILIARY_CONCEPTS.includes(concept)) {
            return {
                required: true,
                reason: `${concept} puede ser aprobado por Contador Auxiliar`,
                approvers: ['AUXILIARY_ACCOUNTANT'],
                priority: 'normal'
            };
        }
        
        // Regla 4: Conceptos desconocidos = Rector (por seguridad)
        return {
            required: true,
            reason: 'Concepto no definido requiere aprobación del Rector',
            approvers: ['RECTOR'],
            priority: 'high'
        };
    }

    /**
     * Obtener aprobadores según monto y concepto
     */
    getApproversForInvoice(invoice, rule) {
        const concept = this.normalizeConceptType(invoice.concept);
        
        // Para conceptos que solo el rector puede aprobar
        if (['MATRICULA', 'EXCURSION', 'GRADO', 'CURSO_VACACIONAL'].includes(concept)) {
            return ['RECTOR'];
        }

        // Para montos altos, siempre rector
        if (invoice.amount > 1000000) { // Más de $1M
            return ['RECTOR'];
        }

        // Para rifas, según monto
        if (concept === 'RIFA') {
            return invoice.amount > rule.maxAmount ? ['RECTOR'] : ['AUXILIARY_ACCOUNTANT'];
        }

        // Para mensualidades con descuentos especiales
        if (concept === 'MENSUALIDAD' && invoice.hasDiscount) {
            return ['RECTOR'];
        }

        // Regla general: contador auxiliar puede aprobar montos menores
        if (rule.maxAmount && invoice.amount <= rule.maxAmount) {
            return rule.approvers.includes('AUXILIARY_ACCOUNTANT') ? ['AUXILIARY_ACCOUNTANT'] : ['RECTOR'];
        }

        // Por defecto, rector para montos altos
        return ['RECTOR'];
    }

    /**
     * Verificar si el usuario actual puede aprobar una factura
     */
    canApprove(invoice) {
        const approvalInfo = this.requiresApproval(invoice);
        
        if (!approvalInfo.required) {
            return {
                canApprove: true,
                reason: 'No requiere aprobación'
            };
        }

        const canApprove = approvalInfo.approvers.includes(this.userRole);
        
        return {
            canApprove: canApprove,
            reason: canApprove 
                ? `Autorizado como ${this.getRoleLabel(this.userRole)}`
                : `Requiere aprobación de: ${approvalInfo.approvers.map(r => this.getRoleLabel(r)).join(' o ')}`,
            requiredApprovers: approvalInfo.approvers
        };
    }

    /**
     * Procesar aprobación de factura
     */
    async approveInvoice(invoice) {
        const canApproveInfo = this.canApprove(invoice);
        
        if (!canApproveInfo.canApprove) {
            throw new Error(`No autorizado para aprobar: ${canApproveInfo.reason}`);
        }

        // Registrar aprobación
        const approval = {
            invoiceId: invoice.id,
            approvedBy: this.userRole,
            approvedAt: new Date().toISOString(),
            approverName: this.getCurrentUserName(),
            concept: invoice.concept,
            amount: invoice.amount,
            reason: canApproveInfo.reason
        };

        // Actualizar estado de la factura
        invoice.status = 'APPROVED';
        invoice.approvals = invoice.approvals || [];
        invoice.approvals.push(approval);

        console.log('✅ Factura aprobada:', approval);
        return approval;
    }

    /**
     * Verificar condiciones de auto-aprobación
     */
    meetsAutoApprovalConditions(invoice, rule) {
        if (!rule.autoApproveConditions) return true;

        const conditions = rule.autoApproveConditions;

        // Verificar si es monto estándar
        if (conditions.standardAmount) {
            const isStandard = this.isStandardAmount(invoice);
            if (!isStandard) return false;
        }

        // Verificar si no tiene descuentos
        if (conditions.noDiscount) {
            if (invoice.hasDiscount || invoice.discountAmount > 0) return false;
        }

        return true;
    }

    /**
     * Verificar si es un monto estándar
     */
    isStandardAmount(invoice) {
        const concept = this.normalizeConceptType(invoice.concept);
        
        // Los montos estándar se cargarán desde la configuración de la institución
        // Por ahora, considerar cualquier monto como estándar
        return true;
    }

    /**
     * Normalizar tipo de concepto
     */
    normalizeConceptType(concept) {
        if (!concept) return 'OTRO';
        
        const normalized = concept.toUpperCase();
        
        // Mapear variaciones comunes
        const mappings = {
            'MATRICULA': ['MATRÍCULA', 'MATRICULA', 'INSCRIPCION', 'INSCRIPCIÓN'],
            'MENSUALIDAD': ['MENSUALIDAD', 'PENSION', 'PENSIÓN', 'COLEGIATURA'],
            'RIFA': ['RIFA', 'SORTEO', 'BINGO'],
            'EXCURSION': ['EXCURSIÓN', 'EXCURSION', 'PASEO', 'SALIDA PEDAGÓGICA'],
            'UNIFORME': ['UNIFORME', 'UNIFORMES', 'DOTACIÓN'],
            'TRANSPORTE': ['TRANSPORTE', 'RUTA', 'BUS'],
            'CERTIFICADO': ['CERTIFICADO', 'CONSTANCIA', 'DIPLOMA'],
            'CARNET': ['CARNET', 'CARNÉ', 'DOCUMENTO']
        };

        for (const [key, variations] of Object.entries(mappings)) {
            if (variations.some(v => normalized.includes(v))) {
                return key;
            }
        }

        return 'OTRO';
    }

    /**
     * Obtener rol actual del usuario
     */
    getCurrentUserRole() {
        // Obtener del estado global o localStorage
        if (window.AccountingState) {
            const user = window.AccountingState.get('user');
            if (user && user.role) return user.role;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role || 'AUXILIARY_ACCOUNTANT'; // Por defecto
    }

    /**
     * Obtener nombre actual del usuario
     */
    getCurrentUserName() {
        if (window.AccountingState) {
            const user = window.AccountingState.get('user');
            if (user) return `${user.firstName} ${user.lastName}`;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.firstName ? `${user.firstName} ${user.lastName}` : 'Usuario';
    }

    /**
     * Obtener etiqueta del rol
     */
    getRoleLabel(role) {
        const labels = {
            'SUPER_ADMIN': 'Super Administrador',
            'RECTOR': 'Rector',
            'AUXILIARY_ACCOUNTANT': 'Contador Auxiliar'
        };
        return labels[role] || role;
    }

    /**
     * Formatear moneda
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    /**
     * Obtener resumen de reglas de aprobación
     */
    getApprovalRulesSummary() {
        return Object.entries(this.approvalRules).map(([concept, rule]) => ({
            concept,
            requiresApproval: rule.requiresApproval,
            approvers: rule.approvers.map(r => this.getRoleLabel(r)),
            autoApprove: rule.autoApprove,
            maxAmount: rule.maxAmount ? this.formatCurrency(rule.maxAmount) : 'Sin límite',
            reason: rule.reason
        }));
    }
}

// Crear instancia global
window.approvalSystem = new ApprovalSystem();
window.ApprovalSystem = ApprovalSystem;

console.log('🔐 Sistema de aprobaciones inicializado');