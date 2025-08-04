// ===================================
// EDUCONTA - Validar JavaScript en HTML
// ===================================

const fs = require('fs');

function validateJavaScriptInHTML(filePath) {
    console.log(`🔍 Validando JavaScript en ${filePath}...`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extraer bloques de JavaScript
        const scriptBlocks = [];
        const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        
        while ((match = scriptRegex.exec(content)) !== null) {
            if (match[1].trim()) {
                scriptBlocks.push({
                    content: match[1],
                    start: content.substring(0, match.index).split('\n').length
                });
            }
        }
        
        console.log(`📋 Encontrados ${scriptBlocks.length} bloques de JavaScript`);
        
        // Validar cada bloque
        let hasErrors = false;
        scriptBlocks.forEach((block, index) => {
            try {
                // Intentar parsear el JavaScript
                new Function(block.content);
                console.log(`✅ Bloque ${index + 1}: Sintaxis válida`);
            } catch (error) {
                hasErrors = true;
                console.error(`❌ Bloque ${index + 1} (línea ~${block.start}): ${error.message}`);
                
                // Mostrar las primeras líneas del bloque problemático
                const lines = block.content.split('\n').slice(0, 5);
                console.log('📝 Primeras líneas del bloque:');
                lines.forEach((line, i) => {
                    console.log(`   ${i + 1}: ${line}`);
                });
                console.log('   ...\n');
            }
        });
        
        if (!hasErrors) {
            console.log('🎉 Todos los bloques de JavaScript tienen sintaxis válida');
        }
        
        return !hasErrors;
        
    } catch (error) {
        console.error('❌ Error leyendo archivo:', error.message);
        return false;
    }
}

// Ejecutar validación
const filePath = process.argv[2] || 'public/accounting-dashboard.html';
validateJavaScriptInHTML(filePath);