#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

console.log('🔧 Restaurando restricción única...');

// Leer el schema
let schema = fs.readFileSync(schemaPath, 'utf8');

// Restaurar la restricción única
const commentedLine = '  // @@unique([institutionId, documento]) // Temporalmente comentado para deployment';
const originalLine = '  @@unique([institutionId, documento])';

if (schema.includes(commentedLine)) {
  schema = schema.replace(commentedLine, originalLine);
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Restricción única restaurada');
} else {
  console.log('ℹ️ Restricción única ya está activa o no encontrada');
}

console.log('🎯 Schema restaurado a estado normal');