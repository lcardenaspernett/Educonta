// ===================================
// EDUCONTA - Rutas de Administración
// ===================================

const express = require('express');
const router = express.Router();
const { resetAllCredentialsProduction } = require('../scripts/reset-all-credentials-production');
const { emergencyCredentialsFix } = require('../scripts/emergency-credentials-fix');

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

module.exports = router;