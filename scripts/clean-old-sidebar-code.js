// ===================================
// EDUCONTA - Limpiar Código Antiguo del Sidebar
// ===================================

const fs = require('fs');

const filesToClean = [
    'public/accounting-dashboard.html',
    'public/movements-management.html'
];

function cleanFile(filePath) {
    console.log(`🧹 Limpiando ${filePath}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Eliminar CSS del sidebar complejo
        content = content.replace(
            /\/\* Sidebar Navigation Improvements \*\/[\s\S]*?\.nav-subitem svg \{[\s\S]*?\}/,
            '/* CSS del sidebar complejo removido - ahora usa sidebar unificado */'
        );
        
        // Eliminar función initializeSidebar completa
        content = content.replace(
            /\/\/ SIDEBAR MANAGEMENT[\s\S]*?function initializeSidebar\(\)[\s\S]*?\}\s*}/,
            '// Función de sidebar removida - ahora usa sidebar unificado'
        );
        
        // Eliminar cualquier referencia restante a nav-group, nav-parent, etc.
        content = content.replace(/\.nav-group[^}]*}/g, '');
        content = content.replace(/\.nav-parent[^}]*}/g, '');
        content = content.replace(/\.nav-subitem[^}]*}/g, '');
        content = content.replace(/\.nav-submenu[^}]*}/g, '');
        content = content.replace(/\.nav-arrow[^}]*}/g, '');
        
        // Limpiar líneas vacías múltiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filePath} limpiado`);
        
    } catch (error) {
        console.error(`❌ Error limpiando ${filePath}:`, error.message);
    }
}

console.log('🧹 Limpiando código antiguo del sidebar...\n');

filesToClean.forEach(file => {
    if (fs.existsSync(file)) {
        cleanFile(file);
    } else {
        console.log(`⚠️ Archivo no encontrado: ${file}`);
    }
});

console.log('\n✅ Limpieza completada');
console.log('🔄 Ejecuta verify-unified-sidebars.js para verificar');