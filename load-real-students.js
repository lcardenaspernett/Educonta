// ===================================
// CARGAR ESTUDIANTES REALES DESDE EXCEL
// ===================================

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function loadRealStudents() {
    try {
        console.log('🔄 Cargando estudiantes reales desde Excel...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        const excelPath = 'C:\\Users\\LUIS C\\Documents\\BASE DE DATOS ESTUDIANTES.xlsx';
        
        // Verificar que el archivo existe
        if (!fs.existsSync(excelPath)) {
            console.error('❌ Archivo no encontrado:', excelPath);
            return;
        }
        
        console.log('📂 Archivo encontrado:', excelPath);
        
        // 1. Eliminar estudiantes existentes
        console.log('\n🗑️ Eliminando estudiantes existentes...');
        const deleteResult = await prisma.student.deleteMany({
            where: { institutionId }
        });
        console.log(`   ✅ ${deleteResult.count} estudiantes eliminados`);
        
        // 2. Leer archivo Excel
        console.log('\n📖 Leyendo archivo Excel...');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`   📊 ${data.length} filas encontradas en Excel`);
        
        if (data.length === 0) {
            console.log('❌ No se encontraron datos en el archivo Excel');
            return;
        }
        
        // 3. Mostrar estructura de datos
        console.log('\n📋 Estructura de datos encontrada:');
        const firstRow = data[0];
        Object.keys(firstRow).forEach((key, index) => {
            console.log(`   ${index + 1}. "${key}": "${firstRow[key]}"`);
        });
        
        // 4. Procesar y cargar estudiantes
        console.log('\n👥 Procesando estudiantes...');
        
        let createdCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            
            try {
                // Mapear campos del Excel (ajustar según la estructura real)
                const nombreCompleto = row['Nombre Completo'] || row['NOMBRE COMPLETO'] || row['nombre completo'] || '';
                const documento = row['Identificación'] || row['IDENTIFICACION'] || row['identificacion'] || row['Documento'] || row['DOCUMENTO'] || '';
                const curso = row['Curso'] || row['CURSO'] || row['curso'] || '';
                
                if (!nombreCompleto || !documento) {
                    console.log(`   ⚠️ Fila ${i + 1}: Faltan datos requeridos`);
                    errorCount++;
                    continue;
                }
                
                // Separar nombres y apellidos
                const nombres = nombreCompleto.trim().split(' ');
                const mitad = Math.ceil(nombres.length / 2);
                const firstName = nombres.slice(0, mitad).join(' ');
                const lastName = nombres.slice(mitad).join(' ');
                
                // Extraer grado y curso del campo "Curso"
                let grado = '';
                let cursoNum = '';
                
                // Convertir curso a string si no lo es
                const cursoStr = curso ? curso.toString() : '';
                
                if (cursoStr.toLowerCase().includes('sexto')) {
                    grado = '6';
                } else if (cursoStr.toLowerCase().includes('séptimo') || cursoStr.toLowerCase().includes('septimo')) {
                    grado = '7';
                } else if (cursoStr.toLowerCase().includes('octavo')) {
                    grado = '8';
                } else if (cursoStr.toLowerCase().includes('noveno')) {
                    grado = '9';
                } else if (cursoStr.toLowerCase().includes('décimo') || cursoStr.toLowerCase().includes('decimo')) {
                    grado = '10';
                } else if (cursoStr.toLowerCase().includes('undécimo') || cursoStr.toLowerCase().includes('undecimo') || cursoStr.toLowerCase().includes('once')) {
                    grado = '11';
                }
                
                // Extraer número de curso
                if (cursoStr.includes('01') || cursoStr.includes('1')) {
                    cursoNum = '01';
                } else if (cursoStr.includes('02') || cursoStr.includes('2')) {
                    cursoNum = '02';
                } else if (cursoStr.includes('03') || cursoStr.includes('3')) {
                    cursoNum = '03';
                } else {
                    cursoNum = '01'; // Por defecto
                }
                
                // Si no se pudo extraer el grado, usar un valor por defecto
                if (!grado) {
                    grado = '6'; // Por defecto sexto
                }
                
                // Crear estudiante
                await prisma.student.create({
                    data: {
                        documento: documento.toString(),
                        nombre: firstName,
                        apellido: lastName,
                        email: `${firstName.toLowerCase().replace(/\s+/g, '.')}@villasanpablo.edu.co`,
                        telefono: '+57 300 000 0000',
                        grado: grado,
                        curso: cursoNum,
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
                
                if (createdCount % 100 === 0) {
                    console.log(`   📝 Procesados: ${createdCount} estudiantes...`);
                }
                
            } catch (error) {
                console.error(`   ❌ Error en fila ${i + 1}:`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n📊 RESUMEN DE CARGA:');
        console.log('====================');
        console.log(`✅ Estudiantes creados: ${createdCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📋 Total procesado: ${data.length}`);
        
        // 5. Verificar distribución final
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
        finalDistribution.forEach(item => {
            const gradeNames = {
                '6': 'Sexto',
                '7': 'Séptimo',
                '8': 'Octavo',
                '9': 'Noveno',
                '10': 'Décimo',
                '11': 'Undécimo'
            };
            console.log(`   ${item.grado}° (${gradeNames[item.grado]}) - Curso ${item.curso}: ${item._count.id} estudiantes`);
        });
        
        // 6. Regenerar archivo de datos para el frontend
        console.log('\n🔄 Regenerando archivo de datos para el frontend...');
        
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

        // Crear archivo JavaScript actualizado
        const jsContent = `
// Datos de estudiantes reales cargados desde Excel
window.STUDENTS_DATA = ${JSON.stringify(students, null, 2)};
console.log('📦 Datos de estudiantes reales cargados:', window.STUDENTS_DATA.length);
`;

        const filePath = path.join(__dirname, 'public', 'js', 'students-data.js');
        fs.writeFileSync(filePath, jsContent);
        
        console.log('✅ Archivo de datos actualizado:', filePath);
        
        console.log('\n🎉 ¡CARGA COMPLETADA!');
        console.log('=====================');
        console.log('✅ Estudiantes reales cargados desde Excel');
        console.log('✅ Base de datos actualizada');
        console.log('✅ Archivo de frontend regenerado');
        console.log('\n💡 Recarga la página de estudiantes para ver los datos reales');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await prisma.$disconnect();
    }
}

loadRealStudents();