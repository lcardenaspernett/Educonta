const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
    try {
        console.log(`🔄 Reseteando clave para: ${email}`);
        
        // Verificar que el usuario existe
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
            select: { id: true, email: true, firstName: true, lastName: true, role: true }
        });
        
        if (!existingUser) {
            console.log(`❌ Usuario no encontrado: ${email}`);
            return;
        }
        
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Actualizar la contraseña
        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword },
            select: { email: true, firstName: true, lastName: true, role: true }
        });
        
        console.log(`✅ Clave actualizada exitosamente!`);
        console.log(`   📧 Email: ${updatedUser.email}`);
        console.log(`   👤 Usuario: ${updatedUser.firstName} ${updatedUser.lastName}`);
        console.log(`   🎭 Rol: ${updatedUser.role}`);
        console.log(`   🔑 Nueva clave: ${newPassword}`);
        console.log('');
        console.log('🔗 Ahora puedes usar estas credenciales para hacer login');
        
    } catch (error) {
        console.error('❌ Error reseteando clave:', error.message);
        
        if (error.code === 'P2025') {
            console.log('💡 El usuario especificado no existe en la base de datos');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Función para mostrar ayuda
function showHelp() {
    console.log('🔧 SCRIPT DE RESETEO DE CONTRASEÑAS - EDUCONTA');
    console.log('');
    console.log('📖 Uso:');
    console.log('   node scripts/reset-password.js <email> <nueva_clave>');
    console.log('');
    console.log('📝 Ejemplos:');
    console.log('   node scripts/reset-password.js rector@colegiosanjose.edu.co "Rector123!"');
    console.log('   node scripts/reset-password.js contabilidad@colegiosanjose.edu.co "Conta123!"');
    console.log('   node scripts/reset-password.js admin@educonta.com "MiClaveSegura2024!"');
    console.log('');
    console.log('⚠️  Requisitos para la clave:');
    console.log('   - Mínimo 8 caracteres');
    console.log('   - Al menos una mayúscula');
    console.log('   - Al menos una minúscula');
    console.log('   - Al menos un número');
    console.log('   - Se recomienda usar símbolos (!@#$%^&*)');
    console.log('');
    console.log('👥 Usuarios disponibles en el sistema:');
    console.log('   - admin@educonta.com (SUPER_ADMIN)');
    console.log('   - rector@colegiosanjose.edu.co (RECTOR)');
    console.log('   - contabilidad@colegiosanjose.edu.co (AUXILIARY_ACCOUNTANT)');
}

// Validar argumentos de línea de comandos
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    showHelp();
    process.exit(1);
}

// Validación básica de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    console.log('❌ Email inválido. Debe tener formato: usuario@dominio.com');
    process.exit(1);
}

// Validación básica de contraseña
if (password.length < 8) {
    console.log('❌ La contraseña debe tener al menos 8 caracteres');
    process.exit(1);
}

// Ejecutar el reseteo
resetPassword(email, password);