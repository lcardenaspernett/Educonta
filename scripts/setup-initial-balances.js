// ===================================
// SCRIPT PARA CONFIGURAR SALDOS INICIALES
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupInitialBalances(institutionId) {
    console.log('💰 Configurando saldos iniciales...\n');

    try {
        // 1. Verificar que la institución existe
        const institution = await prisma.institution.findUnique({
            where: { id: institutionId }
        });

        if (!institution) {
            throw new Error(`Institución no encontrada: ${institutionId}`);
        }

        console.log(`🏫 Configurando para: ${institution.name}`);

        // 2. Crear plan de cuentas básico si no existe
        console.log('📊 Verificando plan de cuentas...');
        
        const accountsToCreate = [
            {
                code: '1105',
                name: 'Caja General',
                type: 'ASSET',
                description: 'Efectivo disponible en caja',
                isActive: true,
                institutionId
            },
            {
                code: '1110',
                name: 'Bancos',
                type: 'ASSET',
                description: 'Cuentas bancarias de la institución',
                isActive: true,
                institutionId
            },
            {
                code: '1305',
                name: 'Cuentas por Cobrar Estudiantes',
                type: 'ASSET',
                description: 'Deudas pendientes de estudiantes',
                isActive: true,
                institutionId
            },
            {
                code: '4135',
                name: 'Ingresos por Eventos',
                type: 'INCOME',
                description: 'Ingresos generados por eventos institucionales',
                isActive: true,
                institutionId
            },
            {
                code: '4140',
                name: 'Otros Ingresos',
                type: 'INCOME',
                description: 'Otros ingresos institucionales',
                isActive: true,
                institutionId
            },
            {
                code: '5105',
                name: 'Gastos Administrativos',
                type: 'EXPENSE',
                description: 'Gastos de administración',
                isActive: true,
                institutionId
            },
            {
                code: '5110',
                name: 'Gastos de Eventos',
                type: 'EXPENSE',
                description: 'Gastos relacionados con eventos',
                isActive: true,
                institutionId
            }
        ];

        for (const accountData of accountsToCreate) {
            const existingAccount = await prisma.account.findFirst({
                where: {
                    code: accountData.code,
                    institutionId
                }
            });

            if (!existingAccount) {
                await prisma.account.create({
                    data: {
                        ...accountData,
                        balance: 0 // Iniciar en 0, se configurará después
                    }
                });
                console.log(`✅ Cuenta creada: ${accountData.code} - ${accountData.name}`);
            } else {
                console.log(`⚠️  Cuenta ya existe: ${accountData.code} - ${accountData.name}`);
            }
        }

        // 3. Solicitar saldos iniciales
        console.log('\n💰 Configuración de saldos iniciales:');
        console.log('=====================================');
        
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askBalance = (accountName, accountCode) => {
            return new Promise((resolve) => {
                rl.question(`💵 Saldo inicial para ${accountName} (${accountCode}): $`, (answer) => {
                    const amount = parseFloat(answer.replace(/[,$]/g, '')) || 0;
                    resolve(amount);
                });
            });
        };

        // Obtener cuentas creadas
        const accounts = await prisma.account.findMany({
            where: { institutionId },
            orderBy: { code: 'asc' }
        });

        const balances = {};
        
        for (const account of accounts) {
            if (account.type === 'ASSET') {
                const balance = await askBalance(account.name, account.code);
                balances[account.id] = balance;
                console.log(`✅ ${account.name}: $${balance.toLocaleString()}`);
            }
        }

        rl.close();

        // 4. Actualizar saldos en la base de datos
        console.log('\n💾 Guardando saldos iniciales...');
        
        for (const [accountId, balance] of Object.entries(balances)) {
            if (balance > 0) {
                await prisma.account.update({
                    where: { id: accountId },
                    data: { balance }
                });

                // Crear transacción de saldo inicial
                const account = accounts.find(a => a.id === accountId);
                await prisma.transaction.create({
                    data: {
                        amount: balance,
                        type: 'INCOME',
                        description: `Saldo inicial - ${account.name}`,
                        reference: `SALDO-INICIAL-${Date.now()}`,
                        date: new Date(),
                        accountId,
                        institutionId,
                        status: 'COMPLETED',
                        metadata: {
                            type: 'initial_balance',
                            setupDate: new Date().toISOString()
                        }
                    }
                });

                console.log(`✅ Saldo configurado: ${account.name} - $${balance.toLocaleString()}`);
            }
        }

        // 5. Crear categorías básicas para transacciones
        console.log('\n📋 Creando categorías básicas...');
        
        const categoriesToCreate = [
            {
                name: 'Eventos Institucionales',
                type: 'INCOME',
                description: 'Ingresos por eventos como rifas, bingos, etc.',
                color: '#28a745',
                institutionId
            },
            {
                name: 'Gastos de Eventos',
                type: 'EXPENSE',
                description: 'Gastos relacionados con la organización de eventos',
                color: '#dc3545',
                institutionId
            },
            {
                name: 'Gastos Administrativos',
                type: 'EXPENSE',
                description: 'Gastos de administración general',
                color: '#fd7e14',
                institutionId
            },
            {
                name: 'Otros Ingresos',
                type: 'INCOME',
                description: 'Otros ingresos institucionales',
                color: '#17a2b8',
                institutionId
            }
        ];

        for (const categoryData of categoriesToCreate) {
            const existingCategory = await prisma.category.findFirst({
                where: {
                    name: categoryData.name,
                    institutionId
                }
            });

            if (!existingCategory) {
                await prisma.category.create({
                    data: categoryData
                });
                console.log(`✅ Categoría creada: ${categoryData.name}`);
            }
        }

        // 6. Resumen final
        const totalAssets = await prisma.account.aggregate({
            where: {
                institutionId,
                type: 'ASSET'
            },
            _sum: { balance: true }
        });

        console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
        console.log('=====================================');
        console.log(`💰 Total activos: $${(totalAssets._sum.balance || 0).toLocaleString()}`);
        console.log(`📊 Cuentas configuradas: ${accounts.length}`);
        console.log(`📋 Categorías creadas: ${categoriesToCreate.length}`);
        console.log('\n🚀 El sistema está listo para transacciones reales');

        return {
            institution,
            accounts,
            totalBalance: totalAssets._sum.balance || 0
        };

    } catch (error) {
        console.error('❌ Error configurando saldos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Función para uso desde línea de comandos
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('❌ Uso: node setup-initial-balances.js <institutionId>');
        console.log('📝 Ejemplo: node setup-initial-balances.js cmdt7n66m00003t1jy17ay313');
        process.exit(1);
    }

    const institutionId = args[0];

    try {
        await setupInitialBalances(institutionId);
        console.log('✅ Configuración completada exitosamente');
    } catch (error) {
        console.error('❌ Error en la configuración:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { setupInitialBalances };