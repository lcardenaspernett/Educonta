// ===================================
// EDUCONTA - Sistema de Formularios de Contabilidad
// ===================================

/**
 * Sistema centralizado para manejar todos los formularios del dashboard contable
 */
class AccountingForms {
    constructor() {
        this.state = window.AccountingState;
        this.forms = new Map();
        this.validators = new Map();
        
        this.init();
    }
    
    init() {
        console.log('📝 Inicializando sistema de formularios');
        this.setupForms();
        this.setupValidators();
        this.setupEventListeners();
    }
    
    // ===================================
    // CONFIGURACIÓN DE FORMULARIOS
    // ===================================
    
    setupForms() {
        // Configurar formulario de ingresos
        this.forms.set('income', {
            formId: 'incomeForm',
            alertId: 'incomeAlert',
            fields: {
                recipientType: { required: true },
                recipientDetails: { required: false, dependsOn: 'recipientType' },
                concept: { required: true },
                newConcept: { required: false, dependsOn: 'concept' },
                debitAccount: { required: true, element: 'debitAccountSelect' },
                creditAccount: { required: true, element: 'creditAccountSelect' },
                amount: { required: true, type: 'number', min: 0.01 },
                description: { required: true, maxLength: 200 }
            },
            onSubmit: this.handleIncomeSubmit.bind(this)
        });
        
        // Configurar formulario de gastos
        this.forms.set('expense', {
            formId: 'expenseForm',
            alertId: 'expenseAlert',
            fields: {
                category: { required: true },
                debitAccount: { required: true, element: 'expenseDebitAccountSelect' },
                creditAccount: { required: true, element: 'expenseCreditAccountSelect' },
                amount: { required: true, type: 'number', min: 0.01 },
                description: { required: true, maxLength: 200 }
            },
            onSubmit: this.handleExpenseSubmit.bind(this)
        });
        
        // Configurar formulario de facturas
        this.forms.set('invoice', {
            formId: 'quickInvoiceForm',
            alertId: 'invoiceAlert',
            fields: {
                studentId: { required: true },
                concept: { required: true },
                amount: { required: true, type: 'number', min: 0.01 },
                dueDate: { required: true, type: 'date' },
                debitAccount: { required: true, element: 'invoiceDebitAccountSelect' },
                creditAccount: { required: true, element: 'invoiceCreditAccountSelect' }
            },
            onSubmit: this.handleInvoiceSubmit.bind(this)
        });
    }
    
    setupValidators() {
        // Validador para campos requeridos
        this.validators.set('required', (value, field) => {
            if (!value || value.toString().trim() === '') {
                return `${field.label || 'Este campo'} es requerido`;
            }
            return null;
        });
        
        // Validador para números
        this.validators.set('number', (value, field) => {
            const num = parseFloat(value);
            if (isNaN(num)) {
                return `${field.label || 'Este campo'} debe ser un número válido`;
            }
            if (field.min !== undefined && num < field.min) {
                return `${field.label || 'Este campo'} debe ser mayor a ${field.min}`;
            }
            if (field.max !== undefined && num > field.max) {
                return `${field.label || 'Este campo'} debe ser menor a ${field.max}`;
            }
            return null;
        });
        
        // Validador para fechas
        this.validators.set('date', (value, field) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return `${field.label || 'Este campo'} debe ser una fecha válida`;
            }
            return null;
        });
        
        // Validador para longitud máxima
        this.validators.set('maxLength', (value, field) => {
            if (value && value.length > field.maxLength) {
                return `${field.label || 'Este campo'} no puede tener más de ${field.maxLength} caracteres`;
            }
            return null;
        });
    }
    
    setupEventListeners() {
        // Configurar listeners para cada formulario
        this.forms.forEach((config, formName) => {
            const form = document.getElementById(config.formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmit(formName, form);
                });
                
                // Configurar validación en tiempo real
                this.setupRealTimeValidation(form, config);
            }
        });
        
        // Configurar campos dependientes
        this.setupDependentFields();
    }
    
    setupRealTimeValidation(form, config) {
        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
            const element = form.querySelector(`[name="${fieldName}"]`) || 
                          document.getElementById(fieldConfig.element);
            
            if (element) {
                element.addEventListener('blur', () => {
                    this.validateField(element, fieldConfig, fieldName);
                });
                
                element.addEventListener('input', () => {
                    // Limpiar errores mientras el usuario escribe
                    this.clearFieldError(element);
                });
            }
        });
    }
    
    setupDependentFields() {
        // Campo de detalles del destinatario (ingresos)
        const recipientType = document.getElementById('recipientType');
        const recipientDetailsGroup = document.getElementById('recipientDetailsGroup');
        
        if (recipientType && recipientDetailsGroup) {
            recipientType.addEventListener('change', () => {
                const showDetails = ['student', 'provider', 'other'].includes(recipientType.value);
                recipientDetailsGroup.style.display = showDetails ? 'block' : 'none';
                
                // Actualizar label
                const label = document.getElementById('recipientDetailsLabel');
                if (label) {
                    const labels = {
                        student: 'Nombre del estudiante',
                        provider: 'Nombre del proveedor',
                        other: 'Nombre del destinatario'
                    };
                    label.textContent = labels[recipientType.value] || 'Nombre del destinatario';
                }
            });
        }
        
        // Campo de nuevo concepto
        this.setupNewConceptField('conceptSelect', 'newConceptGroup');
    }
    
    setupNewConceptField(selectId, groupId) {
        const select = document.getElementById(selectId);
        const group = document.getElementById(groupId);
        
        if (select && group) {
            select.addEventListener('change', () => {
                group.style.display = select.value === 'otro' ? 'block' : 'none';
            });
        }
    }
    
    // ===================================
    // VALIDACIÓN
    // ===================================
    
    validateField(element, fieldConfig, fieldName) {
        const value = element.value;
        let error = null;
        
        // Validar campo requerido
        if (fieldConfig.required) {
            error = this.validators.get('required')(value, { ...fieldConfig, label: fieldName });
            if (error) {
                this.showFieldError(element, error);
                return false;
            }
        }
        
        // Validar tipo si hay valor
        if (value && fieldConfig.type) {
            error = this.validators.get(fieldConfig.type)(value, fieldConfig);
            if (error) {
                this.showFieldError(element, error);
                return false;
            }
        }
        
        // Validar longitud máxima
        if (fieldConfig.maxLength) {
            error = this.validators.get('maxLength')(value, fieldConfig);
            if (error) {
                this.showFieldError(element, error);
                return false;
            }
        }
        
        this.clearFieldError(element);
        return true;
    }
    
    validateForm(formName) {
        const config = this.forms.get(formName);
        if (!config) return false;
        
        const form = document.getElementById(config.formId);
        if (!form) return false;
        
        let isValid = true;
        const errors = [];
        
        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
            const element = form.querySelector(`[name="${fieldName}"]`) || 
                          document.getElementById(fieldConfig.element);
            
            if (element) {
                // Verificar dependencias
                if (fieldConfig.dependsOn) {
                    const dependentElement = form.querySelector(`[name="${fieldConfig.dependsOn}"]`);
                    if (dependentElement && !this.shouldValidateDependent(dependentElement, fieldConfig)) {
                        return; // Saltar validación si la dependencia no se cumple
                    }
                }
                
                if (!this.validateField(element, fieldConfig, fieldName)) {
                    isValid = false;
                    errors.push(fieldName);
                }
            }
        });
        
        return { isValid, errors };
    }
    
    shouldValidateDependent(dependentElement, fieldConfig) {
        // Lógica para determinar si se debe validar un campo dependiente
        const dependentValue = dependentElement.value;
        
        // Para recipientDetails, solo validar si recipientType tiene valor
        if (dependentElement.name === 'recipientType') {
            return ['student', 'provider', 'other'].includes(dependentValue);
        }
        
        // Para newConcept, solo validar si concept es 'otro'
        if (dependentElement.name === 'concept') {
            return dependentValue === 'otro';
        }
        
        return !!dependentValue;
    }
    
    showFieldError(element, message) {
        this.clearFieldError(element);
        
        element.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: block;
        `;
        
        element.parentNode.appendChild(errorElement);
    }
    
    clearFieldError(element) {
        element.classList.remove('error');
        
        const existingError = element.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    showFormAlert(formName, message, type = 'error') {
        const config = this.forms.get(formName);
        if (!config) return;
        
        const alertElement = document.getElementById(config.alertId);
        if (alertElement) {
            alertElement.textContent = message;
            alertElement.className = `alert ${type} show`;
            alertElement.style.display = 'block';
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                alertElement.style.display = 'none';
                alertElement.classList.remove('show');
            }, 5000);
        }
    }
    
    // ===================================
    // MANEJO DE ENVÍOS
    // ===================================
    
    async handleFormSubmit(formName, form) {
        console.log(`📝 Procesando formulario: ${formName}`);
        
        // Validar formulario
        const validation = this.validateForm(formName);
        if (!validation.isValid) {
            this.showFormAlert(formName, 'Por favor corrige los errores en el formulario', 'error');
            return;
        }
        
        // Obtener configuración
        const config = this.forms.get(formName);
        if (!config || !config.onSubmit) {
            console.error(`❌ No hay handler para el formulario: ${formName}`);
            return;
        }
        
        // Obtener datos del formulario
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            // Mostrar loading
            this.setFormLoading(formName, true);
            
            // Ejecutar handler
            await config.onSubmit(data, form);
            
            // Limpiar formulario en caso de éxito
            form.reset();
            this.showFormAlert(formName, 'Operación completada exitosamente', 'success');
            
        } catch (error) {
            console.error(`❌ Error en formulario ${formName}:`, error);
            this.showFormAlert(formName, error.message || 'Error procesando la solicitud', 'error');
        } finally {
            this.setFormLoading(formName, false);
        }
    }
    
    async handleIncomeSubmit(data, form) {
        console.log('💰 Procesando ingreso:', data);
        
        const transactionData = {
            date: new Date().toISOString().split('T')[0],
            reference: `ING-${Date.now()}`,
            description: data.description,
            amount: parseFloat(data.amount),
            type: 'INCOME',
            debitAccountId: data.debitAccount,
            creditAccountId: data.creditAccount
        };
        
        // Usar null si está disponible, sino usar el estado normal
        let transaction;
        if (null) {
            console.log('📊 Usando null para crear transacción de ingreso...');
            transaction = await null.createTransaction(transactionData);
        } else {
            transaction = await this.state.createTransaction(transactionData);
        }
        
        console.log('✅ Transacción de ingreso creada:', transaction);
        
        // Recargar estadísticas y transacciones para actualizar los números
        await this.state.loadStats();
        await this.state.loadTransactions();
        
        // Generar factura para el ingreso
        try {
            console.log('📄 Generando factura para ingreso...');
            await this.generateInvoicePDF({
                concept: data.concept || 'Ingreso',
                amount: data.amount,
                description: data.description,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 días
            }, transaction);
        } catch (error) {
            console.warn('⚠️ Error generando factura para ingreso:', error);
        }
        
        // Forzar actualización de la UI
        setTimeout(() => {
            if (typeof forceUpdate === 'function') {
                console.log('🔄 Forzando actualización después de crear ingreso...');
                forceUpdate();
            }
        }, 500);
    }
    
    async handleExpenseSubmit(data, form) {
        console.log('💸 Procesando gasto:', data);
        
        const transactionData = {
            date: new Date().toISOString().split('T')[0],
            reference: `GAS-${Date.now()}`,
            description: data.description,
            amount: parseFloat(data.amount),
            type: 'EXPENSE',
            debitAccountId: data.debitAccount,
            creditAccountId: data.creditAccount
        };
        
        // Usar null si está disponible, sino usar el estado normal
        let transaction;
        if (null) {
            console.log('📊 Usando null para crear transacción de gasto...');
            transaction = await null.createTransaction(transactionData);
        } else {
            transaction = await this.state.createTransaction(transactionData);
        }
        
        console.log('✅ Transacción de gasto creada:', transaction);
        
        // Recargar estadísticas y transacciones para actualizar los números
        await this.state.loadStats();
        await this.state.loadTransactions();
        
        // Generar comprobante para el gasto (como factura)
        try {
            console.log('📄 Generando comprobante para gasto...');
            await this.generateInvoicePDF({
                concept: data.concept || 'Gasto',
                amount: data.amount,
                description: data.description,
                dueDate: new Date().toISOString().split('T')[0]
            }, transaction);
        } catch (error) {
            console.warn('⚠️ Error generando comprobante para gasto:', error);
        }
        
        // Forzar actualización de la UI
        setTimeout(() => {
            if (typeof forceUpdate === 'function') {
                console.log('🔄 Forzando actualización después de crear gasto...');
                forceUpdate();
            }
        }, 500);
    }
    
    async handleInvoiceSubmit(data, form) {
        console.log('🧾 Procesando factura:', data);
        
        const transactionData = {
            date: new Date().toISOString().split('T')[0],
            reference: `FAC-${Date.now()}`,
            description: `Factura - ${data.concept}`,
            amount: parseFloat(data.amount),
            type: 'INCOME',
            debitAccountId: data.debitAccount,
            creditAccountId: data.creditAccount
        };
        
        // Crear la transacción usando null si está disponible
        let transaction;
        if (null) {
            console.log('📊 Usando null para crear transacción de factura...');
            transaction = await null.createTransaction(transactionData);
        } else {
            transaction = await this.state.createTransaction(transactionData);
        }
        console.log('✅ Transacción de factura creada:', transaction);
        
        // Recargar estadísticas y transacciones para actualizar los números
        await this.state.loadStats();
        await this.state.loadTransactions();
        
        // Generar PDF de la factura
        await this.generateInvoicePDF(data, transaction);
        
        // Forzar actualización de la UI
        setTimeout(() => {
            if (typeof forceUpdate === 'function') {
                console.log('🔄 Forzando actualización después de crear factura...');
                forceUpdate();
            }
        }, 1000);
    }
    
    async generateInvoicePDF(formData, transaction) {
        try {
            console.log('📄 Generando PDF de factura...');
            
            // Preparar datos para el PDF
            const invoiceData = {
                invoiceNumber: transaction.data?.reference || `FAC-${Date.now()}`,
                date: new Date().toISOString(),
                dueDate: formData.dueDate,
                concept: formData.concept,
                amount: parseFloat(formData.amount),
                subtotal: parseFloat(formData.amount),
                total: parseFloat(formData.amount),
                student: {
                    name: this.getStudentName(formData.studentId),
                    grade: 'Por definir',
                    document: 'Por definir'
                },
                institution: {
                    name: this.state.get('user')?.institution?.name || 'Institución Educativa'
                },
                items: [
                    {
                        description: `${formData.concept} - ${this.getStudentName(formData.studentId)}`,
                        quantity: 1,
                        unitPrice: parseFloat(formData.amount),
                        total: parseFloat(formData.amount)
                    }
                ]
            };
            
            // Generar PDF usando el generador
            console.log('🔍 Verificando PDF generator:', !!window.invoicePDFGenerator);
            if (window.invoicePDFGenerator) {
                console.log('📄 Llamando a generateInvoicePDF...');
                const pdfInfo = await window.invoicePDFGenerator.generateInvoicePDF(invoiceData);
                console.log('✅ PDF generado:', pdfInfo);
                
                // Guardar en el historial de facturas con ID de transacción
                const transactionId = transaction?.data?.id || transaction?.id;
                if (window.invoiceManager) {
                    window.invoiceManager.saveInvoice(invoiceData, pdfInfo, transactionId);
                    console.log('💾 Factura guardada en historial con transacción:', transactionId);
                } else {
                    console.warn('⚠️ Gestor de facturas no disponible');
                    // Intentar inicializar el gestor
                    if (window.InvoiceManager) {
                        window.invoiceManager = new InvoiceManager();
                        window.invoiceManager.saveInvoice(invoiceData, pdfInfo, transactionId);
                    }
                }
                
                // Mostrar notificación de éxito
                this.showFormAlert('invoice', `Factura generada exitosamente. PDF: ${pdfInfo.fileName}`, 'success');
            } else {
                console.error('❌ Generador de PDF no disponible. window.invoicePDFGenerator:', window.invoicePDFGenerator);
                console.error('❌ window.InvoicePDFGenerator:', window.InvoicePDFGenerator);
                this.showFormAlert('invoice', 'Error: Generador de PDF no disponible', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            this.showFormAlert('invoice', 'Factura creada pero error generando PDF: ' + error.message, 'warning');
        }
    }
    
    getStudentName(studentId) {
        // Mapeo de estudiantes demo
        const students = {
            'demo1': 'Juan Pérez',
            'demo2': 'María García', 
            'demo3': 'Carlos López'
        };
        
        return students[studentId] || 'Estudiante';
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    
    setFormLoading(formName, isLoading) {
        const config = this.forms.get(formName);
        if (!config) return;
        
        const form = document.getElementById(config.formId);
        if (!form) return;
        
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = isLoading;
            
            const buttonText = submitButton.querySelector('.btn-text') || submitButton;
            const loadingSpinner = submitButton.querySelector('.loading-spinner');
            
            if (isLoading) {
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'inline-block';
                }
                if (buttonText) {
                    buttonText.style.opacity = '0.7';
                }
            } else {
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
                if (buttonText) {
                    buttonText.style.opacity = '1';
                }
            }
        }
    }
    
    populateAccountSelects() {
        const accounts = this.state.get('accounts') || [];
        
        // Filtrar cuentas por tipo para cada select
        this.populateSelect('debitAccountSelect', accounts, ['ASSET'], 'Seleccionar cuenta donde entra el dinero...');
        this.populateSelect('creditAccountSelect', accounts, ['INCOME'], 'Seleccionar tipo de ingreso...');
        
        this.populateSelect('expenseDebitAccountSelect', accounts, ['EXPENSE'], 'Seleccionar tipo de gasto...');
        this.populateSelect('expenseCreditAccountSelect', accounts, ['ASSET'], 'Seleccionar cuenta donde sale el dinero...');
        
        this.populateSelect('invoiceDebitAccountSelect', accounts, ['ASSET'], 'Seleccionar cuenta donde entra el dinero...');
        this.populateSelect('invoiceCreditAccountSelect', accounts, ['INCOME'], 'Seleccionar tipo de ingreso...');
    }
    
    populateSelect(selectId, accounts, allowedTypes, placeholder) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = `<option value="">${placeholder}</option>`;
        
        // Filtrar cuentas por tipo permitido
        const filteredAccounts = accounts.filter(account => 
            allowedTypes.includes(account.accountType) && account.isActive
        );
        
        // Agrupar por tipo para mejor organización
        const groupedAccounts = {};
        filteredAccounts.forEach(account => {
            if (!groupedAccounts[account.accountType]) {
                groupedAccounts[account.accountType] = [];
            }
            groupedAccounts[account.accountType].push(account);
        });
        
        // Agregar opciones agrupadas
        Object.entries(groupedAccounts).forEach(([type, typeAccounts]) => {
            if (typeAccounts.length > 0) {
                // Crear grupo
                const optgroup = document.createElement('optgroup');
                optgroup.label = this.getAccountTypeLabel(type);
                
                typeAccounts
                    .sort((a, b) => a.code.localeCompare(b.code))
                    .forEach(account => {
                        const option = document.createElement('option');
                        option.value = account.id;
                        option.textContent = `${account.code} - ${account.name}`;
                        if (account.id === currentValue) {
                            option.selected = true;
                        }
                        optgroup.appendChild(option);
                    });
                
                select.appendChild(optgroup);
            }
        });
    }
    
    getAccountTypeLabel(type) {
        const labels = {
            'ASSET': '💰 Activos (Caja, Bancos)',
            'LIABILITY': '💳 Pasivos',
            'EQUITY': '🏛️ Patrimonio',
            'INCOME': '📈 Ingresos',
            'EXPENSE': '📉 Gastos'
        };
        return labels[type] || type;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que AccountingState esté disponible
    if (window.AccountingState) {
        window.accountingForms = new AccountingForms();
        
        // Suscribirse a cambios en las cuentas para actualizar selects
        window.AccountingState.subscribe('accounts', () => {
            if (window.accountingForms) {
                window.accountingForms.populateAccountSelects();
            }
        });
    } else {
        setTimeout(() => {
            if (window.AccountingState) {
                window.accountingForms = new AccountingForms();
                
                window.AccountingState.subscribe('accounts', () => {
                    if (window.accountingForms) {
                        window.accountingForms.populateAccountSelects();
                    }
                });
            }
        }, 1000);
    }
});

// Exportar para uso global
window.AccountingForms = AccountingForms;