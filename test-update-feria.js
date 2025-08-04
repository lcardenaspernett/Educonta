const fetch = require('node-fetch');

async function testUpdateFeria() {
    try {
        console.log('🧪 Probando actualización de FERIA GIL...');
        
        const studentId = 'cmdw4c0xg000j8c4ulknahabq';
        const newEmail = 'feria.gil.nuevo@villasanpablo.edu.co';
        
        console.log(`📝 Actualizando estudiante ${studentId}`);
        console.log(`📧 Nuevo email: ${newEmail}`);
        
        const updateData = {
            email: newEmail
        };
        
        const response = await fetch(`http://localhost:3000/api/students/student/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        console.log(`📊 Respuesta HTTP: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Actualización exitosa:');
            console.log(JSON.stringify(result, null, 2));
        } else {
            const error = await response.text();
            console.log('❌ Error en la actualización:');
            console.log(error);
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

testUpdateFeria();