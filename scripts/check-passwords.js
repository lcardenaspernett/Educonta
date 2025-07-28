const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function checkPasswords() {
    try {
        console.log('🔐 VERIFICACIÓN DE CLAVES DEL SISTEMA\n');
        
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                password: true,
                isActive: true
            },
            orderBy: { role: 'asc' }
        });
        
        console.log('👥 USUARIOS Y ESTADO DE CLAVES:');
        
        // Claves por defecto conocidas
        const defaultPasswords = {
            'admin@educonta.com': 'Admin123!',
            'rector@colegiosanjose.edu.co': 'Rector123!',
            'contabilidad@colegiosanjose.edu.co': 'Conta123!'
        };
        
        for (const user of users) {
            console.log(`\n📧 ${user.email}`);
            console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
            console.log(`   Rol: ${user.role}`);
            console.log(`   Activo: ${user.isActive ? '✅' : '❌'}`);
            
            // Verificar si usa la clave por defecto
            const defaultPassword = defaultPasswords[user.email];
            if (defaultPassword) {
                const isDefaultPassword = await bcrypt.compare(defaultPassword, user.password);
                if (isDefaultPassword) {
                    console.log(`   🔑 Clave: ${defaultPassword} (por defecto)`);
                } else {
                    console.log(`   🔒 Clave: Modificada desde la instalación`);
                }
            } else {
                console.log(`   🔒 Clave: Personalizada/Desconocida`);
            }
        }
        
        console.log('\n📝 NOTAS:');
        console.log('- Las claves se muestran solo si son las por defecto del sistema');
        console.log('- Si un usuario cambió su clave, aparecerá como "Modificada"');
        console.log('- Para resetear una clave, usa el script reset-password.js');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPasswords();