// ===================================
// CARGAR ESTUDIANTES DESDE ARCHIVO REAL
// ===================================

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

async function loadStudentsFromFile() {
    try {
        console.log('🔄 Cargando estudiantes desde archivo real...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // 1. Eliminar estudiantes actuales
        console.log('\n🗑️ Eliminando estudiantes existentes...');
        const deleteResult = await prisma.student.deleteMany({
            where: { institutionId }
        });
        console.log(`   ✅ ${deleteResult.count} estudiantes eliminados`);
        
        // 2. Buscar el archivo en diferentes ubicaciones posibles
        const possiblePaths = [
            path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'BASE DE DATOS ESTUDIANTES.xlsx'),
            path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'BASE DE DATOS ESTUDIANTES.csv'),
            path.join(process.env.USERPROFILE || process.env.HOME, 'Documentos', 'BASE DE DATOS ESTUDIANTES.xlsx'),
            path.join(process.env.USERPROFILE || process.env.HOME, 'Documentos', 'BASE DE DATOS ESTUDIANTES.csv'),
            path.join(__dirname, 'BASE DE DATOS ESTUDIANTES.xlsx'),
            path.join(__dirname, 'BASE DE DATOS ESTUDIANTES.csv'),
            path.join(__dirname, 'documents', 'BASE DE DATOS ESTUDIANTES.xlsx'),
            path.join(__dirname, 'documents', 'BASE DE DATOS ESTUDIANTES.csv')
        ];
        
        let filePath = null;
        let fileType = null;
        
        console.log('\n🔍 Buscando archivo de estudiantes...');
        for (const testPath of possiblePaths) {
            console.log(`   Probando: ${testPath}`);
            if (fs.existsSync(testPath)) {
                filePath = testPath;
                fileType = path.extname(testPath).toLowerCase();
                console.log(`   ✅ Archivo encontrado: ${filePath}`);
                break;
            }
        }
        
        if (!filePath) {
            console.log('\n❌ No se encontró el archivo. Ubicaciones probadas:');
            possiblePaths.forEach(p => console.log(`   - ${p}`));
            console.log('\n💡 Por favor, coloca el archivo en una de estas ubicaciones:');
            console.log(`   - ${path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'BASE DE DATOS ESTUDIANTES.xlsx')}`);
            console.log(`   - ${path.join(__dirname, 'BASE DE DATOS ESTUDIANTES.xlsx')}`);
            return;
        }
        
        // 3. Leer el archivo
        console.log(`\n📖 Leyendo archivo: ${filePath}`);
        let studentsData = [];
        
        if (fileType === '.xlsx' || fileType === '.xls') {
            // Leer archivo Excel
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            studentsData = XLSX.utils.sheet_to_json(worksheet);
            console.log(`   📊 Datos leídos desde Excel: ${studentsData.length} filas`);
        } else if (fileType === '.csv') {
            // Leer archivo CSV
            const csvContent = fs.readFileSync(filePath, 'utf8');
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            studentsData = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index] || '';
                });
                return obj;
            });
            console.log(`   📊 Datos leídos desde CSV: ${studentsData.length} filas`);
        }
        
        if (studentsData.length === 0) {
            console.log('❌ No se encontraron datos en el archivo');
            return;
        }
        
        // 4. Mostrar estructura del archivo
        console.log('\n📋 Estructura del archivo:');
        const firstRow = studentsData[0];
        const columns = Object.keys(firstRow);
        console.log('   Columnas encontradas:');
        columns.forEach((col, index) => {
            console.log(`   ${index + 1}. "${col}"`);
        });
        
        console.log('\n📝 Muestra de datos (primeras 3 filas):');
        studentsData.slice(0, 3).forEach((row, index) => {
            console.log(`   Fila ${index + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
                if (value && value.toString().trim()) {
                    console.log(`     ${key}: "${value}"`);
                }
            });
            console.log('');
        });
        
        // 5. Mapear campos automáticamente
        console.log('🔄 Mapeando campos...');
        const fieldMapping = detectFieldMapping(columns);
        console.log('   Mapeo detectado:');
        Object.entries(fieldMapping).forEach(([dbField, excelField]) => {
            console.log(`     ${dbField} ← "${excelField}"`);
        });
        
        // 6. Procesar y cargar estudiantes
        console.log('\n👥 Procesando estudiantes...');
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < studentsData.length; i++) {
            const row = studentsData[i];
            
            try {
                // Extraer datos usando el mapeo
                const studentData = extractStudentData(row, fieldMapping);
                
                if (!studentData.documento || !studentData.nombre) {
                    console.log(`   ⚠️ Fila ${i + 1}: Faltan datos obligatorios (documento o nombre)`);
                    errorCount++;
                    continue;
                }
                
                // Crear estudiante en la base de datos
                await prisma.student.create({
                    data: {
                        ...studentData,
                        institutionId: institutionId
                    }
                });
                
                successCount++;
                
                if (successCount % 100 === 0) {
                    console.log(`   ✅ Procesados: ${successCount} estudiantes`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error en fila ${i + 1}: ${error.message}`);
                errorCount++;
            }
        }
        
        console.log(`\n📊 RESUMEN DE CARGA:`);
        console.log(`   ✅ Estudiantes cargados: ${successCount}`);
        console.log(`   ❌ Errores: ${errorCount}`);
        console.log(`   📋 Total procesado: ${studentsData.length}`);
        
        // 7. Verificar distribución
        console.log('\n📈 Verificando distribución...');
        const distribution = await prisma.student.groupBy({
            by: ['grado', 'curso'],
            where: { institutionId },
            _count: { id: true },
            orderBy: [
                { grado: 'asc' },
                { curso: 'asc' }
            ]
        });
        
        console.log('\n📊 DISTRIBUCIÓN FINAL:');
        distribution.forEach(item => {
            console.log(`   Grado ${item.grado} - Curso ${item.curso}: ${item._count.id} estudiantes`);
        });
        
        // 8. Regenerar archivo de datos para el frontend
        console.log('\n🔄 Regenerando archivo de datos para el frontend...');
        await regenerateStudentsDataFile(institutionId);
        
        console.log('\n🎉 ¡CARGA COMPLETADA!');
        console.log('====================');
        console.log(`✅ ${successCount} estudiantes cargados desde archivo real`);
        console.log('✅ Archivo de frontend actualizado');
        console.log('💡 Recarga la página de estudiantes para ver los cambios');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await prisma.$disconnect();
    }
}

function detectFieldMapping(columns) {
    const mapping = {};
    
    // Mapeo de campos comunes
    const fieldPatterns = {
        documento: ['documento', 'cedula', 'identificacion', 'id', 'numero documento', 'doc'],
        nombre: ['nombre', 'nombres', 'primer nombre', 'name'],
        apellido: ['apellido', 'apellidos', 'surname', 'last name'],
        email: ['email', 'correo', 'mail', 'e-mail'],
        telefono: ['telefono', 'phone', 'celular', 'movil'],
        grado: ['grado', 'grade', 'nivel', 'curso grado'],
        curso: ['curso', 'seccion', 'group', 'clase', 'salon'],
        genero: ['genero', 'sexo', 'gender', 'sex'],
        fechaNacimiento: ['fecha nacimiento', 'nacimiento', 'birth date', 'fecha_nacimiento'],
        direccion: ['direccion', 'address', 'domicilio'],
        acudienteNombre: ['acudiente', 'padre', 'madre', 'tutor', 'guardian'],
        acudienteTelefono: ['telefono acudiente', 'tel acudiente', 'phone guardian'],
        acudienteEmail: ['email acudiente', 'correo acudiente', 'mail guardian']
    };
    
    // Detectar campos automáticamente
    Object.entries(fieldPatterns).forEach(([dbField, patterns]) => {
        const matchedColumn = columns.find(col => 
            patterns.some(pattern => 
                col.toLowerCase().includes(pattern.toLowerCase())
            )
        );
        if (matchedColumn) {
            mapping[dbField] = matchedColumn;
        }
    });
    
    return mapping;
}

function extractStudentData(row, fieldMapping) {
    const data = {
        documento: cleanString(row[fieldMapping.documento] || ''),
        nombre: cleanString(row[fieldMapping.nombre] || ''),
        apellido: cleanString(row[fieldMapping.apellido] || ''),
        email: cleanString(row[fieldMapping.email] || ''),
        telefono: cleanString(row[fieldMapping.telefono] || ''),
        grado: cleanString(row[fieldMapping.grado] || ''),
        curso: cleanString(row[fieldMapping.curso] || ''),
        genero: cleanString(row[fieldMapping.genero] || 'M').toUpperCase(),
        fechaNacimiento: parseDate(row[fieldMapping.fechaNacimiento]),
        direccion: cleanString(row[fieldMapping.direccion] || ''),
        acudienteNombre: cleanString(row[fieldMapping.acudienteNombre] || ''),
        acudienteTelefono: cleanString(row[fieldMapping.acudienteTelefono] || ''),
        acudienteEmail: cleanString(row[fieldMapping.acudienteEmail] || ''),
        estado: 'activo'
    };
    
    // Normalizar grado y curso
    data.grado = normalizeGrade(data.grado);
    data.curso = normalizeCourse(data.curso);
    
    return data;
}

function cleanString(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ');
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}

function normalizeGrade(grade) {
    if (!grade) return '6';
    
    const gradeStr = grade.toString().toLowerCase();
    
    // Mapeo de grados de texto a números
    const gradeMap = {
        'sexto': '6',
        'septimo': '7',
        'séptimo': '7',
        'octavo': '8',
        'noveno': '9',
        'decimo': '10',
        'décimo': '10',
        'undecimo': '11',
        'undécimo': '11',
        'once': '11'
    };
    
    // Si ya es un número, devolverlo
    if (/^\d+$/.test(gradeStr)) {
        return gradeStr;
    }
    
    // Buscar en el mapeo
    return gradeMap[gradeStr] || '6';
}

function normalizeCourse(course) {
    if (!course) return '01';
    
    const courseStr = course.toString().toUpperCase().trim();
    
    // Si es una letra, convertir a número
    const courseMap = {
        'A': '01',
        'B': '02', 
        'C': '03',
        '1': '01',
        '2': '02',
        '3': '03'
    };
    
    return courseMap[courseStr] || '01';
}

async function regenerateStudentsDataFile(institutionId) {
    const studentsFromDB = await prisma.student.findMany({
        where: { institutionId },
        orderBy: [
            { grado: 'asc' },
            { curso: 'asc' },
            { apellido: 'asc' },
            { nombre: 'asc' }
        ]
    });

    const students = studentsFromDB.map(student => ({
        id: student.id,
        firstName: student.nombre || '',
        lastName: student.apellido || '',
        fullName: `${student.nombre || ''} ${student.apellido || ''}`.trim(),
        documentType: 'TI',
        document: student.documento || '',
        email: student.email || `${(student.nombre || '').toLowerCase().replace(' ', '.')}@estudiante.edu.co`,
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

    const jsContent = `
// Datos de estudiantes cargados desde archivo real
window.STUDENTS_DATA = ${JSON.stringify(students, null, 2)};
console.log('📦 Datos de estudiantes cargados desde archivo real:', window.STUDENTS_DATA.length);
`;

    const filePath = path.join(__dirname, 'public', 'js', 'students-data.js');
    fs.writeFileSync(filePath, jsContent);
    console.log('✅ Archivo de datos actualizado:', filePath);
}

loadStudentsFromFile();