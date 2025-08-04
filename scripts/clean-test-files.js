// ===================================
// EDUCONTA - Limpiar Archivos de Prueba
// ===================================

const fs = require('fs');
const path = require('path');

const testFilesToDelete = [
    'public/demo-data-simple.js',
    'public/test-demo-data.html',
    'public/test-clients-simple.html',
    'public/diagnostico-carga-datos.js',
    'public/diagnostico-opcional.js',
    'public/test-modals-mejorados.html',
    'public/debug-view-transaction.js',
    'public/test-modal-simple.js',
    'public/test-invoice-button.js',
    'test-invoice-button.js',
    'public/diagnostico-movimientos.js',
    'test-buttons-simple.html',
    'diagnostico-movimientos.js',
    'test-movements-buttons.js',
    'verificar-facturas.js',
    'mejora-facturas-pendientes.js',
    'test-expense-calculation.js',
    'test-stats-api.js'
];

console.log('🧹 Eliminando archivos de prueba innecesarios...\n');

let deletedCount = 0;
let notFoundCount = 0;

testFilesToDelete.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            fs.unlinkSync(file);
            console.log(`✅ Eliminado: ${file}`);
            deletedCount++;
        } catch (error) {
            console.error(`❌ Error eliminando ${file}:`, error.message);
        }
    } else {
        console.log(`⚠️ No encontrado: ${file}`);
        notFoundCount++;
    }
});

console.log(`\n📊 RESUMEN:`);
console.log(`✅ Archivos eliminados: ${deletedCount}`);
console.log(`⚠️ Archivos no encontrados: ${notFoundCount}`);
console.log(`\n🎉 Limpieza de archivos de prueba completada`);