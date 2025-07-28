// Versión simplificada de DemoData para debugging

console.log('🔄 Cargando DemoData simplificado...');

window.DemoData = {
    // Función para obtener clientes
    async getClients() {
        console.log('📋 getClients llamado');
        return new Promise((resolve) => {
            setTimeout(() => {
                const clients = [
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
                    }
                ];

                console.log('✅ Clientes generados:', clients.length);
                resolve({
                    success: true,
                    data: clients
                });
            }, 300);
        });
    },

    // Función para obtener facturas
    async getInvoices() {
        console.log('📋 getInvoices llamado');
        return new Promise((resolve) => {
            setTimeout(() => {
                const invoices = [
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
                    }
                ];

                console.log('✅ Facturas generadas:', invoices.length);
                resolve({
                    success: true,
                    data: invoices
                });
            }, 400);
        });
    },

    // Función para obtener transacciones (simplificada)
    async getTransactions() {
        console.log('📋 getTransactions llamado');
        return new Promise((resolve) => {
            setTimeout(() => {
                const transactions = [
                    {
                        id: '1',
                        date: new Date().toISOString(),
                        reference: 'ING-001',
                        description: 'Pago de matrícula - Juan Pérez',
                        amount: 500000,
                        type: 'INCOME',
                        status: 'APPROVED',
                        debitAccount: { id: '1', code: '1105', name: 'Caja' },
                        creditAccount: { id: '2', code: '4135', name: 'Ingresos por Servicios Educativos' },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];

                console.log('✅ Transacciones generadas:', transactions.length);
                resolve({
                    success: true,
                    data: transactions
                });
            }, 400);
        });
    }
};

console.log('✅ DemoData simplificado cargado exitosamente');
console.log('📊 Métodos disponibles:', Object.keys(window.DemoData));