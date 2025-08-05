#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseFrontendStudents() {
  try {
    console.log('🔍 DIAGNÓSTICO: Frontend de estudiantes');
    console.log('====================================');
    
    // 1. Verificar estudiantes en base de datos
    const institution = await prisma.institution.findFirst({
      where: {
        OR: [
          { name: { contains: 'Villas', mode: 'insensitive' } },
          { name: { contains: 'San Pablo', mode: 'insensitive' } }
        ]
      }
    });
    
    if (!institution) {
      console.log('❌ No se encontró institución Villas San Pablo');
      return;
    }
    
    console.log(`✅ Institución: ${institution.name}`);
    console.log(`📋 ID: ${institution.id}`);
    
    const studentsCount = await prisma.student.count({
      where: { institutionId: institution.id }
    });
    
    console.log(`👥 Estudiantes en DB: ${studentsCount}`);
    
    if (studentsCount === 0) {
      console.log('❌ PROBLEMA: No hay estudiantes en la base de datos');
      console.log('💡 SOLUCIÓN: Ejecutar carga de estudiantes');
      return;
    }
    
    // 2. Simular llamada API exacta que hace el frontend
    console.log('\n🔗 Simulando llamada API del frontend...');
    
    const apiResponse = await prisma.student.findMany({
      where: {
        institutionId: institution.id
      },
      orderBy: [
        { grado: 'asc' },
        { curso: 'asc' },
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });
    
    console.log(`📡 API devolvería: ${apiResponse.length} estudiantes`);
    
    if (apiResponse.length === 0) {
      console.log('❌ PROBLEMA: La API no devuelve estudiantes');
      return;
    }
    
    // 3. Verificar formato de datos
    console.log('\n📋 Verificando formato de datos...');
    const sampleStudent = apiResponse[0];
    
    console.log('Campos disponibles:');
    Object.keys(sampleStudent).forEach(key => {
      console.log(`  - ${key}: ${typeof sampleStudent[key]} = ${sampleStudent[key]}`);
    });
    
    // 4. Simular transformación del frontend
    console.log('\n🔄 Simulando transformación del frontend...');
    
    const transformedStudent = {
      id: sampleStudent.id,
      firstName: sampleStudent.nombre || '',
      lastName: sampleStudent.apellido || '',
      fullName: `${sampleStudent.nombre || ''} ${sampleStudent.apellido || ''}`.trim(),
      documentType: 'TI',
      document: sampleStudent.documento || '',
      email: sampleStudent.email || '',
      phone: sampleStudent.telefono || '',
      grade: sampleStudent.grado || '',
      course: sampleStudent.curso || '',
      status: sampleStudent.estado === 'activo' ? 'ACTIVE' : 'INACTIVE',
      enrollmentDate: sampleStudent.createdAt || new Date().toISOString(),
      birthDate: sampleStudent.fechaNacimiento || new Date('2008-01-01').toISOString(),
      guardian: {
        name: sampleStudent.acudienteNombre || 'Acudiente',
        phone: sampleStudent.acudienteTelefono || '',
        email: sampleStudent.acudienteEmail || ''
      },
      address: sampleStudent.direccion || '',
      events: [],
      totalDebt: 0,
      totalPaid: 0,
      createdAt: sampleStudent.createdAt || new Date().toISOString()
    };
    
    console.log('Estudiante transformado:');
    console.log(JSON.stringify(transformedStudent, null, 2));
    
    // 5. Verificar problemas comunes
    console.log('\n⚠️ Verificando problemas comunes...');
    
    const problemsFound = [];
    
    if (!sampleStudent.nombre) problemsFound.push('Campo "nombre" vacío');
    if (!sampleStudent.apellido) problemsFound.push('Campo "apellido" vacío');
    if (!sampleStudent.documento) problemsFound.push('Campo "documento" vacío');
    if (!sampleStudent.grado) problemsFound.push('Campo "grado" vacío');
    if (!sampleStudent.curso) problemsFound.push('Campo "curso" vacío');
    
    if (problemsFound.length > 0) {
      console.log('❌ Problemas encontrados:');
      problemsFound.forEach(problem => console.log(`  - ${problem}`));
    } else {
      console.log('✅ Datos del estudiante están completos');
    }
    
    // 6. Verificar endpoint específico
    console.log('\n🛣️ Verificando endpoint específico...');
    console.log(`URL que debería funcionar: /api/students/${institution.id}`);
    
    // 7. Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('==================');
    
    if (studentsCount > 0 && apiResponse.length > 0) {
      console.log('✅ Los datos están en la base de datos y la API funciona');
      console.log('🔍 PROBLEMA PROBABLE: Error en el JavaScript del frontend');
      console.log('');
      console.log('VERIFICAR EN EL NAVEGADOR:');
      console.log('1. Abrir DevTools (F12)');
      console.log('2. Ir a la pestaña Console');
      console.log('3. Buscar errores JavaScript en rojo');
      console.log('4. Ir a la pestaña Network');
      console.log('5. Recargar la página de estudiantes');
      console.log(`6. Verificar si se hace llamada a: /api/students/${institution.id}`);
      console.log('7. Ver si la llamada devuelve datos o error');
      console.log('');
      console.log('POSIBLES CAUSAS:');
      console.log('- Error en students-page.js');
      console.log('- Problema de autenticación/permisos');
      console.log('- ID de institución incorrecto en el frontend');
      console.log('- Error en la transformación de datos');
    } else {
      console.log('❌ Problema en la base de datos o API');
      console.log('💡 Ejecutar carga de estudiantes primero');
    }
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  diagnoseFrontendStudents()
    .then(() => {
      console.log('\n✅ Diagnóstico completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseFrontendStudents };