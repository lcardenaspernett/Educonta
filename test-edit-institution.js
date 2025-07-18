const jwt = require('jsonwebtoken');

async function testEditInstitution() {
    // Generar token para SUPER_ADMIN
    const token = jwt.sign(
        { userId: 'cmd3z16ye0001w6hero6hshrh' }, 
        process.env.JWT_SECRET || 'educonta-fallback-secret-key'
    );

    console.log('🔑 Token generado para SUPER_ADMIN');

    try {
        // Primero obtener una institución para editar
        console.log('\n📋 Obteniendo lista de instituciones...');
        const listResponse = await fetch('http://localhost:3000/api/institutions?page=1&limit=1', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!listResponse.ok) {
            console.log('❌ Error obteniendo lista:', listResponse.status, listResponse.statusText);
            return;
        }

        const listData = await listResponse.json();
        console.log('✅ Lista obtenida:', listData);

        if (listData.data.length === 0) {
            console.log('❌ No hay instituciones para editar');
            return;
        }

        const institution = listData.data[0];
        console.log('🏫 Institución a editar:', institution.name, institution.id);

        // Ahora intentar editar la institución
        console.log('\n✏️ Intentando editar institución...');
        
        const updateData = {
            name: institution.name + ' (Editado)',
            nit: institution.nit,
            address: institution.address,
            phone: institution.phone,
            email: institution.email,
            city: institution.city,
            department: institution.department,
            country: institution.country,
            educationLevel: institution.educationLevel
        };

        console.log('📝 Datos a enviar:', updateData);

        const updateResponse = await fetch(`http://localhost:3000/api/institutions/${institution.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        console.log('📡 Respuesta de actualización:', updateResponse.status, updateResponse.statusText);

        if (updateResponse.ok) {
            const updateResult = await updateResponse.json();
            console.log('✅ Actualización exitosa:', updateResult);
        } else {
            const errorText = await updateResponse.text();
            console.log('❌ Error en actualización:', errorText);
        }

    } catch (error) {
        console.error('❌ Error de red:', error);
    }
}

testEditInstitution();