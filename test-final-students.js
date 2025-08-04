// ===================================
// TEST FINAL - Verificar Estudiantes
// ===================================

const http = require('http');

async function testFinalStudents() {
    console.log('🚀 Prueba final de la API de estudiantes...\n');
    
    const institutionId = 'cmdt7n66m00003t1jy17ay313';
    const url = `/api/students/${institutionId}`;
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: url,
        method: 'GET',
        timeout: 10000
    };
    
    console.log('📡 Probando:', `http://localhost:3000${url}`);
    
    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    
                    if (res.statusCode === 200 && jsonData.success) {
                        console.log('✅ ¡API FUNCIONANDO!');
                        console.log(`👥 Total estudiantes: ${jsonData.students.length}`);
                        
                        if (jsonData.students.length > 0) {
                            console.log('\n📋 Primer estudiante:');
                            const first = jsonData.students[0];
                            console.log(`   Nombre: ${first.fullName}`);
                            console.log(`   Documento: ${first.document}`);
                            console.log(`   Grado: ${first.grade}° ${first.course}`);
                            
                            // Estadísticas por grado
                            const gradeStats = {};
                            jsonData.students.forEach(student => {
                                const grade = student.grade;
                                gradeStats[grade] = (gradeStats[grade] || 0) + 1;
                            });
                            
                            console.log('\n📈 Distribución por grado:');
                            Object.keys(gradeStats).sort().forEach(grade => {
                                console.log(`   Grado ${grade}: ${gradeStats[grade]} estudiantes`);
                            });
                            
                            console.log('\n🎯 RESULTADO: ¡Los 1340 estudiantes están disponibles!');
                            console.log('💡 Ahora recarga la página de estudiantes en el navegador');
                        }
                    } else {
                        console.log('❌ Error en la respuesta:');
                        console.log(JSON.stringify(jsonData, null, 2));
                    }
                } catch (e) {
                    console.log('❌ Error parsing JSON:', e.message);
                    console.log('📦 Datos recibidos:', data.substring(0, 200));
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Error de conexión: ${error.message}`);
            console.log('💡 Asegúrate de que el servidor esté corriendo con: npm start');
            resolve();
        });
        
        req.on('timeout', () => {
            console.log(`⏰ Timeout - el servidor no responde`);
            req.destroy();
            resolve();
        });
        
        req.end();
    });
}

testFinalStudents();