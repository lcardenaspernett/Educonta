// ===================================
// CARGAR NUEVA BASE DE DATOS ESTUDIANTES
// ===================================

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function loadNewDatabase() {
    try {
        console.log('🔄 Iniciando carga de nueva base de datos...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        const excelPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'BASE DE DATOS ESTUDIANTES.xlsx');
        
        console.log('📂 Buscando archivo en:', excelPath);
        
        // Verificar que el archivo existe
        if (!fs.existsSync(excelPath)) {
            console.error('❌ Archivo no encontrado:', excelPath);
            console.log('💡 Asegúrate de que el archivo "BASE DE DATOS ESTUDIANTES.xlsx" esté en la carpeta Documentos');
            return;
        }
        
        // 1. ELIMINAR TODOS LOS ESTUDIANTES EXISTENTES
        console.log('\n🗑️ Eliminando base de datos actual...');
        const deleteResult = await prisma.student.deleteMany({
            where: { institutionId }
        });
        console.log(`   ✅ ${deleteResult.count} estudiantes eliminados`);
        
        // 2. LEER ARCHIVO EXCEL
        console.log('\n📖 Leyendo nueva base de datos...');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`   📊 ${data.length} registros encontrados en Excel`);
        
        // 3. ANALIZAR ESTRUCTURA DE DATOS
        console.log('\n🔍 Analizando estructura de datos...');
        if (data.length > 0) {
            console.log('   📋 Columnas encontradas:', Object.keys(data[0]));
        }
        
        // 4. PROCESAR Y CARGAR ESTUDIANTES
        console.log('\n👥 Procesando estudiantes...');
        
        let createdCount = 0;
        let errorCount = 0;
        const coursesFound = new Set();
        const gradesFound = new Set();
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            
            try {
                // Mapear campos del Excel (flexible para diferentes nombres de columnas)
                const nombreCompleto = getFieldValue(row, ['Nombre Completo', 'NOMBRE COMPLETO', 'nombre completo', 'Nombre', 'NOMBRE', 'nombre']);
                const documento = getFieldValue(row, ['Identificación', 'IDENTIFICACION', 'identificacion', 'Documento', 'DOCUMENTO', 'documento', 'ID', 'id']);
                const cursoRaw = getFieldValue(row, ['CURSO', 'Curso', 'curso']);
                const gradoRaw = getFieldValue(row, ['GRADO', 'Grado', 'grado']);
                const email = getFieldValue(row, ['Email', 'EMAIL', 'email', 'Correo', 'CORREO', 'correo']);
                const telefono = getFieldValue(row, ['Teléfono', 'TELEFONO', 'telefono', 'Celular', 'CELULAR', 'celular']);
                
                if (!nombreCompleto || !documento) {
                    console.warn(`   ⚠️ Fila ${i + 1}: Faltan datos obligatorios (nombre o documento)`);
                    errorCount++;
                    continue;
                }
                
                // Separar nombres y apellidos
                const nombres = nombreCompleto.trim().split(' ');
                const mitad = Math.ceil(nombres.length / 2);
                const firstName = nombres.slice(0, mitad).join(' ');
                const lastName = nombres.slice(mitad).join(' ');
                
                // Procesar curso y grado correctamente
                const { grado, curso } = processCourseAndGrade(cursoRaw, gradoRaw);
                
                // Registrar cursos y grados encontrados
                coursesFound.add(curso);
                gradesFound.add(grado);
                
                // Crear estudiante
                await prisma.student.create({
                    data: {
                        documento: documento.toString().trim(),
                        nombre: firstName,
                        apellido: lastName,
                        email: email || `${firstName.toLowerCase().replace(/\s+/g, '.')}@villasanpablo.edu.co`,
                        telefono: telefono || '+57 300 000 0000',
                        grado: grado,
                        curso: curso,
                        genero: 'M', // Por defecto
                        fechaNacimiento: new Date(2008, 0, 1), // Por defecto
                        direccion: 'Dirección pendiente',
                        acudienteNombre: 'Acudiente',
                        acudienteTelefono: '+57 300 000 0000',
                        acudienteEmail: 'acudiente@email.com',
                        estado: 'activo',
                        institutionId: institutionId
                    }
                });
                
                createdCount++;
                
                // Mostrar progreso cada 50 estudiantes
                if (createdCount % 50 === 0) {
                    console.log(`   📝 Procesados: ${createdCount} estudiantes...`);
                }
                
            } catch (error) {
                errorCount++;
                if (errorCount <= 10) { // Mostrar los primeros 10 errores
                    console.error(`   ❌ Error en fila ${i + 1}:`, error.message);
                }
            }
        }
        
        // 5. MOSTRAR RESUMEN
        console.log('\n📊 RESUMEN DE CARGA:');
        console.log('====================');
        console.log(`✅ Estudiantes creados: ${createdCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📋 Total procesado: ${data.length}`);
        console.log(`🎓 Grados encontrados: ${Array.from(gradesFound).sort().join(', ')}`);
        console.log(`📚 Cursos encontrados: ${Array.from(coursesFound).sort().join(', ')}`);
        
        // 6. VERIFICAR DISTRIBUCIÓN FINAL
        console.log('\n🔍 Verificando distribución final...');
        const finalDistribution = await prisma.student.groupBy({
            by: ['grado', 'curso'],
            where: { institutionId },
            _count: { id: true },
            orderBy: [
                { grado: 'asc' },
                { curso: 'asc' }
            ]
        });
        
        console.log('\n📈 DISTRIBUCIÓN FINAL:');
        console.log('======================');
        const gradeNames = {
            '6': 'Sexto',
            '7': 'Séptimo', 
            '8': 'Octavo',
            '9': 'Noveno',
            '10': 'Décimo',
            '11': 'Undécimo'
        };
        
        finalDistribution.forEach(item => {
            const gradeName = gradeNames[item.grado] || `Grado ${item.grado}`;
            console.log(`   ${item.grado}° (${gradeName}) - Curso ${item.curso}: ${item._count.id} estudiantes`);
        });
        
        // 7. REGENERAR ARCHIVO DE DATOS PARA EL FRONTEND
        console.log('\n🔄 Regenerando archivo de datos para el frontend...');
        await generateFrontendData(institutionId);
        
        // 8. ACTUALIZAR FILTROS DINÁMICOS
        console.log('\n🔧 Actualizando filtros dinámicos...');
        await updateDynamicFilters(Array.from(gradesFound), Array.from(coursesFound));
        
        console.log('\n🎉 ¡CARGA COMPLETADA EXITOSAMENTE!');
        console.log('==================================');
        console.log(`✅ ${createdCount} estudiantes cargados desde la nueva base de datos`);
        console.log('✅ Base de datos actualizada');
        console.log('✅ Archivo de frontend regenerado');
        console.log('✅ Filtros dinámicos actualizados');
        console.log('\n💡 Recarga la página de estudiantes para ver los nuevos datos');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Función auxiliar para obtener valor de campo con múltiples nombres posibles
function getFieldValue(row, possibleNames) {
    for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
            return row[name].toString().trim();
        }
    }
    return '';
}

// Función para procesar curso y grado
function processCourseAndGrade(cursoRaw, gradoRaw) {
    // Valores por defecto
    let grado = '6';
    let curso = '01';
    
    // Procesar GRADO directamente desde la columna GRADO
    if (gradoRaw) {
        const gradoStr = gradoRaw.toString().trim();
        // El grado viene directamente como número (6, 7, 8, 9, 10, 11)
        if (['6', '7', '8', '9', '10', '11'].includes(gradoStr)) {
            grado = gradoStr;
        }
    }
    
    // Procesar CURSO directamente desde la columna CURSO
    if (cursoRaw) {
        const cursoStr = cursoRaw.toString().trim();
        // El curso viene como número (1, 2, 3, 4, 5, 6, 7)
        // Convertir a formato con ceros: 1 -> 01, 2 -> 02, etc.
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(cursoStr)) {
            curso = cursoStr.padStart(2, '0'); // Convierte "1" a "01", "2" a "02", etc.
        }
    }
    
    return { grado, curso };
}

// Función para generar datos del frontend
async function generateFrontendData(institutionId) {
    const studentsFromDB = await prisma.student.findMany({
        where: { institutionId },
        orderBy: [
            { grado: 'asc' },
            { curso: 'asc' },
            { apellido: 'asc' },
            { nombre: 'asc' }
        ]
    });

    // Transformar datos
    const students = studentsFromDB.map(student => ({
        id: student.id,
        firstName: student.nombre || '',
        lastName: student.apellido || '',
        fullName: `${student.nombre || ''} ${student.apellido || ''}`.trim(),
        documentType: 'TI',
        document: student.documento || '',
        email: student.email || '',
        phone: student.telefono || '+57 300 000 0000',
        grade: student.grado || '',
        course: student.curso || '',
        status: student.estado === 'activo' ? 'ACTIVE' : 'INACTIVE',
        enrollmentDate: student.createdAt || new Date().toISOString(),
        birthDate: student.fechaNacimiento || new Date('2008-01-01').toISOString(),
        guardian: {
            name: student.acudienteNombre || 'Acudiente',
            phone: student.acudienteTelefono || '+57 300 000 0000',
            email: student.acudienteEmail || 'acudiente@email.com'
        },
        address: student.direccion || 'Dirección pendiente',
        events: [],
        totalDebt: 0,
        totalPaid: 0,
        createdAt: student.createdAt || new Date().toISOString()
    }));

    // Crear archivo JavaScript actualizado
    const jsContent = `
// Datos de estudiantes cargados desde nueva base de datos
window.STUDENTS_DATA = ${JSON.stringify(students, null, 2)};
console.log('📦 Nueva base de datos cargada:', window.STUDENTS_DATA.length, 'estudiantes');
`;

    const filePath = path.join(__dirname, '..', 'public', 'js', 'students-data.js');
    fs.writeFileSync(filePath, jsContent);
    
    console.log('✅ Archivo de datos del frontend actualizado');
}

// Función para actualizar filtros dinámicos
async function updateDynamicFilters(grades, courses) {
    // Obtener todos los cursos únicos de la base de datos
    const uniqueCourses = await prisma.student.findMany({
        where: { institutionId: 'cmdt7n66m00003t1jy17ay313' },
        select: { curso: true },
        distinct: ['curso']
    });
    
    const allCourses = uniqueCourses.map(c => c.curso).sort();
    
    console.log('📚 Cursos únicos encontrados en BD:', allCourses);
    
    // Crear archivo de configuración de filtros
    const filterConfig = {
        grades: grades.sort().map(g => ({
            value: g,
            label: `${g}° (${getGradeName(g)})`
        })),
        courses: allCourses.map(c => ({
            value: c,
            label: `Curso ${c}`
        })),
        lastUpdated: new Date().toISOString()
    };
    
    const configPath = path.join(__dirname, '..', 'public', 'js', 'filter-config.js');
    const configContent = `
// Configuración dinámica de filtros
window.FILTER_CONFIG = ${JSON.stringify(filterConfig, null, 2)};
console.log('🔧 Configuración de filtros cargada:', window.FILTER_CONFIG);
`;
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Configuración de filtros actualizada');
}

function getGradeName(grade) {
    const names = {
        '6': 'Sexto',
        '7': 'Séptimo',
        '8': 'Octavo', 
        '9': 'Noveno',
        '10': 'Décimo',
        '11': 'Undécimo'
    };
    return names[grade] || `Grado ${grade}`;
}

// Ejecutar el script
loadNewDatabase();