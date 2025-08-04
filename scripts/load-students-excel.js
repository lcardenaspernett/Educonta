// ===================================
// SCRIPT PARA CARGAR ESTUDIANTES DESDE EXCEL
// ===================================

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function loadStudentsFromExcel(excelFilePath, institutionId) {
    console.log('📊 Cargando estudiantes desde Excel...');
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
        const sheetName = workbook.SheetNames[0]; // Primera hoja
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        console.log(`📋 Encontradas ${rawData.length} filas en el Excel`);

        if (rawData.length === 0) {
            throw new Error('El archivo Excel está vacío o no tiene datos válidos');
        }

        // 4. Mostrar las columnas disponibles
        console.log('📊 Columnas encontradas en el Excel:');
        const columns = Object.keys(rawData[0]);
        columns.forEach((col, index) => {
            console.log(`   ${index + 1}. ${col}`);
        });

        // 5. Mapear y validar datos
        console.log('🔄 Procesando y validando datos...');
        const studentsData = [];
        const errors = [];

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const rowNumber = i + 2; // +2 porque Excel empieza en 1 y hay header

            try {
                // Mapear campos (adaptado para el archivo real de Villas de San Pablo)
                const fullName = cleanString(row['Nombre Completo'] || row['NOMBRE COMPLETO'] || row['nombre completo']);
                const nameParts = fullName ? fullName.split(' ') : [];
                const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
                const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
                
                // Usar documento real del Excel (incluyendo los que empiezan con N para extranjeros)
                const originalDoc = cleanString(row['Identificación'] || row['IDENTIFICACION'] || row['identificacion']);
                const studentNumber = cleanString(row['No.'] || row['No'] || row['NO'] || row['NUMERO']);
                
                // Solo generar documento si realmente no existe
                let finalDoc = originalDoc;
                if (!originalDoc || originalDoc.trim() === '' || originalDoc === 'null' || originalDoc === 'undefined') {
                    finalDoc = generateDocument(studentNumber, institutionId);
                    console.log(`⚠️  Generando documento para estudiante ${studentNumber}: ${finalDoc}`);
                }
                
                const studentData = {
                    // Campos requeridos - adaptados al esquema real
                    documento: finalDoc,
                    nombre: firstName || 'Sin nombre',
                    apellido: lastName || 'Sin apellido',
                    grado: extractGrade(cleanString(row['Curso'] || row['CURSO'] || row['curso'])),
                    curso: extractSection(cleanString(row['Curso'] || row['CURSO'] || row['curso'])) || 'A',
                    genero: inferGender(firstName) || 'M', // Inferir género del nombre
                    
                    // Campos opcionales
                    email: cleanEmail(row['EMAIL'] || row['Email'] || row['email'] || row['CORREO'] || row['correo']),
                    telefono: cleanString(row['TELEFONO'] || row['Telefono'] || row['telefono'] || row['PHONE'] || row['phone']),
                    fechaNacimiento: parseDate(row['FECHA_NACIMIENTO'] || row['Fecha_Nacimiento'] || row['fecha_nacimiento']),
                    direccion: cleanString(row['DIRECCION'] || row['Direccion'] || row['direccion']),
                    
                    // Información del acudiente
                    acudienteNombre: cleanString(row['ACUDIENTE'] || row['Acudiente'] || row['acudiente']),
                    acudienteTelefono: cleanString(row['TEL_ACUDIENTE'] || row['Tel_Acudiente'] || row['tel_acudiente']),
                    acudienteEmail: cleanEmail(row['EMAIL_ACUDIENTE'] || row['Email_Acudiente'] || row['email_acudiente']),
                    
                    // Campos del sistema
                    institutionId: institutionId,
                    estado: 'activo'
                };

                // Validaciones básicas (más flexibles)
                if (!studentData.nombre || studentData.nombre === 'Sin nombre') {
                    throw new Error('Nombre requerido');
                }
                if (!studentData.apellido || studentData.apellido === 'Sin apellido') {
                    throw new Error('Apellido requerido');
                }
                if (!studentData.grado) {
                    throw new Error('Grado requerido');
                }

                // El documento siempre estará presente (generado o real)
                // Validar formato básico
                if (studentData.documento && studentData.documento.length < 8) {
                    // Si es muy corto, regenerar
                    studentData.documento = generateDocument(i + 1, institutionId);
                }

                studentsData.push(studentData);

            } catch (error) {
                errors.push({
                    row: rowNumber,
                    error: error.message,
                    data: row
                });
            }
        }

        // 6. Mostrar errores si los hay
        if (errors.length > 0) {
            console.log(`⚠️  Se encontraron ${errors.length} errores:`);
            errors.slice(0, 10).forEach(err => { // Mostrar solo los primeros 10
                console.log(`   Fila ${err.row}: ${err.error}`);
            });
            
            if (errors.length > 10) {
                console.log(`   ... y ${errors.length - 10} errores más`);
            }
            
            const validStudents = studentsData.length;
            const totalRows = rawData.length;
            console.log(`📊 Resumen: ${validStudents} válidos de ${totalRows} total`);
            
            if (validStudents === 0) {
                throw new Error('No hay estudiantes válidos para cargar');
            }
            
            const continuar = await askQuestion(`¿Desea continuar cargando ${validStudents} estudiantes válidos? (s/n): `);
            if (continuar.toLowerCase() !== 's' && continuar.toLowerCase() !== 'si') {
                console.log('❌ Proceso cancelado por el usuario');
                return;
            }
        }

        // 7. Cargar estudiantes en la base de datos
        console.log(`💾 Cargando ${studentsData.length} estudiantes en la base de datos...`);
        
        let loaded = 0;
        let duplicates = 0;
        let generatedDocs = 0;
        
        for (const studentData of studentsData) {
            try {
                // Verificar si ya existe
                const existing = await prisma.student.findFirst({
                    where: {
                        documento: studentData.documento,
                        institutionId
                    }
                });

                if (existing) {
                    duplicates++;
                    console.log(`⚠️  Estudiante duplicado: ${studentData.documento} - ${studentData.nombre} ${studentData.apellido}`);
                    continue;
                }

                // Verificar si el documento fue generado
                const isGenerated = studentData.documento.startsWith('1000');
                if (isGenerated) {
                    generatedDocs++;
                }
                
                // Log para documentos que empiezan con N (extranjeros)
                if (studentData.documento.startsWith('N')) {
                    console.log(`🌍 Estudiante extranjero: ${studentData.nombre} ${studentData.apellido} - Doc: ${studentData.documento}`);
                }

                // Crear estudiante
                await prisma.student.create({
                    data: studentData
                });
                
                loaded++;
                
                if (loaded % 50 === 0) {
                    console.log(`   ✅ Cargados ${loaded} estudiantes...`);
                }

            } catch (error) {
                console.error(`❌ Error cargando estudiante ${studentData.documento}:`, error.message);
            }
        }

        // 8. Resumen final
        console.log('\n🎉 ¡CARGA COMPLETADA!');
        console.log('=====================================');
        console.log(`✅ Estudiantes cargados: ${loaded}`);
        console.log(`⚠️  Duplicados omitidos: ${duplicates}`);
        console.log(`🔢 Documentos generados: ${generatedDocs}`);
        console.log(`❌ Errores en Excel: ${errors.length}`);
        console.log(`📊 Total procesado: ${rawData.length}`);
        
        if (generatedDocs > 0) {
            console.log('\n📝 NOTA IMPORTANTE:');
            console.log('=====================================');
            console.log(`🔢 Se generaron ${generatedDocs} documentos automáticamente`);
            console.log('📋 Estos documentos temporales inician con "1000"');
            console.log('✏️  Puedes actualizarlos después con los documentos reales');
            console.log('🔧 Usa el sistema de gestión de estudiantes para editarlos');
        }
        
        // 9. Estadísticas por grado
        const gradeStats = await prisma.student.groupBy({
            by: ['grado'],
            where: { institutionId },
            _count: { id: true }
        });

        console.log('\n📊 ESTUDIANTES POR GRADO:');
        console.log('=====================================');
        gradeStats.forEach(stat => {
            console.log(`${stat.grado}°: ${stat._count.id} estudiantes`);
        });

        return {
            loaded,
            duplicates,
            generatedDocs,
            errors: errors.length,
            total: rawData.length
        };

    } catch (error) {
        console.error('❌ Error cargando estudiantes:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Funciones auxiliares
function cleanString(value) {
    if (!value) return null;
    return String(value).trim().replace(/\s+/g, ' ');
}

function cleanEmail(value) {
    if (!value) return null;
    const email = String(value).trim().toLowerCase();
    return email.includes('@') ? email : null;
}

function parseDate(value) {
    if (!value) return null;
    
    try {
        // Si es un número (fecha de Excel)
        if (typeof value === 'number') {
            const date = XLSX.SSF.parse_date_code(value);
            return new Date(date.y, date.m - 1, date.d);
        }
        
        // Si es string, intentar parsear
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}

function extractGrade(courseString) {
    if (!courseString) return null;
    
    // Buscar patrones como "6A", "7B", "10C", etc.
    const gradeMatch = courseString.match(/(\d+)/);
    return gradeMatch ? gradeMatch[1] : null;
}

function extractSection(courseString) {
    if (!courseString) return 'A';
    
    // Buscar patrones como "6A", "7B", "10C", etc.
    const sectionMatch = courseString.match(/\d+([A-Z])/);
    return sectionMatch ? sectionMatch[1] : 'A';
}

function generateDocument(studentNumber, institutionId) {
    // Generar documento temporal basado en el número de estudiante
    // Formato: 1000000000 + número de estudiante (10 dígitos total)
    const baseDoc = '1000000000';
    const numStr = String(studentNumber || Math.floor(Math.random() * 9999)).padStart(4, '0');
    const generated = baseDoc.slice(0, -numStr.length) + numStr;
    console.log(`🔢 Documento generado para estudiante ${studentNumber}: ${generated}`);
    return generated;
}

function inferGender(firstName) {
    if (!firstName) return 'M';
    
    const name = firstName.toLowerCase();
    
    // Nombres típicamente femeninos
    const femaleNames = [
        'maria', 'ana', 'laura', 'sofia', 'valentina', 'camila', 'isabella', 'natalia',
        'andrea', 'carolina', 'alejandra', 'daniela', 'gabriela', 'paula', 'sara',
        'lucia', 'elena', 'carmen', 'rosa', 'patricia', 'monica', 'claudia', 'diana'
    ];
    
    // Nombres típicamente masculinos
    const maleNames = [
        'juan', 'carlos', 'luis', 'miguel', 'jose', 'diego', 'andres', 'santiago',
        'alejandro', 'daniel', 'david', 'sebastian', 'nicolas', 'felipe', 'jorge',
        'ricardo', 'fernando', 'antonio', 'manuel', 'pedro', 'pablo', 'rafael'
    ];
    
    // Buscar coincidencias exactas o parciales
    for (const femaleName of femaleNames) {
        if (name.includes(femaleName)) return 'F';
    }
    
    for (const maleName of maleNames) {
        if (name.includes(maleName)) return 'M';
    }
    
    // Terminaciones típicamente femeninas
    if (name.endsWith('a') || name.endsWith('ia') || name.endsWith('ina') || name.endsWith('ela')) {
        return 'F';
    }
    
    // Por defecto masculino
    return 'M';
}

function askQuestion(question) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Función para uso desde línea de comandos
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('❌ Uso: node load-students-excel.js <archivo.xlsx> <institutionId>');
        console.log('📝 Ejemplo: node load-students-excel.js estudiantes.xlsx 1');
        process.exit(1);
    }

    const excelFile = args[0];
    const institutionId = args[1];

    try {
        await loadStudentsFromExcel(excelFile, institutionId);
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

module.exports = { loadStudentsFromExcel };