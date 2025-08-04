const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInstitutions() {
    try {
        const institutions = await prisma.institution.findMany();
        console.log('Instituciones encontradas:');
        institutions.forEach(inst => {
            console.log(`- ID: ${inst.id}, Nombre: ${inst.name}`);
        });
        
        if (institutions.length > 0) {
            console.log(`\nUsaremos la primera institución: ${institutions[0].id}`);
            return institutions[0].id;
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkInstitutions();