// ===================================
// SCRIPT PARA ACTUALIZAR DOCUMENTOS DE ESTUDIANTES
// ===================================

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');

const prisma = new PrismaClient();

async function updateStudentDocuments(excelFilePath, institutionId) {
    console.log('📝 Actualizando documentos de estudiantes...');
    console.log(`📁 Archivo: ${excelFilePath}`);
    console.log(`🏫 Institución ID: ${institutionId}`);

    try {
        // 1. Verificar que el archivo existe
        if (!fs.existsSync(excelFilePath)) {
            throw new Error(`Archivo no encontrado: ${excelFilePath}`);
        }

        // 2. Verificar que la institución existe
        const institution = await prisma.institution.findUnique({
            where: { id: institutionId }
        });

        if (!institution) {
            throw new Error(`Institución no encontrada con ID: ${institutionId}`);
        }

        console.log(`✅ Institución encontrada: ${institution.name}`);

        // 3. Leer el archivo Excel
        console.log('📖 Leyendo archivo Excel...');
        const workbook = XLSX.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        console.log(`📋 Encontradas ${rawData.length} filas en el Excel`);

        // 4. Mostrar columnas disponibles
        console.log('📊 Columnas encontradas:');
        const columns = Object.keys(rawData[0]);
        columns.forEach((col, index) => {
            console.log(`   ${index + 1}. ${col}`);
        });

        // 5. Procesar actualizaciones
        console.log('\n🔄 Procesando actualizaciones...');
        let updated = 0;
        let notFound = 0;
        let errors = 0;

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const rowNumber = i + 2;

            try {
                // Extraer datos de identificación
                const fullName = cleanString(row['Nombre Completo'] || row['NOMBRE COMPLETO']);
                const newDocument = cleanString(row['Documento Real'] || row['DOCUMENTO_REAL'] || row['Identificación']);
                const studentNumber = cleanString(row['No.'] || row['No'] || row['NO']);

                if (!fullName || !newDocument) {
                    console.log(`⚠️  Fila ${rowNumber}: Faltan datos (nombre o documento)`);
                    continue;
                }

                // Buscar estudiante por nombre o documento generado
                const nameParts = fullName.split(' ');
                const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
                const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');

                const student = await prisma.student.findFirst({
                    where: {
                        institutionId,
                        OR: [
                            {
                                AND: [
                                    { nombre: { contains: firstName } },
                                    { apellido: { contains: lastName } }
                                ]
                            },
                            { documento: { startsWith: '1000' } } // Documento generado
                        ]
                    }
                });

                if (!student) {
                    notFound++;
                    console.log(`❌ Fila ${rowNumber}: Estudiante no encontrado - ${fullName}`);
                    continue;
                }

                // Verificar si el nuevo documento ya existe
                const existingDoc = await prisma.student.findFirst({
                    where: {
                        documento: newDocument,
                        institutionId,
                        id: { not: student.id }
                    }
                });

                if (existingDoc) {
                    errors++;
                    console.log(`❌ Fila ${rowNumber}: Documento ${newDocument} ya existe para otro estudiante`);
                    continue;
                }

                // Actualizar documento
                await prisma.student.update({
                    where: { id: student.id },
                    data: { documento: newDocument }
                });

                updated++;
                console.log(`✅ Actualizado: ${student.nombre} ${student.apellido} -> ${newDocument}`);

            } catch (error) {
                errors++;
                console.error(`❌ Error en fila ${rowNumber}:`, error.message);
            }
        }

        // 6. Resumen final
        console.log('\n🎉 ¡ACTUALIZACIÓN COMPLETADA!');
        console.log('=====================================');
        console.log(`✅ Documentos actualizados: ${updated}`);
        console.log(`❌ Estudiantes no encontrados: ${notFound}`);
        console.log(`⚠️  Errores: ${errors}`);
        console.log(`📊 Total procesado: ${rawData.length}`);

        // 7. Mostrar estudiantes con documentos generados restantes
        const remainingGenerated = await prisma.student.count({
            where: {
                institutionId,
                documento: { startsWith: '1000' }
            }
        });

        if (remainingGenerated > 0) {
            console.log(`\n📝 Quedan ${remainingGenerated} estudiantes con documentos generados`);
            console.log('💡 Puedes ejecutar este script nuevamente con más datos');
        } else {
            console.log('\n🎉 ¡Todos los estudiantes tienen documentos reales!');
        }

        return {
            updated,
            notFound,
            errors,
            total: rawData.length,
            remainingGenerated
        };

    } catch (error) {
        console.error('❌ Error actualizando documentos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

function cleanString(value) {
    if (!value) return null;
    return String(value).trim().replace(/\s+/g, ' ');
}

// Función para uso desde línea de comandos
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('❌ Uso: node update-student-documents.js <archivo.xlsx> <institutionId>');
        console.log('📝 Ejemplo: node update-student-documents.js documentos.xlsx cmdt7n66m00003t1jy17ay313');
        console.log('\n📋 El archivo Excel debe tener las columnas:');
        console.log('   - "Nombre Completo" - Nombre del estudiante');
        console.log('   - "Documento Real" o "Identificación" - Nuevo documento');
        console.log('   - "No." - Número de estudiante (opcional)');
        process.exit(1);
    }

    const excelFile = args[0];
    const institutionId = args[1];

    try {
        await updateStudentDocuments(excelFile, institutionId);
        console.log('✅ Proceso completado exitosamente');
    } catch (error) {
        console.error('❌ Error en el proceso:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { updateStudentDocuments };