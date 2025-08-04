// ===================================
// EDUCONTA - Controlador de Estudiantes (Corregido)
// ===================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los estudiantes de una institución
async function getStudents(req, res) {
    try {
        const institutionId = req.params.institutionId;
        
        console.log('🔍 Obteniendo estudiantes para institución:', institutionId);
        
        const studentsFromDB = await prisma.student.findMany({
            where: {
                institutionId: institutionId
            },
            orderBy: [
                { grado: 'asc' },
                { curso: 'asc' },
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });

        console.log('📊 Estudiantes encontrados en DB:', studentsFromDB.length);

        // Transformar datos para que coincidan con el formato esperado por el frontend
        const students = studentsFromDB.map(student => ({
            id: student.id,
            firstName: student.nombre || '',
            lastName: student.apellido || '',
            fullName: `${student.nombre || ''} ${student.apellido || ''}`.trim(),
            documentType: 'TI',
            document: student.documento || '',
            email: student.email || `${(student.nombre || '').toLowerCase().replace(' ', '.')}@estudiante.edu.co`,
            phone: student.telefono || '+57 300 000 0000',
            grade: student.grado || '',
            course: student.curso || '',
            status: student.estado === 'activo' ? 'ACTIVE' : 'INACTIVE',
            enrollmentDate: student.createdAt || new Date().toISOString(),
            birthDate: student.fechaNacimiento || new Date('2008-01-01').toISOString(),
            guardian: {
                name: student.acudienteNombre || 'Acudiente',
                phone: student.acudienteTelefono || '+57 300 000 0000',
                email: student.acudienteEmail || 'acudiente@email.com'
            },
            address: student.direccion || 'Dirección pendiente',
            events: [],
            totalDebt: 0,
            totalPaid: 0,
            createdAt: student.createdAt || new Date().toISOString()
        }));

        console.log('✅ Estudiantes transformados:', students.length);

        res.json({
            success: true,
            students: students
        });

    } catch (error) {
        console.error('❌ Error obteniendo estudiantes:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estudiantes',
            error: error.message
        });
    }
}

// Obtener un estudiante específico
async function getStudent(req, res) {
    try {
        const studentId = req.params.studentId;
        
        console.log('🔍 Obteniendo estudiante:', studentId);
        
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Transformar al formato del frontend
        const transformedStudent = {
            id: student.id,
            firstName: student.nombre || '',
            lastName: student.apellido || '',
            fullName: `${student.nombre || ''} ${student.apellido || ''}`.trim(),
            documentType: 'TI',
            document: student.documento || '',
            email: student.email || '',
            phone: student.telefono || '',
            grade: student.grado || '',
            course: student.curso || '',
            status: student.estado === 'activo' ? 'ACTIVE' : 'INACTIVE',
            address: student.direccion || '',
            guardian: {
                name: student.acudienteNombre || '',
                phone: student.acudienteTelefono || '',
                email: student.acudienteEmail || ''
            },
            events: [],
            totalDebt: 0,
            totalPaid: 0
        };

        res.json({
            success: true,
            student: transformedStudent
        });

    } catch (error) {
        console.error('❌ Error obteniendo estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estudiante',
            error: error.message
        });
    }
}

// Actualizar un estudiante
async function updateStudent(req, res) {
    try {
        const studentId = req.params.studentId;
        const updateData = req.body;
        
        console.log('🔧 Actualizando estudiante:', studentId);
        console.log('📝 Datos recibidos:', updateData);

        // Verificar que el estudiante existe
        const existingStudent = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Preparar datos para actualización
        const dataToUpdate = {};
        
        if (updateData.nombre !== undefined) dataToUpdate.nombre = updateData.nombre;
        if (updateData.apellido !== undefined) dataToUpdate.apellido = updateData.apellido;
        if (updateData.documento !== undefined) dataToUpdate.documento = updateData.documento;
        if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
        if (updateData.telefono !== undefined) dataToUpdate.telefono = updateData.telefono;
        if (updateData.grado !== undefined) dataToUpdate.grado = updateData.grado;
        if (updateData.curso !== undefined) dataToUpdate.curso = updateData.curso;
        if (updateData.direccion !== undefined) dataToUpdate.direccion = updateData.direccion;
        if (updateData.acudienteNombre !== undefined) dataToUpdate.acudienteNombre = updateData.acudienteNombre;
        if (updateData.acudienteTelefono !== undefined) dataToUpdate.acudienteTelefono = updateData.acudienteTelefono;
        if (updateData.acudienteEmail !== undefined) dataToUpdate.acudienteEmail = updateData.acudienteEmail;

        console.log('💾 Datos a actualizar en BD:', dataToUpdate);

        // Actualizar en la base de datos
        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: dataToUpdate
        });

        console.log('✅ Estudiante actualizado en BD:', updatedStudent.nombre, updatedStudent.apellido);

        // Transformar respuesta al formato del frontend
        const transformedStudent = {
            id: updatedStudent.id,
            firstName: updatedStudent.nombre || '',
            lastName: updatedStudent.apellido || '',
            fullName: `${updatedStudent.nombre || ''} ${updatedStudent.apellido || ''}`.trim(),
            documentType: 'TI',
            document: updatedStudent.documento || '',
            email: updatedStudent.email || '',
            phone: updatedStudent.telefono || '',
            grade: updatedStudent.grado || '',
            course: updatedStudent.curso || '',
            status: updatedStudent.estado === 'activo' ? 'ACTIVE' : 'INACTIVE',
            address: updatedStudent.direccion || '',
            guardian: {
                name: updatedStudent.acudienteNombre || '',
                phone: updatedStudent.acudienteTelefono || '',
                email: updatedStudent.acudienteEmail || ''
            }
        };

        res.json({
            success: true,
            message: 'Estudiante actualizado exitosamente',
            student: transformedStudent
        });

    } catch (error) {
        console.error('❌ Error actualizando estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando estudiante',
            error: error.message
        });
    }
}

// Crear un nuevo estudiante
async function createStudent(req, res) {
    try {
        const institutionId = req.params.institutionId;
        const {
            documento,
            nombre,
            apellido,
            email,
            telefono,
            grado,
            curso,
            genero,
            fechaNacimiento,
            direccion,
            acudienteNombre,
            acudienteTelefono,
            acudienteEmail,
            estado
        } = req.body;

        console.log('➕ Creando nuevo estudiante para institución:', institutionId);

        // Validaciones básicas
        if (!documento || !nombre || !apellido || !grado || !curso) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: documento, nombre, apellido, grado, curso'
            });
        }

        // Verificar si el estudiante ya existe
        const existingStudent = await prisma.student.findFirst({
            where: {
                documento: documento,
                institutionId: institutionId
            }
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un estudiante con este documento en la institución'
            });
        }

        // Crear el estudiante
        const student = await prisma.student.create({
            data: {
                documento,
                nombre,
                apellido,
                email: email || null,
                telefono: telefono || null,
                grado,
                curso,
                genero: genero || 'M',
                fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
                direccion: direccion || null,
                acudienteNombre: acudienteNombre || null,
                acudienteTelefono: acudienteTelefono || null,
                acudienteEmail: acudienteEmail || null,
                estado: estado || 'activo',
                institutionId: institutionId
            }
        });

        console.log('✅ Estudiante creado:', student.nombre, student.apellido);

        res.status(201).json({
            success: true,
            message: 'Estudiante creado exitosamente',
            student: student
        });

    } catch (error) {
        console.error('❌ Error creando estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando estudiante',
            error: error.message
        });
    }
}

// Eliminar un estudiante
async function deleteStudent(req, res) {
    try {
        const studentId = req.params.studentId;

        console.log('🗑️ Eliminando estudiante:', studentId);

        // Verificar si el estudiante existe
        const existingStudent = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Eliminar el estudiante
        await prisma.student.delete({
            where: { id: studentId }
        });

        console.log('✅ Estudiante eliminado:', existingStudent.nombre, existingStudent.apellido);

        res.json({
            success: true,
            message: 'Estudiante eliminado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error eliminando estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando estudiante',
            error: error.message
        });
    }
}

// Obtener estadísticas de estudiantes
async function getStudentStats(req, res) {
    try {
        const institutionId = req.params.institutionId;

        console.log('📊 Obteniendo estadísticas para institución:', institutionId);

        const totalStudents = await prisma.student.count({
            where: { institutionId: institutionId }
        });

        const activeStudents = await prisma.student.count({
            where: { 
                institutionId: institutionId,
                estado: 'activo'
            }
        });

        const byGrade = await prisma.student.groupBy({
            by: ['grado'],
            where: { institutionId: institutionId },
            _count: { id: true }
        });

        const byCourse = await prisma.student.groupBy({
            by: ['grado', 'curso'],
            where: { institutionId: institutionId },
            _count: { id: true }
        });

        res.json({
            success: true,
            stats: {
                totalStudents,
                activeStudents,
                inactiveStudents: totalStudents - activeStudents,
                byGrade,
                byCourse
            }
        });

    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas',
            error: error.message
        });
    }
}

module.exports = {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentStats
};