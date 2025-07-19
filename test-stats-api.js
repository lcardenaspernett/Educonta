// ===================================
// EDUCONTA - Test de API de Estadísticas
// ===================================

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    email: 'admin@educonta.com',
    password: 'Admin123!'
};

async function testStatsAPI() {
    console.log('🧪 PROBANDO API DE ESTADÍSTICAS');
    console.log('='.repeat(50));

    try {
        // 1. Login
        console.log('🔐 Haciendo login...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TEST_USER)
        });

        const loginResult = await loginResponse.json();
        
        if (!loginResult.success) {
            console.log('❌ Error en login:', loginResult.error);
            return;
        }

        const token = loginResult.token;
        console.log('✅ Login exitoso');

        // 2. Probar API de estadísticas
        console.log('\n📊 Probando /api/accounting/stats...');
        const statsResponse = await fetch(`${BASE_URL}/api/accounting/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status:', statsResponse.status);
        
        if (statsResponse.ok) {
            const statsResult = await statsResponse.json();
            console.log('✅ Respuesta exitosa');
            console.log('\n📋 DATOS DEVUELTOS:');
            console.log(JSON.stringify(statsResult, null, 2));
            
            // Analizar los datos específicos
            if (statsResult.data) {
                const data = statsResult.data;
                console.log('\n🔍 ANÁLISIS DETALLADO:');
                console.log(`Total de cuentas: ${data.totalAccounts}`);
                console.log(`Total de transacciones: ${data.totalTransactions}`);
                console.log(`Balance total: $${data.totalBalance?.toLocaleString('es-CO')}`);
                
                if (data.accountsByType) {
                    console.log('\nCuentas por tipo:');
                    Object.entries(data.accountsByType).forEach(([type, count]) => {
                        console.log(`  ${type}: ${count}`);
                    });
                }
                
                if (data.recentTransactions) {
                    console.log(`\nTransacciones recientes: ${data.recentTransactions.length}`);
                    data.recentTransactions.forEach(t => {
                        console.log(`  ${t.reference}: $${parseFloat(t.amount).toLocaleString('es-CO')}`);
                    });
                }
            }
        } else {
            const errorText = await statsResponse.text();
            console.log('❌ Error en API:', statsResponse.status);
            console.log('Respuesta:', errorText);
        }

        // 3. Probar API de cuentas
        console.log('\n📊 Probando /api/accounting/accounts...');
        const accountsResponse = await fetch(`${BASE_URL}/api/accounting/accounts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status:', accountsResponse.status);
        
        if (accountsResponse.ok) {
            const accountsResult = await accountsResponse.json();
            console.log('✅ Respuesta exitosa');
            console.log(`Total de cuentas devueltas: ${accountsResult.data?.length || 0}`);
            
            if (accountsResult.summary) {
                console.log('\nResumen:', accountsResult.summary);
            }
        } else {
            const errorText = await accountsResponse.text();
            console.log('❌ Error en API:', accountsResponse.status);
            console.log('Respuesta:', errorText);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 PRUEBA COMPLETADA');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testStatsAPI().catch(console.error);
}

module.exports = { testStatsAPI };