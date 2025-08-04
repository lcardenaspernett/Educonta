// ===================================
// EDUCONTA - Verificar Sidebars Unificados
// ===================================

const fs = require('fs');

const pagesToCheck = [
    'public/accounting-dashboard.html',
    'public/students-management.html',
    'public/clients-management.html', 
    'public/debts-management.html',
    'public/events-management.html',
    'public/movements-management.html',
    'public/invoices.html'
];

function checkPage(filePath) {
    console.log(`🔍 Verificando ${filePath}...`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const checks = {
            hasUnifiedSidebar: content.includes('<!-- El contenido se cargará dinámicamente con sidebar.js -->'),
            hasSidebarScript: content.includes('js/shared/sidebar.js'),
            hasOldNavGroup: content.includes('nav-group'),
            hasOldNavParent: content.includes('nav-parent'),
            hasOldInitFunction: content.includes('initializeSidebar()')
        };
        
        let status = '✅';
        let issues = [];
        
        if (!checks.hasUnifiedSidebar) {
            status = '❌';
            issues.push('No tiene sidebar unificado');
        }
        
        if (!checks.hasSidebarScript) {
            status = '⚠️';
            issues.push('Falta script sidebar.js');
        }
        
        if (checks.hasOldNavGroup || checks.hasOldNavParent) {
            status = '⚠️';
            issues.push('Contiene CSS/HTML del sidebar antiguo');
        }
        
        if (checks.hasOldInitFunction) {
            status = '⚠️';
            issues.push('Contiene función initializeSidebar antigua');
        }
        
        console.log(`${status} ${filePath}`);
        if (issues.length > 0) {
            issues.forEach(issue => console.log(`   - ${issue}`));
        }
        
        return status === '✅';
        
    } catch (error) {
        console.error(`❌ Error leyendo ${filePath}:`, error.message);
        return false;
    }
}

console.log('🔍 Verificando sidebars unificados...\n');

let allGood = true;
pagesToCheck.forEach(page => {
    if (fs.existsSync(page)) {
        const isGood = checkPage(page);
        if (!isGood) allGood = false;
    } else {
        console.log(`⚠️ Archivo no encontrado: ${page}`);
        allGood = false;
    }
});

console.log('\n📊 RESUMEN:');
if (allGood) {
    console.log('🎉 Todos los sidebars están unificados correctamente');
    console.log('✅ El sistema debería tener navegación consistente');
} else {
    console.log('⚠️ Algunos archivos necesitan correcciones');
    console.log('🔧 Revisa los issues reportados arriba');
}

console.log('\n💡 PRÓXIMOS PASOS:');
console.log('1. Probar cada página en el navegador');
console.log('2. Verificar que el menú activo se marque correctamente');
console.log('3. Confirmar que todos los enlaces funcionen');