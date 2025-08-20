const { AuditLog } = require("../models");
const logger = require("../utils/logger");

// Función principal para crear logs de auditoría
const createAuditLog = async (logData) => {
  try {
    const auditLog = new AuditLog({
      userId: logData.userId,
      action: logData.action,
      resource: logData.resource,
      resourceId: logData.resourceId,
      details: logData.details || {},
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
    });

    await auditLog.save();

    // También logear en archivos para redundancia
    logger.info("Audit Log", {
      userId: logData.userId,
      action: logData.action,
      resource: logData.resource,
      resourceId: logData.resourceId,
      ip: logData.ipAddress,
    });
  } catch (error) {
    // No fallar la request si el audit log falla
    logger.error("Error creando audit log:", error);
  }
};

// Middleware para capturar información de audit automáticamente
const captureAuditInfo = (req, res, next) => {
  // Agregar información útil al request para audit logs
  req.auditInfo = {
    ipAddress:
      req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"],
    userAgent: req.get("User-Agent") || "Unknown",
  };
  next();
};

// Funciones específicas para cada tipo de acción

const logUserAction = async (req, action, details = {}) => {
  if (!req.user) return;

  await createAuditLog({
    userId: req.user._id,
    action,
    resource: "user",
    resourceId: req.user._id,
    details,
    ipAddress: req.auditInfo?.ipAddress,
    userAgent: req.auditInfo?.userAgent,
  });
};

const logTicketAction = async (req, action, ticketId, details = {}) => {
  if (!req.user) return;

  await createAuditLog({
    userId: req.user._id,
    action,
    resource: "ticket",
    resourceId: ticketId,
    details,
    ipAddress: req.auditInfo?.ipAddress,
    userAgent: req.auditInfo?.userAgent,
  });
};

const logCommentAction = async (req, action, commentId, details = {}) => {
  if (!req.user) return;

  await createAuditLog({
    userId: req.user._id,
    action,
    resource: "comment",
    resourceId: commentId,
    details,
    ipAddress: req.auditInfo?.ipAddress,
    userAgent: req.auditInfo?.userAgent,
  });
};

const logAttachmentAction = async (req, action, attachmentId, details = {}) => {
  if (!req.user) return;

  await createAuditLog({
    userId: req.user._id,
    action,
    resource: "attachment",
    resourceId: attachmentId,
    details,
    ipAddress: req.auditInfo?.ipAddress,
    userAgent: req.auditInfo?.userAgent,
  });
};

// Función para obtener logs de auditoría (solo admin)
const getAuditLogs = async (filters = {}) => {
  const query = {};

  if (filters.userId) query.userId = filters.userId;
  if (filters.action) query.action = filters.action;
  if (filters.resource) query.resource = filters.resource;
  if (filters.startDate) {
    query.createdAt = { $gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    query.createdAt = {
      ...query.createdAt,
      $lte: new Date(filters.endDate),
    };
  }

  return await AuditLog.find(query)
    .populate("userId", "name email role")
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100);
};

module.exports = {
  createAuditLog,
  captureAuditInfo,
  logUserAction,
  logTicketAction,
  logCommentAction,
  logAttachmentAction,
  getAuditLogs,
};
