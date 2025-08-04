// ===================================
// TEST - Verificar Estado del Servidor
// ===================================

const http = require('http');

function testEndpoint(path, description) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            timeout: 5000
        };
        
        console.log(`🔍 Probando ${description}: ${path}`);
        
        const req = http.request(options, (res) => {
            console.log(`   📊 Status: ${res.statusCode} ${res.statusMessage}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`   ✅ Respuesta JSON válida`);
                        if (jsonData.students) {
                            console.log(`   👥 Estudiantes: ${jsonData.students.length}`);
                        }
                    } catch (e) {
                        console.log(`   📄 Respuesta HTML/texto`);
                    }
                } else {
                    console.log(`   ❌ Error: ${data.substring(0, 100)}`);
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log(`   ❌ Error de conexión: ${error.message}`);
            resolve();
        });
        
        req.on('timeout', () => {
            console.log(`   ⏰ Timeout - servidor no responde`);
            req.destroy();
            resolve();
        });
        
        req.end();
    });
}

async function testServer() {
    console.log('🚀 Verificando estado del servidor...\n');
    
    // Probar endpoints básicos
    await testEndpoint('/', 'Página principal');
    await testEndpoint('/api/students/test', 'Endpoint de prueba');
    await testEndpoint('/api/students/cmdt7n66m00003t1jy17ay313', 'API de estudiantes');
    
    console.log('\n📋 Resumen:');
    console.log('   Si ves errores de conexión, el servidor no está corriendo');
    console.log('   Si ves 404, las rutas no están configuradas correctamente');
    console.log('   Si ves 200, todo está funcionando');
    
    console.log('\n🔧 Para iniciar el servidor:');
    console.log('   npm start');
}

testServer();