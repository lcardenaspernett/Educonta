// ===================================
// TEST - Nueva Ruta de Estudiantes
// ===================================

const http = require('http');

function testNewRoute() {
    const institutionId = 'cmdt7n66m00003t1jy17ay313';
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/students/test/${institutionId}`,
        method: 'GET',
        timeout: 5000
    };
    
    console.log(`🔍 Probando nueva ruta: ${options.path}`);
    
    const req = http.request(options, (res) => {
        console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ Respuesta JSON:', jsonData);
            } catch (e) {
                console.log('❌ Error parsing JSON:', e.message);
                console.log('📦 Datos recibidos:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log(`❌ Error de conexión: ${error.message}`);
    });
    
    req.on('timeout', () => {
        console.log(`⏰ Timeout`);
        req.destroy();
    });
    
    req.end();
}

testNewRoute();