// ===================================
// SCRIPT PARA CONFIGURAR SALDO INICIAL SIMPLE
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupSimpleInitialBalance(institutionId, initialAmount = 0) {
    console.log('💰 Configurando saldo inicial simple...\n');

    try {
        // 1. Verificar que la institución existe
        const institution = await prisma.institution.findUnique({
            where: { id: institutionId }
        });

        if (!institution) {
            throw new Error(`Institución no encontrada: ${institutionId}`);
        }

        console.log(`🏫 Configurando para: ${institution.name}`);

        // 2. Crear plan de cuentas básico
        console.log('📊 Creando plan de cuentas básico...');
        
        const basicAccounts = [
            {
                code: '1105',
                name: 'Caja General',
                accountType: 'ASSET',
                level: 1,
                isActive: true,
                institutionId
            },
            {
                code: '1110',
                name: 'Bancos',
                accountType: 'ASSET',
                level: 1,
                isActive: true,
                institutionId
            },
            {
                code: '1305',
                name: 'Cuentas por Cobrar',
                accountType: 'ASSET',
                level: 1,
                isActive: true,
                institutionId
            },
            {
                code: '4135',
                name: 'Ingresos por Eventos',
                accountType: 'INCOME',
                level: 1,
                isActive: true,
                institutionId
            },
            {
                code: '5105',
                name: 'Gastos Administrativos',
                accountType: 'EXPENSE',
                level: 1,
                isActive: true,
                institutionId
            }
        ];

        let createdAccounts = [];
        
        for (const accountData of basicAccounts) {
            const existingAccount = await prisma.account.findFirst({
                where: {
                    code: accountData.code,
                    institutionId
                }
            });

            if (!existingAccount) {
                const account = await prisma.account.create({
                    data: accountData
                });
                createdAccounts.push(account);
                console.log(`✅ Cuenta creada: ${accountData.code} - ${accountData.name}`);
            } else {
                createdAccounts.push(existingAccount);
                console.log(`⚠️  Cuenta ya existe: ${accountData.code} - ${accountData.name}`);
            }
        }

        // 3. Crear categorías básicas
        console.log('\n📋 Creando categorías básicas...');
        
        const basicCategories = [
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
                description: 'Gastos relacionados con eventos',
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

        for (const categoryData of basicCategories) {
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

        // 4. Si se proporciona un monto inicial, crear transacción
        if (initialAmount > 0) {
            console.log(`\n💵 Registrando saldo inicial de $${initialAmount.toLocaleString()}...`);
            
            // Buscar la cuenta de Caja General
            const cajaAccount = createdAccounts.find(acc => acc.code === '1105');
            
            if (cajaAccount) {
                // Buscar cuenta de patrimonio existente
                let patrimonioAccount = createdAccounts.find(acc => acc.accountType === 'EQUITY');
                
                if (!patrimonioAccount) {
                    // Buscar en todas las cuentas de la institución
                    patrimonioAccount = await prisma.account.findFirst({
                        where: {
                            institutionId,
                            accountType: 'EQUITY'
                        }
                    });
                }
                
                if (!patrimonioAccount) {
                    console.log('📊 Creando cuenta de patrimonio para saldo inicial...');
                    patrimonioAccount = await prisma.account.create({
                        data: {
                            code: '3105',
                            name: 'Capital Social',
                            accountType: 'EQUITY',
                            institutionId,
                            level: 1
                        }
                    });
                }

                await prisma.transaction.create({
                    data: {
                        amount: initialAmount,
                        type: 'INCOME',
                        description: 'Saldo inicial - Caja General',
                        reference: `SALDO-INICIAL-${Date.now()}`,
                        date: new Date(),
                        debitAccountId: cajaAccount.id,
                        creditAccountId: patrimonioAccount.id,
                        institutionId,
                        status: 'APPROVED'
                    }
                });
                
                console.log(`✅ Saldo inicial registrado en Caja General`);
            }
        }

        // 5. Mostrar resumen
        console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
        console.log('=====================================');
        console.log(`🏫 Institución: ${institution.name}`);
        console.log(`📊 Cuentas creadas: ${createdAccounts.length}`);
        console.log(`📋 Categorías creadas: ${basicCategories.length}`);
        if (initialAmount > 0) {
            console.log(`💰 Saldo inicial: $${initialAmount.toLocaleString()}`);
        }
        
        console.log('\n🚀 SISTEMA LISTO PARA USAR');
        console.log('=====================================');
        console.log('✅ Plan de cuentas básico configurado');
        console.log('✅ Categorías de transacciones creadas');
        console.log('✅ Sistema contable inicializado');
        
        if (initialAmount === 0) {
            console.log('\n💡 PRÓXIMO PASO:');
            console.log('Ejecuta nuevamente con un monto inicial:');
            console.log(`node setup-simple-initial-balance.js ${institutionId} 1000000`);
        }

        return {
            institution,
            accounts: createdAccounts,
            initialAmount
        };

    } catch (error) {
        console.error('❌ Error configurando saldo inicial:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Función para uso desde línea de comandos
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('❌ Uso: node setup-simple-initial-balance.js <institutionId> [montoInicial]');
        console.log('📝 Ejemplo: node setup-simple-initial-balance.js cmdt7n66m00003t1jy17ay313 1000000');
        console.log('\n💡 Si no especificas monto, solo se creará el plan de cuentas');
        process.exit(1);
    }

    const institutionId = args[0];
    const initialAmount = args[1] ? parseFloat(args[1]) : 0;

    try {
        await setupSimpleInitialBalance(institutionId, initialAmount);
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

module.exports = { setupSimpleInitialBalance };