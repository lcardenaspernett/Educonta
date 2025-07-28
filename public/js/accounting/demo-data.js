// ===================================
// EDUCONTA - Datos de Demostración
// ===================================

/**
 * Datos de ejemplo para demostrar el funcionamiento del dashboard
 * cuando no hay conexión con el backend real
 */

window.DemoData = {
    // Estadísticas iniciales (serán recalculadas dinámicamente)
    stats: {
        totalAccounts: 18,
        activeAccounts: 18,
        totalTransactions: 0,
        pendingTransactions: 0,
        totalBalance: 0, // Será calculado dinámicamente
        totalIncome: 0,  // Será calculado dinámicamente
        totalExpenses: 0, // Será calculado dinámicamente
        netBalance: 0,   // Será calculado dinámicamente
        pendingInvoices: 0,
        accountsByType: {
            ASSET: 5,
            LIABILITY: 3,
            EQUITY: 3,
            INCOME: 3,
            EXPENSE: 4
        },
        recentTransactions: [],
        transactionsByMonth: []
    },

    // Cuentas de ejemplo
    accounts: [
        // ACTIVOS
        {
            id: 'asset-1',
            code: '1100',
            name: 'Disponible',
            accountType: 'ASSET',
            level: 1,
            parentId: null,
            balance: 3000000,
            isActive: true,
            _count: { debitTransactions: 13, creditTransactions: 5 }
        },
        {
            id: '1',
            code: '1105',
            name: 'Caja',
            accountType: 'ASSET',
            level: 2,
            parentId: 'asset-1',
            balance: 500000,
            isActive: true,
            _count: { debitTransactions: 5, creditTransactions: 2 }
        },
        {
            id: '2',
            code: '1110',
            name: 'Bancos',
            accountType: 'ASSET',
            level: 2,
            parentId: 'asset-1',
            balance: 2500000,
            isActive: true,
            _count: { debitTransactions: 8, creditTransactions: 3 }
        },
        {
            id: 'asset-2',
            code: '1200',
            name: 'Inversiones',
            accountType: 'ASSET',
            level: 1,
            parentId: null,
            balance: 1200000,
            isActive: true,
            _count: { debitTransactions: 3, creditTransactions: 1 }
        },
        {
            id: 'asset-3',
            code: '1205',
            name: 'Inversiones Temporales',
            accountType: 'ASSET',
            level: 2,
            parentId: 'asset-2',
            balance: 1200000,
            isActive: true,
            _count: { debitTransactions: 3, creditTransactions: 1 }
        },

        // PASIVOS
        {
            id: 'liability-1',
            code: '2100',
            name: 'Obligaciones Financieras',
            accountType: 'LIABILITY',
            level: 1,
            parentId: null,
            balance: 1500000,
            isActive: true,
            _count: { debitTransactions: 2, creditTransactions: 8 }
        },
        {
            id: '3',
            code: '2105',
            name: 'Proveedores',
            accountType: 'LIABILITY',
            level: 2,
            parentId: 'liability-1',
            balance: 800000,
            isActive: true,
            _count: { debitTransactions: 2, creditTransactions: 6 }
        },
        {
            id: 'liability-2',
            code: '2110',
            name: 'Acreedores Varios',
            accountType: 'LIABILITY',
            level: 2,
            parentId: 'liability-1',
            balance: 700000,
            isActive: true,
            _count: { debitTransactions: 0, creditTransactions: 2 }
        },

        // PATRIMONIO
        {
            id: 'equity-1',
            code: '3100',
            name: 'Capital Social',
            accountType: 'EQUITY',
            level: 1,
            parentId: null,
            balance: 2000000,
            isActive: true,
            _count: { debitTransactions: 0, creditTransactions: 2 }
        },
        {
            id: '4',
            code: '3105',
            name: 'Capital Suscrito y Pagado',
            accountType: 'EQUITY',
            level: 2,
            parentId: 'equity-1',
            balance: 1000000,
            isActive: true,
            _count: { debitTransactions: 0, creditTransactions: 1 }
        },
        {
            id: 'equity-2',
            code: '3110',
            name: 'Reservas',
            accountType: 'EQUITY',
            level: 2,
            parentId: 'equity-1',
            balance: 1000000,
            isActive: true,
            _count: { debitTransactions: 0, creditTransactions: 1 }
        },

        // INGRESOS
        {
            id: 'income-1',
            code: '4100',
            name: 'Ingresos Operacionales',
            accountType: 'INCOME',
            level: 1,
            parentId: null,
            balance: 2500000,
            isActive: true,
            _count: { debitTransactions: 1, creditTransactions: 15 }
        },
        {
            id: '5',
            code: '4135',
            name: 'Ingresos por Servicios Educativos',
            accountType: 'INCOME',
            level: 2,
            parentId: 'income-1',
            balance: 1500000,
            isActive: true,
            _count: { debitTransactions: 1, creditTransactions: 10 }
        },
        {
            id: 'income-2',
            code: '4140',
            name: 'Otros Ingresos Operacionales',
            accountType: 'INCOME',
            level: 2,
            parentId: 'income-1',
            balance: 1000000,
            isActive: true,
            _count: { debitTransactions: 0, creditTransactions: 5 }
        },

        // GASTOS
        {
            id: 'expense-1',
            code: '5100',
            name: 'Gastos Operacionales',
            accountType: 'EXPENSE',
            level: 1,
            parentId: null,
            balance: 800000,
            isActive: true,
            _count: { debitTransactions: 12, creditTransactions: 0 }
        },
        {
            id: '6',
            code: '5105',
            name: 'Gastos Administrativos',
            accountType: 'EXPENSE',
            level: 2,
            parentId: 'expense-1',
            balance: 300000,
            isActive: true,
            _count: { debitTransactions: 4, creditTransactions: 0 }
        },
        {
            id: 'expense-2',
            code: '5110',
            name: 'Gastos de Ventas',
            accountType: 'EXPENSE',
            level: 2,
            parentId: 'expense-1',
            balance: 200000,
            isActive: true,
            _count: { debitTransactions: 3, creditTransactions: 0 }
        },
        {
            id: 'expense-3',
            code: '5115',
            name: 'Gastos Financieros',
            accountType: 'EXPENSE',
            level: 2,
            parentId: 'expense-1',
            balance: 300000,
            isActive: true,
            _count: { debitTransactions: 5, creditTransactions: 0 }
        }
    ],

    // Transacciones de ejemplo
    transactions: [
        {
            id: '1',
            date: new Date().toISOString(),
            reference: 'ING-001',
            description: 'Pago de matrícula - Juan Pérez',
            amount: 500000,
            type: 'INCOME',
            status: 'APPROVED',
            debitAccountId: '1',
            creditAccountId: '5',
            debitAccount: {
                id: '1',
                code: '1105',
                name: 'Caja',
                accountType: 'ASSET'
            },
            creditAccount: {
                id: '5',
                code: '4135',
                name: 'Ingresos por Servicios Educativos',
                accountType: 'INCOME'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '2',
            date: new Date(Date.now() - 86400000).toISOString(),
            reference: 'GAS-001',
            description: 'Pago de servicios públicos',
            amount: 150000,
            type: 'EXPENSE',
            status: 'APPROVED',
            debitAccountId: '6',
            creditAccountId: '1',
            debitAccount: {
                id: '6',
                code: '5105',
                name: 'Gastos Administrativos',
                accountType: 'EXPENSE'
            },
            creditAccount: {
                id: '1',
                code: '1105',
                name: 'Caja',
                accountType: 'ASSET'
            },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '3',
            date: new Date(Date.now() - 172800000).toISOString(),
            reference: 'ING-002',
            description: 'Pago de mensualidad - María García',
            amount: 300000,
            type: 'INCOME',
            status: 'APPROVED',
            debitAccountId: '2',
            creditAccountId: '5',
            debitAccount: {
                id: '2',
                code: '1110',
                name: 'Bancos',
                accountType: 'ASSET'
            },
            creditAccount: {
                id: '5',
                code: '4135',
                name: 'Ingresos por Servicios Educativos',
                accountType: 'INCOME'
            },
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: '4',
            date: new Date(Date.now() - 259200000).toISOString(),
            reference: 'GAS-002',
            description: 'Compra de materiales de oficina',
            amount: 80000,
            type: 'EXPENSE',
            status: 'APPROVED',
            debitAccountId: '6',
            creditAccountId: '1',
            debitAccount: {
                id: '6',
                code: '5105',
                name: 'Gastos Administrativos',
                accountType: 'EXPENSE'
            },
            creditAccount: {
                id: '1',
                code: '1105',
                name: 'Caja',
                accountType: 'ASSET'
            },
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            updatedAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
            id: '6',
            date: new Date().toISOString(),
            reference: 'ING-004',
            description: 'Matrícula estudiante nuevo - Pedro Ramírez',
            amount: 1200000,
            type: 'INCOME',
            status: 'PENDING', // Requiere aprobación del Rector (monto alto)
            debitAccountId: '1',
            creditAccountId: '5',
            debitAccount: {
                id: '1',
                code: '1105',
                name: 'Caja',
                accountType: 'ASSET'
            },
            creditAccount: {
                id: '5',
                code: '4135',
                name: 'Ingresos por Servicios Educativos',
                accountType: 'INCOME'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '7',
            date: new Date(Date.now() - 86400000).toISOString(),
            reference: 'ING-005',
            description: 'Mensualidad regular - Laura González',
            amount: 350000,
            type: 'INCOME',
            status: 'PENDING', // Puede aprobar Contador Auxiliar
            debitAccountId: '1',
            creditAccountId: '5',
            debitAccount: {
                id: '1',
                code: '1105',
                name: 'Caja',
                accountType: 'ASSET'
            },
            creditAccount: {
                id: '5',
                code: '4135',
                name: 'Ingresos por Servicios Educativos',
                accountType: 'INCOME'
            },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '8',
            date: new Date(Date.now() - 172800000).toISOString(),
            reference: 'GAS-003',
            description: 'Excursión pedagógica - Transporte',
            amount: 800000,
            type: 'EXPENSE',
            status: 'PENDING', // Requiere aprobación del Rector (concepto importante)
            debitAccountId: 'expense-2',
            creditAccountId: '2',
            debitAccount: {
                id: 'expense-2',
                code: '5110',
                name: 'Gastos de Ventas',
                accountType: 'EXPENSE'
            },
            creditAccount: {
                id: '2',
                code: '1110',
                name: 'Bancos',
                accountType: 'ASSET'
            },
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: '5',
            date: new Date(Date.now() - 345600000).toISOString(),
            reference: 'ING-003',
            description: 'Pago de evento especial - Carlos López',
            amount: 120000,
            type: 'INCOME',
            status: 'APPROVED',
            debitAccountId: '1',
            creditAccountId: 'income-2',
            debitAccount: {
                id: '1',
                code: '1105',
                name: 'Caja',
                accountType: 'ASSET'
            },
            creditAccount: {
                id: 'income-2',
                code: '4140',
                name: 'Otros Ingresos Operacionales',
                accountType: 'INCOME'
            },
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            updatedAt: new Date(Date.now() - 345600000).toISOString()
        },

    ],

    // Función para obtener datos simulados
    async getStats() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Recalcular estadísticas dinámicamente
                this.recalculateStats();
                
                console.log('📊 Estadísticas demo actualizadas:', this.stats);
                resolve({
                    success: true,
                    data: { ...this.stats }
                });
            }, 500);
        });
    },
    
    recalculateStats() {
        console.log('🔄 Recalculando estadísticas completas...');
        
        let totalIncome = 0;
        let totalExpenses = 0;
        let pendingTransactions = 0;
        let pendingInvoices = 0;
        
        // Obtener mes y año actual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        this.transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                                 transactionDate.getFullYear() === currentYear;
            
            if (transaction.status === 'APPROVED') {
                // Solo contar transacciones del mes actual para las estadísticas mensuales
                if (isCurrentMonth) {
                    if (transaction.type === 'INCOME') {
                        totalIncome += transaction.amount;
                    } else if (transaction.type === 'EXPENSE') {
                        totalExpenses += transaction.amount;
                    }
                }
            } else if (transaction.status === 'PENDING') {
                pendingTransactions++;
                if (transaction.type === 'INCOME') {
                    pendingInvoices++;
                }
            }
        });
        
        // Actualizar estadísticas
        this.stats.totalIncome = totalIncome;
        this.stats.totalExpenses = totalExpenses;
        this.stats.netBalance = totalIncome - totalExpenses;
        this.stats.pendingTransactions = pendingTransactions;
        this.stats.pendingInvoices = pendingInvoices;
        this.stats.totalTransactions = this.transactions.length;
        
        // Calcular balance total de cuentas
        this.stats.totalBalance = this.calculateTotalBalance();
        
        console.log('📊 Estadísticas actualizadas:', {
            ingresos: totalIncome,
            gastos: totalExpenses,
            balance: this.stats.netBalance,
            pendientes: pendingTransactions,
            balanceTotal: this.stats.totalBalance
        });
        
        return this.stats;
    },

    // Nueva función para calcular balance total
    calculateTotalBalance() {
        let totalAssets = 0;
        let totalLiabilities = 0;
        
        this.accounts.forEach(account => {
            if (account.accountType === 'ASSET') {
                totalAssets += account.balance || 0;
            } else if (account.accountType === 'LIABILITY') {
                totalLiabilities += account.balance || 0;
            }
        });
        
        return totalAssets - totalLiabilities;
    },

    // Nueva función para actualizar balances de cuentas
    updateAccountBalances(transactionData) {
        const debitAccount = this.accounts.find(acc => acc.id === transactionData.debitAccountId);
        const creditAccount = this.accounts.find(acc => acc.id === transactionData.creditAccountId);

        if (debitAccount) {
            debitAccount.balance = (debitAccount.balance || 0) + transactionData.amount;
            debitAccount._count.debitTransactions++;
        }

        if (creditAccount) {
            // Para cuentas de ingreso y pasivo, el crédito aumenta el balance
            // Para cuentas de activo y gasto, el crédito disminuye el balance
            if (['INCOME', 'LIABILITY', 'EQUITY'].includes(creditAccount.accountType)) {
                creditAccount.balance = (creditAccount.balance || 0) + transactionData.amount;
            } else {
                creditAccount.balance = (creditAccount.balance || 0) - transactionData.amount;
            }
            creditAccount._count.creditTransactions++;
        }
    },

    async getAccounts() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: this.accounts
                });
            }, 300);
        });
    },

    async getTransactions() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: this.transactions
                });
            }, 400);
        });
    },

    async createTransaction(transactionData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTransaction = {
                    id: Date.now().toString(),
                    ...transactionData,
                    status: 'APPROVED',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    debitAccount: this.accounts.find(acc => acc.id === transactionData.debitAccountId),
                    creditAccount: this.accounts.find(acc => acc.id === transactionData.creditAccountId)
                };

                // Agregar transacción
                this.transactions.unshift(newTransaction);

                // Actualizar balances de las cuentas afectadas
                this.updateAccountBalances(transactionData);

                // Recalcular estadísticas completas
                this.recalculateStats();

                console.log('✅ Transacción creada:', newTransaction);
                console.log('📊 Stats después de crear transacción:', this.stats);

                // SINCRONIZAR CON ACCOUNTING STATE
                if (window.AccountingState) {
                    console.log('🔄 Sincronizando con AccountingState...');
                    
                    // Actualizar las transacciones en AccountingState
                    window.AccountingState.set('transactions', [...this.transactions]);
                    
                    // Actualizar las estadísticas en AccountingState
                    window.AccountingState.set('stats', {...this.stats});
                    
                    // Notificar a los listeners
                    window.AccountingState.notifyListeners('transactions', this.transactions);
                    window.AccountingState.notifyListeners('stats', this.stats);
                    
                    console.log('✅ AccountingState sincronizado');
                }

                resolve({
                    success: true,
                    data: newTransaction
                });
            }, 600);
        });
    },

    // Función para obtener clientes
    async getClients() {
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
                    },
                    {
                        id: '4',
                        name: 'Ana Sofía Herrera',
                        email: 'ana.herrera@email.com',
                        phone: '+57 303 456 7890',
                        document: '45678901',
                        documentType: 'CC',
                        address: 'Calle 72 #11-25, Barranquilla',
                        city: 'Barranquilla',
                        status: 'ACTIVE',
                        totalInvoices: 22,
                        totalAmount: 3800000,
                        lastInvoice: new Date('2025-07-28').toISOString(),
                        createdAt: new Date('2023-11-05').toISOString(),
                        category: 'VIP'
                    },
                    {
                        id: '5',
                        name: 'Luis Fernando Castro',
                        email: 'luis.castro@email.com',
                        phone: '+57 304 567 8901',
                        document: '56789012',
                        documentType: 'CC',
                        address: 'Transversal 15 #67-89, Bucaramanga',
                        city: 'Bucaramanga',
                        status: 'ACTIVE',
                        totalInvoices: 12,
                        totalAmount: 1800000,
                        lastInvoice: new Date('2025-07-22').toISOString(),
                        createdAt: new Date('2024-02-28').toISOString(),
                        category: 'REGULAR'
                    },
                    {
                        id: '6',
                        name: 'Patricia Morales Vega',
                        email: 'patricia.morales@email.com',
                        phone: '+57 305 678 9012',
                        document: '67890123',
                        documentType: 'CC',
                        address: 'Diagonal 25 #34-56, Cartagena',
                        city: 'Cartagena',
                        status: 'ACTIVE',
                        totalInvoices: 18,
                        totalAmount: 2800000,
                        lastInvoice: new Date('2025-07-26').toISOString(),
                        createdAt: new Date('2023-09-12').toISOString(),
                        category: 'PREMIUM'
                    },
                    {
                        id: '7',
                        name: 'Roberto Silva Jiménez',
                        email: 'roberto.silva@email.com',
                        phone: '+57 306 789 0123',
                        document: '78901234',
                        documentType: 'CC',
                        address: 'Calle 50 #78-90, Pereira',
                        city: 'Pereira',
                        status: 'INACTIVE',
                        totalInvoices: 5,
                        totalAmount: 750000,
                        lastInvoice: new Date('2025-04-10').toISOString(),
                        createdAt: new Date('2024-05-18').toISOString(),
                        category: 'BASIC'
                    },
                    {
                        id: '8',
                        name: 'Carmen Elena Ruiz',
                        email: 'carmen.ruiz@email.com',
                        phone: '+57 307 890 1234',
                        document: '89012345',
                        documentType: 'CC',
                        address: 'Avenida 15 #23-45, Manizales',
                        city: 'Manizales',
                        status: 'ACTIVE',
                        totalInvoices: 25,
                        totalAmount: 4200000,
                        lastInvoice: new Date('2025-07-27').toISOString(),
                        createdAt: new Date('2023-08-03').toISOString(),
                        category: 'VIP'
                    }
                ];

                resolve({
                    success: true,
                    data: clients
                });
            }, 300);
        });
    },

    // Función para obtener facturas
    async getInvoices() {
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
                    },
                    {
                        id: 'inv-004',
                        number: 'FAC-2025-004',
                        date: new Date('2025-02-01').toISOString(),
                        dueDate: new Date('2025-03-01').toISOString(),
                        client: {
                            id: '4',
                            name: 'Ana Sofía Herrera',
                            document: '4567890123',
                            email: 'ana.herrera@email.com'
                        },
                        items: [
                            {
                                description: 'Matrícula + Mensualidad Febrero',
                                quantity: 1,
                                unitPrice: 800000,
                                total: 800000
                            }
                        ],
                        subtotal: 800000,
                        tax: 0,
                        total: 800000,
                        status: 'PAID',
                        paymentMethod: 'CASH',
                        paymentDate: new Date('2025-02-05').toISOString(),
                        createdAt: new Date('2025-02-01').toISOString(),
                        updatedAt: new Date('2025-02-05').toISOString()
                    },
                    {
                        id: 'inv-005',
                        number: 'FAC-2025-005',
                        date: new Date('2025-02-10').toISOString(),
                        dueDate: new Date('2025-03-10').toISOString(),
                        client: {
                            id: '5',
                            name: 'Luis Fernando Castro',
                            document: '5678901234',
                            email: 'luis.castro@email.com'
                        },
                        items: [
                            {
                                description: 'Mensualidad Febrero 2025',
                                quantity: 1,
                                unitPrice: 300000,
                                total: 300000
                            }
                        ],
                        subtotal: 300000,
                        tax: 0,
                        total: 300000,
                        status: 'CANCELLED',
                        paymentMethod: null,
                        paymentDate: null,
                        createdAt: new Date('2025-02-10').toISOString(),
                        updatedAt: new Date('2025-02-12').toISOString()
                    }
                ];

                resolve({
                    success: true,
                    data: invoices
                });
            }, 400);
        });
    }
};

// Ya está disponible globalmente como window.DemoData