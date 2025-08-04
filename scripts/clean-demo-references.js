// ===================================
// EDUCONTA - Limpiar Referencias a DemoData
// ===================================

const fs = require('fs');
const path = require('path');

const filesToClean = [
    'public/js/accounting/clients-page.js',
    'public/js/accounting/movements-page.js',
    'public/js/accounting/forms.js',
    'public/js/accounting/state.js',
    'public/js/accounting/navigation.js',
    'public/js/accounting/notification-system.js',
    'public/js/accounting/approval-status.js'
];

function cleanFile(filePath) {
    console.log(`🧹 Limpiando ${filePath}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Reemplazos comunes
        content = content.replace(/window\.DemoData/g, 'null');
        content = content.replace(/DemoData/g, 'null');
        
        // Comentar bloques que usan DemoData
        content = content.replace(
            /if \(window\.DemoData[^}]+}/g, 
            '// DemoData removido - usar API real'
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filePath} limpiado`);
        
    } catch (error) {
        console.error(`❌ Error limpiando ${filePath}:`, error.message);
    }
}

console.log('🧹 Iniciando limpieza de referencias a DemoData...\n');

filesToClean.forEach(file => {
    if (fs.existsSync(file)) {
        cleanFile(file);
    } else {
        console.log(`⚠️ Archivo no encontrado: ${file}`);
    }
});

console.log('\n✅ Limpieza completada');
console.log('💡 Revisa los archivos manualmente para ajustes específicos');