// ===================================
// EDUCONTA - Controlador de Autenticación
// ===================================

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const config = require('../config/config');
const { 
  generateTokenPair, 
  verifyToken, 
  refreshAccessToken, 
  generateResetPasswordToken,
  generateEmailVerificationToken,
  generateInvitationToken,
  createAuthResponse,
  blacklistToken
} = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const { AuthError, ValidationError } = require('../middleware/errorHandler');

/**
 * Registro de nuevo usuario (solo por invitación)
 */
const register = async (req, res, next) => {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de registro inválidos'));
    }

    const { 
      firstName, 
      lastName, 
      password, 
      invitationToken 
    } = req.body;

    // Verificar token de invitación
    const invitationResult = verifyToken(invitationToken, 'invitation');
    if (!invitationResult.success) {
      return next(new AuthError('Token de invitación inválido o expirado'));
    }

    const { email, role, institutionId, invitedBy } = invitationResult.payload;

    // Verificar que no existe usuario con este email
    const existingUser = await req.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return next(new ValidationError('Ya existe un usuario con este email'));
    }

    // Verificar que la institución existe (excepto para SUPER_ADMIN)
    let institution = null;
    if (role !== 'SUPER_ADMIN' && institutionId) {
      institution = await req.prisma.institution.findUnique({
        where: { id: institutionId }
      });

      if (!institution) {
        return next(new AuthError('Institución no encontrada'));
      }

      if (!institution.isActive) {
        return next(new AuthError('La institución está inactiva'));
      }
    }

    // Crear usuario
    const user = await req.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password, // Se hasheará automáticamente por el middleware de Prisma
        role,
        institutionId: role === 'SUPER_ADMIN' ? null : institutionId,
        createdById: invitedBy,
        isActive: true
      },
      include: {
        institution: true,
        permissions: true
      }
    });

    // Crear permisos por defecto según el rol
    await createDefaultPermissions(req.prisma, user.id, role);

    // Generar tokens
    const tokens = generateTokenPair(user);

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'REGISTER',
        tableName: 'users',
        recordId: user.id,
        newValues: { email, role },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId: user.institutionId,
        userId: user.id
      }
    });

    // Respuesta exitosa
    res.status(201).json({
      ...createAuthResponse(user, tokens),
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Inicio de sesión
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de login inválidos'));
    }

    const { email, password } = req.body;

    // Buscar usuario
    const user = await req.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        institution: true,
        permissions: true
      }
    });

    if (!user) {
      return next(new AuthError('Credenciales inválidas'));
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return next(new AuthError('Usuario inactivo. Contacta al administrador'));
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AuthError('Credenciales inválidas'));
    }

    // Verificar institución activa (excepto SUPER_ADMIN)
    if (user.role !== 'SUPER_ADMIN' && user.institution && !user.institution.isActive) {
      return next(new AuthError('La institución está inactiva'));
    }

    // Actualizar último login
    await req.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generar tokens
    const tokens = generateTokenPair(user);

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        tableName: 'users',
        recordId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId: user.institutionId,
        userId: user.id
      }
    });

    // Respuesta exitosa
    res.json({
      ...createAuthResponse(user, tokens),
      message: 'Inicio de sesión exitoso'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Cerrar sesión
 */
const logout = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Agregar token a blacklist
      blacklistToken(token);
    }

    // Registrar auditoría
    if (req.user) {
      await req.prisma.auditLog.create({
        data: {
          action: 'LOGOUT',
          tableName: 'users',
          recordId: req.user.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          institutionId: req.user.institutionId,
          userId: req.user.id
        }
      });
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Renovar token de acceso
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return next(new AuthError('Refresh token requerido'));
    }

    // Renovar token
    const result = await refreshAccessToken(token, req.prisma);

    if (!result.success) {
      return next(new AuthError(result.error));
    }

    res.json({
      success: true,
      accessToken: result.accessToken,
      expiresIn: config.JWT_EXPIRE,
      tokenType: 'Bearer',
      user: result.user
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener perfil del usuario actual
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        institution: true,
        permissions: true
      }
    });

    if (!user) {
      return next(new AuthError('Usuario no encontrado'));
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        institution: user.institution ? {
          id: user.institution.id,
          name: user.institution.name,
          nit: user.institution.nit,
          educationLevel: user.institution.educationLevel
        } : null,
        permissions: user.permissions
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar perfil del usuario
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de perfil inválidos'));
    }

    const { firstName, lastName, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Preparar datos de actualización
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    // Si se quiere cambiar contraseña
    if (newPassword) {
      if (!currentPassword) {
        return next(new ValidationError('Contraseña actual requerida'));
      }

      // Verificar contraseña actual
      const user = await req.prisma.user.findUnique({
        where: { id: userId }
      });

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return next(new AuthError('Contraseña actual incorrecta'));
      }

      updateData.password = newPassword; // Se hasheará automáticamente
    }

    // Actualizar usuario
    const updatedUser = await req.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        institution: true,
        permissions: true
      }
    });

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'UPDATE_PROFILE',
        tableName: 'users',
        recordId: userId,
        newValues: { firstName, lastName, passwordChanged: !!newPassword },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId: req.user.institutionId,
        userId: userId
      }
    });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        institution: updatedUser.institution
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Solicitar reseteo de contraseña
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await req.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { institution: true }
    });

    if (!user) {
      // Por seguridad, siempre responder que se envió el email
      return res.json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación'
      });
    }

    // Generar token de reseteo
    const resetToken = generateResetPasswordToken(user);

    // Crear enlace de reseteo
    const resetUrl = `${config.getAppUrl()}/reset-password?token=${resetToken}`;

    // Enviar email (implementar según configuración de email)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reseteo de contraseña - Educonta',
        template: 'password-reset',
        data: {
          firstName: user.firstName,
          resetUrl,
          institutionName: user.institution?.name
        }
      });
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      // No fallar si el email no se puede enviar
    }

    res.json({
      success: true,
      message: 'Si el email existe, se ha enviado un enlace de recuperación'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Resetear contraseña
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Verificar token
    const tokenResult = verifyToken(token, 'password_reset');
    if (!tokenResult.success) {
      return next(new AuthError('Token de reseteo inválido o expirado'));
    }

    const { userId } = tokenResult.payload;

    // Actualizar contraseña
    await req.prisma.user.update({
      where: { id: userId },
      data: { password: newPassword } // Se hasheará automáticamente
    });

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Crear permisos por defecto según el rol
 */
const createDefaultPermissions = async (prisma, userId, role) => {
  const permissions = [];

  switch (role) {
    case 'SUPER_ADMIN':
      // SUPER_ADMIN no necesita permisos explícitos, tiene acceso total
      break;
      
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

  // Crear permisos
  for (const permission of permissions) {
    await prisma.userPermission.create({
      data: {
        userId,
        module: permission.module,
        actions: permission.actions
      }
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword
};