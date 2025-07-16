// ===================================
// EDUCONTA - Controlador de Estudiantes
// ===================================

const { validationResult } = require('express-validator');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');

/**
 * Helper para obtener la institución del usuario
 */
const getInstitutionId = async (req) => {
  if (req.user.role === 'SUPER_ADMIN') {
    if (req.query.institutionId) {
      return req.query.institutionId;
    } else {
      const firstInstitution = await req.prisma.institution.findFirst({
        where: { isActive: true }
      });
      return firstInstitution?.id || null;
    }
  } else {
    return req.user.institutionId;
  }
};

/**
 * Obtener lista de estudiantes con filtros y paginación
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      grade = '',
      section = '',
      isActive = 'true',
      sortBy = 'lastName',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    let institutionId;
    if (req.user.role === 'SUPER_ADMIN') {
      // Super Admin puede ver estudiantes de cualquier institución
      // Si no especifica institución, buscar la primera disponible
      if (req.query.institutionId) {
        institutionId = req.query.institutionId;
      } else {
        // Buscar la primera institución disponible para Super Admin
        const firstInstitution = await req.prisma.institution.findFirst({
          where: { isActive: true }
        });
        if (firstInstitution) {
          institutionId = firstInstitution.id;
        }
      }
    } else {
      institutionId = req.user.institutionId;
    }

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'No hay instituciones disponibles'
      });
    }

    const where = {
      institutionId: institutionId
    };

    // Filtro por estado activo
    if (isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    // Filtro por grado
    if (grade) {
      where.grade = grade;
    }

    // Filtro por sección
    if (section) {
      where.section = section;
    }

    // Búsqueda por texto
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentCode: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Configurar ordenamiento
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Calcular paginación
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    // Ejecutar consultas
    const [students, totalCount] = await Promise.all([
      req.prisma.student.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          studentCode: true,
          firstName: true,
          lastName: true,
          documentType: true,
          documentNumber: true,
          grade: true,
          section: true,
          birthDate: true,
          parentName: true,
          parentPhone: true,
          parentEmail: true,
          address: true,
          isActive: true,
          enrollmentDate: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      req.prisma.student.count({ where })
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / take);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: students,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: take,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un estudiante por ID
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Determinar institución
    let institutionId;
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.query.institutionId) {
        institutionId = req.query.institutionId;
      } else {
        const firstInstitution = await req.prisma.institution.findFirst({
          where: { isActive: true }
        });
        if (firstInstitution) {
          institutionId = firstInstitution.id;
        }
      }
    } else {
      institutionId = req.user.institutionId;
    }

    const student = await req.prisma.student.findFirst({
      where: {
        id,
        institutionId: institutionId
      },
      include: {
        paymentAssignments: {
          include: {
            paymentEvent: true
          },
          orderBy: {
            assignedDate: 'desc'
          }
        },
        invoices: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        }
      }
    });

    if (!student) {
      return next(new NotFoundError('Estudiante no encontrado'));
    }

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Crear nuevo estudiante
 */
const createStudent = async (req, res, next) => {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de estudiante inválidos', errors.array()));
    }

    const {
      studentCode,
      firstName,
      lastName,
      documentType,
      documentNumber,
      grade,
      section,
      birthDate,
      parentName,
      parentPhone,
      parentEmail,
      address
    } = req.body;

    const institutionId = await getInstitutionId(req);
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'No hay instituciones disponibles'
      });
    }

    // Verificar que no exista estudiante con el mismo código
    const existingByCode = await req.prisma.student.findUnique({
      where: {
        institutionId_studentCode: {
          institutionId,
          studentCode
        }
      }
    });

    if (existingByCode) {
      return next(new ConflictError('Ya existe un estudiante con este código'));
    }

    // Verificar que no exista estudiante con el mismo documento
    const existingByDocument = await req.prisma.student.findUnique({
      where: {
        institutionId_documentNumber: {
          institutionId,
          documentNumber
        }
      }
    });

    if (existingByDocument) {
      return next(new ConflictError('Ya existe un estudiante con este número de documento'));
    }

    // Crear estudiante
    const student = await req.prisma.student.create({
      data: {
        studentCode,
        firstName,
        lastName,
        documentType,
        documentNumber,
        grade,
        section,
        birthDate: birthDate ? new Date(birthDate) : null,
        parentName,
        parentPhone,
        parentEmail,
        address,
        institutionId,
        isActive: true,
        enrollmentDate: new Date()
      }
    });

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        tableName: 'students',
        recordId: student.id,
        newValues: {
          studentCode,
          firstName,
          lastName,
          grade
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId,
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Estudiante creado exitosamente',
      data: student
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar estudiante
 */
const updateStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Datos de estudiante inválidos', errors.array()));
    }

    const { id } = req.params;
    const {
      studentCode,
      firstName,
      lastName,
      documentType,
      documentNumber,
      grade,
      section,
      birthDate,
      parentName,
      parentPhone,
      parentEmail,
      address,
      isActive
    } = req.body;

    const institutionId = await getInstitutionId(req);
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'No hay instituciones disponibles'
      });
    }

    // Verificar que el estudiante existe
    const existingStudent = await req.prisma.student.findFirst({
      where: {
        id,
        institutionId
      }
    });

    if (!existingStudent) {
      return next(new NotFoundError('Estudiante no encontrado'));
    }

    // Verificar unicidad de código (si cambió)
    if (studentCode && studentCode !== existingStudent.studentCode) {
      const existingByCode = await req.prisma.student.findUnique({
        where: {
          institutionId_studentCode: {
            institutionId,
            studentCode
          }
        }
      });

      if (existingByCode) {
        return next(new ConflictError('Ya existe un estudiante con este código'));
      }
    }

    // Verificar unicidad de documento (si cambió)
    if (documentNumber && documentNumber !== existingStudent.documentNumber) {
      const existingByDocument = await req.prisma.student.findUnique({
        where: {
          institutionId_documentNumber: {
            institutionId,
            documentNumber
          }
        }
      });

      if (existingByDocument) {
        return next(new ConflictError('Ya existe un estudiante con este número de documento'));
      }
    }

    // Actualizar estudiante
    const updatedStudent = await req.prisma.student.update({
      where: { id },
      data: {
        studentCode,
        firstName,
        lastName,
        documentType,
        documentNumber,
        grade,
        section,
        birthDate: birthDate ? new Date(birthDate) : null,
        parentName,
        parentPhone,
        parentEmail,
        address,
        isActive: isActive !== undefined ? isActive : existingStudent.isActive
      }
    });

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'students',
        recordId: id,
        oldValues: {
          studentCode: existingStudent.studentCode,
          firstName: existingStudent.firstName,
          lastName: existingStudent.lastName,
          grade: existingStudent.grade
        },
        newValues: {
          studentCode,
          firstName,
          lastName,
          grade
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Estudiante actualizado exitosamente',
      data: updatedStudent
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar estudiante (soft delete)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institutionId = await getInstitutionId(req);
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'No hay instituciones disponibles'
      });
    }

    // Verificar que el estudiante existe
    const student = await req.prisma.student.findFirst({
      where: {
        id,
        institutionId
      }
    });

    if (!student) {
      return next(new NotFoundError('Estudiante no encontrado'));
    }

    // Verificar si tiene pagos o facturas asociadas
    const [paymentsCount, invoicesCount] = await Promise.all([
      req.prisma.paymentAssignment.count({
        where: { studentId: id }
      }),
      req.prisma.invoice.count({
        where: { studentId: id }
      })
    ]);

    if (paymentsCount > 0 || invoicesCount > 0) {
      // Solo desactivar si tiene registros asociados
      const updatedStudent = await req.prisma.student.update({
        where: { id },
        data: { isActive: false }
      });

      // Registrar auditoría
      await req.prisma.auditLog.create({
        data: {
          action: 'DEACTIVATE',
          tableName: 'students',
          recordId: id,
          oldValues: { isActive: true },
          newValues: { isActive: false },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          institutionId,
          userId: req.user.id
        }
      });

      return res.json({
        success: true,
        message: 'Estudiante desactivado exitosamente (tiene registros asociados)',
        data: updatedStudent
      });
    }

    // Eliminar completamente si no tiene registros asociados
    await req.prisma.student.delete({
      where: { id }
    });

    // Registrar auditoría
    await req.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        tableName: 'students',
        recordId: id,
        oldValues: {
          studentCode: student.studentCode,
          firstName: student.firstName,
          lastName: student.lastName
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        institutionId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Estudiante eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de estudiantes
 */
const getStudentStats = async (req, res, next) => {
  try {
    const institutionId = await getInstitutionId(req);
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'No hay instituciones disponibles'
      });
    }

    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      gradeStats,
      recentEnrollments
    ] = await Promise.all([
      // Total de estudiantes
      req.prisma.student.count({
        where: { institutionId }
      }),
      
      // Estudiantes activos
      req.prisma.student.count({
        where: { institutionId, isActive: true }
      }),
      
      // Estudiantes inactivos
      req.prisma.student.count({
        where: { institutionId, isActive: false }
      }),
      
      // Estadísticas por grado
      req.prisma.student.groupBy({
        by: ['grade'],
        where: { institutionId, isActive: true },
        _count: { grade: true },
        orderBy: { grade: 'asc' }
      }),
      
      // Matrículas recientes (últimos 30 días)
      req.prisma.student.count({
        where: {
          institutionId,
          enrollmentDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        recentEnrollments,
        byGrade: gradeStats.map(stat => ({
          grade: stat.grade,
          count: stat._count.grade
        }))
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtener opciones para formularios (grados, secciones, etc.)
 */
const getStudentOptions = async (req, res, next) => {
  try {
    const institutionId = await getInstitutionId(req);
    
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'No hay instituciones disponibles'
      });
    }

    const [grades, sections] = await Promise.all([
      // Grados únicos
      req.prisma.student.findMany({
        where: { institutionId, isActive: true },
        select: { grade: true },
        distinct: ['grade'],
        orderBy: { grade: 'asc' }
      }),
      
      // Secciones únicas
      req.prisma.student.findMany({
        where: { institutionId, isActive: true, section: { not: null } },
        select: { section: true },
        distinct: ['section'],
        orderBy: { section: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        grades: grades.map(g => g.grade),
        sections: sections.map(s => s.section),
        documentTypes: [
          { value: 'TI', label: 'Tarjeta de Identidad' },
          { value: 'CC', label: 'Cédula de Ciudadanía' },
          { value: 'CE', label: 'Cédula de Extranjería' },
          { value: 'PP', label: 'Pasaporte' },
          { value: 'RC', label: 'Registro Civil' }
        ]
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  getStudentOptions
};