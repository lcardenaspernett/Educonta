// ===================================
// SCRIPT DE VERIFICACIÓN - VILLAS DE SAN PABLO
// ===================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function verifyVillasSanPablo() {
    console.log('🔍 Verificando configuración de Villas de San Pablo...\n');

    try {
        // 1. Verificar institución
        console.log('🏫 Verificando institución...');
        const institution = await prisma.institution.findUnique({
            where: { nit: '901079125-0' },
            include: {
                users: true,
                students: true,
                events: true
            }
        });

        if (!institution) {
            console.log('❌ Institución no encontrada');
            return false;
        }

        console.log('✅ Institución encontrada:');
        console.log(`   📛 Nombre: ${institution.name}`);
        console.log(`   🆔 ID: ${institution.id}`);
        console.log(`   📧 Email: ${institution.email}`);
        console.log(`   📞 Teléfono: ${institution.phone}`);
        console.log(`   📍 Dirección: ${institution.address}`);

        // 2. Verificar usuarios
        console.log('\n👥 Verificando usuarios...');
        const rector = institution.users.find(u => u.role === 'RECTOR');
        const contabilidad = institution.users.find(u => u.role === 'AUXILIARY_ACCOUNTANT');

        if (rector) {
            console.log('✅ Usuario Rector encontrado:');
            console.log(`   📧 Email: ${rector.email}`);
            console.log(`   👤 Nombre: ${rector.firstName} ${rector.lastName}`);
            console.log(`   🔑 Contraseña: VillasSP2024!`);
        } else {
            console.log('❌ Usuario Rector no encontrado');
        }

        if (contabilidad) {
            console.log('✅ Usuario Contabilidad encontrado:');
            console.log(`   📧 Email: ${contabilidad.email}`);
            console.log(`   👤 Nombre: ${contabilidad.firstName} ${contabilidad.lastName}`);
            console.log(`   🔑 Contraseña: ContaVSP2024!`);
        } else {
            console.log('❌ Usuario Contabilidad no encontrado');
        }

        // 3. Verificar eventos
        console.log('\n🎉 Verificando eventos...');
        console.log(`✅ Eventos encontrados: ${institution.events.length}`);
        institution.events.forEach(event => {
            console.log(`   📅 ${event.nombre} (${event.tipo}) - ${event.estado}`);
        });

        // 4. Verificar estudiantes
        console.log('\n👥 Verificando estudiantes...');
        console.log(`✅ Estudiantes encontrados: ${institution.students.length}`);
        
        if (institution.students.length > 0) {
            // Estadísticas por grado
            const gradeStats = await prisma.student.groupBy({
                by: ['grado'],
                where: { institutionId: institution.id },
                _count: { id: true }
            });

            console.log('📊 Estudiantes por grado:');
            gradeStats.forEach(stat => {
                console.log(`   ${stat.grado}°: ${stat._count.id} estudiantes`);
            });
        } else {
            console.log('⚠️  No hay estudiantes cargados aún');
            console.log('💡 Usa el script load-students-excel.js para cargar estudiantes');
        }

        // 5. Generar enlaces de acceso
        console.log('\n🔗 ENLACES DE ACCESO:');
        console.log('=====================================');
        console.log(`🌐 Login: http://localhost:3000/login.html`);
        console.log(`🏫 Dashboard Rector: http://localhost:3000/rector-dashboard.html?institutionId=${institution.id}`);
        console.log(`💰 Dashboard Contable: http://localhost:3000/accounting-dashboard.html?institutionId=${institution.id}`);
        console.log(`🎉 Gestión Eventos: http://localhost:3000/events-management.html?institutionId=${institution.id}`);
        console.log(`👥 Gestión Estudiantes: http://localhost:3000/students-management.html?institutionId=${institution.id}`);

        // 6. Verificar conectividad de login
        console.log('\n🔐 Verificando credenciales...');
        
        // Verificar contraseña del rector
        const rectorPasswordValid = await bcrypt.compare('VillasSP2024!', rector.password);
        console.log(`✅ Contraseña Rector: ${rectorPasswordValid ? 'Válida' : 'Inválida'}`);
        
        // Verificar contraseña de contabilidad
        const contabilidadPasswordValid = await bcrypt.compare('ContaVSP2024!', contabilidad.password);
        console.log(`✅ Contraseña Contabilidad: ${contabilidadPasswordValid ? 'Válida' : 'Inválida'}`);

        // 7. Instrucciones finales
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('=====================================');
        console.log('1. 🚀 Inicia el servidor: npm start');
        console.log('2. 🌐 Ve a: http://localhost:3000/login.html');
        console.log('3. 🔑 Usa las credenciales mostradas arriba');
        console.log('4. 📊 Carga estudiantes con: node scripts/load-students-excel.js archivo.xlsx ' + institution.id);
        console.log('5. 🎉 ¡Disfruta del sistema!');

        return true;

    } catch (error) {
        console.error('❌ Error verificando configuración:', error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    verifyVillasSanPablo()
        .then((success) => {
            if (success) {
                console.log('\n✅ Verificación completada exitosamente');
            } else {
                console.log('\n❌ Verificación falló');
            }
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('❌ Error en la verificación:', error);
            process.exit(1);
        });
}

module.exports = { verifyVillasSanPablo };