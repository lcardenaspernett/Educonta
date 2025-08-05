#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixSeedAndCredentials() {
  try {
    console.log('🔧 Corrigiendo seed y credenciales...');

    // 1. Verificar si ya existe el super admin
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@educonta.com'
      }
    });

    if (!existingSuperAdmin) {
      console.log('👤 Creando super admin...');
      
      // Crear super admin
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@educonta.com',
          password: hashedPassword,
          name: 'Super Administrador',
          role: 'SUPER_ADMIN',
          isActive: true
        }
      });
      
      console.log('✅ Super admin creado exitosamente');
    } else {
      console.log('ℹ️  Super admin ya existe');
    }

    // 2. Verificar instituciones
    const institutions = await prisma.institution.findMany();
    console.log(`📊 Instituciones encontradas: ${institutions.length}`);

    if (institutions.length === 0) {
      console.log('🏫 Creando institución demo...');
      
      const institution = await prisma.institution.create({
        data: {
          name: 'Institución Educativa Villas San Pablo',
          nit: '900123456-1',
          address: 'Calle Principal #123-45',
          phone: '(1) 234-5678',
          email: 'info@villasanpablo.edu.co',
          city: 'Bogotá',
          department: 'Cundinamarca',
          country: 'Colombia',
          educationLevel: 'SECUNDARIA',
          isActive: true
        }
      });

      console.log('✅ Institución creada:', institution.name);

      // 3. Crear usuario rector para la institución
      const rectorPassword = await bcrypt.hash('Rector123!', 10);
      
      await prisma.user.create({
        data: {
          email: 'rector@villasanpablo.edu.co',
          password: rectorPassword,
          name: 'Rector Principal',
          role: 'RECTOR',
          isActive: true,
          institutionId: institution.id
        }
      });

      console.log('✅ Usuario rector creado');

      // 4. Crear usuario auxiliar contable
      const auxiliarPassword = await bcrypt.hash('Auxiliar123!', 10);
      
      await prisma.user.create({
        data: {
          email: 'auxiliar@villasanpablo.edu.co',
          password: auxiliarPassword,
          name: 'Auxiliar Contable',
          role: 'AUXILIAR_CONTABLE',
          isActive: true,
          institutionId: institution.id
        }
      });

      console.log('✅ Usuario auxiliar contable creado');

      // 5. Crear algunos estudiantes demo
      const studentsData = [
        {
          documento: '1234567890',
          nombre: 'Ana',
          apellido: 'Martínez',
          email: 'ana.martinez@estudiante.com',
          telefono: '3001234567',
          grado: '10',
          curso: 'A',
          genero: 'F',
          fechaNacimiento: new Date('2008-03-15'),
          direccion: 'Calle 123 #45-67',
          acudienteNombre: 'Pedro Martínez',
          acudienteTelefono: '3009876543',
          acudienteEmail: 'pedro.martinez@gmail.com',
          estado: 'activo',
          institutionId: institution.id
        },
        {
          documento: '1234567891',
          nombre: 'Luis',
          apellido: 'García',
          email: 'luis.garcia@estudiante.com',
          telefono: '3001234568',
          grado: '11',
          curso: 'B',
          genero: 'M',
          fechaNacimiento: new Date('2007-07-22'),
          direccion: 'Carrera 456 #78-90',
          acudienteNombre: 'Carmen García',
          acudienteTelefono: '3009876544',
          acudienteEmail: 'carmen.garcia@gmail.com',
          estado: 'activo',
          institutionId: institution.id
        },
        {
          documento: '1234567892',
          nombre: 'Sofia',
          apellido: 'López',
          email: 'sofia.lopez@estudiante.com',
          telefono: '3001234569',
          grado: '9',
          curso: 'A',
          genero: 'F',
          fechaNacimiento: new Date('2009-11-08'),
          direccion: 'Avenida 789 #12-34',
          acudienteNombre: 'Roberto López',
          acudienteTelefono: '3009876545',
          acudienteEmail: 'roberto.lopez@gmail.com',
          estado: 'activo',
          institutionId: institution.id
        }
      ];

      for (const studentData of studentsData) {
        const existingStudent = await prisma.student.findFirst({
          where: {
            documento: studentData.documento,
            institutionId: institution.id
          }
        });

        if (!existingStudent) {
          await prisma.student.create({
            data: studentData
          });
          console.log(`✅ Estudiante creado: ${studentData.nombre} ${studentData.apellido}`);
        }
      }
    }

    // 6. Mostrar resumen de credenciales
    console.log('\n🔑 CREDENCIALES DISPONIBLES:');
    console.log('================================');
    console.log('📧 Super Admin: admin@educonta.com');
    console.log('🔑 Password: Admin123!');
    console.log('');
    console.log('📧 Rector: rector@villasanpablo.edu.co');
    console.log('🔑 Password: Rector123!');
    console.log('');
    console.log('📧 Auxiliar: auxiliar@villasanpablo.edu.co');
    console.log('🔑 Password: Auxiliar123!');
    console.log('================================');

    console.log('✅ Seed y credenciales corregidos exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixSeedAndCredentials()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { fixSeedAndCredentials };