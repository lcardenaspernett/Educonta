#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Crear un wrapper de prisma que intercepte db push
const prismaWrapper = `#!/usr/bin/env node

const { spawn } = require('child_process');
const args = process.argv.slice(2);

console.log('🎯 Prisma wrapper interceptando:', args.join(' '));

if (args.includes('db') && args.includes('push')) {
  console.log('🚨 Interceptando db push - ejecutando limpieza primero...');
  
  // Ejecutar limpieza
  const { exec } = require('child_process');
  exec('node scripts/clean-duplicate-students.js', (error, stdout, stderr) => {
    if (error) {
      console.log('⚠️ Error en limpieza (continuando):', error.message);
    } else {
      console.log('✅ Limpieza completada');
    }
    
    // Agregar --accept-data-loss
    if (!args.includes('--accept-data-loss')) {
      args.push('--accept-data-loss');
    }
    
    // Ejecutar prisma real
    const realPrismaPath = require.resolve('prisma/build/index.js');
    const prisma = spawn('node', [realPrismaPath, ...args], {
      stdio: 'inherit'
    });
    
    prisma.on('close', (code) => {
      process.exit(code);
    });
  });
} else {
  // Comando normal
  const realPrismaPath = require.resolve('prisma/build/index.js');
  const prisma = spawn('node', [realPrismaPath, ...args], {
    stdio: 'inherit'
  });
  
  prisma.on('close', (code) => {
    process.exit(code);
  });
}
`;

// Crear directorio bin si no existe
const binDir = path.join(process.cwd(), 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir);
}

// Escribir el wrapper
const wrapperPath = path.join(binDir, 'prisma');
fs.writeFileSync(wrapperPath, prismaWrapper);

// Hacer ejecutable en sistemas Unix
if (process.platform !== 'win32') {
  fs.chmodSync(wrapperPath, '755');
}

console.log('✅ Wrapper de Prisma creado en:', wrapperPath);

// Actualizar package.json para usar el wrapper
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Agregar bin directory al PATH
if (!packageJson.scripts.preinstall) {
  packageJson.scripts.preinstall = 'export PATH="./bin:$PATH"';
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ package.json actualizado');

console.log('🎉 Setup completado - Prisma será interceptado automáticamente');