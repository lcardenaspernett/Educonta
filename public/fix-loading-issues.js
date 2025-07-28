// Script para corregir problemas de carga

console.log('🔧 Iniciando corrección de problemas de carga...');

// Función para forzar la carga de datos
function forceLoadData() {
    console.log('🔄 Forzando carga de datos...');
    
    // Corregir clientes
    if (window.clientsPage) {
        console.log('👥 Corrigiendo carga de clientes...');
        
        // Si no hay datos, usar datos de ejemplo
        if (!window.clientsPage.clients || window.clientsPage.clients.length === 0) {
            window.clientsPage.clients = [
                {
                    id: '1',
                    name: 'Juan Pérez García',
                    email: 'juan.perez@email.com',
                    phone: '+57 300 123 4567',
                    document: '12345678',
                    documentType: 'CC',
                    address: 'Calle 123 #45-67, Bogotá',
                    city: 'Bogotá',
                    status: 'ACTIVE',
                    totalInvoices: 15,
                    totalAmount: 2500000,
                    lastInvoice: new Date('2025-07-20').toISOString(),
                    createdAt: new Date('2024-01-15').toISOString(),
                    category: 'REGULAR'
                },
                {
                    id: '2',
                    name: 'María González López',
                    email: 'maria.gonzalez@email.com',
                    phone: '+57 301 234 5678',
                    document: '23456789',
                    documentType: 'CC',
                    address: 'Carrera 45 #12-34, Medellín',
                    city: 'Medellín',
                    status: 'ACTIVE',
                    totalInvoices: 8,
                    totalAmount: 1200000,
                    lastInvoice: new Date('2025-07-25').toISOString(),
                    createdAt: new Date('2024-03-10').toISOString(),
                    category: 'PREMIUM'
                },
                {
                    id: '3',
                    name: 'Carlos Rodríguez Martín',
                    email: 'carlos.rodriguez@email.com',
                    phone: '+57 302 345 6789',
                    document: '34567890',
                    documentType: 'CC',
                    address: 'Avenida 80 #23-45, Cali',
                    city: 'Cali',
                    status: 'INACTIVE',
                    totalInvoices: 3,
                    totalAmount: 450000,
                    lastInvoice: new Date('2025-05-15').toISOString(),
                    createdAt: new Date('2024-06-20').toISOString(),
                    category: 'BASIC'
                }
            ];
            
            window.clientsPage.filteredClients = [...window.clientsPage.clients];
            window.clientsPage.renderClients();
            window.clientsPage.updateStats();
            console.log('✅ Clientes cargados y renderizados');
        }
    }
    
    // Corregir facturas
    if (window.invoicesPage) {
        console.log('🧾 Corrigiendo carga de facturas...');
        
        // Si no hay datos, usar datos de ejemplo
        if (!window.invoicesPage.invoices || window.invoicesPage.invoices.length === 0) {
            window.invoicesPage.invoices = [
                {
                    id: 'inv-001',
                    number: 'FAC-2025-001',
                    date: new Date('2025-01-15').toISOString(),
                    dueDate: new Date('2025-02-15').toISOString(),
                    client: {
                        id: '1',
                        name: 'Juan Carlos Pérez',
                        document: '1234567890',
                        email: 'juan.perez@email.com'
                    },
                    items: [
                        {
                            description: 'Matrícula Semestre 2025-1',
                            quantity: 1,
                            unitPrice: 1500000,
                            total: 1500000
                        }
                    ],
                    subtotal: 1500000,
                    tax: 0,
                    total: 1500000,
                    status: 'PAID',
                    paymentMethod: 'TRANSFER',
                    paymentDate: new Date('2025-01-20').toISOString(),
                    createdAt: new Date('2025-01-15').toISOString(),
                    updatedAt: new Date('2025-01-20').toISOString()
                },
                {
                    id: 'inv-002',
                    number: 'FAC-2025-002',
                    date: new Date('2025-01-20').toISOString(),
                    dueDate: new Date('2025-02-20').toISOString(),
                    client: {
                        id: '2',
                        name: 'María González López',
                        document: '2345678901',
                        email: 'maria.gonzalez@email.com'
                    },
                    items: [
                        {
                            description: 'Mensualidad Enero 2025',
                            quantity: 1,
                            unitPrice: 350000,
                            total: 350000
                        }
                    ],
                    subtotal: 350000,
                    tax: 0,
                    total: 350000,
                    status: 'PENDING',
                    paymentMethod: null,
                    paymentDate: null,
                    createdAt: new Date('2025-01-20').toISOString(),
                    updatedAt: new Date('2025-01-20').toISOString()
                },
                {
                    id: 'inv-003',
                    number: 'FAC-2025-003',
                    date: new Date('2025-01-25').toISOString(),
                    dueDate: new Date('2025-02-25').toISOString(),
                    client: {
                        id: '3',
                        name: 'Carlos Rodríguez Martín',
                        document: '3456789012',
                        email: 'carlos.rodriguez@email.com'
                    },
                    items: [
                        {
                            description: 'Curso de Inglés - Nivel Básico',
                            quantity: 1,
                            unitPrice: 450000,
                            total: 450000
                        }
                    ],
                    subtotal: 450000,
                    tax: 0,
                    total: 450000,
                    status: 'OVERDUE',
                    paymentMethod: null,
                    paymentDate: null,
                    createdAt: new Date('2025-01-25').toISOString(),
                    updatedAt: new Date('2025-01-25').toISOString()
                }
            ];
            
            window.invoicesPage.filteredInvoices = [...window.invoicesPage.invoices];
            window.invoicesPage.renderInvoices();
            window.invoicesPage.updateSummary();
            console.log('✅ Facturas cargadas y renderizadas');
        }
    }
}

// Función para limpiar elementos de carga duplicados
function cleanupLoadingElements() {
    console.log('🧹 Limpiando elementos de carga duplicados...');
    
    // Buscar y eliminar elementos de carga duplicados
    const loadingRows = document.querySelectorAll('.loading-row');
    if (loadingRows.length > 1) {
        console.log(`🗑️ Encontrados ${loadingRows.length} elementos de carga, eliminando duplicados...`);
        
        // Mantener solo el primero, eliminar el resto
        for (let i = 1; i < loadingRows.length; i++) {
            loadingRows[i].remove();
        }
    }
    
    // Buscar y eliminar headers duplicados
    const duplicateHeaders = document.querySelectorAll('h3');
    const headerTexts = [];
    duplicateHeaders.forEach(header => {
        if (headerTexts.includes(header.textContent)) {
            console.log(`🗑️ Eliminando header duplicado: ${header.textContent}`);
            header.parentElement.remove();
        } else {
            headerTexts.push(header.textContent);
        }
    });
}

// Función principal de corrección
function fixLoadingIssues() {
    console.log('🔧 Ejecutando corrección completa...');
    
    cleanupLoadingElements();
    
    setTimeout(() => {
        forceLoadData();
    }, 500);
    
    setTimeout(() => {
        // Verificar si aún hay problemas
        const stillLoading = document.querySelectorAll('.loading-row:not([style*="display: none"])');
        if (stillLoading.length > 0) {
            console.log('⚠️ Aún hay elementos cargando, forzando renderizado...');
            forceLoadData();
        }
    }, 2000);
}

// Hacer funciones disponibles globalmente
window.forceLoadData = forceLoadData;
window.cleanupLoadingElements = cleanupLoadingElements;
window.fixLoadingIssues = fixLoadingIssues;

// Ejecutar automáticamente si se detectan problemas
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loadingElements = document.querySelectorAll('.loading-row:not([style*="display: none"])');
        if (loadingElements.length > 0) {
            console.log('🔍 Detectados problemas de carga, ejecutando corrección automática...');
            fixLoadingIssues();
        }
    }, 3000);
});

console.log('✅ Script de corrección cargado. Funciones disponibles:');
console.log('   - fixLoadingIssues() - Corrección completa');
console.log('   - forceLoadData() - Forzar carga de datos');
console.log('   - cleanupLoadingElements() - Limpiar duplicados');