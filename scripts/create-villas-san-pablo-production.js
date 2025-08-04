#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createVillasSanPablo() {
  try {
    console.log('🏫 Creando institución Villas San Pablo...');
    
    // Verificar si ya existe
    const existing = await prisma.institution.findFirst({
      where: {
        OR: [
          { name: { contains: 'Villas San Pablo', mode: 'insensitive' } },
          { nit: '900123456-7' }
        ]
      }
    });

    if (existing) {
      console.log('✅ Institución Villas San Pablo ya existe:', existing.name);
      return existing;
    }

    // Crear institución
    const institution = await prisma.institution.create({
      data: {
        name: 'Institución Educativa Villas San Pablo',
        nit: '900123456-7',
        address: 'Carrera 45 # 67-89, Barrio Villas San Pablo',
        phone: '(5) 987-6543',
        email: 'info@villassanpablo.edu.co',
        city: 'Barranquilla',
        department: 'Atlántico',
        country: 'Colombia',
        educationLevel: 'SECUNDARIA',
        isActive: true
      }
    });

    console.log('✅ Institución creada:', institution.name);

    // Crear usuario rector
    const rector = await prisma.user.create({
      data: {
        email: 'rector@villassanpablo.edu.co',
        password: 'VillasSP2024!',
        firstName: 'Director',
        lastName: 'Villas San Pablo',
        role: 'RECTOR',
        isActive: true,
        institutionId: institution.id
      }
    });

    console.log('✅ Rector creado:', rector.email);

    // Crear usuario auxiliar contable
    const accountant = await prisma.user.create({
      data: {
        email: 'contabilidad@villassanpablo.edu.co',
        password: 'ContaVSP2024!',
        firstName: 'Auxiliar',
        lastName: 'Contable VSP',
        role: 'AUXILIARY_ACCOUNTANT',
        isActive: true,
        institutionId: institution.id
      }
    });

    console.log('✅ Auxiliar contable creado:', accountant.email);

    // Crear plan de cuentas básico
    await createBasicAccounts(institution.id);

    // Crear categorías básicas
    await createBasicCategories(institution.id);

    console.log('🎉 Institución Villas San Pablo configurada completamente!');
    console.log('📧 Credenciales:');
    console.log(`   Rector: ${rector.email} / VillasSP2024!`);
    console.log(`   Contabilidad: ${accountant.email} / ContaVSP2024!`);

    return institution;

  } catch (error) {
    console.error('❌ Error creando Villas San Pablo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createBasicAccounts(institutionId) {
  console.log('📊 Creando plan de cuentas...');
  
  const accounts = [
    { code: '1105', name: 'CAJA', accountType: 'ASSET', level: 3 },
    { code: '1110', name: 'BANCOS', accountType: 'ASSET', level: 3 },
    { code: '1305', name: 'CUENTAS POR COBRAR ESTUDIANTES', accountType: 'ASSET', level: 3 },
    { code: '4135', name: 'MATRÍCULAS', accountType: 'INCOME', level: 3 },
    { code: '4140', name: 'MENSUALIDADES', accountType: 'INCOME', level: 3 },
    { code: '4145', name: 'OTROS INGRESOS ACADÉMICOS', accountType: 'INCOME', level: 3 },
    { code: '5105', name: 'GASTOS DE PERSONAL', accountType: 'EXPENSE', level: 3 },
    { code: '5110', name: 'SERVICIOS PÚBLICOS', accountType: 'EXPENSE', level: 3 }
  ];

  for (const accountData of accounts) {
    await prisma.account.create({
      data: {
        ...accountData,
        institutionId,
        isActive: true
      }
    });
  }

  console.log('✅ Plan de cuentas creado');
}

async function createBasicCategories(institutionId) {
  console.log('🏷️ Creando categorías...');
  
  const categories = [
    { name: 'Matrículas', description: 'Ingresos por matrículas', type: 'INCOME', color: '#10b981' },
    { name: 'Mensualidades', description: 'Ingresos por mensualidades', type: 'INCOME', color: '#3b82f6' },
    { name: 'Eventos Especiales', description: 'Rifas, grados, excursiones', type: 'EVENT', color: '#8b5cf6' },
    { name: 'Gastos Operacionales', description: 'Gastos de funcionamiento', type: 'EXPENSE', color: '#ef4444' }
  ];

  for (const categoryData of categories) {
    await prisma.category.create({
      data: {
        ...categoryData,
        institutionId,
        isActive: true
      }
    });
  }

  console.log('✅ Categorías creadas');
}

if (require.main === module) {
  createVillasSanPablo()
    .then(() => {
      console.log('✨ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { createVillasSanPablo };