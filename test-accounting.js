// ===================================
// EDUCONTA - Test del Módulo de Contabilidad
// ===================================

const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    email: 'admin@educonta.com',
    password: 'Admin123!'
};

let authToken = '';

// Función para hacer login
async function login() {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TEST_USER)
        });

        const result = await response.json();
        
        if (result.success) {
            authToken = result.token;
            console.log('✅ Login exitoso');
            return true;
        } else {
            console.log('❌ Error en login:', result.error);
            return false;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return false;
    }
}

// Test: Crear cuenta contable
async function testCreateAccount() {
    console.log('\n🧪 Probando creación de cuenta...');
    
    const accountData = {
        code: '1105',
        name: 'Caja General',
        accountType: 'ASSET',
        level: 1
    };

    try {
        const response = await fetch(`${BASE_URL}/api/accounting/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(accountData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Cuenta creada:', result.data.code, '-', result.data.name);
            return result.data;
        } else {
            console.log('❌ Error creando cuenta:', result.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Test: Obtener cuentas
async function testGetAccounts() {
    console.log('\n🧪 Probando obtención de cuentas...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/accounting/accounts`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Cuentas obtenidas:', result.data.length, 'cuentas');
            result.data.forEach(account => {
                console.log(`   - ${account.code}: ${account.name} (${account.accountType})`);
            });
            return result.data;
        } else {
            console.log('❌ Error obteniendo cuentas:', result.error);
            return [];
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return [];
    }
}

// Test: Crear transacción
async function testCreateTransaction(accounts) {
    console.log('\n🧪 Probando creación de transacción...');
    
    if (accounts.length < 2) {
        console.log('❌ Se necesitan al menos 2 cuentas para crear una transacción');
        return null;
    }

    const transactionData = {
        date: new Date().toISOString().split('T')[0],
        reference: 'COMP-001',
        description: 'Transacción de prueba - Ingreso inicial',
        amount: 1000000,
        type: 'INCOME',
        debitAccountId: accounts[0].id,
        creditAccountId: accounts[1]?.id || accounts[0].id
    };

    try {
        const response = await fetch(`${BASE_URL}/api/accounting/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(transactionData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Transacción creada:', result.data.reference, '- $', result.data.amount);
            return result.data;
        } else {
            console.log('❌ Error creando transacción:', result.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Test: Obtener transacciones
async function testGetTransactions() {
    console.log('\n🧪 Probando obtención de transacciones...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/accounting/transactions`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Transacciones obtenidas:', result.data.length, 'transacciones');
            result.data.forEach(transaction => {
                console.log(`   - ${transaction.reference}: $${transaction.amount} (${transaction.type})`);
            });
            return result.data;
        } else {
            console.log('❌ Error obteniendo transacciones:', result.error);
            return [];
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return [];
    }
}

// Test: Balance general
async function testBalanceSheet() {
    console.log('\n🧪 Probando balance general...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/accounting/balance-sheet`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Balance general generado');
            console.log('   - Total Activos: $', result.totals.assets);
            console.log('   - Total Pasivos: $', result.totals.liabilities);
            console.log('   - Total Patrimonio: $', result.totals.equity);
            return result;
        } else {
            console.log('❌ Error generando balance:', result.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Ejecutar todos los tests
async function runTests() {
    console.log('🧮 INICIANDO TESTS DEL MÓDULO DE CONTABILIDAD');
    console.log('='.repeat(50));

    // 1. Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('❌ No se pudo hacer login. Abortando tests.');
        return;
    }

    // 2. Crear algunas cuentas de prueba
    const accounts = [];
    
    // Crear cuenta de activo
    const assetAccount = await testCreateAccount();
    if (assetAccount) accounts.push(assetAccount);
    
    // Crear cuenta de patrimonio
    const equityAccountData = {
        code: '3105',
        name: 'Capital Social',
        accountType: 'EQUITY',
        level: 1
    };
    
    console.log('\n🧪 Creando segunda cuenta...');
    try {
        const response = await fetch(`${BASE_URL}/api/accounting/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(equityAccountData)
        });

        const result = await response.json();
        if (result.success) {
            console.log('✅ Segunda cuenta creada:', result.data.code, '-', result.data.name);
            accounts.push(result.data);
        }
    } catch (error) {
        console.log('❌ Error creando segunda cuenta');
    }

    // 3. Obtener todas las cuentas
    const allAccounts = await testGetAccounts();

    // 4. Crear transacción
    await testCreateTransaction(accounts.length > 0 ? accounts : allAccounts);

    // 5. Obtener transacciones
    await testGetTransactions();

    // 6. Balance general
    await testBalanceSheet();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 TESTS COMPLETADOS');
    console.log('\n💡 Para probar la interfaz web:');
    console.log('   1. Inicia el servidor: npm start');
    console.log('   2. Ve a: http://localhost:3000/accounting');
    console.log('   3. Usa las credenciales: admin@educonta.com / Admin123!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };