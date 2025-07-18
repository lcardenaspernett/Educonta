const jwt = require('jsonwebtoken');

// Generar token para el SUPER_ADMIN
const token = jwt.sign(
    { userId: 'cmd3z16ye0001w6hero6hshrh' }, 
    process.env.JWT_SECRET || 'educonta-fallback-secret-key'
);

console.log('Token generado:', token);

// Hacer petición a la API
fetch('http://localhost:3000/api/institutions/stats', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    return response.json();
})
.then(data => {
    console.log('Datos recibidos:', JSON.stringify(data, null, 2));
})
.catch(error => {
    console.error('Error:', error);
});