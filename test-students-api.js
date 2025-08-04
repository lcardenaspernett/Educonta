// ===================================
// TEST - Verificar API de Estudiantes
// ===================================

const http = require('http');

async function testStudentsAPI() {
    try {
        console.log('🔍 Probando API de estudiantes...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        const url = `http://localhost:3000/api/students/${institutionId}`;
        
        console.log('📡 URL:', url);
        
        const response = await fetch(url);
        console.log('📊 Status:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Respuesta exitosa');
            console.log('📦 Estructura de respuesta:', Object.keys(data));
            
            if (data.students && Array.isArray(data.students)) {
                console.log('👥 Total estudiantes:', data.students.length);
                
                if (data.students.length > 0) {
                    console.log('\n📋 Primer estudiante:');
                    const firstStudent = data.students[0];
                    console.log('   ID:', firstStudent.id);
                    console.log('   Nombre completo:', firstStudent.fullName);
                    console.log('   Documento:', firstStudent.document);
                    console.log('   Grado:', firstStudent.grade);
                    console.log('   Curso:', firstStudent.course);
                    console.log('   Estado:', firstStudent.status);
                    
                    console.log('\n📈 Estadísticas por grado:');
                    const gradeStats = {};
                    data.students.forEach(student => {
                        const grade = student.grade;
                        gradeStats[grade] = (gradeStats[grade] || 0) + 1;
                    });
                    
                    Object.keys(gradeStats).sort().forEach(grade => {
                        console.log(`   Grado ${grade}: ${gradeStats[grade]} estudiantes`);
                    });
                }
            } else {
                console.log('❌ Formato de respuesta incorrecto');
                console.log('📦 Datos recibidos:', JSON.stringify(data, null, 2));
            }
        } else {
            const errorText = await response.text();
            console.log('❌ Error en API:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Verificar si fetch está disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('⚠️ fetch no disponible, usando alternativa...');
    
    // Alternativa usando http nativo
    function testWithHttp() {
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/students/${institutionId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            console.log('📊 Status:', res.statusCode);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ Respuesta exitosa');
                    console.log('👥 Total estudiantes:', jsonData.students ? jsonData.students.length : 0);
                    
                    if (jsonData.students && jsonData.students.length > 0) {
                        console.log('📋 Primer estudiante:', jsonData.students[0].fullName);
                    }
                } catch (e) {
                    console.log('❌ Error parsing JSON:', e.message);
                    console.log('📦 Datos recibidos:', data);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Error en request:', error.message);
        });
        
        req.end();
    }
    
    testWithHttp();
} else {
    testStudentsAPI();
}