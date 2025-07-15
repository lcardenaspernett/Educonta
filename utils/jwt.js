// ===================================
// EDUCONTA - Utilidades JWT
// ===================================

const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generar token de acceso JWT
 */
const generateAccessToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    firstName: user.firstName,
    lastName: user.lastName,
    type: 'access'
  };

  const options = {
    expiresIn: config.JWT_EXPIRE,
    issuer: config.APP_NAME,
    audience: config.getAppUrl(),
    subject: user.id,
    jwtid: generateJwtId()
  };

  return jwt.sign(payload, config.JWT_SECRET, options);
};

/**
 * Generar token de renovación (refresh token)
 */
const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    type: 'refresh',
    tokenVersion: user.tokenVersion || 0 // Para invalidar tokens si es necesario
  };

  const options = {
    expiresIn: config.JWT_REFRESH_EXPIRE,
    issuer: config.APP_NAME,
    audience: config.getAppUrl(),
    subject: user.id,
    jwtid: generateJwtId()
  };

  return jwt.sign(payload, config.JWT_SECRET, options);
};

/**
 * Generar token temporal para reseteo de contraseña
 */
const generateResetPasswordToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    type: 'password_reset',
    timestamp: Date.now()
  };

  const options = {
    expiresIn: '1h', // Solo válido por 1 hora
    issuer: config.APP_NAME,
    audience: config.getAppUrl(),
    subject: user.id,
    jwtid: generateJwtId()
  };

  return jwt.sign(payload, config.JWT_SECRET, options);
};

/**
 * Generar token de verificación de email
 */
const generateEmailVerificationToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    type: 'email_verification',
    timestamp: Date.now()
  };

  const options = {
    expiresIn: '24h', // Válido por 24 horas
    issuer: config.APP_NAME,
    audience: config.getAppUrl(),
    subject: user.id,
    jwtid: generateJwtId()
  };

  return jwt.sign(payload, config.JWT_SECRET, options);
};

/**
 * Generar token de invitación para nuevos usuarios
 */
const generateInvitationToken = (email, role, institutionId, invitedBy) => {
  const payload = {
    email,
    role,
    institutionId,
    invitedBy,
    type: 'invitation',
    timestamp: Date.now()
  };

  const options = {
    expiresIn: '7d', // Válido por 7 días
    issuer: config.APP_NAME,
    audience: config.getAppUrl(),
    jwtid: generateJwtId()
  };

  return jwt.sign(payload, config.JWT_SECRET, options);
};

/**
 * Verificar y decodificar token
 */
const verifyToken = (token, expectedType = null) => {
  try {
    const options = {
      issuer: config.APP_NAME,
      audience: config.getAppUrl()
    };

    const decoded = jwt.verify(token, config.JWT_SECRET, options);

    // Verificar tipo de token si se especifica
    if (expectedType && decoded.type !== expectedType) {
      throw new Error(`Token inválido. Esperado: ${expectedType}, recibido: ${decoded.type}`);
    }

    return {
      success: true,
      payload: decoded,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      payload: null,
      error: error.message
    };
  }
};

/**
 * Verificar token sin lanzar excepción
 */
const verifyTokenSafe = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Decodificar token sin verificar (solo para debugging)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

/**
 * Verificar si un token está expirado
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Obtener tiempo restante del token en segundos
 */
const getTokenTimeRemaining = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - currentTime;
    
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Renovar token de acceso usando refresh token
 */
const refreshAccessToken = async (refreshToken, prisma) => {
  try {
    // Verificar refresh token
    const result = verifyToken(refreshToken, 'refresh');
    
    if (!result.success) {
      throw new Error('Refresh token inválido');
    }

    const { userId, tokenVersion } = result.payload;

    // Buscar usuario en base de datos
    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true 
      },
      include: {
        institution: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    // Verificar versión del token si se usa
    if (user.tokenVersion !== undefined && user.tokenVersion !== tokenVersion) {
      throw new Error('Refresh token revocado');
    }

    // Generar nuevo access token
    const newAccessToken = generateAccessToken(user);

    return {
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        institution: user.institution
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generar par de tokens (access + refresh)
 */
const generateTokenPair = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: config.JWT_EXPIRE,
    tokenType: 'Bearer'
  };
};

/**
 * Blacklist de tokens (en memoria - para producción usar Redis)
 */
const tokenBlacklist = new Set();

/**
 * Agregar token a blacklist
 */
const blacklistToken = (token) => {
  const decoded = jwt.decode(token);
  if (decoded && decoded.jti) {
    tokenBlacklist.add(decoded.jti);
  }
};

/**
 * Verificar si token está en blacklist
 */
const isTokenBlacklisted = (token) => {
  const decoded = jwt.decode(token);
  if (decoded && decoded.jti) {
    return tokenBlacklist.has(decoded.jti);
  }
  return false;
};

/**
 * Limpiar tokens expirados de blacklist
 */
const cleanupBlacklist = () => {
  // Esta función debería ejecutarse periódicamente
  // En producción, usar Redis con TTL automático
  const now = Math.floor(Date.now() / 1000);
  
  for (const jti of tokenBlacklist) {
    // Lógica para verificar si el token ha expirado
    // Por simplicidad, limpiamos todo cada cierto tiempo
  }
};

/**
 * Generar ID único para JWT
 */
const generateJwtId = () => {
  return require('crypto')
    .randomBytes(16)
    .toString('hex') + 
    Date.now().toString(36);
};

/**
 * Extraer token del header Authorization
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Crear respuesta estándar de autenticación
 */
const createAuthResponse = (user, tokens) => {
  return {
    success: true,
    message: 'Autenticación exitosa',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      institution: user.institution ? {
        id: user.institution.id,
        name: user.institution.name,
        nit: user.institution.nit
      } : null,
      lastLogin: user.lastLogin
    },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: tokens.tokenType
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Middleware para limpiar blacklist periódicamente
 */
const startBlacklistCleanup = () => {
  // Ejecutar limpieza cada 6 horas
  setInterval(cleanupBlacklist, 6 * 60 * 60 * 1000);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken,
  generateEmailVerificationToken,
  generateInvitationToken,
  verifyToken,
  verifyTokenSafe,
  decodeToken,
  isTokenExpired,
  getTokenTimeRemaining,
  refreshAccessToken,
  generateTokenPair,
  blacklistToken,
  isTokenBlacklisted,
  cleanupBlacklist,
  generateJwtId,
  extractTokenFromHeader,
  createAuthResponse,
  startBlacklistCleanup
};