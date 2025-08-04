/**
 * Script de migración para actualizar el schema de estudiantes
 * y cargar datos de prueba desde CSV
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const prisma = new PrismaClient();

async function migrateStudents() {
    try {
        console.log('🔄 Iniciando migración de estudiantes...');

        // 1. Verificar si hay una institución disponible
        let institution = await prisma.institution.findFirst({
            where: { isActive: true }
        });

        if (!institution) {
            console.log('📝 Creando institución de prueba...');
            institution = await prisma.institution.create({
                data: {
                    name: 'Institución Educativa San José',
                    nit: '900123456-7',
                    address: 'Calle 123 #45-67',
                    phone: '601-234-5678',
                    email: 'contacto@sanjose.edu.co',
                    city: 'Bogotá',
                    department: 'Cundinamarca',
                    educationLevel: 'SECUNDARIA',
                    isActive: true
                }
            });
            console.log('✅ Institución creada:', institution.name);
        }

        // 2. Limpiar estudiantes existentes (opcional)
        const existingStudents = await prisma.student.count({
            where: { institutionId: institution.id }
        });

        if (existingStudents > 0) {
            console.log(`⚠️ Se encontraron ${existingStudents} estudiantes existentes.`);
            console.log('🗑️ Eliminando estudiantes existentes...');
            
            // Eliminar participaciones en eventos primero
            await prisma.eventParticipation.deleteMany({
                where: {
                    student: {
                        institutionId: institution.id
                    }
                }
            });

            // Eliminar asignaciones de pago
            await prisma.paymentAssignment.deleteMany({
                where: {
                    student: {
                        institutionId: institution.id
                    }
                }
            });

            // Eliminar facturas
            await prisma.invoice.deleteMany({
                where: {
                    student: {
                        institutionId: institution.id
                    }
                }
            });

            // Finalmente eliminar estudiantes
            await prisma.student.deleteMany({
                where: { institutionId: institution.id }
            });

            console.log('✅ Estudiantes existentes eliminados');
        }

        // 3. Cargar estudiantes desde CSV
        const csvPath = path.join(__dirname, '../templates/estudiantes-plantilla.csv');
        
        if (!fs.existsSync(csvPath)) {
            console.log('❌ Archivo CSV no encontrado:', csvPath);
            return;
        }

        console.log('📂 Cargando estudiantes desde CSV...');
        const students = [];

        await new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
                .pipe(csv())
                .on('data', (row) => {
                    students.push({
                        documento: row.documento?.trim(),
                        nombre: row.nombre?.trim(),
                        apellido: row.apellido?.trim(),
                        email: row.email?.trim() || null,
                        telefono: row.telefono?.trim() || null,
                        grado: row.grado?.trim(),
                        curso: row.curso?.trim().toUpperCase(),
                        genero: row.genero?.trim().toUpperCase(),
                        fechaNacimiento: row.fecha_nacimiento?.trim() ? new Date(row.fecha_nacimiento.trim()) : null,
                        direccion: row.direccion?.trim() || null,
                        acudienteNombre: row.acudiente_nombre?.trim() || null,
                        acudienteTelefono: row.acudiente_telefono?.trim() || null,
                        acudienteEmail: row.acudiente_email?.trim() || null,
                        estado: row.estado?.trim() || 'activo',
                        institutionId: institution.id
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`📊 Procesados ${students.length} estudiantes del CSV`);

        // 4. Insertar estudiantes en la base de datos
        let insertedCount = 0;
        let errorCount = 0;

        for (const studentData of students) {
            try {
                // Validar datos básicos
                if (!studentData.documento || !studentData.nombre || !studentData.apellido || 
                    !studentData.grado || !studentData.curso || !studentData.genero) {
                    console.log(`⚠️ Datos incompletos para estudiante: ${studentData.nombre} ${studentData.apellido}`);
                    errorCount++;
                    continue;
                }

                await prisma.student.create({
                    data: studentData
                });

                insertedCount++;
                
                if (insertedCount % 5 === 0) {
                    console.log(`📝 Insertados ${insertedCount} estudiantes...`);
                }

            } catch (error) {
                console.error(`❌ Error insertando estudiante ${studentData.nombre} ${studentData.apellido}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 RESUMEN DE MIGRACIÓN:');
        console.log(`✅ Estudiantes insertados: ${insertedCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`🏫 Institución: ${institution.name}`);

        // 5. Mostrar estadísticas finales
        const stats = await prisma.student.groupBy({
            by: ['grado', 'curso'],
            where: { institutionId: institution.id },
            _count: { id: true }
        });

        console.log('\n📈 ESTADÍSTICAS POR GRADO Y CURSO:');
        stats.forEach(stat => {
            console.log(`   ${stat.grado}°${stat.curso}: ${stat._count.id} estudiantes`);
        });

        console.log('\n🎉 Migración completada exitosamente!');

    } catch (error) {
        console.error('💥 Error en la migración:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
    migrateStudents()
        .then(() => {
            console.log('✅ Script de migración finalizado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error ejecutando migración:', error);
            process.exit(1);
        });
}

module.exports = { migrateStudents };