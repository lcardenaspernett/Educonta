// ===================================
// EDUCONTA - Test de API de Contabilidad
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
        console.log('🔐 Intentando login...');
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
            console.log('   Token:', authToken.substring(0, 20) + '...');
            return true;
        } else {
            console.log('❌ Error en login:', result.error);
            return false;
        }
    } catch (error) {
        console.log('❌ Error de conexión en login:', error.message);
        return false;
    }
}

// Test: Health check
async function testHealth() {
    try {
        console.log('\n🏥 Probando health check...');
        const response = await fetch(`${BASE_URL}/api/health`);
        const result = await response.json();
        
        console.log('   Status:', result.status);
        console.log('   Database:', result.database);
        
        return result.status === 'OK';
    } catch (error) {
        console.log('❌ Error en health check:', error.message);
        return false;
    }
}

// Test: Obtener cuentas
async function testGetAccounts() {
    try {
        console.log('\n📊 Probando GET /api/accounting/accounts...');
        const response = await fetch(`${BASE_URL}/api/accounting/accounts`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('   Status:', response.status);
        console.log('   Headers:', Object.fromEntries(response.headers.entries()));

        const text = await response.text();
        console.log('   Response length:', text.length);
        
        if (response.status === 200) {
            try {
                const result = JSON.parse(text);
                console.log('✅ Cuentas obtenidas exitosamente');
                console.log('   Total cuentas:', result.data?.length || 0);
                return result;
            } catch (parseError) {
                console.log('❌ Error parsing JSON:', parseError.message);
                console.log('   Raw response:', text.substring(0, 200));
                return null;
            }
        } else {
            console.log('❌ Error HTTP:', response.status);
            console.log('   Response:', text);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Test: Obtener transacciones
async function testGetTransactions() {
    try {
        console.log('\n💰 Probando GET /api/accounting/transactions...');
        const response = await fetch(`${BASE_URL}/api/accounting/transactions`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('   Status:', response.status);
        
        const text = await response.text();
        
        if (response.status === 200) {
            try {
                const result = JSON.parse(text);
                console.log('✅ Transacciones obtenidas exitosamente');
                console.log('   Total transacciones:', result.data?.length || 0);
                console.log('   Paginación:', result.pagination);
                return result;
            } catch (parseError) {
                console.log('❌ Error parsing JSON:', parseError.message);
                console.log('   Raw response:', text.substring(0, 200));
                return null;
            }
        } else {
            console.log('❌ Error HTTP:', response.status);
            console.log('   Response:', text);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Test: Balance general
async function testBalanceSheet() {
    try {
        console.log('\n📈 Probando GET /api/accounting/balance-sheet...');
        const response = await fetch(`${BASE_URL}/api/accounting/balance-sheet`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('   Status:', response.status);
        
        const text = await response.text();
        
        if (response.status === 200) {
            try {
                const result = JSON.parse(text);
                console.log('✅ Balance general obtenido exitosamente');
                console.log('   Totales:', result.totals);
                return result;
            } catch (parseError) {
                console.log('❌ Error parsing JSON:', parseError.message);
                console.log('   Raw response:', text.substring(0, 200));
                return null;
            }
        } else {
            console.log('❌ Error HTTP:', response.status);
            console.log('   Response:', text);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Test: Crear cuenta
async function testCreateAccount() {
    try {
        console.log('\n➕ Probando POST /api/accounting/accounts...');
        
        const accountData = {
            code: '1105',
            name: 'Caja General',
            accountType: 'ASSET',
            level: 1
        };

        const response = await fetch(`${BASE_URL}/api/accounting/accounts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accountData)
        });

        console.log('   Status:', response.status);
        
        const text = await response.text();
        
        if (response.status === 201) {
            try {
                const result = JSON.parse(text);
                console.log('✅ Cuenta creada exitosamente');
                console.log('   Cuenta:', result.data.code, '-', result.data.name);
                return result.data;
            } catch (parseError) {
                console.log('❌ Error parsing JSON:', parseError.message);
                return null;
            }
        } else {
            console.log('❌ Error HTTP:', response.status);
            console.log('   Response:', text);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

// Ejecutar todos los tests
async function runTests() {
    console.log('🧪 INICIANDO TESTS DE API DE CONTABILIDAD');
    console.log('='.repeat(50));

    // 1. Health check
    const healthOk = await testHealth();
    if (!healthOk) {
        console.log('❌ Health check falló. Verifica que el servidor esté corriendo.');
        return;
    }

    // 2. Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('❌ No se pudo hacer login. Verifica las credenciales.');
        return;
    }

    // 3. Test APIs de contabilidad
    await testGetAccounts();
    await testGetTransactions();
    await testBalanceSheet();
    await testCreateAccount();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 TESTS COMPLETADOS');
    
    console.log('\n💡 DIAGNÓSTICO:');
    console.log('   - Si ves errores 404: Las rutas no están registradas correctamente');
    console.log('   - Si ves errores 401: Problema de autenticación');
    console.log('   - Si ves errores 403: Problema de permisos');
    console.log('   - Si ves errores 500: Problema en el servidor o base de datos');
    console.log('   - Si ves "Error de conexión": El servidor no está corriendo');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };