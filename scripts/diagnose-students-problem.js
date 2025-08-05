#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseStudentsProblem() {
  try {
    console.log('🔍 DIAGNÓSTICO: Problema con estudiantes');
    console.log('=====================================');
    
    // 1. Verificar conexión a base de datos
    console.log('1. 🗄️ Verificando conexión...');
    await prisma.$connect();
    console.log('   ✅ Conexión exitosa');
    
    // 2. Contar estudiantes totales
    console.log('\n2. 📊 Contando estudiantes...');
    const totalStudents = await prisma.student.count();
    console.log(`   👥 Total estudiantes en sistema: ${totalStudents}`);
    
    // 3. Listar instituciones y sus estudiantes
    console.log('\n3. 🏫 Estudiantes por institución:');
    const institutions = await prisma.institution.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
    
    institutions.forEach((inst, index) => {
      console.log(`   ${index + 1}. ${inst.name}`);
      console.log(`      📋 ID: ${inst.id}`);
      console.log(`      📋 NIT: ${inst.nit}`);
      console.log(`      👥 Estudiantes: ${inst._count.students}`);
      console.log(`      ✅ Activa: ${inst.isActive}`);
      console.log('      ---');
    });
    
    // 4. Verificar estudiantes de Villas San Pablo específicamente
    console.log('\n4. 🎯 Estudiantes Villas San Pablo:');
    const villasInstitution = await prisma.institution.findFirst({
      where: {
        OR: [
          { name: { contains: 'Villas', mode: 'insensitive' } },
          { name: { contains: 'San Pablo', mode: 'insensitive' } }
        ]
      }
    });
    
    if (villasInstitution) {
      console.log(`   ✅ Institución encontrada: ${villasInstitution.name}`);
      console.log(`   📋 ID: ${villasInstitution.id}`);
      
      const villasStudents = await prisma.student.count({
        where: { institutionId: villasInstitution.id }
      });
      
      console.log(`   👥 Estudiantes: ${villasStudents}`);
      
      if (villasStudents > 0) {
        // Mostrar algunos estudiantes de ejemplo
        const sampleStudents = await prisma.student.findMany({
          where: { institutionId: villasInstitution.id },
          take: 5,
          select: {
            documento: true,
            nombre: true,
            apellido: true,
            grado: true,
            curso: true,
            email: true
          }
        });
        
        console.log('\n   📋 Muestra de estudiantes:');
        sampleStudents.forEach((student, index) => {
          console.log(`      ${index + 1}. ${student.nombre} ${student.apellido}`);
          console.log(`         📋 Documento: ${student.documento}`);
          console.log(`         🎓 Grado: ${student.grado} - Curso: ${student.curso}`);
          console.log(`         📧 Email: ${student.email}`);
          console.log('         ---');
        });
        
        // Estadísticas por grado
        console.log('\n   📈 Estudiantes por grado:');
        const gradeStats = await prisma.student.groupBy({
          by: ['grado'],
          where: { institutionId: villasInstitution.id },
          _count: { grado: true }
        });
        
        gradeStats.forEach(stat => {
          console.log(`      ${stat.grado}: ${stat._count.grado} estudiantes`);
        });
      } else {
        console.log('   ❌ No hay estudiantes para Villas San Pablo');
      }
    } else {
      console.log('   ❌ No se encontró institución Villas San Pablo');
    }
    
    // 5. Verificar endpoint de estudiantes
    console.log('\n5. 🔗 Verificando endpoint de estudiantes...');
    try {
      // Simular llamada al endpoint
      const testInstitutionId = villasInstitution?.id || institutions[0]?.id;
      
      if (testInstitutionId) {
        const studentsFromAPI = await prisma.student.findMany({
          where: { institutionId: testInstitutionId },
          take: 10,
          select: {
            id: true,
            documento: true,
            nombre: true,
            apellido: true,
            grado: true,
            curso: true,
            estado: true
          }
        });
        
        console.log(`   📡 Endpoint simulado devolvería: ${studentsFromAPI.length} estudiantes`);
        
        if (studentsFromAPI.length > 0) {
          console.log('   ✅ Los datos están disponibles para la API');
        } else {
          console.log('   ❌ La API no devolvería estudiantes');
        }
      }
    } catch (apiError) {
      console.log(`   ❌ Error simulando API: ${apiError.message}`);
    }
    
    // 6. Verificar rutas de estudiantes
    console.log('\n6. 🛣️ Verificando rutas de estudiantes...');
    const fs = require('fs');
    const path = require('path');
    
    const routesPath = path.join(process.cwd(), 'routes', 'students.js');
    const routesSimplePath = path.join(process.cwd(), 'routes', 'students-simple.js');
    
    console.log(`   📁 routes/students.js: ${fs.existsSync(routesPath) ? '✅ Existe' : '❌ No existe'}`);
    console.log(`   📁 routes/students-simple.js: ${fs.existsSync(routesSimplePath) ? '✅ Existe' : '❌ No existe'}`);
    
    // 7. Verificar controlador de estudiantes
    const controllerPath = path.join(process.cwd(), 'controllers', 'studentController.js');
    console.log(`   📁 controllers/studentController.js: ${fs.existsSync(controllerPath) ? '✅ Existe' : '❌ No existe'}`);
    
    // 8. Diagnóstico del frontend
    console.log('\n7. 🖥️ Verificando archivos del frontend...');
    const studentsPagePath = path.join(process.cwd(), 'public', 'js', 'accounting', 'students-page.js');
    console.log(`   📁 students-page.js: ${fs.existsSync(studentsPagePath) ? '✅ Existe' : '❌ No existe'}`);
    
    // 9. Recomendaciones
    console.log('\n8. 💡 RECOMENDACIONES:');
    console.log('======================');
    
    if (totalStudents === 0) {
      console.log('❌ PROBLEMA: No hay estudiantes en el sistema');
      console.log('💡 SOLUCIÓN: Ejecutar script de carga de estudiantes');
    } else if (villasInstitution && villasStudents === 0) {
      console.log('❌ PROBLEMA: Villas San Pablo no tiene estudiantes');
      console.log('💡 SOLUCIÓN: Ejecutar script específico para Villas San Pablo');
    } else if (villasStudents > 0) {
      console.log('✅ Los estudiantes existen en la base de datos');
      console.log('💡 PROBLEMA POSIBLE: Error en el frontend o API');
      console.log('💡 VERIFICAR: Consola del navegador para errores JavaScript');
      console.log('💡 VERIFICAR: Network tab para ver si las llamadas API fallan');
    }
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    if (totalStudents === 0) {
      console.log('1. Ejecutar: node scripts/load-villas-students-production.js');
      console.log('2. O usar la interfaz web: /reset-credentials.html');
    } else {
      console.log('1. Verificar consola del navegador en la página de estudiantes');
      console.log('2. Verificar que el usuario tenga permisos correctos');
      console.log('3. Verificar que esté seleccionada la institución correcta');
    }
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  diagnoseStudentsProblem()
    .then(() => {
      console.log('\n✅ Diagnóstico completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseStudentsProblem };