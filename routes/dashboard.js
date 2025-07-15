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
      // Stats para Super Admin
      const institutionsCount = await req.prisma.institution.count({
        where: { isActive: true }
      });
      
      const studentsCount = await req.prisma.student.count();
      
      // Simular ingresos (no hay tabla de facturas aún)
      const monthlyRevenue = 2450000;
      const pendingInvoices = 3;
      
      stats = {
        institutions: institutionsCount,
        students: studentsCount,
        monthlyRevenue: monthlyRevenue,
        pendingInvoices: pendingInvoices
      };
      
    } else {
      // Stats para Rector/Auxiliar
      if (!req.institution) {
        return res.status(400).json({ success: false, error: 'Usuario sin institución' });
      }
      
      const studentsCount = await req.prisma.student.count({
        where: { institutionId: req.institution.id }
      });
      
      stats = {
        institutions: 1,
        students: studentsCount,
        monthlyRevenue: 850000,
        pendingInvoices: 2
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
