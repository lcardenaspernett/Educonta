// ===================================
// EDUCONTA - Rutas de Administración
// ===================================

const express = require('express');
const router = express.Router();
const { resetAllCredentialsProduction } = require('../scripts/reset-all-credentials-production');
const { emergencyCredentialsFix } = require('../scripts/emergency-credentials-fix');
const { forceUpdateCredentials } = require('../scripts/force-update-credentials');

/**
 * POST /api/admin/reset-credentials
 * Reset completo de credenciales
 */
router.post('/reset-credentials', async (req, res) => {
  try {
    console.log('🚨 ADMIN: Reset completo de credenciales solicitado');
    
    await resetAllCredentialsProduction();
    
    res.json({
      success: true,
      message: 'Reset completo de credenciales exitoso',
      credentials: {
        superAdmin: { email: 'admin@educonta.com', password: 'Admin123!' },
        rector: { email: 'rector@villasanpablo.edu.co', password: 'Rector2024!' },
        contabilidad: { email: 'contabilidad@villasanpablo.edu.co', password: 'Conta2024!' },
        auxiliar: { email: 'auxiliar@villasanpablo.edu.co', password: 'Auxiliar2024!' }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en reset de credenciales:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/emergency-fix
 * Arreglo de emergencia para credenciales
 */
router.post('/emergency-fix', async (req, res) => {
  try {
    console.log('🚨 ADMIN: Arreglo de emergencia solicitado');
    
    await emergencyCredentialsFix();
    
    res.json({
      success: true,
      message: 'Arreglo de emergencia completado',
      note: 'Múltiples credenciales creadas como respaldo'
    });
    
  } catch (error) {
    console.error('❌ Error en arreglo de emergencia:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/current-users
 * Mostrar usuarios actuales
 */
router.get('/current-users', async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      include: {
        institution: {
          select: {
            name: true
          }
        }
      }
    });
    
    const formattedUsers = users.map(user => ({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      institution: user.institution?.name || null
    }));
    
    res.json({
      success: true,
      users: formattedUsers,
      total: users.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/force-update
 * Forzar actualización de credenciales
 */
router.post('/force-update', async (req, res) => {
  try {
    console.log('🚨 ADMIN: Forzar actualización de credenciales solicitado');
    
    await forceUpdateCredentials();
    
    res.json({
      success: true,
      message: 'Actualización forzada de credenciales exitosa',
      credentials: {
        auxiliar: { email: 'auxiliar@villasanpablo.edu.co', password: 'Auxiliar123!' },
        contabilidad: { email: 'contabilidad@villasanpablo.edu.co', password: 'ContaVSP2024!' },
        rector: { email: 'rector@villasanpablo.edu.co', password: 'Rector123!' },
        admin: { email: 'admin@educonta.com', password: 'Admin123!' }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en actualización forzada:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/diagnose
 * Diagnóstico completo del sistema
 */
router.get('/diagnose', async (req, res) => {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA');
    
    // 1. Contar usuarios
    const usersCount = await req.prisma.user.count();
    
    // 2. Contar instituciones
    const institutionsCount = await req.prisma.institution.count();
    
    // 3. Obtener todos los usuarios con detalles
    const users = await req.prisma.user.findMany({
      include: {
        institution: true
      }
    });
    
    // 4. Obtener todas las instituciones
    const institutions = await req.prisma.institution.findMany();
    
    // 5. Verificar credenciales específicas
    const bcrypt = require('bcryptjs');
    const credentialTests = [];
    
    const testCredentials = [
      { email: 'contabilidad@villasanpablo.edu.co', password: 'Conta2024!' },
      { email: 'contabilidad@villasanpablo.edu.co', password: 'ContaVSP2024!' },
      { email: 'rector@villasanpablo.edu.co', password: 'Rector2024!' },
      { email: 'auxiliar@villasanpablo.edu.co', password: 'Auxiliar2024!' },
      { email: 'admin@educonta.com', password: 'Admin123!' }
    ];
    
    for (const cred of testCredentials) {
      const user = users.find(u => u.email === cred.email);
      if (user) {
        try {
          const isValid = await bcrypt.compare(cred.password, user.password);
          credentialTests.push({
            email: cred.email,
            password: cred.password,
            userExists: true,
            passwordValid: isValid,
            isActive: user.isActive,
            role: user.role,
            institutionName: user.institution?.name || null
          });
        } catch (error) {
          credentialTests.push({
            email: cred.email,
            password: cred.password,
            userExists: true,
            passwordValid: false,
            error: error.message
          });
        }
      } else {
        credentialTests.push({
          email: cred.email,
          password: cred.password,
          userExists: false,
          passwordValid: false
        });
      }
    }
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      database: {
        usersCount,
        institutionsCount,
        connected: true
      },
      users: users.map(user => ({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        institutionId: user.institutionId,
        institutionName: user.institution?.name || null,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      })),
      institutions: institutions.map(inst => ({
        id: inst.id,
        name: inst.name,
        nit: inst.nit,
        isActive: inst.isActive
      })),
      credentialTests,
      recommendations: []
    };
    
    // Generar recomendaciones
    if (usersCount === 0) {
      diagnosis.recommendations.push('❌ No hay usuarios en el sistema. Ejecutar reset completo.');
    }
    
    if (institutionsCount === 0) {
      diagnosis.recommendations.push('❌ No hay instituciones. Crear institución Villas San Pablo.');
    }
    
    const workingCredentials = credentialTests.filter(test => test.userExists && test.passwordValid);
    if (workingCredentials.length === 0) {
      diagnosis.recommendations.push('❌ Ninguna credencial funciona. Ejecutar arreglo de emergencia.');
    } else {
      diagnosis.recommendations.push(`✅ ${workingCredentials.length} credenciales funcionando.`);
    }
    
    console.log('📊 Diagnóstico completado:', {
      users: usersCount,
      institutions: institutionsCount,
      workingCredentials: workingCredentials.length
    });
    
    res.json({
      success: true,
      diagnosis
    });
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;