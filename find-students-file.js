// ===================================
// BUSCAR ARCHIVO DE ESTUDIANTES
// ===================================

const fs = require('fs');
const path = require('path');

function findStudentsFile() {
    console.log('🔍 Buscando archivo de estudiantes...');
    
    // Obtener rutas del usuario
    const userProfile = process.env.USERPROFILE || process.env.HOME;
    console.log(`👤 Perfil de usuario: ${userProfile}`);
    
    // Rutas posibles
    const possiblePaths = [
        // Documentos en español
        path.join(userProfile, 'Documents', 'BASE DE DATOS ESTUDIANTES.xlsx'),
        path.join(userProfile, 'Documents', 'BASE DE DATOS ESTUDIANTES.csv'),
        path.join(userProfile, 'Documents', 'base de datos estudiantes.xlsx'),
        path.join(userProfile, 'Documents', 'base de datos estudiantes.csv'),
        path.join(userProfile, 'Documentos', 'BASE DE DATOS ESTUDIANTES.xlsx'),
        path.join(userProfile, 'Documentos', 'BASE DE DATOS ESTUDIANTES.csv'),
        
        // En el directorio actual
        path.join(__dirname, 'BASE DE DATOS ESTUDIANTES.xlsx'),
        path.join(__dirname, 'BASE DE DATOS ESTUDIANTES.csv'),
        path.join(__dirname, 'base de datos estudiantes.xlsx'),
        path.join(__dirname, 'base de datos estudiantes.csv'),
        
        // Otras variaciones
        path.join(userProfile, 'Desktop', 'BASE DE DATOS ESTUDIANTES.xlsx'),
        path.join(userProfile, 'Desktop', 'BASE DE DATOS ESTUDIANTES.csv'),
        path.join(userProfile, 'Downloads', 'BASE DE DATOS ESTUDIANTES.xlsx'),
        path.join(userProfile, 'Downloads', 'BASE DE DATOS ESTUDIANTES.csv')
    ];
    
    console.log('\n📂 Verificando ubicaciones posibles:');
    
    let foundFiles = [];
    
    possiblePaths.forEach((testPath, index) => {
        const exists = fs.existsSync(testPath);
        console.log(`   ${index + 1}. ${exists ? '✅' : '❌'} ${testPath}`);
        
        if (exists) {
            foundFiles.push(testPath);
        }
    });
    
    if (foundFiles.length > 0) {
        console.log('\n🎉 ¡Archivos encontrados!');
        foundFiles.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file}`);
            
            // Mostrar información del archivo
            try {
                const stats = fs.statSync(file);
                console.log(`      📊 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
                console.log(`      📅 Modificado: ${stats.mtime.toLocaleString()}`);
            } catch (error) {
                console.log(`      ❌ Error leyendo stats: ${error.message}`);
            }
        });
        
        return foundFiles[0]; // Devolver el primero encontrado
    } else {
        console.log('\n❌ No se encontró el archivo en ninguna ubicación.');
        console.log('\n💡 Sugerencias:');
        console.log('   1. Verifica que el archivo se llame exactamente "BASE DE DATOS ESTUDIANTES.xlsx"');
        console.log('   2. Colócalo en una de estas ubicaciones:');
        console.log(`      - ${path.join(userProfile, 'Documents')}`);
        console.log(`      - ${path.join(userProfile, 'Desktop')}`);
        console.log(`      - ${__dirname}`);
        
        // Listar archivos en Documents para ayudar
        try {
            const documentsPath = path.join(userProfile, 'Documents');
            if (fs.existsSync(documentsPath)) {
                console.log(`\n📁 Archivos en ${documentsPath}:`);
                const files = fs.readdirSync(documentsPath);
                const excelFiles = files.filter(f => f.toLowerCase().includes('estudiante') || f.toLowerCase().includes('base'));
                
                if (excelFiles.length > 0) {
                    console.log('   Archivos relacionados encontrados:');
                    excelFiles.forEach(file => {
                        console.log(`   - ${file}`);
                    });
                } else {
                    console.log('   No se encontraron archivos relacionados con "estudiantes" o "base"');
                }
            }
        } catch (error) {
            console.log('   No se pudo listar el contenido de Documents');
        }
        
        return null;
    }
}

// Ejecutar búsqueda
const foundFile = findStudentsFile();

if (foundFile) {
    console.log(`\n🎯 Archivo seleccionado: ${foundFile}`);
    console.log('\n💡 Ahora puedes ejecutar:');
    console.log('   node load-students-from-file.js');
} else {
    console.log('\n🔧 Una vez que coloques el archivo en la ubicación correcta, ejecuta:');
    console.log('   node load-students-from-file.js');
}