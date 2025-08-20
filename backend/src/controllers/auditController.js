const { getAuditLogs } = require("../services/auditService");
const logger = require("../utils/logger");

// Obtener logs de auditoría (solo admin)
const getAuditLogsController = async (req, res) => {
  try {
    const user = req.user;

    // Solo admin puede ver logs de auditoría
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Solo administradores pueden acceder a los logs de auditoría",
      });
    }

    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      limit = 50,
      page = 1,
    } = req.query;

    // Preparar filtros
    const filters = {
      limit: Math.min(parseInt(limit), 100), // Máximo 100 registros
    };

    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    // Obtener logs
    const auditLogs = await getAuditLogs(filters);

    // Paginación simple
    const startIndex = (parseInt(page) - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedLogs = auditLogs.slice(startIndex, endIndex);

    logger.info("Audit logs accessed", {
      adminId: user._id,
      filters,
      resultCount: paginatedLogs.length,
    });

    res.json({
      logs: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: filters.limit,
        total: auditLogs.length,
        hasMore: endIndex < auditLogs.length,
      },
    });
  } catch (error) {
    logger.error("Error obteniendo audit logs:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Estadísticas de seguridad (solo admin)
const getSecurityStats = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "admin") {
      return res.status(403).json({
        error:
          "Solo administradores pueden acceder a estadísticas de seguridad",
      });
    }

    const { AuditLog } = require("../models");

    // Últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Agregaciones básicas
    const [totalLogs, recentLogs, loginAttempts, failedActions] =
      await Promise.all([
        AuditLog.countDocuments(),
        AuditLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        AuditLog.countDocuments({
          action: { $in: ["USER_LOGIN", "USER_LOGIN_FAILED"] },
          createdAt: { $gte: sevenDaysAgo },
        }),
        AuditLog.countDocuments({
          action: { $regex: "FAILED", $options: "i" },
          createdAt: { $gte: sevenDaysAgo },
        }),
      ]);

    // Top acciones recientes
    const topActions = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    logger.info("Security stats accessed", {
      adminId: user._id,
    });

    res.json({
      stats: {
        totalLogs,
        recentLogs,
        loginAttempts,
        failedActions,
        topActions,
      },
      period: "7 days",
    });
  } catch (error) {
    logger.error("Error obteniendo security stats:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  getAuditLogsController,
  getSecurityStats,
};
