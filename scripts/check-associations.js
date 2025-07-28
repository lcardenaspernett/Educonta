const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAssociations() {
    try {
        console.log('🔍 VERIFICANDO ASOCIACIONES USUARIO-INSTITUCIÓN\n');
        
        // Ver todas las instituciones
        const institutions = await prisma.institution.findMany({
            select: { id: true, name: true, nit: true, isActive: true }
        });
        
        console.log('📚 INSTITUCIONES DISPONIBLES:');
        institutions.forEach(inst => {
            console.log(`  - ${inst.name} (NIT: ${inst.nit}) - ${inst.isActive ? 'ACTIVA' : 'INACTIVA'}`);
        });
        console.log('');
        
        // Ver usuarios con sus asociaciones
        const usersWithInstitutions = await prisma.user.findMany({
            include: {
                institution: {
                    select: { id: true, name: true, nit: true, isActive: true }
                }
            },
            orderBy: { role: 'asc' }
        });
        
        console.log('👥 USUARIOS Y SUS ASOCIACIONES:');
        usersWithInstitutions.forEach(user => {
            const status = getAssociationStatus(user);
            console.log(`  ${status.emoji} ${user.email}`);
            console.log(`     Nombre: ${user.firstName} ${user.lastName}`);
            console.log(`     Rol: ${user.role}`);
            console.log(`     Institución: ${user.institution ? user.institution.name : 'NINGUNA'}`);
            console.log(`     Estado: ${status.message}`);
            console.log('');
        });
        
        // Verificar rectores específicamente
        const rectores = usersWithInstitutions.filter(u => u.role === 'RECTOR');
        console.log('🎓 ANÁLISIS DE RECTORES:');
        
        if (rectores.length === 0) {
            console.log('  ⚠️  No hay rectores en el sistema');
        } else {
            rectores.forEach(rector => {
                if (!rector.institution) {
                    console.log(`  ❌ ${rector.email} - RECTOR SIN INSTITUCIÓN ASIGNADA`);
                } else {
                    console.log(`  ✅ ${rector.email} - Rector de ${rector.institution.name}`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

function getAssociationStatus(user) {
    if (user.role === 'SUPER_ADMIN') {
        if (!user.institution) {
            return { emoji: '✅', message: 'Correcto - Super Admin sin institución específica' };
        } else {
            return { emoji: '⚠️', message: 'Warning - Super Admin con institución asignada' };
        }
    }
    
    if (user.role === 'RECTOR' || user.role === 'AUXILIARY_ACCOUNTANT') {
        if (!user.institution) {
            return { emoji: '❌', message: 'Error - Usuario debe tener institución asignada' };
        } else if (!user.institution.isActive) {
            return { emoji: '⚠️', message: 'Warning - Institución inactiva' };
        } else {
            return { emoji: '✅', message: 'Correcto - Usuario correctamente asociado' };
        }
    }
    
    return { emoji: '❓', message: 'Caso especial - revisar manualmente' };
}

checkAssociations();