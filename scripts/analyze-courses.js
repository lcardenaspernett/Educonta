// ===================================
// ANALIZAR CURSOS EN LA BASE DE DATOS
// ===================================

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function analyzeCourses() {
    try {
        console.log('🔍 Analizando cursos en la base de datos...');
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        const excelPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'BASE DE DATOS ESTUDIANTES.xlsx');
        
        // 1. ANALIZAR ARCHIVO EXCEL ORIGINAL
        console.log('\n📖 Analizando archivo Excel original...');
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`📊 Total de registros: ${data.length}`);
        
        // Analizar valores únicos en la columna CURSO
        const cursosExcel = new Set();
        const gradosExcel = new Set();
        const muestras = [];
        
        data.forEach((row, index) => {
            const curso = row['CURSO'] || row['Curso'] || row['curso'] || '';
            const grado = row['GRADO'] || row['Grado'] || row['grado'] || '';
            
            if (curso) cursosExcel.add(curso.toString());
            if (grado) gradosExcel.add(grado.toString());
            
            // Guardar algunas muestras para análisis
            if (index < 10) {
                muestras.push({
                    index: index + 1,
                    grado: grado,
                    curso: curso,
                    nombre: row['Nombre Completo'] || ''
                });
            }
        });
        
        console.log('\n📋 ANÁLISIS DEL EXCEL:');
        console.log('======================');
        console.log('🎓 Grados únicos encontrados:', Array.from(gradosExcel).sort());
        console.log('📚 Cursos únicos encontrados:', Array.from(cursosExcel).sort());
        
        console.log('\n📝 MUESTRAS DE DATOS:');
        console.log('====================');
        muestras.forEach(muestra => {
            console.log(`   ${muestra.index}. ${muestra.nombre} - Grado: "${muestra.grado}" - Curso: "${muestra.curso}"`);
        });
        
        // 2. ANALIZAR BASE DE DATOS ACTUAL
        console.log('\n🗄️ Analizando base de datos actual...');
        
        const estudiantesDB = await prisma.student.findMany({
            where: { institutionId },
            select: {
                grado: true,
                curso: true,
                nombre: true,
                apellido: true
            },
            take: 10
        });
        
        const cursosDB = await prisma.student.findMany({
            where: { institutionId },
            select: { curso: true },
            distinct: ['curso']
        });
        
        const gradosDB = await prisma.student.findMany({
            where: { institutionId },
            select: { grado: true },
            distinct: ['grado']
        });
        
        console.log('\n📊 ANÁLISIS DE LA BASE DE DATOS:');
        console.log('================================');
        console.log('🎓 Grados en BD:', gradosDB.map(g => g.grado).sort());
        console.log('📚 Cursos en BD:', cursosDB.map(c => c.curso).sort());
        
        console.log('\n📝 MUESTRAS DE LA BD:');
        console.log('====================');
        estudiantesDB.forEach((estudiante, index) => {
            console.log(`   ${index + 1}. ${estudiante.nombre} ${estudiante.apellido} - Grado: "${estudiante.grado}" - Curso: "${estudiante.curso}"`);
        });
        
        // 3. ANÁLISIS DETALLADO DE CURSOS
        console.log('\n🔍 ANÁLISIS DETALLADO DE CURSOS:');
        console.log('================================');
        
        // Contar estudiantes por grado y curso
        const distribucion = await prisma.student.groupBy({
            by: ['grado', 'curso'],
            where: { institutionId },
            _count: { id: true },
            orderBy: [
                { grado: 'asc' },
                { curso: 'asc' }
            ]
        });
        
        distribucion.forEach(item => {
            console.log(`   Grado ${item.grado} - Curso ${item.curso}: ${item._count.id} estudiantes`);
        });
        
        // 4. VERIFICAR SI HAY CURSOS PERDIDOS
        console.log('\n⚠️ VERIFICACIÓN DE CURSOS:');
        console.log('==========================');
        
        const cursosExcelArray = Array.from(cursosExcel);
        const cursosDBArray = cursosDB.map(c => c.curso);
        
        const cursosPerdidos = cursosExcelArray.filter(curso => !cursosDBArray.includes(curso));
        const cursosExtra = cursosDBArray.filter(curso => !cursosExcelArray.includes(curso));
        
        if (cursosPerdidos.length > 0) {
            console.log('❌ Cursos que están en Excel pero NO en BD:', cursosPerdidos);
        }
        
        if (cursosExtra.length > 0) {
            console.log('➕ Cursos que están en BD pero NO en Excel:', cursosExtra);
        }
        
        if (cursosPerdidos.length === 0 && cursosExtra.length === 0) {
            console.log('✅ Todos los cursos coinciden entre Excel y BD');
        }
        
        // 5. ANÁLISIS DE PATRONES EN CURSOS
        console.log('\n🔍 ANÁLISIS DE PATRONES:');
        console.log('========================');
        
        const patronesCursos = {};
        data.forEach(row => {
            const cursoOriginal = row['CURSO'] || row['Curso'] || row['curso'] || '';
            if (cursoOriginal) {
                const patron = cursoOriginal.toString().toLowerCase();
                if (!patronesCursos[patron]) {
                    patronesCursos[patron] = 0;
                }
                patronesCursos[patron]++;
            }
        });
        
        console.log('📊 Patrones de cursos encontrados:');
        Object.entries(patronesCursos).forEach(([patron, cantidad]) => {
            console.log(`   "${patron}": ${cantidad} estudiantes`);
        });
        
        console.log('\n✅ Análisis completado');
        
    } catch (error) {
        console.error('❌ Error en análisis:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeCourses();