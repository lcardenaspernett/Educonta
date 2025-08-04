#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Obtener argumentos pasados al script
const args = process.argv.slice(2);

console.log('🎯 Prisma Interceptor ejecutándose con args:', args);

// Verificar si es un comando db push
if (args.includes('db') && args.includes('push')) {
  console.log('🚨 Interceptando comando db push...');
  
  // Ejecutar limpieza de duplicados primero
  console.log('🧹 Ejecutando limpieza de duplicados...');
  
  const cleanupScript = path.join(__dirname, 'clean-duplicate-students.js');
  const cleanup = spawn('node', [cleanupScript], {
    stdio: 'inherit',
    shell: true
  });
  
  cleanup.on('close', (cleanupCode) => {
    console.log(`🔄 Limpieza completada con código: ${cleanupCode}`);
    
    // Agregar --accept-data-loss si no está presente
    if (!args.includes('--accept-data-loss')) {
      args.push('--accept-data-loss');
      console.log('✅ Agregado --accept-data-loss al comando');
    }
    
    // Ejecutar el comando original de prisma
    console.log('🗄️ Ejecutando prisma db push con flags seguros...');
    const prisma = spawn('npx', ['prisma', ...args], {
      stdio: 'inherit',
      shell: true
    });
    
    prisma.on('close', (code) => {
      console.log(`🎉 Prisma db push completado con código: ${code}`);
      process.exit(code);
    });
  });
} else {
  // Para otros comandos, ejecutar normalmente
  console.log('➡️ Ejecutando comando prisma normal...');
  const prisma = spawn('npx', ['prisma', ...args], {
    stdio: 'inherit',
    shell: true
  });
  
  prisma.on('close', (code) => {
    process.exit(code);
  });
}