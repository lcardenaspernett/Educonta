// ===================================
// EDUCONTA - Configuración de Multer
// ===================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('./config');

// ===================================
// UTILIDADES GENERALES
// ===================================

/**
 * Crear directorio si no existe
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Generar nombre de archivo único
 */
const generateUniqueFilename = (originalname, prefix = '') => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  const baseName = path.basename(originalname, extension);
  
  return `${prefix}${baseName}-${timestamp}-${randomString}${extension}`;
};

/**
 * Validar tipo de archivo
 */
const isAllowedFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.mimetype);
};

/**
 * Obtener categoría de archivo por extensión
 */
const getFileCategory = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  
  const categories = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    spreadsheets: ['.xlsx', '.xls', '.csv'],
    archives: ['.zip', '.rar', '.7z']
  };

  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(extension)) {
      return category;
    }
  }
  
  return 'other';
};

// ===================================
// CONFIGURACIONES ESPECÍFICAS
// ===================================

/**
 * Configuración para logos de instituciones
 */
const logoConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const logoDir = path.join(__dirname, '../uploads/logos');
      ensureDirectoryExists(logoDir);
      cb(null, logoDir);
    },
    filename: (req, file, cb) => {
      const institutionId = req.params.institutionId || req.body.institutionId || 'default';
      const filename = generateUniqueFilename(file.originalname, `logo-${institutionId}-`);
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (isAllowedFileType(file, allowedTypes)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG, GIF, WebP)'), false);
    }
  }
};

/**
 * Configuración para datos de estudiantes (CSV/Excel)
 */
const studentDataConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dataDir = path.join(__dirname, '../uploads/student-data');
      ensureDirectoryExists(dataDir);
      cb(null, dataDir);
    },
    filename: (req, file, cb) => {
      const institutionId = req.user?.institutionId || req.params.institutionId || 'default';
      const filename = generateUniqueFilename(file.originalname, `students-${institutionId}-`);
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (isAllowedFileType(file, allowedTypes)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV o Excel (.csv, .xls, .xlsx)'), false);
    }
  }
};

/**
 * Configuración para documentos generales
 */
const documentsConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const category = getFileCategory(file.originalname);
      const docsDir = path.join(__dirname, '../uploads/documents', category);
      ensureDirectoryExists(docsDir);
      cb(null, docsDir);
    },
    filename: (req, file, cb) => {
      const institutionId = req.user?.institutionId || 'general';
      const filename = generateUniqueFilename(file.originalname, `doc-${institutionId}-`);
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (isAllowedFileType(file, allowedTypes)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
};

/**
 * Configuración para facturas y documentos contables
 */
const invoiceConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const invoiceDir = path.join(__dirname, '../uploads/invoices');
      ensureDirectoryExists(invoiceDir);
      cb(null, invoiceDir);
    },
    filename: (req, file, cb) => {
      const institutionId = req.user?.institutionId || 'default';
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const filename = generateUniqueFilename(file.originalname, `invoice-${institutionId}-${timestamp}-`);
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
    files: 3
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (isAllowedFileType(file, allowedTypes)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten PDFs, imágenes o archivos de datos'), false);
    }
  }
};

/**
 * Configuración para importación masiva de datos
 */
const bulkImportConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const importDir = path.join(__dirname, '../uploads/bulk-import');
      ensureDirectoryExists(importDir);
      cb(null, importDir);
    },
    filename: (req, file, cb) => {
      const institutionId = req.user?.institutionId || 'default';
      const importType = req.body.importType || 'general';
      const filename = generateUniqueFilename(file.originalname, `${importType}-${institutionId}-`);
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB para imports masivos
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
    
    if (isAllowedFileType(file, allowedTypes)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV, Excel o JSON para importación'), false);
    }
  }
};

// ===================================
// INSTANCIAS DE MULTER
// ===================================

const logoUpload = multer(logoConfig);
const studentDataUpload = multer(studentDataConfig);
const documentsUpload = multer(documentsConfig);
const invoiceUpload = multer(invoiceConfig);
const bulkImportUpload = multer(bulkImportConfig);

// ===================================
// MIDDLEWARE DE LIMPIEZA
// ===================================

/**
 * Middleware para limpiar archivos temporales en caso de error
 */
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Si hay error y hay archivos subidos, limpiarlos
    if (res.statusCode >= 400 && req.files) {
      const filesToClean = Array.isArray(req.files) ? req.files : [req.files];
      
      filesToClean.forEach(file => {
        if (file && file.path && fs.existsSync(file.path)) {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error limpiando archivo temporal:', err);
          });
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware para validar tamaño total de archivos múltiples
 */
const validateTotalSize = (maxTotalSize) => {
  return (req, res, next) => {
    if (req.files && Array.isArray(req.files)) {
      const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
      
      if (totalSize > maxTotalSize) {
        return res.status(400).json({
          success: false,
          error: `El tamaño total de archivos excede el límite de ${maxTotalSize / 1024 / 1024}MB`
        });
      }
    }
    
    next();
  };
};

/**
 * Middleware para agregar metadata a archivos subidos
 */
const addFileMetadata = (req, res, next) => {
  if (req.file) {
    req.file.uploadedAt = new Date().toISOString();
    req.file.uploadedBy = req.user?.id;
    req.file.institutionId = req.user?.institutionId;
    req.file.category = getFileCategory(req.file.filename);
  }
  
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(file => {
      file.uploadedAt = new Date().toISOString();
      file.uploadedBy = req.user?.id;
      file.institutionId = req.user?.institutionId;
      file.category = getFileCategory(file.filename);
    });
  }
  
  next();
};

// ===================================
// FUNCIONES DE LIMPIEZA PERIÓDICA
// ===================================

/**
 * Limpiar archivos temporales antiguos
 */
const cleanupOldTempFiles = () => {
  const tempDirs = [
    path.join(__dirname, '../uploads/temp'),
    path.join(__dirname, '../uploads/bulk-import')
  ];
  
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas
  
  tempDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.readdir(dir, (err, files) => {
        if (err) return;
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          fs.stat(filePath, (err, stats) => {
            if (err) return;
            
            if (Date.now() - stats.mtime.getTime() > maxAge) {
              fs.unlink(filePath, (err) => {
                if (err) console.error('Error eliminando archivo temporal:', err);
                else console.log('Archivo temporal eliminado:', file);
              });
            }
          });
        });
      });
    }
  });
};

// Ejecutar limpieza cada 6 horas
setInterval(cleanupOldTempFiles, 6 * 60 * 60 * 1000);

// ===================================
// CONFIGURACIÓN DINÁMICA
// ===================================

/**
 * Crear configuración de multer personalizada
 */
const createCustomConfig = (options = {}) => {
  const defaultOptions = {
    destination: path.join(__dirname, '../uploads/custom'),
    fileSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    prefix: 'custom-'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        ensureDirectoryExists(finalOptions.destination);
        cb(null, finalOptions.destination);
      },
      filename: (req, file, cb) => {
        const filename = generateUniqueFilename(file.originalname, finalOptions.prefix);
        cb(null, filename);
      }
    }),
    limits: {
      fileSize: finalOptions.fileSize,
      files: finalOptions.maxFiles || 1
    },
    fileFilter: (req, file, cb) => {
      if (isAllowedFileType(file, finalOptions.allowedTypes)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipos permitidos: ${finalOptions.allowedTypes.join(', ')}`), false);
      }
    }
  });
};

module.exports = {
  // Instancias configuradas
  logoUpload,
  studentDataUpload,
  documentsUpload,
  invoiceUpload,
  bulkImportUpload,
  
  // Middlewares
  cleanupOnError,
  validateTotalSize,
  addFileMetadata,
  
  // Utilidades
  ensureDirectoryExists,
  generateUniqueFilename,
  isAllowedFileType,
  getFileCategory,
  createCustomConfig,
  
  // Configuraciones base
  logoConfig,
  studentDataConfig,
  documentsConfig,
  invoiceConfig,
  bulkImportConfig
};