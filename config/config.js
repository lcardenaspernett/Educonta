// ===================================
// EDUCONTA - Configuración Central
// ===================================

require('dotenv').config();

const config = {
  // ===================================
  // CONFIGURACIÓN GENERAL
  // ===================================
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  APP_NAME: process.env.APP_NAME || 'Educonta',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',

  // ===================================
  // BASE DE DATOS
  // ===================================
  DATABASE_URL: process.env.DATABASE_URL,

  // ===================================
  // JWT CONFIGURACIÓN
  // ===================================
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',

  // ===================================
  // ENCRIPTACIÓN
  // ===================================
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,

  // ===================================
  // EMAIL CONFIGURACIÓN
  // ===================================
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.EMAIL_PORT) || 587,
    SECURE: process.env.EMAIL_SECURE === 'true',
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASS,
    FROM_NAME: process.env.EMAIL_FROM_NAME || 'Educonta Sistema',
    FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'noreply@educonta.com'
  },

  // ===================================
  // ARCHIVOS Y UPLOADS
  // ===================================
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    PATH: process.env.UPLOAD_PATH || './uploads',
    ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,csv,xlsx').split(','),
    LOGOS_PATH: './uploads/logos',
    STUDENT_DATA_PATH: './uploads/student-data',
    INVOICES_PATH: './uploads/invoices'
  },

  // ===================================
  // URLs DEL CLIENTE
  // ===================================
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:3000/admin',

  // ===================================
  // SEGURIDAD
  // ===================================
  SECURITY: {
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15, // minutos
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    SESSION_SECRET: process.env.SESSION_SECRET || 'fallback-session-secret',
    CORS_ORIGINS: [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.RAILWAY_STATIC_URL
    ].filter(Boolean)
  },

  // ===================================
  // SUPER ADMIN POR DEFECTO
  // ===================================
  SUPER_ADMIN: {
    EMAIL: process.env.SUPER_ADMIN_EMAIL || 'admin@educonta.com',
    PASSWORD: process.env.SUPER_ADMIN_PASSWORD || 'Admin123!',
    FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
    LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME || 'Administrador'
  },

  // ===================================
  // FACTURACIÓN
  // ===================================
  INVOICE: {
    PREFIX: process.env.INVOICE_PREFIX || 'EDU',
    START_NUMBER: parseInt(process.env.INVOICE_START_NUMBER) || 1,
    TAX_PERCENTAGE: parseFloat(process.env.TAX_PERCENTAGE) || 19
  },

  // ===================================
  // CONFIGURACIÓN REGIONAL
  // ===================================
  LOCALE: {
    CURRENCY: process.env.DEFAULT_CURRENCY || 'COP',
    TIMEZONE: process.env.DEFAULT_TIMEZONE || 'America/Bogota',
    LANGUAGE: process.env.DEFAULT_LANGUAGE || 'es'
  },

  // ===================================
  // REDIS (OPCIONAL)
  // ===================================
  REDIS_URL: process.env.REDIS_URL,

  // ===================================
  // LOGS
  // ===================================
  LOG: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    FILE: process.env.LOG_FILE || './logs/educonta.log'
  },

  // ===================================
  // RAILWAY ESPECÍFICO
  // ===================================
  RAILWAY: {
    STATIC_URL: process.env.RAILWAY_STATIC_URL,
    GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA
  },

  // ===================================
  // DESARROLLO
  // ===================================
  DEBUG: process.env.DEBUG,
  PRISMA_QUERY_LOG: process.env.PRISMA_QUERY_LOG === 'true',

  // ===================================
  // FUNCIONES AUXILIARES
  // ===================================
  
  /**
   * Verifica si estamos en producción
   */
  isProduction() {
    return this.NODE_ENV === 'production';
  },

  /**
   * Verifica si estamos en desarrollo
   */
  isDevelopment() {
    return this.NODE_ENV === 'development';
  },

  /**
   * Verifica si estamos en testing
   */
  isTesting() {
    return this.NODE_ENV === 'test';
  },

  /**
   * Obtiene la URL completa de la aplicación
   */
  getAppUrl() {
    return this.RAILWAY.STATIC_URL || this.APP_URL;
  },

  /**
   * Obtiene la configuración completa de email
   */
  getEmailConfig() {
    return {
      host: this.EMAIL.HOST,
      port: this.EMAIL.PORT,
      secure: this.EMAIL.SECURE,
      auth: {
        user: this.EMAIL.USER,
        pass: this.EMAIL.PASS
      }
    };
  },

  /**
   * Valida que las variables críticas estén configuradas
   */
  validateConfig() {
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET'
    ];

    const missing = requiredVars.filter(varName => {
      if (varName === 'DATABASE_URL') return !this.DATABASE_URL;
      if (varName === 'JWT_SECRET') return !this.JWT_SECRET || this.JWT_SECRET === 'fallback-secret-key-change-in-production';
      return false;
    });

    if (missing.length > 0 && this.isProduction()) {
      throw new Error(`Variables de entorno faltantes en producción: ${missing.join(', ')}`);
    }

    // Advertencias en desarrollo
    if (this.isDevelopment()) {
      if (this.JWT_SECRET === 'fallback-secret-key-change-in-production') {
        console.warn('⚠️  Usando JWT_SECRET por defecto. Cambia esto en producción.');
      }
      if (!this.EMAIL.USER || !this.EMAIL.PASS) {
        console.warn('⚠️  Configuración de email no completa. Las notificaciones no funcionarán.');
      }
    }

    return true;
  }
};

// Validar configuración al cargar
try {
  config.validateConfig();
} catch (error) {
  console.error('❌ Error en configuración:', error.message);
  if (config.isProduction()) {
    process.exit(1);
  }
}

module.exports = config;