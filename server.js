// server.js - ACTUALIZADO
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Usar nuestro cliente Prisma personalizado con middleware
const prisma = require('./config/prisma');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware Prisma
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// ===================================
// ENDPOINT DIRECTO PARA ESTUDIANTES (ANTES DE OTROS MIDDLEWARES)
// ===================================
app.get('/api/students/:institutionId', async (req, res) => {
  try {
    const institutionId = req.params.institutionId;
    console.log('🔍 [DIRECTO-EARLY] Obteniendo estudiantes para institución:', institutionId);
    
    const studentsFromDB = await prisma.student.findMany({
      where: {
        institutionId: institutionId
      },
      orderBy: [
        { grado: 'asc' },
        { curso: 'asc' },
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });

    console.log('📊 [DIRECTO-EARLY] Estudiantes encontrados en DB:', studentsFromDB.length);

    // Transformar datos
    const students = studentsFromDB.map(student => ({
      id: student.id,
      firstName: student.nombre || '',
      lastName: student.apellido || '',
      fullName: `${student.nombre || ''} ${student.apellido || ''}`.trim(),
      documentType: 'TI',
      document: student.documento || '',
      email: student.email || `${(student.nombre || '').toLowerCase().replace(' ', '.')}@estudiante.edu.co`,
      phone: student.telefono || '+57 300 000 0000',
      grade: student.grado || '',
      course: student.curso || '',
      status: student.estado === 'activo' ? 'ACTIVE' : 'INACTIVE',
      enrollmentDate: student.createdAt || new Date().toISOString(),
      birthDate: student.fechaNacimiento || new Date('2008-01-01').toISOString(),
      guardian: {
        name: student.acudienteNombre || 'Acudiente',
        phone: student.acudienteTelefono || '+57 300 000 0000',
        email: student.acudienteEmail || 'acudiente@email.com'
      },
      address: student.direccion || 'Dirección pendiente',
      events: [],
      totalDebt: 0,
      totalPaid: 0,
      createdAt: student.createdAt || new Date().toISOString()
    }));

    console.log('✅ [DIRECTO-EARLY] Estudiantes transformados:', students.length);

    res.json({
      success: true,
      students: students
    });

  } catch (error) {
    console.error('❌ [DIRECTO-EARLY] Error obteniendo estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estudiantes',
      error: error.message
    });
  }
});

// ===================================
// RUTAS PRINCIPALES
// ===================================

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Selector de institución
app.get('/select-institution', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'select-institution.html'));
});

// Login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboards específicos por rol
app.get('/rector-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rector-dashboard.html'));
});

app.get('/accounting-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'accounting-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Dashboard genérico (redirige según rol)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Páginas adicionales
app.get('/accounting', (req, res) => {
  console.log('📊 Serving accounting page');
  res.sendFile(path.join(__dirname, 'public', 'accounting.html'));
});

app.get('/institutions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'institutions.html'));
});

app.get('/students', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'students.html'));
});

// ===================================
// HEALTH CHECK
// ===================================
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===================================
// CARGAR RUTAS DE API
// ===================================

console.log('🔧 Cargando rutas de API...');

// Rutas de autenticación
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('⚠️ Auth routes not found:', error.message);
}

// Rutas de instituciones
try {
  const institutionRoutes = require('./routes/institutions');
  app.use('/api/institutions', institutionRoutes);
  console.log('✅ Institution routes loaded');
} catch (error) {
  console.log('⚠️ Institution routes not found:', error.message);
}

// Endpoint de prueba para estudiantes
app.get('/api/students/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API de estudiantes funcionando',
    timestamp: new Date().toISOString()
  });
});

// Endpoint directo para obtener estudiantes (solución temporal)
app.get('/api/students/:institutionId', async (req, res) => {
  try {
    const institutionId = req.params.institutionId;
    console.log('🔍 [DIRECTO] Obteniendo estudiantes para institución:', institutionId);
    
    const studentsFromDB = await prisma.student.findMany({
      where: {
        institutionId: institutionId
      },
      orderBy: [
        { grado: 'asc' },
        { curso: 'asc' },
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });

    console.log('📊 [DIRECTO] Estudiantes encontrados en DB:', studentsFromDB.length);

    // Transformar datos para que coincidan con el formato esperado por el frontend
    const students = studentsFromDB.map(student => ({
      id: student.id,
      firstName: student.nombre || '',
      lastName: student.apellido || '',
      fullName: `${student.nombre || ''} ${student.apellido || ''}`.trim(),
      documentType: 'TI',
      document: student.documento || '',
      email: student.email || `${(student.nombre || '').toLowerCase().replace(' ', '.')}@estudiante.edu.co`,
      phone: student.telefono || '+57 300 000 0000',
      grade: student.grado || '',
      course: student.curso || '',
      status: student.estado === 'activo' ? 'ACTIVE' : 'INACTIVE',
      enrollmentDate: student.createdAt || new Date().toISOString(),
      birthDate: student.fechaNacimiento || new Date('2008-01-01').toISOString(),
      guardian: {
        name: student.acudienteNombre || 'Acudiente',
        phone: student.acudienteTelefono || '+57 300 000 0000',
        email: student.acudienteEmail || 'acudiente@email.com'
      },
      address: student.direccion || 'Dirección pendiente',
      events: [],
      totalDebt: 0,
      totalPaid: 0,
      createdAt: student.createdAt || new Date().toISOString()
    }));

    console.log('✅ [DIRECTO] Estudiantes transformados:', students.length);

    res.json({
      success: true,
      students: students
    });

  } catch (error) {
    console.error('❌ [DIRECTO] Error obteniendo estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estudiantes',
      error: error.message
    });
  }
});

// Rutas de estudiantes (versión simple)
try {
  const studentRoutes = require('./routes/students-simple');
  app.use('/api/students', studentRoutes);
  console.log('✅ Student routes (simple) loaded');
} catch (error) {
  console.log('⚠️ Student routes (simple) not found:', error.message);
}

// Rutas financieras (NUEVAS)
try {
  const financialRoutes = require('./routes/financial');
  app.use('/api/financial', financialRoutes);
  console.log('✅ Financial routes loaded');
} catch (error) {
  console.log('⚠️ Financial routes not found:', error.message);
}

// Rutas de dashboard
try {
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✅ Dashboard routes loaded');
} catch (error) {
  console.log('⚠️ Dashboard routes not found:', error.message);
}

// Rutas de contabilidad
try {
  const accountingRoutes = require('./routes/accounting');
  app.use('/api/accounting', accountingRoutes);
  console.log('✅ Accounting routes loaded');
} catch (error) {
  console.log('⚠️ Accounting routes not found:', error.message);
}

// Rutas de contabilidad simplificada
try {
  const accountingSimpleRoutes = require('./routes/accounting-simple');
  app.use('/api/accounting-simple', accountingSimpleRoutes);
  console.log('✅ Accounting simple routes loaded');
} catch (error) {
  console.log('⚠️ Accounting simple routes not found:', error.message);
}

// Rutas de pagos
try {
  const paymentRoutes = require('./routes/payments');
  app.use('/api/payments', paymentRoutes);
  console.log('✅ Payment routes loaded');
} catch (error) {
  console.log('⚠️ Payment routes not found:', error.message);
}

// Rutas de facturas
try {
  const invoiceRoutes = require('./routes/invoices');
  app.use('/api/invoices', invoiceRoutes);
  console.log('✅ Invoice routes loaded');
} catch (error) {
  console.log('⚠️ Invoice routes not found:', error.message);
}

// Rutas de reportes
try {
  const reportRoutes = require('./routes/reports');
  app.use('/api/reports', reportRoutes);
  console.log('✅ Report routes loaded');
} catch (error) {
  console.log('⚠️ Report routes not found:', error.message);
}

// Rutas de eventos
try {
  const eventRoutes = require('./routes/events');
  app.use('/api/events', eventRoutes);
  console.log('✅ Event routes loaded');
} catch (error) {
  console.log('⚠️ Event routes not found:', error.message);
}

// Rutas de CSV
try {
  const csvRoutes = require('./routes/csv');
  app.use('/api/csv', csvRoutes);
  console.log('✅ CSV routes loaded');
} catch (error) {
  console.log('⚠️ CSV routes not found:', error.message);
}

// ===================================
// MIDDLEWARE DE REDIRECCIONAMIENTO INTELIGENTE
// ===================================

// Middleware para redirigir automáticamente según el rol del usuario
app.get('/dashboard.html', async (req, res) => {
  try {
    // Obtener token desde headers o query params
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.redirect('/select-institution');
    }

    // Verificar token y obtener usuario
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'educonta-fallback-secret-key');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.redirect('/select-institution');
    }

    // Redirigir según el rol
    switch (user.role) {
      case 'SUPER_ADMIN':
        return res.redirect('/admin-dashboard.html');
      case 'RECTOR':
        return res.redirect('/rector-dashboard.html');
      case 'AUXILIARY_ACCOUNTANT':
        return res.redirect('/accounting-dashboard.html');
      default:
        return res.redirect('/select-institution');
    }

  } catch (error) {
    console.error('Error en redirección de dashboard:', error);
    return res.redirect('/select-institution');
  }
});

// ===================================
// ERROR HANDLERS
// ===================================

// 404 handler para API routes (debe ir DESPUÉS de todas las rutas de API)
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'API route not found',
    path: req.path 
  });
});

// 404 handler general
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler global
try {
  const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
  app.use(errorHandler);
} catch (error) {
  console.log('⚠️ Error handler middleware not found');
  
  // Error handler básico
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
}

// ===================================
// SERVIDOR
// ===================================

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Verificar que existen las tablas principales
    try {
      await prisma.institution.count();
      await prisma.user.count();
      console.log('✅ Database schema verified');
    } catch (error) {
      console.warn('⚠️ Database schema might need migration:', error.message);
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ===================================');
      console.log(`🚀 Educonta running on http://localhost:${PORT}`);
      console.log('🚀 ===================================');
      console.log('');
      console.log('📱 URLs importantes:');
      console.log(`   🏠 Inicio: http://localhost:${PORT}`);
      console.log(`   🏫 Selector: http://localhost:${PORT}/select-institution`);
      console.log(`   🔐 Login: http://localhost:${PORT}/login`);
      console.log(`   📊 Health: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('👥 Credenciales por defecto:');
      console.log('   📧 Super Admin: admin@educonta.com');
      console.log('   🔑 Password: Admin123!');
      console.log('');
      console.log('🔧 Funcionalidades implementadas:');
      console.log('   ✅ Sistema multi-tenant');
      console.log('   ✅ Selector de institución');
      console.log('   ✅ Login por institución');
      console.log('   ✅ Dashboard para Rector');
      console.log('   ✅ Dashboard para Auxiliar Contable');
      console.log('   ✅ Gestión financiera básica');
      console.log('   ✅ Generación automática de facturas');
      console.log('   ✅ Registro de ingresos y gastos');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Manejo de cierre del servidor
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Conexión a base de datos cerrada');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Conexión a base de datos cerrada');
  process.exit(0);
});

// Manejo de errores no controlados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
start();

module.exports = app;