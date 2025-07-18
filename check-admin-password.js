const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkAdminPassword() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@educonta.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true
      }
    });
    
    if (admin) {
      console.log('Usuario SUPER_ADMIN encontrado:');
      console.log(`Email: ${admin.email}`);
      console.log(`Nombre: ${admin.firstName} ${admin.lastName}`);
      console.log(`Rol: ${admin.role}`);
      
      // Verificar si la contraseña es 'admin123'
      const isValidPassword = await bcrypt.compare('admin123', admin.password);
      console.log(`\nContraseña 'admin123' es válida: ${isValidPassword}`);
      
      if (!isValidPassword) {
        // Intentar con otras contraseñas comunes
        const commonPasswords = ['admin', 'password', '123456', 'educonta'];
        for (const pwd of commonPasswords) {
          const isValid = await bcrypt.compare(pwd, admin.password);
          if (isValid) {
            console.log(`Contraseña encontrada: ${pwd}`);
            break;
          }
        }
      }
    } else {
      console.log('Usuario SUPER_ADMIN no encontrado');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminPassword();