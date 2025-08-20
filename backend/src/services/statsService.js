const { User, Ticket, Comment, Attachment, AuditLog } = require("../models");

// Estadísticas para empleados
const getEmployeeStats = async (userId) => {
  try {
    // Mis tickets por estado
    const ticketsByStatus = await Ticket.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Total de tickets creados
    const totalTickets = await Ticket.countDocuments({ createdBy: userId });

    // Tickets resueltos
    const resolvedTickets = await Ticket.countDocuments({
      createdBy: userId,
      status: "resolved",
    });

    // Tickets pendientes (abiertos o en progreso)
    const pendingTickets = await Ticket.countDocuments({
      createdBy: userId,
      status: { $in: ["open", "assigned", "in_progress", "pending_user"] },
    });

    // Tiempo promedio de resolución (últimos 10 tickets resueltos)
    const avgResolutionTime = await Ticket.aggregate([
      {
        $match: {
          createdBy: userId,
          status: "resolved",
          resolvedAt: { $exists: true },
        },
      },
      { $sort: { resolvedAt: -1 } },
      { $limit: 10 },
      {
        $addFields: {
          resolutionTimeHours: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: "$resolutionTimeHours" },
        },
      },
    ]);

    // Mis comentarios recientes
    const recentComments = await Comment.countDocuments({
      userId: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // Archivos subidos
    const filesUploaded = await Attachment.countDocuments({
      uploadedBy: userId,
    });

    return {
      totalTickets,
      resolvedTickets,
      pendingTickets,
      ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      avgResolutionTimeHours: avgResolutionTime[0]?.avgHours || 0,
      recentComments,
      filesUploaded,
    };
  } catch (error) {
    throw new Error(
      "Error calculando estadísticas de empleado: " + error.message
    );
  }
};

// Estadísticas para agentes
const getAgentStats = async (userId) => {
  try {
    // Tickets asignados a mí
    const assignedTickets = await Ticket.countDocuments({ assignedTo: userId });

    // Tickets por estado (asignados a mí)
    const myTicketsByStatus = await Ticket.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Tickets resueltos por mí
    const resolvedByMe = await Ticket.countDocuments({
      assignedTo: userId,
      status: "resolved",
    });

    // Tickets sin asignar (disponibles para tomar)
    const unassignedTickets = await Ticket.countDocuments({
      assignedTo: null,
      status: { $in: ["open"] },
    });

    // Tickets de alta prioridad asignados a mí
    const highPriorityTickets = await Ticket.countDocuments({
      assignedTo: userId,
      priority: { $in: ["high", "urgent"] },
      status: { $ne: "closed" },
    });

    // Mi carga de trabajo esta semana
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyWorkload = await Ticket.countDocuments({
      assignedTo: userId,
      updatedAt: { $gte: weekStart },
    });

    // Tiempo promedio de respuesta (mis tickets)
    const avgResponseTime = await Ticket.aggregate([
      {
        $match: {
          assignedTo: userId,
          status: "resolved",
          resolvedAt: { $exists: true },
        },
      },
      { $limit: 20 },
      {
        $addFields: {
          responseTimeHours: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: "$responseTimeHours" },
        },
      },
    ]);

    // Comentarios que he hecho esta semana
    const weeklyComments = await Comment.countDocuments({
      userId: userId,
      createdAt: { $gte: weekStart },
    });

    return {
      assignedTickets,
      resolvedByMe,
      unassignedTickets,
      highPriorityTickets,
      weeklyWorkload,
      weeklyComments,
      myTicketsByStatus: myTicketsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      avgResponseTimeHours: avgResponseTime[0]?.avgHours || 0,
    };
  } catch (error) {
    throw new Error(
      "Error calculando estadísticas de agente: " + error.message
    );
  }
};

// Estadísticas para admin/supervisor
const getAdminStats = async () => {
  try {
    // Usuarios totales por rol
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Usuarios activos
    const activeUsers = await User.countDocuments({ isActive: true });

    // Tickets totales
    const totalTickets = await Ticket.countDocuments();

    // Tickets por estado
    const ticketsByStatus = await Ticket.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Tickets por categoría
    const ticketsByCategory = await Ticket.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Tickets por prioridad
    const ticketsByPriority = await Ticket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Actividad reciente (últimos 7 días)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentActivity = {
      newTickets: await Ticket.countDocuments({ createdAt: { $gte: weekAgo } }),
      resolvedTickets: await Ticket.countDocuments({
        resolvedAt: { $gte: weekAgo },
      }),
      newComments: await Comment.countDocuments({
        createdAt: { $gte: weekAgo },
      }),
      newUsers: await User.countDocuments({ createdAt: { $gte: weekAgo } }),
      filesUploaded: await Attachment.countDocuments({
        createdAt: { $gte: weekAgo },
      }),
    };

    // Top 5 usuarios más activos (por tickets creados)
    const topUsers = await Ticket.aggregate([
      { $group: { _id: "$createdBy", ticketCount: { $sum: 1 } } },
      { $sort: { ticketCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          ticketCount: 1,
          name: "$user.name",
          email: "$user.email",
          department: "$user.department",
        },
      },
    ]);

    // Agentes más productivos (por tickets resueltos)
    const topAgents = await Ticket.aggregate([
      { $match: { status: "resolved", assignedTo: { $ne: null } } },
      { $group: { _id: "$assignedTo", resolvedCount: { $sum: 1 } } },
      { $sort: { resolvedCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          resolvedCount: 1,
          name: "$user.name",
          email: "$user.email",
        },
      },
    ]);

    return {
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      activeUsers,
      totalTickets,
      ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      ticketsByCategory: ticketsByCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivity,
      topUsers,
      topAgents,
    };
  } catch (error) {
    throw new Error("Error calculando estadísticas de admin: " + error.message);
  }
};

module.exports = {
  getEmployeeStats,
  getAgentStats,
  getAdminStats,
};
