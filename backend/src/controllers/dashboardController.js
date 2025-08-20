const {
  getEmployeeStats,
  getAgentStats,
  getAdminStats,
} = require("../services/statsService");
const { Ticket, Comment } = require("../models");
const logger = require("../utils/logger");
const { logUserAction } = require("../services/auditService");

// Dashboard principal - redirige según rol
const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    let dashboardData = {};

    // Obtener estadísticas según rol
    switch (user.role) {
      case "employee":
        dashboardData = await getEmployeeStats(user._id);
        dashboardData.role = "employee";
        break;

      case "agent":
        dashboardData = await getAgentStats(user._id);
        dashboardData.role = "agent";
        break;

      case "supervisor":
      case "admin":
        dashboardData = await getAdminStats();
        dashboardData.role = user.role;
        break;

      default:
        return res.status(400).json({
          error: "Rol de usuario no válido",
        });
    }

    // Agregar información del usuario actual
    dashboardData.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    // Log de acceso al dashboard
    await logUserAction(req, "DASHBOARD_ACCESSED", {
      role: user.role,
    });

    res.json({
      message: `Dashboard ${user.role} cargado exitosamente`,
      dashboard: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error obteniendo dashboard:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Dashboard específico para empleados
const getEmployeeDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "employee") {
      return res.status(403).json({
        error: "Solo empleados pueden acceder a este dashboard",
      });
    }

    // Estadísticas del empleado
    const stats = await getEmployeeStats(user._id);

    // Mis tickets recientes (últimos 5)
    const recentTickets = await Ticket.find({ createdBy: user._id })
      .populate("assignedTo", "name email")
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title status priority category updatedAt");

    // Mis tickets que necesitan mi atención
    const needsAttention = await Ticket.find({
      createdBy: user._id,
      status: "pending_user",
    })
      .populate("assignedTo", "name email")
      .select("title status assignedTo updatedAt");

    res.json({
      message: "Dashboard de empleado cargado",
      dashboard: {
        user: {
          name: user.name,
          email: user.email,
          department: user.department,
        },
        stats,
        recentTickets,
        needsAttention,
      },
    });
  } catch (error) {
    logger.error("Error obteniendo dashboard de empleado:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Dashboard específico para agentes
const getAgentDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (!["agent", "supervisor", "admin"].includes(user.role)) {
      return res.status(403).json({
        error: "Solo agentes pueden acceder a este dashboard",
      });
    }

    // Estadísticas del agente
    const stats = await getAgentStats(user._id);

    // Mis tickets asignados que requieren atención
    const myUrgentTickets = await Ticket.find({
      assignedTo: user._id,
      status: { $in: ["assigned", "in_progress"] },
      priority: { $in: ["high", "urgent"] },
    })
      .populate("createdBy", "name email department")
      .sort({ priority: -1, createdAt: 1 })
      .limit(5)
      .select("title status priority category createdAt createdBy");

    // Tickets sin asignar disponibles
    const availableTickets = await Ticket.find({
      assignedTo: null,
      status: "open",
    })
      .populate("createdBy", "name email department")
      .sort({ priority: -1, createdAt: 1 })
      .limit(5)
      .select("title priority category createdAt createdBy");

    // Tickets recién resueltos por mí
    const recentlyResolved = await Ticket.find({
      assignedTo: user._id,
      status: "resolved",
      resolvedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .populate("createdBy", "name email")
      .sort({ resolvedAt: -1 })
      .limit(3)
      .select("title resolvedAt createdBy");

    res.json({
      message: "Dashboard de agente cargado",
      dashboard: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        stats,
        myUrgentTickets,
        availableTickets,
        recentlyResolved,
      },
    });
  } catch (error) {
    logger.error("Error obteniendo dashboard de agente:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Dashboard específico para admin
const getAdminDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (!["admin", "supervisor"].includes(user.role)) {
      return res.status(403).json({
        error: "Solo administradores pueden acceder a este dashboard",
      });
    }

    // Estadísticas generales
    const stats = await getAdminStats();

    // Tickets críticos sin asignar
    const criticalUnassigned = await Ticket.find({
      assignedTo: null,
      priority: { $in: ["high", "urgent"] },
      status: "open",
    })
      .populate("createdBy", "name email department")
      .sort({ priority: -1, createdAt: 1 })
      .limit(5)
      .select("title priority category createdAt createdBy");

    // Tickets antiguos sin resolver (más de 3 días)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const oldTickets = await Ticket.find({
      status: { $in: ["open", "assigned", "in_progress"] },
      createdAt: { $lt: threeDaysAgo },
    })
      .populate("createdBy assignedTo", "name email")
      .sort({ createdAt: 1 })
      .limit(5)
      .select("title status priority createdAt createdBy assignedTo");

    // Actividad reciente del sistema
    const recentActivity = await Comment.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .populate("userId", "name role")
      .populate("ticketId", "title")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("createdAt userId ticketId type isInternal");

    res.json({
      message: "Dashboard de administrador cargado",
      dashboard: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        stats,
        criticalUnassigned,
        oldTickets,
        recentActivity,
      },
    });
  } catch (error) {
    logger.error("Error obteniendo dashboard de admin:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Resumen rápido para cualquier usuario
const getQuickStats = async (req, res) => {
  try {
    const user = req.user;

    let quickStats = {};

    if (user.role === "employee") {
      const myTickets = await Ticket.countDocuments({ createdBy: user._id });
      const pendingTickets = await Ticket.countDocuments({
        createdBy: user._id,
        status: { $in: ["open", "assigned", "in_progress", "pending_user"] },
      });

      quickStats = {
        myTickets,
        pendingTickets,
        needsAttention: await Ticket.countDocuments({
          createdBy: user._id,
          status: "pending_user",
        }),
      };
    } else if (["agent", "supervisor", "admin"].includes(user.role)) {
      const assignedToMe = await Ticket.countDocuments({
        assignedTo: user._id,
      });
      const unassigned = await Ticket.countDocuments({
        assignedTo: null,
        status: "open",
      });

      quickStats = {
        assignedToMe,
        unassigned,
        urgent: await Ticket.countDocuments({
          assignedTo: user._id,
          priority: { $in: ["high", "urgent"] },
          status: { $ne: "closed" },
        }),
      };
    }

    res.json({
      quickStats,
      user: {
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Error obteniendo quick stats:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  getDashboard,
  getEmployeeDashboard,
  getAgentDashboard,
  getAdminDashboard,
  getQuickStats,
};
