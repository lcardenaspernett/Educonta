// ===================================
// EDUCONTA - Script de Seeding
// ===================================

const bcrypt = require('bcryptjs');

// Usar nuestro cliente Prisma personalizado con middleware de hasheo automático
const prisma = require('../config/prisma');

// ===================================
// DATOS DE CONFIGURACIÓN
// ===================================

const SEED_CONFIG = {
  // Control de seeding
  CREATE_SUPER_ADMIN: true,
  CREATE_DEMO_INSTITUTION: true, // Crear siempre para tener datos de prueba
  CREATE_SAMPLE_DATA: true, // Crear siempre para tener datos de prueba
  
  // Credenciales por defecto
  SUPER_ADMIN: {
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@educonta.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'Admin123!',
    firstName: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
    lastName: process.env.SUPER_ADMIN_LAST_NAME || 'Administrador'
  },
  
  // Institución demo
  DEMO_INSTITUTION: {
    name: 'Colegio San José Demo',
    nit: '123456789-0',
    address: 'Calle 123 # 45-67',
    phone: '(5) 123-4567',
    email: 'info@colegiosanjose.edu.co',
    city: 'Barranquilla',
    department: 'Atlántico',
    educationLevel: 'MIXTA'
  },
  
  // Usuario rector demo
  DEMO_RECTOR: {
    email: 'rector@colegiosanjose.edu.co',
    password: 'Rector123!',
    firstName: 'María',
    lastName: 'González'
  },
  
  // Usuario auxiliar contable demo
  DEMO_ACCOUNTANT: {
    email: 'contabilidad@colegiosanjose.edu.co',
    password: 'Conta123!',
    firstName: 'Carlos',
    lastName: 'Rodríguez'
  }
};

// ===================================
// FUNCIONES DE SEEDING
// ===================================

/**
 * Crear super administrador
 */
async function createSuperAdmin() {
  console.log('🔧 Creando Super Administrador...');
  
  try {
    // Verificar si ya existe
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('ℹ️  Super Admin ya existe:', existingSuperAdmin.email);
      return existingSuperAdmin;
    }

    // Crear super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: SEED_CONFIG.SUPER_ADMIN.email,
        password: SEED_CONFIG.SUPER_ADMIN.password, // Se hasheará automáticamente
        firstName: SEED_CONFIG.SUPER_ADMIN.firstName,
        lastName: SEED_CONFIG.SUPER_ADMIN.lastName,
        role: 'SUPER_ADMIN',
        isActive: true,
        institutionId: null
      }
    });

    console.log('✅ Super Admin creado:', superAdmin.email);
    return superAdmin;
  } catch (error) {
    console.error('❌ Error creando Super Admin:', error);
    throw error;
  }
}

/**
 * Crear institución demo
 */
async function createDemoInstitution() {
  console.log('🏫 Creando institución demo...');
  
  try {
    // Verificar si ya existe
    const existingInstitution = await prisma.institution.findUnique({
      where: { nit: SEED_CONFIG.DEMO_INSTITUTION.nit }
    });

    if (existingInstitution) {
      console.log('ℹ️  Institución demo ya existe:', existingInstitution.name);
      return existingInstitution;
    }

    // Crear institución
    const institution = await prisma.institution.create({
      data: {
        ...SEED_CONFIG.DEMO_INSTITUTION,
        isActive: true
      }
    });

    console.log('✅ Institución demo creada:', institution.name);
    return institution;
  } catch (error) {
    console.error('❌ Error creando institución demo:', error);
    throw error;
  }
}

/**
 * Crear usuarios demo para la institución
 */
async function createDemoUsers(institutionId) {
  console.log('👥 Creando usuarios demo...');
  
  try {
    const users = [];

    // Verificar y crear rector
    let rector = await prisma.user.findUnique({
      where: { email: SEED_CONFIG.DEMO_RECTOR.email }
    });

    if (!rector) {
      rector = await prisma.user.create({
        data: {
          email: SEED_CONFIG.DEMO_RECTOR.email,
          password: SEED_CONFIG.DEMO_RECTOR.password,
          firstName: SEED_CONFIG.DEMO_RECTOR.firstName,
          lastName: SEED_CONFIG.DEMO_RECTOR.lastName,
          role: 'RECTOR',
          isActive: true,
          institutionId
        }
      });
      console.log('✅ Rector creado:', rector.email);
      
      // Crear permisos para rector
      await createUserPermissions(rector.id, 'RECTOR');
    } else {
      console.log('ℹ️  Rector ya existe:', rector.email);
    }
    users.push(rector);

    // Verificar y crear auxiliar contable
    let accountant = await prisma.user.findUnique({
      where: { email: SEED_CONFIG.DEMO_ACCOUNTANT.email }
    });

    if (!accountant) {
      accountant = await prisma.user.create({
        data: {
          email: SEED_CONFIG.DEMO_ACCOUNTANT.email,
          password: SEED_CONFIG.DEMO_ACCOUNTANT.password,
          firstName: SEED_CONFIG.DEMO_ACCOUNTANT.firstName,
          lastName: SEED_CONFIG.DEMO_ACCOUNTANT.lastName,
          role: 'AUXILIARY_ACCOUNTANT',
          isActive: true,
          institutionId
        }
      });
      console.log('✅ Auxiliar contable creado:', accountant.email);
      
      // Crear permisos para auxiliar contable
      await createUserPermissions(accountant.id, 'AUXILIARY_ACCOUNTANT');
    } else {
      console.log('ℹ️  Auxiliar contable ya existe:', accountant.email);
    }
    users.push(accountant);

    console.log('✅ Usuarios demo verificados:', users.length);
    return users;
  } catch (error) {
    console.error('❌ Error creando usuarios demo:', error);
    throw error;
  }
}

/**
 * Crear permisos por defecto para usuarios
 */
async function createUserPermissions(userId, role) {
  const permissions = [];

  switch (role) {
    case 'RECTOR':
      permissions.push(
        { module: 'users', actions: ['create', 'read', 'update'] },
        { module: 'students', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'accounting', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'payments', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'reports', actions: ['read'] },
        { module: 'dashboard', actions: ['read'] }
      );
      break;
      
    case 'AUXILIARY_ACCOUNTANT':
      permissions.push(
        { module: 'students', actions: ['read', 'update'] },
        { module: 'accounting', actions: ['create', 'read', 'update'] },
        { module: 'payments', actions: ['create', 'read', 'update'] },
        { module: 'invoices', actions: ['create', 'read', 'update'] },
        { module: 'reports', actions: ['read'] },
        { module: 'dashboard', actions: ['read'] }
      );
      break;
  }

  for (const permission of permissions) {
    await prisma.userPermission.create({
      data: {
        userId,
        module: permission.module,
        actions: permission.actions
      }
    });
  }
}

/**
 * Crear plan de cuentas básico
 */
async function createBasicAccountPlan(institutionId) {
  console.log('📊 Creando plan de cuentas básico...');
  
  // Verificar si ya existe plan de cuentas para esta institución
  const existingAccounts = await prisma.account.findMany({
    where: { institutionId }
  });

  if (existingAccounts.length > 0) {
    console.log('ℹ️  Plan de cuentas ya existe para esta institución:', existingAccounts.length, 'cuentas');
    return existingAccounts.map(acc => acc.id);
  }

  const accounts = [
    // ACTIVOS
    { code: '1', name: 'ACTIVOS', accountType: 'ASSET', level: 1, parent: null },
    { code: '11', name: 'ACTIVO CORRIENTE', accountType: 'ASSET', level: 2, parent: '1' },
    { code: '1105', name: 'CAJA', accountType: 'ASSET', level: 3, parent: '11' },
    { code: '1110', name: 'BANCOS', accountType: 'ASSET', level: 3, parent: '11' },
    { code: '1305', name: 'CUENTAS POR COBRAR ESTUDIANTES', accountType: 'ASSET', level: 3, parent: '11' },
    
    // PASIVOS
    { code: '2', name: 'PASIVOS', accountType: 'LIABILITY', level: 1, parent: null },
    { code: '24', name: 'CUENTAS POR PAGAR', accountType: 'LIABILITY', level: 2, parent: '2' },
    { code: '2405', name: 'PROVEEDORES', accountType: 'LIABILITY', level: 3, parent: '24' },
    
    // PATRIMONIO
    { code: '3', name: 'PATRIMONIO', accountType: 'EQUITY', level: 1, parent: null },
    { code: '31', name: 'CAPITAL SOCIAL', accountType: 'EQUITY', level: 2, parent: '3' },
    
    // INGRESOS
    { code: '4', name: 'INGRESOS', accountType: 'INCOME', level: 1, parent: null },
    { code: '41', name: 'INGRESOS OPERACIONALES', accountType: 'INCOME', level: 2, parent: '4' },
    { code: '4135', name: 'MATRÍCULAS', accountType: 'INCOME', level: 3, parent: '41' },
    { code: '4140', name: 'MENSUALIDADES', accountType: 'INCOME', level: 3, parent: '41' },
    { code: '4145', name: 'OTROS INGRESOS ACADÉMICOS', accountType: 'INCOME', level: 3, parent: '41' },
    
    // GASTOS
    { code: '5', name: 'GASTOS', accountType: 'EXPENSE', level: 1, parent: null },
    { code: '51', name: 'GASTOS OPERACIONALES', accountType: 'EXPENSE', level: 2, parent: '5' },
    { code: '5105', name: 'GASTOS DE PERSONAL', accountType: 'EXPENSE', level: 3, parent: '51' },
    { code: '5110', name: 'SERVICIOS PÚBLICOS', accountType: 'EXPENSE', level: 3, parent: '51' },
    { code: '5115', name: 'MANTENIMIENTO Y REPARACIONES', accountType: 'EXPENSE', level: 3, parent: '51' },
    { code: '5120', name: 'MATERIALES Y SUMINISTROS', accountType: 'EXPENSE', level: 3, parent: '51' }
  ];

  const createdAccounts = new Map();

  for (const accountData of accounts) {
    const parentId = accountData.parent ? createdAccounts.get(accountData.parent) : null;
    
    const account = await prisma.account.create({
      data: {
        code: accountData.code,
        name: accountData.name,
        accountType: accountData.accountType,
        level: accountData.level,
        parentId,
        institutionId,
        isActive: true
      }
    });

    createdAccounts.set(accountData.code, account.id);
  }

  console.log('✅ Plan de cuentas creado:', accounts.length, 'cuentas');
  return Array.from(createdAccounts.values());
}

/**
 * Crear categorías básicas
 */
async function createBasicCategories(institutionId) {
  console.log('🏷️  Creando categorías básicas...');
  
  // Verificar si ya existen categorías para esta institución
  const existingCategories = await prisma.category.findMany({
    where: { institutionId }
  });

  if (existingCategories.length > 0) {
    console.log('ℹ️  Categorías ya existen para esta institución:', existingCategories.length, 'categorías');
    return existingCategories;
  }

  const categories = [
    { name: 'Matrículas', description: 'Ingresos por matrículas de estudiantes', type: 'INCOME', color: '#10b981' },
    { name: 'Mensualidades', description: 'Ingresos por mensualidades', type: 'INCOME', color: '#3b82f6' },
    { name: 'Eventos Especiales', description: 'Rifas, grados, excursiones', type: 'EVENT', color: '#8b5cf6' },
    { name: 'Pruebas Académicas', description: 'Exámenes, evaluaciones', type: 'EVENT', color: '#06b6d4' },
    { name: 'Uniformes y Materiales', description: 'Venta de uniformes y útiles', type: 'EVENT', color: '#84cc16' },
    { name: 'Nómina', description: 'Gastos de personal', type: 'EXPENSE', color: '#ef4444' },
    { name: 'Servicios Públicos', description: 'Agua, luz, gas, internet', type: 'EXPENSE', color: '#f59e0b' },
    { name: 'Mantenimiento', description: 'Reparaciones y mantenimiento', type: 'EXPENSE', color: '#6b7280' },
    { name: 'Materiales Educativos', description: 'Libros, materiales de enseñanza', type: 'EXPENSE', color: '#ec4899' }
  ];

  const createdCategories = [];

  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: {
        ...categoryData,
        institutionId,
        isActive: true
      }
    });
    createdCategories.push(category);
  }

  console.log('✅ Categorías creadas:', createdCategories.length);
  return createdCategories;
}

/**
 * Crear estudiantes demo
 */
async function createSampleStudents(institutionId) {
  console.log('👨‍🎓 Creando estudiantes demo...');
  
  const studentsData = [
    {
      studentCode: 'EST001',
      firstName: 'Ana',
      lastName: 'Martínez',
      documentType: 'TI',
      documentNumber: '1234567890',
      grade: 'Preescolar',
      section: 'A',
      birthDate: new Date('2018-03-15'),
      parentName: 'Pedro Martínez',
      parentPhone: '300-123-4567',
      parentEmail: 'pedro.martinez@email.com',
      address: 'Calle 45 # 23-12'
    },
    {
      studentCode: 'EST002',
      firstName: 'Luis',
      lastName: 'García',
      documentType: 'TI',
      documentNumber: '1234567891',
      grade: '1°',
      section: 'B',
      birthDate: new Date('2017-07-22'),
      parentName: 'Carmen García',
      parentPhone: '301-234-5678',
      parentEmail: 'carmen.garcia@email.com',
      address: 'Carrera 12 # 34-56'
    },
    {
      studentCode: 'EST003',
      firstName: 'Sofia',
      lastName: 'López',
      documentType: 'TI',
      documentNumber: '1234567892',
      grade: '2°',
      section: 'A',
      birthDate: new Date('2016-11-08'),
      parentName: 'Miguel López',
      parentPhone: '302-345-6789',
      parentEmail: 'miguel.lopez@email.com',
      address: 'Avenida 30 # 45-67'
    },
    {
      studentCode: 'EST004',
      firstName: 'Carlos',
      lastName: 'Hernández',
      documentType: 'TI',
      documentNumber: '1234567893',
      grade: '3°',
      section: 'C',
      birthDate: new Date('2015-05-14'),
      parentName: 'Laura Hernández',
      parentPhone: '303-456-7890',
      parentEmail: 'laura.hernandez@email.com',
      address: 'Calle 67 # 89-01'
    },
    {
      studentCode: 'EST005',
      firstName: 'María',
      lastName: 'Rodríguez',
      documentType: 'TI',
      documentNumber: '1234567894',
      grade: '4°',
      section: 'B',
      birthDate: new Date('2014-09-30'),
      parentName: 'José Rodríguez',
      parentPhone: '304-567-8901',
      parentEmail: 'jose.rodriguez@email.com',
      address: 'Carrera 89 # 12-34'
    }
  ];

  const createdStudents = [];

  for (const studentData of studentsData) {
    // Verificar si el estudiante ya existe por código o documento
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { studentCode: studentData.studentCode },
          { documentNumber: studentData.documentNumber }
        ],
        institutionId
      }
    });

    if (!existingStudent) {
      const student = await prisma.student.create({
        data: {
          ...studentData,
          institutionId,
          isActive: true,
          enrollmentDate: new Date()
        }
      });
      createdStudents.push(student);
      console.log('✅ Estudiante creado:', student.studentCode, '-', student.firstName, student.lastName);
    } else {
      console.log('ℹ️  Estudiante ya existe:', existingStudent.studentCode, '-', existingStudent.firstName, existingStudent.lastName);
      createdStudents.push(existingStudent);
    }
  }

  console.log('✅ Estudiantes demo verificados:', createdStudents.length);
  return createdStudents;
}

/**
 * Crear eventos de pago demo
 */
async function createSamplePaymentEvents(institutionId, categories) {
  console.log('💰 Creando eventos de pago demo...');
  
  const matriculaCategory = categories.find(c => c.name === 'Matrículas');
  const mensualidadCategory = categories.find(c => c.name === 'Mensualidades');
  const eventoCategory = categories.find(c => c.name === 'Eventos Especiales');

  const events = [
    {
      name: 'Matrícula 2024',
      description: 'Pago de matrícula año lectivo 2024',
      amount: 250000,
      eventType: 'MATRICULA',
      categoryId: matriculaCategory?.id,
      dueDate: new Date('2024-02-15')
    },
    {
      name: 'Mensualidad Enero 2024',
      description: 'Pago mensualidad mes de enero',
      amount: 180000,
      eventType: 'MENSUALIDAD',
      categoryId: mensualidadCategory?.id,
      dueDate: new Date('2024-01-31')
    },
    {
      name: 'Rifa Navideña 2023',
      description: 'Participación en rifa navideña del colegio',
      amount: 25000,
      eventType: 'RIFA',
      categoryId: eventoCategory?.id,
      dueDate: new Date('2023-12-20')
    }
  ];

  const createdEvents = [];

  for (const eventData of events) {
    const event = await prisma.paymentEvent.create({
      data: {
        ...eventData,
        institutionId,
        isActive: true
      }
    });
    createdEvents.push(event);
  }

  console.log('✅ Eventos de pago creados:', createdEvents.length);
  return createdEvents;
}

/**
 * Función principal de seeding
 */
async function main() {
  console.log('🌱 Iniciando seeding de Educonta...\n');
  
  try {
    let superAdmin = null;
    let institution = null;
    let users = [];
    let students = [];

    // 1. Crear Super Admin
    if (SEED_CONFIG.CREATE_SUPER_ADMIN) {
      superAdmin = await createSuperAdmin();
    }

    // 2. Crear institución demo (solo en desarrollo)
    if (SEED_CONFIG.CREATE_DEMO_INSTITUTION) {
      institution = await createDemoInstitution();
      
      // 3. Crear usuarios demo
      users = await createDemoUsers(institution.id);
      
      // 4. Crear plan de cuentas
      await createBasicAccountPlan(institution.id);
      
      // 5. Crear categorías
      const categories = await createBasicCategories(institution.id);
      
      // 6. Crear datos de ejemplo
      if (SEED_CONFIG.CREATE_SAMPLE_DATA) {
        students = await createSampleStudents(institution.id);
        await createSamplePaymentEvents(institution.id, categories);
      }
    }

    console.log('\n✅ Seeding completado exitosamente!');
    console.log('\n📋 Resumen:');
    
    if (superAdmin) {
      console.log(`👤 Super Admin: ${superAdmin.email}`);
    }
    
    if (institution) {
      console.log(`🏫 Institución: ${institution.name}`);
      console.log(`👥 Usuarios: ${users.length}`);
      
      if (students.length > 0) {
        console.log(`👨‍🎓 Estudiantes: ${students.length}`);
      }
    }

    console.log('\n🔑 Credenciales de acceso:');
    console.log(`Super Admin: ${SEED_CONFIG.SUPER_ADMIN.email} / ${SEED_CONFIG.SUPER_ADMIN.password}`);
    
    if (SEED_CONFIG.CREATE_DEMO_INSTITUTION) {
      console.log(`Rector: ${SEED_CONFIG.DEMO_RECTOR.email} / ${SEED_CONFIG.DEMO_RECTOR.password}`);
      console.log(`Contabilidad: ${SEED_CONFIG.DEMO_ACCOUNTANT.email} / ${SEED_CONFIG.DEMO_ACCOUNTANT.password}`);
    }

  } catch (error) {
    console.error('\n❌ Error durante el seeding:', error);
    throw error;
  }
}

// ===================================
// EJECUCIÓN
// ===================================

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  })
  .catch(async (e) => {
    console.error('\n💥 Error fatal:', e);
    await prisma.$disconnect();
    process.exit(1);
  });