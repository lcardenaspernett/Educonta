// ===================================
// SCRIPT PARA CREAR INSTITUCIÓN VILLAS DE SAN PABLO
// ===================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createVillasSanPablo() {
    console.log('🏫 Creando Institución Educativa Distrital Villas de San Pablo...');

    try {
        // 1. Verificar si la institución ya existe
        console.log('🔍 Verificando si la institución ya existe...');
        let institution = await prisma.institution.findUnique({
            where: { nit: '901079125-0' }
        });

        if (institution) {
            console.log('✅ Institución ya existe:', institution.name);
        } else {
            // Crear la institución con datos oficiales
            console.log('📝 Creando institución con datos oficiales...');
            institution = await prisma.institution.create({
                data: {
                    name: 'Institución Educativa Distrital Villas de San Pablo',
                    nit: '901079125-0',
                    address: 'Diagonal 136 Nº 9D-60, Barrio Villas de San Pablo',
                    city: 'Barranquilla',
                    department: 'Atlántico',
                    country: 'Colombia',
                    phone: '313 537 40 16',
                    email: 'yasminricodc@gmail.com',
                    educationLevel: 'MIXTA', // Preescolar, Básica Primaria, Básica Secundaria y Media
                    isActive: true
                }
            });
            console.log('✅ Institución creada:', institution.name);
        }

        // 2. Verificar y crear usuario rector
        console.log('👨‍💼 Verificando usuario rector...');
        let rector = await prisma.user.findUnique({
            where: { email: 'rector@villasanpablo.edu.co' }
        });

        if (rector) {
            console.log('✅ Usuario rector ya existe:', rector.email);
        } else {
            const rectorPassword = await bcrypt.hash('VillasSP2024!', 10);
            
            rector = await prisma.user.create({
                data: {
                    email: 'rector@villasanpablo.edu.co',
                    password: rectorPassword,
                    firstName: 'Yasmin',
                    lastName: 'Rico',
                    role: 'RECTOR',
                    institutionId: institution.id,
                    isActive: true
                }
            });
            console.log('✅ Usuario rector creado:', rector.email);
        }

        // 3. Verificar y crear usuario contabilidad
        console.log('💰 Verificando usuario contabilidad...');
        let contabilidad = await prisma.user.findUnique({
            where: { email: 'contabilidad@villasanpablo.edu.co' }
        });

        if (contabilidad) {
            console.log('✅ Usuario contabilidad ya existe:', contabilidad.email);
        } else {
            const contabilidadPassword = await bcrypt.hash('ContaVSP2024!', 10);
            
            contabilidad = await prisma.user.create({
                data: {
                    email: 'contabilidad@villasanpablo.edu.co',
                    password: contabilidadPassword,
                    firstName: 'Auxiliar',
                    lastName: 'Contable',
                    role: 'AUXILIARY_ACCOUNTANT',
                    institutionId: institution.id,
                    isActive: true
                }
            });
            console.log('✅ Usuario contabilidad creado:', contabilidad.email);
        }

        console.log('✅ Usuarios creados correctamente');

        // 4. Crear algunos eventos de ejemplo
        console.log('🎉 Creando eventos de ejemplo...');
        
        const sampleEvents = [
            {
                nombre: 'Rifa Navideña 2024',
                tipo: 'raffle',
                descripcion: 'Rifa navideña para recaudar fondos para mejoras de la institución',
                fechaInicio: new Date('2024-12-01'),
                fechaFin: new Date('2024-12-24'),
                metaRecaudacion: 5000000,
                estado: 'active',
                precioBoletaRifa: 10000,
                maxBoletasRifa: 500
            },
            {
                nombre: 'Derecho a Grado 2024-2',
                tipo: 'graduation',
                descripcion: 'Cobro de derechos de grado para estudiantes de grado 11°',
                fechaInicio: new Date('2024-11-01'),
                fechaFin: new Date('2024-11-30'),
                metaRecaudacion: 15000000,
                estado: 'planning',
                valorDerecho: 200000
            },
            {
                nombre: 'Bingo Familiar Marzo',
                tipo: 'bingo',
                descripcion: 'Bingo familiar para recaudar fondos para actividades estudiantiles',
                fechaInicio: new Date('2025-03-15'),
                fechaFin: new Date('2025-03-15'),
                metaRecaudacion: 2000000,
                estado: 'planning',
                precioCartonBingo: 5000,
                maxCartonesBingo: 400
            }
        ];

        for (const eventData of sampleEvents) {
            await prisma.event.create({
                data: {
                    ...eventData,
                    institutionId: institution.id,
                    montoRecaudado: 0
                }
            });
        }

        console.log('✅ Eventos de ejemplo creados');

        // 5. Mostrar resumen
        console.log('\n🎉 ¡INSTITUCIÓN CREADA EXITOSAMENTE!');
        console.log('=====================================');
        console.log(`🏫 Institución: ${institution.name}`);
        console.log(`📧 Email institucional: ${institution.email}`);
        console.log(`🆔 ID de institución: ${institution.id}`);
        console.log('\n👥 USUARIOS CREADOS:');
        console.log('=====================================');
        console.log(`👨‍💼 Rector:`);
        console.log(`   📧 Email: ${rector.email}`);
        console.log(`   🔑 Contraseña: VillasSP2024!`);
        console.log(`   👤 Nombre: ${rector.firstName} ${rector.lastName}`);
        console.log(`\n💰 Contabilidad:`);
        console.log(`   📧 Email: ${contabilidad.email}`);
        console.log(`   🔑 Contraseña: ContaVSP2024!`);
        console.log(`   👤 Nombre: ${contabilidad.firstName} ${contabilidad.lastName}`);
        
        console.log('\n📊 INFORMACIÓN INSTITUCIONAL:');
        console.log('=====================================');
        console.log(`🏫 NIT: 901.079.125-0`);
        console.log(`📍 Dirección: Diagonal 136 Nº 9D-60`);
        console.log(`🏘️ Barrio: Villas de San Pablo`);
        console.log(`🌍 Localidad: Occidental`);
        console.log(`📞 Teléfono: 313 537 40 16`);
        console.log(`🏛️ Código DANE: 108001800065`);
        console.log(`📜 Resolución: 06584 de 23 junio de 2017`);
        console.log(`📚 Niveles: Preescolar, Básica Primaria, Básica Secundaria y Media`);
        console.log(`🎓 Título: Bachiller Académico`);
        console.log(`📅 Calendario: A - Jornada: Única`);
        console.log(`🎉 Eventos de ejemplo: 3 eventos creados`);
        
        console.log('\n🔗 ENLACES DE ACCESO:');
        console.log('=====================================');
        console.log(`🌐 Login: http://localhost:3000/login.html`);
        console.log(`🏫 Dashboard Rector: http://localhost:3000/rector-dashboard.html?institutionId=${institution.id}`);
        console.log(`💰 Dashboard Contable: http://localhost:3000/accounting-dashboard.html?institutionId=${institution.id}`);
        console.log(`🎉 Gestión Eventos: http://localhost:3000/events-management.html?institutionId=${institution.id}`);
        console.log(`👥 Gestión Estudiantes: http://localhost:3000/students-management.html?institutionId=${institution.id}`);

        return {
            institution,
            rector,
            contabilidad
        };

    } catch (error) {
        console.error('❌ Error creando institución:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    createVillasSanPablo()
        .then(() => {
            console.log('\n✅ Proceso completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en el proceso:', error);
            process.exit(1);
        });
}

module.exports = { createVillasSanPablo };