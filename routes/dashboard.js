const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware de autenticación
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token requerido' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'educonta-fallback-secret-key');
    
    const user = await req.prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      include: { institution: true }
    });
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }
    
    req.user = user;
    req.institution = user.institution;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
};

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { user } = req;
    
    let stats = {};
    
    if (user.role === 'SUPER_ADMIN') {
      // Stats para Super Admin - Datos reales de todas las instituciones
      const [
        institutionsCount,
        totalStudents,
        activeStudents,
        inactiveStudents,
        recentEnrollments,
        institutionsWithStudents
      ] = await Promise.all([
        // Total instituciones activas
        req.prisma.institution.count({
          where: { isActive: true }
        }),
        
        // Total estudiantes
        req.prisma.student.count(),
        
        // Estudiantes activos
        req.prisma.student.count({
          where: { isActive: true }
        }),
        
        // Estudiantes inactivos
        req.prisma.student.count({
          where: { isActive: false }
        }),
        
        // Matrículas recientes (últimos 30 días)
        req.prisma.student.count({
          where: {
            enrollmentDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Instituciones con estudiantes
        req.prisma.institution.count({
          where: {
            isActive: true,
            students: {
              some: {}
            }
          }
        })
      ]);
      
      stats = {
        institutions: institutionsCount,
        students: totalStudents,
        activeStudents: activeStudents,
        inactiveStudents: inactiveStudents,
        recentEnrollments: recentEnrollments,
        institutionsWithStudents: institutionsWithStudents,
        // Por ahora, ingresos y facturas son 0 hasta implementar esos módulos
        monthlyRevenue: 0,
        pendingInvoices: 0,
        // Cambios comparado con período anterior
        changes: {
          institutions: institutionsCount > 0 ? `${institutionsCount} activas` : 'Sin instituciones',
          students: recentEnrollments > 0 ? `+${recentEnrollments} este mes` : 'Sin matrículas recientes',
          revenue: 'Módulo de pagos pendiente',
          invoices: 'Módulo de facturación pendiente'
        }
      };
      
    } else {
      // Stats para Rector/Auxiliar - Solo su institución
      if (!req.institution) {
        return res.status(400).json({ success: false, error: 'Usuario sin institución' });
      }
      
      const [
        totalStudents,
        activeStudents,
        inactiveStudents,
        recentEnrollments,
        gradeStats
      ] = await Promise.all([
        // Total estudiantes de la institución
        req.prisma.student.count({
          where: { institutionId: req.institution.id }
        }),
        
        // Estudiantes activos
        req.prisma.student.count({
          where: { 
            institutionId: req.institution.id,
            isActive: true 
          }
        }),
        
        // Estudiantes inactivos
        req.prisma.student.count({
          where: { 
            institutionId: req.institution.id,
            isActive: false 
          }
        }),
        
        // Matrículas recientes (últimos 30 días)
        req.prisma.student.count({
          where: {
            institutionId: req.institution.id,
            enrollmentDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Estadísticas por grado
        req.prisma.student.groupBy({
          by: ['grade'],
          where: { 
            institutionId: req.institution.id,
            isActive: true 
          },
          _count: { grade: true },
          orderBy: { grade: 'asc' }
        })
      ]);
      
      stats = {
        institutions: 1,
        students: totalStudents,
        activeStudents: activeStudents,
        inactiveStudents: inactiveStudents,
        recentEnrollments: recentEnrollments,
        gradeDistribution: gradeStats,
        // Por ahora, ingresos y facturas son 0 hasta implementar esos módulos
        monthlyRevenue: 0,
        pendingInvoices: 0,
        // Cambios comparado con período anterior
        changes: {
          institutions: req.institution.name,
          students: recentEnrollments > 0 ? `+${recentEnrollments} este mes` : 'Sin matrículas recientes',
          revenue: 'Módulo de pagos pendiente',
          invoices: 'Módulo de facturación pendiente'
        }
      };
    }
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('Error obteniendo stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/dashboard/activity
router.get('/activity', authenticate, async (req, res) => {
  try {
    const { user } = req;
    
    let whereClause = { isActive: true };
    
    if (user.role !== 'SUPER_ADMIN' && req.institution) {
      whereClause.institutionId = req.institution.id;
    }
    
    const recentUsers = await req.prisma.user.findMany({
      where: {
        ...whereClause,
        lastLogin: { not: null }
      },
      orderBy: { lastLogin: 'desc' },
      take: 5,
      include: { institution: true }
    });
    
    const activity = recentUsers.map(u => ({
      user: `${u.firstName} ${u.lastName}`,
      action: 'Conectado al sistema',
      time: u.lastLogin,
      institution: u.institution?.name || 'N/A'
    }));
    
    res.json({
      success: true,
      activity: activity
    });
    
  } catch (error) {
    console.error('Error obteniendo actividad:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
