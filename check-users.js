const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        institution: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log('Usuarios en la base de datos:');
    console.log(JSON.stringify(users, null, 2));
    
    const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN');
    console.log('\nSuper Administradores:', superAdmins.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();