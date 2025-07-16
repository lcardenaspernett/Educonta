// ===================================
// EDUCONTA - Configuración de Prisma con Middleware
// ===================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Middleware para hashear contraseñas automáticamente
prisma.$use(async (params, next) => {
  // Solo aplicar a operaciones en la tabla 'user'
  if (params.model === 'User') {
    // Para operaciones CREATE y UPDATE
    if (params.action === 'create' || params.action === 'update') {
      // Si hay una contraseña en los datos
      if (params.args.data.password) {
        // Verificar si la contraseña ya está hasheada (bcrypt hashes empiezan con $2)
        if (!params.args.data.password.startsWith('$2')) {
          console.log('🔐 Hasheando contraseña para usuario...');
          // Hashear la contraseña
          const saltRounds = 12;
          params.args.data.password = await bcrypt.hash(params.args.data.password, saltRounds);
        }
      }
    }
    
    // Para operaciones updateMany
    if (params.action === 'updateMany') {
      if (params.args.data.password) {
        if (!params.args.data.password.startsWith('$2')) {
          console.log('🔐 Hasheando contraseña para usuarios (updateMany)...');
          const saltRounds = 12;
          params.args.data.password = await bcrypt.hash(params.args.data.password, saltRounds);
        }
      }
    }
  }
  
  return next(params);
});

// Middleware para logging de operaciones (opcional)
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  // Log solo operaciones importantes
  if (['create', 'update', 'delete'].includes(params.action) && params.model === 'User') {
    console.log(`📊 Prisma Query: ${params.model}.${params.action} took ${after - before}ms`);
  }
  
  return result;
});

module.exports = prisma;