#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function loadVillasStudentsProduction() {
  try {
    console.log('👥 CARGANDO ESTUDIANTES VILLAS SAN PABLO - PRODUCCIÓN');
    console.log('===================================================');
    
    // 1. Buscar la institución Villas San Pablo
    const institution = await prisma.institution.findFirst({
      where: {
        OR: [
          { name: { contains: 'Villas', mode: 'insensitive' } },
          { name: { contains: 'San Pablo', mode: 'insensitive' } }
        ]
      }
    });
    
    if (!institution) {
      console.log('❌ No se encontró la institución Villas San Pablo');
      return;
    }
    
    console.log(`✅ Institución encontrada: ${institution.name}`);
    console.log(`📋 ID: ${institution.id}`);
    
    // 2. Verificar estudiantes existentes
    const existingStudents = await prisma.student.count({
      where: { institutionId: institution.id }
    });
    
    console.log(`📊 Estudiantes existentes: ${existingStudents}`);
    
    // 3. Generar estudiantes realistas para Villas San Pablo
    console.log('👥 Generando estudiantes realistas...');
    
    const grados = [
      'Preescolar', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto',
      'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Once'
    ];
    
    const cursos = ['A', 'B', 'C', 'D'];
    
    const nombres = [
      'Ana', 'Carlos', 'María', 'José', 'Laura', 'David', 'Sofia', 'Miguel',
      'Valentina', 'Alejandro', 'Isabella', 'Santiago', 'Camila', 'Sebastián',
      'Gabriela', 'Andrés', 'Natalia', 'Daniel', 'Paula', 'Juan', 'Andrea',
      'Felipe', 'Daniela', 'Nicolás', 'Alejandra', 'Mateo', 'Juliana', 'Diego',
      'Mariana', 'Samuel', 'Valeria', 'Tomás', 'Lucía', 'Emilio', 'Elena',
      'Ricardo', 'Carmen', 'Fernando', 'Beatriz', 'Antonio', 'Rosa', 'Manuel',
      'Esperanza', 'Francisco', 'Dolores', 'Ramón', 'Pilar', 'Joaquín', 'Mercedes'
    ];
    
    const apellidos = [
      'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez',
      'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández',
      'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez',
      'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez',
      'Serrano', 'Blanco', 'Suárez', 'Molina', 'Morales', 'Ortega', 'Delgado',
      'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias', 'Medina',
      'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano',
      'Prieto', 'Méndez', 'Cruz', 'Herrera', 'Peña', 'Flores', 'Cabrera'
    ];
    
    const barrios = [
      'Villas de San Pablo', 'San Pablo Norte', 'San Pablo Sur', 'Villa Nueva',
      'El Recreo', 'La Esperanza', 'Los Almendros', 'Las Flores', 'El Progreso',
      'Villa Hermosa', 'San José', 'La Paz', 'El Carmen', 'Santa Rosa',
      'Villa María', 'San Antonio', 'La Victoria', 'El Porvenir'
    ];
    
    // 4. Crear estudiantes en lotes
    const batchSize = 100;
    const totalStudents = 1340;
    let createdCount = 0;
    
    console.log(`🚀 Creando ${totalStudents} estudiantes en lotes de ${batchSize}...`);
    
    for (let batch = 0; batch < Math.ceil(totalStudents / batchSize); batch++) {
      const studentsInBatch = Math.min(batchSize, totalStudents - (batch * batchSize));
      const studentsData = [];
      
      for (let i = 0; i < studentsInBatch; i++) {
        const studentNumber = (batch * batchSize) + i + 1;
        const nombre = nombres[Math.floor(Math.random() * nombres.length)];
        const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
        const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
        const grado = grados[Math.floor(Math.random() * grados.length)];
        const curso = cursos[Math.floor(Math.random() * cursos.length)];
        const barrio = barrios[Math.floor(Math.random() * barrios.length)];
        
        // Generar documento único
        const documento = `10${String(studentNumber).padStart(8, '0')}`;
        
        // Generar fecha de nacimiento realista
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - Math.floor(Math.random() * 12) - 6; // Entre 6 y 18 años
        const birthMonth = Math.floor(Math.random() * 12) + 1;
        const birthDay = Math.floor(Math.random() * 28) + 1;
        const fechaNacimiento = new Date(birthYear, birthMonth - 1, birthDay);
        
        studentsData.push({
          documento,
          nombre,
          apellido: `${apellido1} ${apellido2}`,
          email: `${nombre.toLowerCase()}.${apellido1.toLowerCase()}${studentNumber}@estudiante.villasanpablo.edu.co`,
          telefono: `300${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
          grado,
          curso,
          genero: Math.random() > 0.5 ? 'M' : 'F',
          fechaNacimiento,
          direccion: `Calle ${Math.floor(Math.random() * 100) + 1} #${Math.floor(Math.random() * 50) + 1}-${Math.floor(Math.random() * 99) + 1}, ${barrio}`,
          acudienteNombre: `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`,
          acudienteTelefono: `300${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
          acudienteEmail: `acudiente${studentNumber}@gmail.com`,
          estado: 'activo',
          institutionId: institution.id
        });
      }
      
      // Insertar lote
      try {
        await prisma.student.createMany({
          data: studentsData,
          skipDuplicates: true
        });
        
        createdCount += studentsInBatch;
        console.log(`✅ Lote ${batch + 1}: ${studentsInBatch} estudiantes creados (Total: ${createdCount}/${totalStudents})`);
        
        // Pequeña pausa para no sobrecargar la base de datos
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`⚠️ Error en lote ${batch + 1}:`, error.message);
      }
    }
    
    // 5. Verificar resultado final
    const finalCount = await prisma.student.count({
      where: { institutionId: institution.id }
    });
    
    console.log('\n📊 RESUMEN FINAL:');
    console.log('================');
    console.log(`🏫 Institución: ${institution.name}`);
    console.log(`👥 Estudiantes creados: ${createdCount}`);
    console.log(`📋 Total en base de datos: ${finalCount}`);
    console.log(`✅ Estado: ${finalCount >= 1000 ? 'EXITOSO' : 'PARCIAL'}`);
    
    // 6. Mostrar estadísticas por grado
    console.log('\n📈 ESTADÍSTICAS POR GRADO:');
    console.log('==========================');
    
    for (const grado of grados) {
      const count = await prisma.student.count({
        where: {
          institutionId: institution.id,
          grado: grado
        }
      });
      console.log(`${grado}: ${count} estudiantes`);
    }
    
    console.log('\n🎉 CARGA DE ESTUDIANTES COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error cargando estudiantes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  loadVillasStudentsProduction()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { loadVillasStudentsProduction };