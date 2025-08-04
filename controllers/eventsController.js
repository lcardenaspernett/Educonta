const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los eventos de una institución
async function getEvents(req, res) {
    try {
        const institutionId = req.params.institutionId;
        
        const events = await prisma.event.findMany({
            where: {
                institutionId: institutionId
            },
            include: {
                participations: {
                    include: {
                        student: true
                    }
                },
                transactions: true,
                _count: {
                    select: {
                        participations: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calcular estadísticas para cada evento
        const eventsWithStats = events.map(event => {
            const totalParticipants = event.participations.length;
            const paidParticipants = event.participations.filter(p => p.estado === 'paid').length;
            const partialParticipants = event.participations.filter(p => p.estado === 'partial').length;
            const pendingParticipants = event.participations.filter(p => p.estado === 'pending').length;
            
            const totalPaid = event.participations.reduce((sum, p) => sum + parseFloat(p.montoPagado), 0);
            const progress = event.metaRecaudacion > 0 ? (totalPaid / parseFloat(event.metaRecaudacion)) * 100 : 0;

            return {
                ...event,
                stats: {
                    totalParticipants,
                    paidParticipants,
                    partialParticipants,
                    pendingParticipants,
                    totalPaid,
                    progress: Math.round(progress * 100) / 100
                }
            };
        });

        res.json({
            success: true,
            events: eventsWithStats
        });

    } catch (error) {
        console.error('Error obteniendo eventos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo eventos',
            error: error.message
        });
    }
}

// Crear un nuevo evento
async function createEvent(req, res) {
    try {
        const institutionId = req.params.institutionId;
        const {
            nombre,
            tipo,
            descripcion,
            fechaInicio,
            fechaFin,
            metaRecaudacion,
            estado,
            // Campos específicos
            precioBoletaRifa,
            maxBoletasRifa,
            precioCartonBingo,
            maxCartonesBingo,
            valorDerecho,
            // Participantes
            participantes
        } = req.body;

        // Validaciones básicas
        if (!nombre || !tipo || !fechaInicio || !fechaFin || !metaRecaudacion) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // Crear el evento
        const event = await prisma.event.create({
            data: {
                nombre,
                tipo,
                descripcion,
                fechaInicio: new Date(fechaInicio),
                fechaFin: new Date(fechaFin),
                metaRecaudacion: parseFloat(metaRecaudacion),
                estado: estado || 'planning',
                precioBoletaRifa: precioBoletaRifa ? parseFloat(precioBoletaRifa) : null,
                maxBoletasRifa: maxBoletasRifa ? parseInt(maxBoletasRifa) : null,
                precioCartonBingo: precioCartonBingo ? parseFloat(precioCartonBingo) : null,
                maxCartonesBingo: maxCartonesBingo ? parseInt(maxCartonesBingo) : null,
                valorDerecho: valorDerecho ? parseFloat(valorDerecho) : null,
                institutionId
            }
        });

        // Si se especificaron participantes, crearlos
        if (participantes && participantes.length > 0) {
            const participationsData = participantes.map(studentId => ({
                eventId: event.id,
                studentId: studentId,
                estado: 'pending'
            }));

            await prisma.eventParticipation.createMany({
                data: participationsData,
                skipDuplicates: true
            });
        }

        // Obtener el evento completo con participaciones
        const completeEvent = await prisma.event.findUnique({
            where: { id: event.id },
            include: {
                participations: {
                    include: {
                        student: true
                    }
                },
                _count: {
                    select: {
                        participations: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            event: completeEvent
        });

    } catch (error) {
        console.error('Error creando evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando evento',
            error: error.message
        });
    }
}

// Actualizar un evento
async function updateEvent(req, res) {
    try {
        const eventId = req.params.eventId;
        const updateData = req.body;

        // Convertir fechas si están presentes
        if (updateData.fechaInicio) {
            updateData.fechaInicio = new Date(updateData.fechaInicio);
        }
        if (updateData.fechaFin) {
            updateData.fechaFin = new Date(updateData.fechaFin);
        }

        // Convertir números si están presentes
        if (updateData.metaRecaudacion) {
            updateData.metaRecaudacion = parseFloat(updateData.metaRecaudacion);
        }
        if (updateData.precioBoletaRifa) {
            updateData.precioBoletaRifa = parseFloat(updateData.precioBoletaRifa);
        }
        if (updateData.maxBoletasRifa) {
            updateData.maxBoletasRifa = parseInt(updateData.maxBoletasRifa);
        }
        if (updateData.precioCartonBingo) {
            updateData.precioCartonBingo = parseFloat(updateData.precioCartonBingo);
        }
        if (updateData.maxCartonesBingo) {
            updateData.maxCartonesBingo = parseInt(updateData.maxCartonesBingo);
        }
        if (updateData.valorDerecho) {
            updateData.valorDerecho = parseFloat(updateData.valorDerecho);
        }

        const event = await prisma.event.update({
            where: { id: eventId },
            data: updateData,
            include: {
                participations: {
                    include: {
                        student: true
                    }
                },
                _count: {
                    select: {
                        participations: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Evento actualizado exitosamente',
            event
        });

    } catch (error) {
        console.error('Error actualizando evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando evento',
            error: error.message
        });
    }
}

// Eliminar un evento
async function deleteEvent(req, res) {
    try {
        const eventId = req.params.eventId;

        // Verificar si el evento existe
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                participations: true,
                transactions: true
            }
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // Verificar si hay transacciones asociadas
        if (event.transactions.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar un evento con transacciones asociadas'
            });
        }

        // Eliminar participaciones primero
        await prisma.eventParticipation.deleteMany({
            where: { eventId: eventId }
        });

        // Eliminar el evento
        await prisma.event.delete({
            where: { id: eventId }
        });

        res.json({
            success: true,
            message: 'Evento eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando evento',
            error: error.message
        });
    }
}

// Obtener participantes de un evento
async function getEventParticipants(req, res) {
    try {
        const eventId = req.params.eventId;

        const participants = await prisma.eventParticipation.findMany({
            where: { eventId },
            include: {
                student: true
            },
            orderBy: [
                { student: { grado: 'asc' } },
                { student: { curso: 'asc' } },
                { student: { apellido: 'asc' } }
            ]
        });

        res.json({
            success: true,
            participants
        });

    } catch (error) {
        console.error('Error obteniendo participantes:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo participantes',
            error: error.message
        });
    }
}

// Registrar pago de un participante
async function registerPayment(req, res) {
    try {
        const { eventId, studentId } = req.params;
        const { monto, descripcion, referencia } = req.body;

        if (!monto || monto <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a 0'
            });
        }

        // Obtener la participación
        const participation = await prisma.eventParticipation.findUnique({
            where: {
                eventId_studentId: {
                    eventId,
                    studentId
                }
            },
            include: {
                event: true,
                student: true
            }
        });

        if (!participation) {
            return res.status(404).json({
                success: false,
                message: 'Participación no encontrada'
            });
        }

        // Calcular nuevo monto pagado
        const nuevoMontoPagado = parseFloat(participation.montoPagado) + parseFloat(monto);
        
        // Determinar nuevo estado
        let nuevoEstado = 'partial';
        const montoEsperado = participation.event.tipo === 'raffle' ? participation.event.precioBoletaRifa :
                             participation.event.tipo === 'bingo' ? participation.event.precioCartonBingo :
                             participation.event.tipo === 'graduation' ? participation.event.valorDerecho :
                             parseFloat(participation.event.metaRecaudacion) / await prisma.eventParticipation.count({ where: { eventId } });

        if (nuevoMontoPagado >= montoEsperado) {
            nuevoEstado = 'paid';
        }

        // Actualizar participación
        const updatedParticipation = await prisma.eventParticipation.update({
            where: {
                eventId_studentId: {
                    eventId,
                    studentId
                }
            },
            data: {
                montoPagado: nuevoMontoPagado,
                estado: nuevoEstado,
                fechaPago: nuevoEstado === 'paid' ? new Date() : participation.fechaPago
            }
        });

        // Crear transacción del evento
        await prisma.eventTransaction.create({
            data: {
                eventId,
                monto: parseFloat(monto),
                descripcion: descripcion || `Pago de ${participation.student.nombre} ${participation.student.apellido}`,
                tipo: 'payment',
                referencia
            }
        });

        // Actualizar monto recaudado del evento
        const totalRecaudado = await prisma.eventParticipation.aggregate({
            where: { eventId },
            _sum: { montoPagado: true }
        });

        await prisma.event.update({
            where: { id: eventId },
            data: {
                montoRecaudado: totalRecaudado._sum.montoPagado || 0
            }
        });

        res.json({
            success: true,
            message: 'Pago registrado exitosamente',
            participation: updatedParticipation
        });

    } catch (error) {
        console.error('Error registrando pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error registrando pago',
            error: error.message
        });
    }
}

// Agregar participantes a un evento
async function addParticipants(req, res) {
    try {
        const eventId = req.params.eventId;
        const { studentIds } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere una lista de IDs de estudiantes'
            });
        }

        // Crear participaciones
        const participationsData = studentIds.map(studentId => ({
            eventId,
            studentId,
            estado: 'pending'
        }));

        const result = await prisma.eventParticipation.createMany({
            data: participationsData,
            skipDuplicates: true
        });

        res.json({
            success: true,
            message: `Se agregaron ${result.count} participantes al evento`,
            added: result.count
        });

    } catch (error) {
        console.error('Error agregando participantes:', error);
        res.status(500).json({
            success: false,
            message: 'Error agregando participantes',
            error: error.message
        });
    }
}

// Obtener estadísticas de eventos
async function getEventStats(req, res) {
    try {
        const institutionId = req.params.institutionId;

        const stats = await prisma.event.aggregate({
            where: { institutionId },
            _count: { id: true },
            _sum: { 
                metaRecaudacion: true,
                montoRecaudado: true 
            }
        });

        const eventsByStatus = await prisma.event.groupBy({
            by: ['estado'],
            where: { institutionId },
            _count: { id: true }
        });

        const eventsByType = await prisma.event.groupBy({
            by: ['tipo'],
            where: { institutionId },
            _count: { id: true }
        });

        res.json({
            success: true,
            stats: {
                totalEvents: stats._count.id,
                totalTarget: stats._sum.metaRecaudacion || 0,
                totalRaised: stats._sum.montoRecaudado || 0,
                byStatus: eventsByStatus,
                byType: eventsByType
            }
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas',
            error: error.message
        });
    }
}

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventParticipants,
    registerPayment,
    addParticipants,
    getEventStats
};