// ===================================
// DEBUG DIRECTO - Problema de Persistencia
// ===================================

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function debugPersistenceIssue() {
    try {
        console.log('🔍 DIAGNÓSTICO DIRECTO DEL PROBLEMA DE PERSISTENCIA');
        console.log('=' .repeat(60));
        
        const institutionId = 'cmdt7n66m00003t1jy17ay313';
        
        // 1. Verificar datos en base de datos
        console.log('\n1️⃣ VERIFICANDO BASE DE DATOS:');
        const studentsInDB = await prisma.student.findMany({
            where: { institutionId },
            orderBy: { nombre: 'asc' },
            take: 5
        });
        
        console.log(`   📊 Total estudiantes en BD: ${studentsInDB.length}`);
        console.log('   📋 Primeros 5 estudiantes en BD:');
        studentsInDB.slice(0, 5).forEach((student, index) => {
            console.log(`      ${index + 1}. ${student.nombre} ${student.apellido}`);
            console.log(`         📧 Email: ${student.email || 'N/A'}`);
            console.log(`         🏠 Dirección: ${student.direccion || 'N/A'}`);
            console.log(`         🕒 Actualizado: ${student.updatedAt || student.createdAt}`);
        });
        
        // 2. Verificar archivo estático
        console.log('\n2️⃣ VERIFICANDO ARCHIVO ESTÁTICO:');
        const staticFilePath = path.join(__dirname, 'public', 'js', 'students-data.js');
        
        if (fs.existsSync(staticFilePath)) {
            const fileContent = fs.readFileSync(staticFilePath, 'utf8');
            const fileStats = fs.statSync(staticFilePath);
            
            console.log(`   📁 Archivo existe: ${staticFilePath}`);
            console.log(`   🕒 Última modificación: ${fileStats.mtime}`);
            console.log(`   📏 Tamaño: ${Math.round(fileStats.size / 1024)} KB`);
            
            // Extraer información del archivo
            const lines = fileContent.split('\n');
            const dataLine = lines.find(line => line.includes('window.STUDENTS_DATA'));
            
            if (dataLine) {
                try {
                    // Extraer el JSON del archivo
                    const jsonStart = dataLine.indexOf('[');
                    const jsonEnd = dataLine.lastIndexOf('];') + 1;
                    const jsonData = dataLine.substring(jsonStart, jsonEnd);
                    const studentsData = JSON.parse(jsonData);
                    
                    console.log(`   📊 Estudiantes en archivo: ${studentsData.length}`);
                    console.log('   📋 Primeros 5 estudiantes en archivo:');
                    studentsData.slice(0, 5).forEach((student, index) => {
                        console.log(`      ${index + 1}. ${student.fullName || student.firstName + ' ' + student.lastName}`);
                        console.log(`         📧 Email: ${student.email || 'N/A'}`);
                        console.log(`         🏠 Dirección: ${student.address || 'N/A'}`);
                    });
                    
                    // 3. Comparar datos
                    console.log('\n3️⃣ COMPARANDO DATOS:');
                    if (studentsInDB.length > 0 && studentsData.length > 0) {
                        const dbStudent = studentsInDB[0];
                        const fileStudent = studentsData.find(s => s.id === dbStudent.id);
                        
                        if (fileStudent) {
                            console.log('   🔍 Comparando primer estudiante:');
                            console.log(`      BD: ${dbStudent.nombre} ${dbStudent.apellido}`);
                            console.log(`      Archivo: ${fileStudent.fullName}`);
                            console.log(`      BD Email: ${dbStudent.email || 'N/A'}`);
                            console.log(`      Archivo Email: ${fileStudent.email || 'N/A'}`);
                            console.log(`      BD Dirección: ${dbStudent.direccion || 'N/A'}`);
                            console.log(`      Archivo Dirección: ${fileStudent.address || 'N/A'}`);
                            
                            const isConsistent = (
                                `${dbStudent.nombre} ${dbStudent.apellido}` === fileStudent.fullName &&
                                (dbStudent.email || '') === (fileStudent.email || '') &&
                                (dbStudent.direccion || '') === (fileStudent.address || '')
                            );
                            
                            if (isConsistent) {
                                console.log('   ✅ DATOS CONSISTENTES');
                            } else {
                                console.log('   ❌ DATOS INCONSISTENTES - ESTE ES EL PROBLEMA');
                            }
                        } else {
                            console.log('   ❌ Estudiante no encontrado en archivo estático');
                        }
                    }
                    
                } catch (parseError) {
                    console.log('   ❌ Error parseando archivo estático:', parseError.message);
                }
            } else {
                console.log('   ❌ No se encontró window.STUDENTS_DATA en el archivo');
            }
        } else {
            console.log('   ❌ Archivo estático no existe');
        }
        
        // 4. Probar actualización directa
        console.log('\n4️⃣ PROBANDO ACTUALIZACIÓN DIRECTA:');
        if (studentsInDB.length > 0) {
            const testStudent = studentsInDB[0];
            const timestamp = new Date().toLocaleTimeString();
            
            console.log(`   🧪 Actualizando estudiante: ${testStudent.nombre} ${testStudent.apellido}`);
            
            const updatedStudent = await prisma.student.update({
                where: { id: testStudent.id },
                data: {
                    direccion: `Dirección TEST ${timestamp}`,
                    email: `test.${timestamp.replace(/:/g, '')}@test.com`
                }
            });
            
            console.log('   ✅ Actualización en BD exitosa');
            console.log(`      Nueva dirección: ${updatedStudent.direccion}`);
            console.log(`      Nuevo email: ${updatedStudent.email}`);
            
            // Verificar que se guardó
            const verifyStudent = await prisma.student.findUnique({
                where: { id: testStudent.id }
            });
            
            if (verifyStudent.direccion.includes('TEST') && verifyStudent.email.includes('test')) {
                console.log('   ✅ VERIFICACIÓN: Cambios persistieron en BD');
            } else {
                console.log('   ❌ VERIFICACIÓN: Cambios NO persistieron en BD');
            }
        }
        
        // 5. Diagnóstico de rutas
        console.log('\n5️⃣ DIAGNÓSTICO DE RUTAS:');
        console.log('   📡 Ruta de API esperada: /api/students/' + institutionId);
        console.log('   📡 Ruta de actualización: /api/students/student/:id');
        
        // 6. Recomendaciones
        console.log('\n6️⃣ RECOMENDACIONES:');
        console.log('   1. Regenerar archivo estático: node scripts/regenerate-students-data.js');
        console.log('   2. Verificar que el servidor esté corriendo');
        console.log('   3. Limpiar caché del navegador');
        console.log('   4. Verificar logs del servidor durante actualización');
        
        console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
        console.log('=' .repeat(60));
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugPersistenceIssue();