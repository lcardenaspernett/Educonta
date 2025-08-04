#!/usr/bin/env node

/**
 * Script de diagnóstico para el servidor Educonta
 * Verifica conectividad, rutas y base de datos
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando diagnóstico del servidor Educonta...\n');

// Configuración
const SERVER_URL = 'http://localhost:3000';
const ENDPOINTS_TO_TEST = [
    '/api/health',
    '/api/test',
    '/api/institutions/public',
    '/api/institutions/debug',
    '/api/institutions/test-public'
];

// Función para hacer peticiones HTTP
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data,
                        parseError: error.message
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// Función principal de diagnóstico
async function diagnose() {
    console.log('1️⃣ Verificando archivos del proyecto...');
    
    // Verificar archivos críticos
    const criticalFiles = [
        'server.js',
        'package.json',
        'routes/institutions.js',
        'controllers/institutionController.js',
        'config/prisma.js',
        'public/select-institution.html'
    ];
    
    for (const file of criticalFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${file} - Existe`);
        } else {
            console.log(`   ❌ ${file} - NO EXISTE`);
        }
    }
    
    console.log('\n2️⃣ Verificando conectividad del servidor...');
    
    // Probar conectividad básica
    try {
        const response = await makeRequest(`${SERVER_URL}/`);
        console.log(`   ✅ Servidor responde - Status: ${response.status}`);
    } catch (error) {
        console.log(`   ❌ Servidor no responde - Error: ${error.message}`);
        console.log('   💡 Asegúrate de que el servidor esté corriendo con: npm start o npm run dev');
        return;
    }
    
    console.log('\n3️⃣ Probando endpoints de la API...');
    
    // Probar cada endpoint
    for (const endpoint of ENDPOINTS_TO_TEST) {
        try {
            console.log(`\n   🔍 Probando: ${endpoint}`);
            const response = await makeRequest(`${SERVER_URL}${endpoint}`);
            
            if (response.status === 200) {
                console.log(`   ✅ Status: ${response.status} - OK`);
                if (response.data && typeof response.data === 'object') {
                    if (response.data.success) {
                        console.log(`   📊 Success: ${response.data.success}`);
                        if (response.data.message) {
                            console.log(`   💬 Message: ${response.data.message}`);
                        }
                        if (response.data.data && Array.isArray(response.data.data)) {
                            console.log(`   📋 Data count: ${response.data.data.length}`);
                        }
                    }
                }
            } else {
                console.log(`   ⚠️  Status: ${response.status} - ${getStatusText(response.status)}`);
                if (response.data) {
                    console.log(`   📄 Response: ${JSON.stringify(response.data, null, 2)}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n4️⃣ Verificando variables de entorno...');
    
    // Verificar variables críticas
    const envVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'NODE_ENV'
    ];
    
    for (const envVar of envVars) {
        if (process.env[envVar]) {
            console.log(`   ✅ ${envVar} - Configurada`);
        } else {
            console.log(`   ⚠️  ${envVar} - NO configurada`);
        }
    }
    
    console.log('\n5️⃣ Recomendaciones...');
    
    // Dar recomendaciones basadas en los resultados
    console.log('   💡 Si el servidor no responde:');
    console.log('      - Ejecuta: npm start o npm run dev');
    console.log('      - Verifica que el puerto 3000 esté libre');
    console.log('      - Revisa los logs del servidor');
    
    console.log('   💡 Si hay errores 404:');
    console.log('      - Verifica que las rutas estén registradas en server.js');
    console.log('      - Revisa que los controladores existan');
    
    console.log('   💡 Si hay errores de base de datos:');
    console.log('      - Ejecuta: npm run db:setup');
    console.log('      - Verifica DATABASE_URL en .env');
    console.log('      - Ejecuta: npx prisma studio para verificar datos');
    
    console.log('\n✅ Diagnóstico completado!');
}

// Función auxiliar para obtener texto del status HTTP
function getStatusText(status) {
    const statusTexts = {
        200: 'OK',
        404: 'Not Found',
        500: 'Internal Server Error',
        403: 'Forbidden',
        401: 'Unauthorized'
    };
    return statusTexts[status] || 'Unknown';
}

// Ejecutar diagnóstico
diagnose().catch(error => {
    console.error('❌ Error en el diagnóstico:', error);
    process.exit(1);
});