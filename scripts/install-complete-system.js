#!/usr/bin/env node

/**
 * Script de instalación completa del sistema Educonta
 * Configura la base de datos, carga datos de prueba y verifica el funcionamiento
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 EDUCONTA - Instalación Completa del Sistema');
console.log('='.repeat(50));

async function runCommand(command, description) {
    console.log(`\n📋 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completado`);
    } catch (error) {
        console.error(`❌ Error en ${description}:`, error.message);
        throw error;
    }
}

async function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${description}: ${filePath}`);
        return true;
    } else {
        console.log(`❌ ${description} no encontrado: ${filePath}`);
        return false;
    }
}

async function installCompleteSystem() {
    try {
        console.log('\n🔍 Verificando archivos del sistema...');
        
        // Verificar archivos críticos
        const criticalFiles = [
            { path: 'prisma/schema.prisma', desc: 'Schema de Prisma' },
            { path: 'templates/estudiantes-plantilla.csv', desc: 'Plantilla CSV de estudiantes' },
            { path: 'controllers/eventsController.js', desc: 'Controlador de eventos' },
            { path: 'controllers/csvController.js', desc: 'Controlador de CSV' },
            { path: 'routes/events.js', desc: 'Rutas de eventos' },
            { path: 'routes/csv.js', desc: 'Rutas de CSV' },
            { path: 'public/students-csv-management.html', desc: 'Página de gestión de estudiantes' },
            { path: 'public/js/students-csv-manager.js', desc: 'JavaScript de gestión de estudiantes' }
        ];

        let allFilesExist = true;
        for (const file of criticalFiles) {
            if (!await checkFile(file.path, file.desc)) {
                allFilesExist = false;
            }
        }

        if (!allFilesExist) {
            console.log('\n❌ Faltan archivos críticos. Por favor, asegúrate de que todos los archivos estén presentes.');
            process.exit(1);
        }

        console.log('\n🎯 Iniciando instalación paso a paso...');

        // 1. Instalar dependencias
        await runCommand('npm install', 'Instalando dependencias de Node.js');

        // 2. Generar cliente de Prisma
        await runCommand('npx prisma generate', 'Generando cliente de Prisma');

        // 3. Aplicar migraciones de base de datos
        console.log('\n📊 Configurando base de datos...');
        try {
            await runCommand('npx prisma db push', 'Aplicando schema a la base de datos');
        } catch (error) {
            console.log('⚠️ Error aplicando schema, intentando reset...');
            await runCommand('npx prisma db push --force-reset', 'Reseteando y aplicando schema');
        }

        // 4. Ejecutar migración de estudiantes
        await runCommand('node scripts/migrate-students.js', 'Cargando estudiantes de prueba desde CSV');

        // 5. Verificar estructura de directorios
        console.log('\n📁 Verificando estructura de directorios...');
        const directories = ['uploads', 'uploads/csv'];
        for (const dir of directories) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`✅ Directorio creado: ${dir}`);
            } else {
                console.log(`✅ Directorio existe: ${dir}`);
            }
        }

        // 6. Verificar variables de entorno
        console.log('\n🔧 Verificando configuración...');
        if (!fs.existsSync('.env')) {
            console.log('⚠️ Archivo .env no encontrado, creando uno básico...');
            const envContent = `# Educonta Environment Variables
DATABASE_URL="postgresql://username:password@localhost:5432/educonta"
JWT_SECRET="educonta-super-secret-key-change-in-production"
NODE_ENV="development"
PORT=3000
`;
            fs.writeFileSync('.env', envContent);
            console.log('✅ Archivo .env creado con configuración básica');
            console.log('⚠️ IMPORTANTE: Actualiza DATABASE_URL con tus credenciales de PostgreSQL');
        } else {
            console.log('✅ Archivo .env encontrado');
        }

        // 7. Verificar conexión a base de datos
        console.log('\n🔌 Verificando conexión a base de datos...');
        try {
            await runCommand('npx prisma db seed', 'Ejecutando seed de datos adicionales');
        } catch (error) {
            console.log('⚠️ Seed opcional falló, continuando...');
        }

        // 8. Mostrar resumen de instalación
        console.log('\n📊 RESUMEN DE INSTALACIÓN');
        console.log('='.repeat(30));
        console.log('✅ Dependencias instaladas');
        console.log('✅ Base de datos configurada');
        console.log('✅ Estudiantes de prueba cargados');
        console.log('✅ Estructura de directorios creada');
        console.log('✅ Archivos de configuración verificados');

        console.log('\n🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE!');
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('1. Actualiza el archivo .env con tu DATABASE_URL');
        console.log('2. Ejecuta: npm start');
        console.log('3. Abre: http://localhost:3000');
        console.log('4. Ve a: http://localhost:3000/students-csv-management.html');
        console.log('5. Prueba cargar más estudiantes con la plantilla CSV');

        console.log('\n🔗 PÁGINAS DISPONIBLES:');
        console.log('• Gestión de Estudiantes: /students-csv-management.html');
        console.log('• Gestión de Eventos: /events-management.html');
        console.log('• Dashboard Contable: /accounting-dashboard.html');

        console.log('\n📁 ARCHIVOS IMPORTANTES:');
        console.log('• Plantilla CSV: templates/estudiantes-plantilla.csv');
        console.log('• Logs del servidor: Consola al ejecutar npm start');

        console.log('\n🧪 PARA PROBAR EL SISTEMA:');
        console.log('1. Descarga la plantilla CSV desde la interfaz');
        console.log('2. Modifica los datos según tus necesidades');
        console.log('3. Carga el archivo CSV modificado');
        console.log('4. Crea eventos y asigna estudiantes');
        console.log('5. Registra pagos y genera reportes');

    } catch (error) {
        console.error('\n💥 ERROR EN LA INSTALACIÓN:', error.message);
        console.log('\n🔧 SOLUCIÓN DE PROBLEMAS:');
        console.log('1. Verifica que PostgreSQL esté ejecutándose');
        console.log('2. Actualiza DATABASE_URL en .env');
        console.log('3. Ejecuta: npm install');
        console.log('4. Ejecuta: npx prisma db push');
        console.log('5. Ejecuta: node scripts/migrate-students.js');
        process.exit(1);
    }
}

// Ejecutar instalación
if (require.main === module) {
    installCompleteSystem()
        .then(() => {
            console.log('\n🎯 Script de instalación finalizado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error en la instalación:', error);
            process.exit(1);
        });
}

module.exports = { installCompleteSystem };