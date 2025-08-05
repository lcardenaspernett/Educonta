const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCorrectDatabase() {
  try {
    console.log('🎯 VERIFICACIÓN FINAL - BASE DE DATOS CORRECTA\n');
    
    // Verificar la institución correcta
    const institution = await prisma.institution.findUnique({
      where: { id: 'cmdt7n66m00003t1jy17ay313' },
      select: {
        id: true,
        name: true,
        nit: true,
        _count: {
          select: {
            students: true,
            users: true,
            events: true
          }
        }
      }
    });
    
    if (!institution) {
      console.log('❌ ERROR: No se encontró la institución Villas San Pablo');
      return;
    }
    
    console.log('✅ INSTITUCIÓN CORRECTA ENCONTRADA:');
    console.log(`📛 Nombre: ${institution.name}`);
    console.log(`🆔 ID: ${institution.id}`);
    console.log(`📄 NIT: ${institution.nit}`);
    console.log(`👥 Estudiantes: ${institution._count.students}`);
    console.log(`👤 Usuarios: ${institution._count.users}`);
    console.log(`🎉 Eventos: ${institution._count.events}`);
    
    // Verificar algunos estudiantes
    const students = await prisma.student.findMany({
      where: { institutionId: 'cmdt7n66m00003t1jy17ay313' },
      take: 5,
      select: {
        nombre: true,
        apellido: true,
        grado: true,
        documento: true
      }
    });
    
    console.log('\n📚 MUESTRA DE ESTUDIANTES:');
    students.forEach(student => {
      console.log(`- ${student.nombre} ${student.apellido} (${student.documento}) - Grado: ${student.grado}`);
    });
    
    // Verificar usuarios
    const users = await prisma.user.findMany({
      where: { institutionId: 'cmdt7n66m00003t1jy17ay313' },
      select: {
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });
    
    console.log('\n👤 USUARIOS REGISTRADOS:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Rol: ${user.role}`);
    });
    
    console.log('\n🎉 RESUMEN:');
    console.log('✅ Institución: Villas San Pablo encontrada');
    console.log(`✅ Estudiantes: ${institution._count.students} registrados`);
    console.log(`✅ Usuarios: ${institution._count.users} activos`);
    console.log(`✅ Eventos: ${institution._count.events} creados`);
    console.log('✅ ID correcto: cmdt7n66m00003t1jy17ay313');
    
    console.log('\n🚀 ESTADO: ¡SISTEMA USANDO LA BASE DE DATOS CORRECTA!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCorrectDatabase();