// ===================================
// EDUCONTA - Unificar Sidebars
// ===================================

const fs = require('fs');
const path = require('path');

const pagesToUpdate = [
    'public/students-management.html',
    'public/clients-management.html', 
    'public/debts-management.html',
    'public/events-management.html',
    'public/movements-management.html',
    'public/accounting-dashboard.html'
];

const unifiedSidebarHTML = `        <!-- SIDEBAR UNIFICADO -->
        <aside class="sidebar">
            <!-- El contenido se cargará dinámicamente con sidebar.js -->
        </aside>`;

const unifiedScripts = `    <!-- Scripts -->
    <script src="js/shared/sidebar.js"></script>`;

function updatePage(filePath) {
    console.log(`🔄 Actualizando ${filePath}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Reemplazar sidebar complejo o simple con el unificado
        content = content.replace(
            /<aside class="sidebar">[\s\S]*?<\/aside>/,
            unifiedSidebarHTML
        );
        
        // Eliminar funciones duplicadas de tema y logout
        content = content.replace(
            /function toggleTheme\(\)[\s\S]*?}\s*function logout\(\)[\s\S]*?}\s*\/\/ Cargar tema guardado[\s\S]*?}\s*\);\s*<\/script>/,
            ''
        );
        
        // Eliminar JavaScript de sidebar complejo
        content = content.replace(
            /function initializeSidebar\(\)[\s\S]*?initializeSidebar\(\);\s*<\/script>/,
            ''
        );
        
        // Agregar script unificado si no existe
        if (!content.includes('js/shared/sidebar.js')) {
            content = content.replace(
                /<\/body>/,
                `    <script src="js/shared/sidebar.js"></script>\n</body>`
            );
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filePath} actualizado`);
        
    } catch (error) {
        console.error(`❌ Error actualizando ${filePath}:`, error.message);
    }
}

console.log('🚀 Iniciando unificación de sidebars...\n');

pagesToUpdate.forEach(page => {
    if (fs.existsSync(page)) {
        updatePage(page);
    } else {
        console.log(`⚠️ Archivo no encontrado: ${page}`);
    }
});

console.log('\n🎉 Unificación completada');
console.log('📋 Todas las páginas ahora usan el sidebar unificado');
console.log('🔧 Recuerda probar cada página para verificar que funcione correctamente');