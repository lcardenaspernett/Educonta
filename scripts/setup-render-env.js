#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Crear un script que modifique el comando de Prisma
const prismaWrapper = `#!/usr/bin/env node

const { spawn } = require('child_process');

// Interceptar comandos de prisma db push
const args = process.argv.slice(2);

if (args.includes('db') && args.includes('push')) {
  console.log('🎯 Interceptando prisma db push...');
  
  // Agregar --accept-data-loss si no está presente
  if (!args.includes('--accept-data-loss')) {
    args.push('--accept-data-loss');
    console.log('✅ Agregado --accept-data-loss');
  }
}

// Ejecutar el comando original de prisma
const prisma = spawn('npx', ['prisma', ...args], {
  stdio: 'inherit',
  shell: true
});

prisma.on('close', (code) => {
  process.exit(code);
});
`;

// Escribir el wrapper
fs.writeFileSync(path.join(__dirname, '..', 'prisma-wrapper.js'), prismaWrapper);
console.log('✅ Wrapper de Prisma creado');

// Hacer ejecutable
if (process.platform !== 'win32') {
  fs.chmodSync(path.join(__dirname, '..', 'prisma-wrapper.js'), '755');
}

console.log('🎉 Setup de Render completado');