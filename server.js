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

// Rutas básicas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

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

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// CARGAR TODAS LAS RUTAS ANTES DEL START
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('⚠️ Auth routes not found');
}

try {
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✅ Dashboard routes loaded');
} catch (error) {
  console.log('⚠️ Dashboard routes not found');
}

try {
  const institutionRoutes = require('./routes/institutions');
  app.use('/api/institutions', institutionRoutes);
  console.log('✅ Institution routes loaded');
} catch (error) {
  console.log('⚠️ Institution routes not found');
}

try {
  const studentRoutes = require('./routes/students');
  app.use('/api/students', studentRoutes);
  console.log('✅ Student routes loaded');
} catch (error) {
  console.log('⚠️ Student routes not found');
}

try {
  const accountingRoutes = require('./routes/accounting');
  app.use('/api/accounting', accountingRoutes);
  console.log('✅ Accounting routes loaded');
} catch (error) {
  console.log('⚠️ Accounting routes not found:', error.message);
}

try {
  const accountingSimpleRoutes = require('./routes/accounting-simple');
  app.use('/api/accounting-simple', accountingSimpleRoutes);
  console.log('✅ Accounting simple routes loaded');
} catch (error) {
  console.log('⚠️ Accounting simple routes not found:', error.message);
}

// 404 handler para API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Error handlers
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Error handler global
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Educonta running on http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Login: admin@educonta.com / Admin123!`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();

module.exports = app;