const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/csv';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        cb(null, `estudiantes-${timestamp}.csv`);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos CSV'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

// Función para validar datos del estudiante
function validateStudentData(student) {
    const errors = [];
    
    // Validaciones requeridas
    if (!student.documento || student.documento.trim() === '') {
        errors.push('Documento es requerido');
    }
    
    if (!student.nombre || student.nombre.trim() === '') {
        errors.push('Nombre es requerido');
    }
    
    if (!student.apellido || student.apellido.trim() === '') {
        errors.push('Apellido es requerido');
    }
    
    if (!student.grado || !['6', '7', '8', '9', '10', '11'].includes(student.grado)) {
        errors.push('Grado debe ser 6, 7, 8, 9, 10 o 11');
    }
    
    if (!student.curso || !['A', 'B', 'C'].includes(student.curso.toUpperCase())) {
        errors.push('Curso debe ser A, B o C');
    }
    
    if (!student.genero || !['M', 'F'].includes(student.genero.toUpperCase())) {
        errors.push('Género debe ser M o F');
    }
    
    // Validación de email
    if (student.email && student.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(student.email)) {
            errors.push('Email no tiene formato válido');
        }
    }
    
    // Validación de teléfono
    if (student.telefono && student.telefono.trim() !== '') {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(student.telefono.replace(/\s/g, ''))) {
            errors.push('Teléfono debe tener 10 dígitos');
        }
    }
    
    // Validación de fecha de nacimiento
    if (student.fecha_nacimiento && student.fecha_nacimiento.trim() !== '') {
        const date = new Date(student.fecha_nacimiento);
        if (isNaN(date.getTime())) {
            errors.push('Fecha de nacimiento no es válida');
        }
    }
    
    return errors;
}

// Función para procesar el archivo CSV
async function processCSV(filePath, institutionId) {
    return new Promise((resolve, reject) => {
        const students = [];
        const errors = [];
        let rowNumber = 1;
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                rowNumber++;
                
                // Limpiar y normalizar datos
                const student = {
                    documento: row.documento?.trim(),
                    nombre: row.nombre?.trim(),
                    apellido: row.apellido?.trim(),
                    email: row.email?.trim() || null,
                    telefono: row.telefono?.trim() || null,
                    grado: row.grado?.trim(),
                    curso: row.curso?.trim().toUpperCase(),
                    genero: row.genero?.trim().toUpperCase(),
                    fecha_nacimiento: row.fecha_nacimiento?.trim() || null,
                    direccion: row.direccion?.trim() || null,
                    acudiente_nombre: row.acudiente_nombre?.trim() || null,
                    acudiente_telefono: row.acudiente_telefono?.trim() || null,
                    acudiente_email: row.acudiente_email?.trim() || null,
                    estado: row.estado?.trim() || 'activo',
                    institutionId: institutionId
                };
                
                // Validar datos
                const validationErrors = validateStudentData(student);
                if (validationErrors.length > 0) {
                    errors.push({
                        row: rowNumber,
                        documento: student.documento,
                        errors: validationErrors
                    });
                } else {
                    students.push(student);
                }
            })
            .on('end', () => {
                resolve({ students, errors });
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Endpoint para subir CSV
const uploadCSV = upload.single('csvFile');

async function importStudents(req, res) {
    try {
        const institutionId = parseInt(req.params.institutionId);
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ningún archivo'
            });
        }
        
        // Procesar el archivo CSV
        const { students, errors } = await processCSV(req.file.path, institutionId);
        
        // Si hay errores de validación, devolverlos
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Se encontraron errores en el archivo CSV',
                errors: errors,
                validStudents: students.length
            });
        }
        
        // Insertar estudiantes en la base de datos
        const insertedStudents = [];
        const duplicateErrors = [];
        
        for (const student of students) {
            try {
                // Verificar si el estudiante ya existe
                const existingStudent = await prisma.student.findFirst({
                    where: {
                        documento: student.documento,
                        institutionId: institutionId
                    }
                });
                
                if (existingStudent) {
                    duplicateErrors.push({
                        documento: student.documento,
                        nombre: `${student.nombre} ${student.apellido}`,
                        error: 'Estudiante ya existe en la institución'
                    });
                    continue;
                }
                
                // Crear el estudiante
                const newStudent = await prisma.student.create({
                    data: {
                        documento: student.documento,
                        nombre: student.nombre,
                        apellido: student.apellido,
                        email: student.email,
                        telefono: student.telefono,
                        grado: student.grado,
                        curso: student.curso,
                        genero: student.genero,
                        fechaNacimiento: student.fecha_nacimiento ? new Date(student.fecha_nacimiento) : null,
                        direccion: student.direccion,
                        acudienteNombre: student.acudiente_nombre,
                        acudienteTelefono: student.acudiente_telefono,
                        acudienteEmail: student.acudiente_email,
                        estado: student.estado,
                        institutionId: institutionId
                    }
                });
                
                insertedStudents.push(newStudent);
                
            } catch (error) {
                console.error('Error insertando estudiante:', error);
                duplicateErrors.push({
                    documento: student.documento,
                    nombre: `${student.nombre} ${student.apellido}`,
                    error: 'Error al insertar en la base de datos'
                });
            }
        }
        
        // Limpiar archivo temporal
        fs.unlinkSync(req.file.path);
        
        res.json({
            success: true,
            message: `Se importaron ${insertedStudents.length} estudiantes correctamente`,
            imported: insertedStudents.length,
            duplicates: duplicateErrors.length,
            duplicateErrors: duplicateErrors,
            students: insertedStudents
        });
        
    } catch (error) {
        console.error('Error importando estudiantes:', error);
        
        // Limpiar archivo temporal si existe
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

// Endpoint para descargar plantilla CSV
async function downloadTemplate(req, res) {
    try {
        const templatePath = path.join(__dirname, '../templates/estudiantes-plantilla.csv');
        
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({
                success: false,
                message: 'Plantilla no encontrada'
            });
        }
        
        res.download(templatePath, 'plantilla-estudiantes.csv', (err) => {
            if (err) {
                console.error('Error descargando plantilla:', err);
                res.status(500).json({
                    success: false,
                    message: 'Error descargando plantilla'
                });
            }
        });
        
    } catch (error) {
        console.error('Error en downloadTemplate:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

// Endpoint para obtener estadísticas de importación
async function getImportStats(req, res) {
    try {
        const institutionId = parseInt(req.params.institutionId);
        
        const stats = await prisma.student.groupBy({
            by: ['grado', 'curso'],
            where: {
                institutionId: institutionId
            },
            _count: {
                id: true
            }
        });
        
        const totalStudents = await prisma.student.count({
            where: {
                institutionId: institutionId
            }
        });
        
        res.json({
            success: true,
            totalStudents,
            byGradeAndCourse: stats
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas'
        });
    }
}

module.exports = {
    uploadCSV,
    importStudents,
    downloadTemplate,
    getImportStats
};