// Prueba simple de la API de instituciones
const jwt = require('jsonwebtoken');

async function testAPI() {
    // Generar token para SUPER_ADMIN
    const token = jwt.sign(
        { userId: 'cmd3z16ye0001w6hero6hshrh' }, 
        process.env.JWT_SECRET || 'educonta-fallback-secret-key'
    );

    console.log('🔑 Token generado para SUPER_ADMIN');

    try {
        // Probar /api/institutions/stats
        console.log('\n📊 Probando /api/institutions/stats...');
        const statsResponse = await fetch('http://localhost:3000/api/institutions/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', statsResponse.status);
        if (statsResponse.ok) {
            const data = await statsResponse.json();
            console.log('✅ Stats exitoso:', data);
        } else {
            const error = await statsResponse.text();
            console.log('❌ Error en stats:', error);
        }

        // Probar /api/institutions
        console.log('\n🏫 Probando /api/institutions...');
        const listResponse = await fetch('http://localhost:3000/api/institutions?page=1&limit=5', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', listResponse.status);
        if (listResponse.ok) {
            const data = await listResponse.json();
            console.log('✅ Lista exitosa:', data);
        } else {
            const error = await listResponse.text();
            console.log('❌ Error en lista:', error);
        }

    } catch (error) {
        console.error('❌ Error de red:', error);
    }
}

testAPI();