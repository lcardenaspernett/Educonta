#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

console.log('🔧 Removiendo temporalmente restricción única...');

// Leer el schema
let schema = fs.readFileSync(schemaPath, 'utf8');

// Comentar la restricción única
const originalLine = '  @@unique([institutionId, documento])';
const commentedLine = '  // @@unique([institutionId, documento]) // Temporalmente comentado para deployment';

if (schema.includes(originalLine)) {
  schema = schema.replace(originalLine, commentedLine);
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Restricción única comentada temporalmente');
} else {
  console.log('ℹ️ Restricción única ya está comentada o no encontrada');
}

console.log('🎯 Schema modificado para deployment seguro');