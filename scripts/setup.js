#!/usr/bin/env node

/**
 * Script de inicialización para Educonta
 * Configura el proyecto automáticamente
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando configuración de Educonta...\n');

// Verificar si Node.js está instalado
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js detectado: ${nodeVersion}`);
} catch (error) {
    console.error('❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/');
    process.exit(1);
}

// Verificar si npm está instalado
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm detectado: ${npmVersion}`);
} catch (error) {
    console.error('❌ npm no está disponible.');
    process.exit(1);
}

// Crear archivo .env si no existe
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Archivo .env creado desde .env.example');
        console.log('⚠️  IMPORTANTE: Configura las variables de entorno en .env');
    } else {
        console.log('⚠️  Archivo .env.example no encontrado');
    }
} else {
    console.log('✅ Archivo .env ya existe');
}

// Instalar dependencias
console.log('\n📦 Instalando dependencias...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencias instaladas correctamente');
} catch (error) {
    console.error('❌ Error instalando dependencias:', error.message);
    process.exit(1);
}

// Verificar si Prisma está configurado
console.log('\n🗄️  Configurando base de datos...');
try {
    // Generar cliente Prisma
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma generado');
    
    // Intentar ejecutar migraciones (solo si la DB está disponible)
    try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migraciones ejecutadas');
        
        // Ejecutar seeding
        execSync('npx prisma db seed', { stdio: 'inherit' });
        console.log('✅ Datos iniciales cargados');
    } catch (dbError) {
        console.log('⚠️  Base de datos no disponible. Configura DATABASE_URL en .env');
        console.log('   Luego ejecuta: npm run db:setup');
    }
} catch (error) {
    console.error('❌ Error configurando Prisma:', error.message);
}

// Crear directorios necesarios
const directories = ['uploads', 'logs', 'temp'];
directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Directorio ${dir}/ creado`);
    }
});

// Mostrar información final
console.log('\n🎉 ¡Configuración completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Configura las variables de entorno en .env');
console.log('2. Configura tu base de datos PostgreSQL');
console.log('3. Ejecuta: npm run db:setup (si no se ejecutó automáticamente)');
console.log('4. Inicia el servidor: npm run dev');
console.log('\n🌐 El servidor estará disponible en: http://localhost:3000');
console.log('\n📚 Documentación completa en README.md');

// Mostrar credenciales por defecto
console.log('\n🔑 Credenciales por defecto:');
console.log('Super Admin: admin@educonta.com / Admin123!');
console.log('Rector Demo: rector@colegiosanjose.edu.co / Rector123!');
console.log('Contabilidad Demo: contabilidad@colegiosanjose.edu.co / Conta123!');

console.log('\n✨ ¡Listo para usar Educonta!');