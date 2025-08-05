#!/usr/bin/env node

const fetch = require('node-fetch');

async function testLoginAPI() {
  try {
    console.log('🧪 Probando API de login...');
    
    // Datos de login
    const loginData = {
      email: 'contabilidad@villasanpablo.edu.co',
      password: 'ContaVSP2024!',
      institutionId: 'cmdt7n66m00003t1jy17ay313' // ID de la institución Villas San Pablo
    };
    
    console.log('📤 Enviando request de login...');
    console.log('Email:', loginData.email);
    console.log('Institution ID:', loginData.institutionId);
    
    // Hacer request al endpoint de login
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📥 Response Status Text: ${response.statusText}`);
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ LOGIN EXITOSO!');
      console.log('🎯 Token recibido:', responseData.token ? 'SÍ' : 'NO');
      console.log('👤 Usuario:', responseData.user?.firstName, responseData.user?.lastName);
      console.log('🔑 Rol:', responseData.user?.role);
      console.log('🏫 Institución:', responseData.user?.institution?.name);
      
      // Probar una request autenticada
      if (responseData.token) {
        console.log('\n🔐 Probando request autenticada...');
        
        const authResponse = await fetch('http://localhost:3000/api/accounting/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${responseData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📥 Auth Response Status: ${authResponse.status}`);
        
        if (authResponse.ok) {
          console.log('✅ Request autenticada exitosa');
        } else {
          console.log('❌ Request autenticada falló');
          const authError = await authResponse.text();
          console.log('Error:', authError);
        }
      }
      
    } else {
      console.log('❌ LOGIN FALLÓ');
      console.log('Error:', responseData);
    }
    
  } catch (error) {
    console.error('💥 Error en test de API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🚨 El servidor no está ejecutándose en localhost:3000');
      console.log('💡 Asegúrate de que el servidor esté corriendo con: npm start');
    }
  }
}

// También probar sin institutionId para ver si es requerido
async function testLoginWithoutInstitution() {
  try {
    console.log('\n🧪 Probando login sin institutionId...');
    
    const loginData = {
      email: 'contabilidad@villasanpablo.edu.co',
      password: 'ContaVSP2024!'
    };
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`📥 Response Status: ${response.status}`);
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ LOGIN SIN INSTITUTION ID EXITOSO');
    } else {
      console.log('❌ LOGIN SIN INSTITUTION ID FALLÓ');
      console.log('Error:', responseData);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

if (require.main === module) {
  testLoginAPI()
    .then(() => testLoginWithoutInstitution())
    .then(() => {
      console.log('\n✅ Test de API completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { testLoginAPI };