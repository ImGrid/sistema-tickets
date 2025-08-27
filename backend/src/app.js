const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");
require("dotenv").config();

// Importar configuraciones
const { connectDB } = require("./config/database");
const logger = require("./utils/logger");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const ticketsRoutes = require("./routes/tickets");
const commentsRoutes = require("./routes/comments");
const attachmentsRoutes = require("./routes/attachments");
const auditRoutes = require("./routes/audit");
const dashboardRoutes = require("./routes/dashboard");
const usersRoutes = require("./routes/usersRoutes"); // NUEVA RUTA AGREGADA

// Importar middleware de seguridad
const {
  helmetConfig,
  additionalSecurityHeaders,
  validateContentType,
  preventTimingAttacks,
  logSuspiciousActivity,
  corsConfig,
} = require("./middleware/security");

const {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  ticketCreationLimiter,
} = require("./middleware/rateLimiting");

const { sanitizeAll } = require("./middleware/sanitization");
const { captureAuditInfo } = require("./services/auditService");

// Crear app Express
const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares de seguridad (ORDEN IMPORTANTE)
app.use(helmetConfig); // Headers de seguridad con helmet
app.use(additionalSecurityHeaders); // Headers adicionales
app.use(cors(corsConfig)); // CORS configurado
app.use(logSuspiciousActivity); // Detectar requests sospechosos
app.use(preventTimingAttacks); // Prevenir timing attacks
app.use(generalLimiter); // Rate limiting general

// Middlewares generales
app.use(compression());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Middleware de sanitización
app.use(sanitizeAll);

// Middleware para capturar info de auditoría
app.use(captureAuditInfo);

// Validar Content-Type
app.use(validateContentType);

// Servir archivos estáticos (uploads) de forma protegida
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Ruta de salud del sistema
app.get("/api/health", (req, res) => {
  try {
    const mongoose = require("mongoose");
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.json({
      status: "OK",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      security: "enabled",
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(500).json({
      status: "ERROR",
      database: "error",
      message: "Health check failed",
    });
  }
});

// Ruta de prueba básica
app.get("/api", (req, res) => {
  res.json({
    message: "API Sistema de Tickets funcionando correctamente",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    features: {
      authentication: "enabled",
      rateLimiting: "enabled",
      sanitization: "enabled",
      auditLogging: "enabled",
      dashboards: "enabled",
      userManagement: "enabled", // 👈 NUEVA CARACTERÍSTICA
    },
  });
});

// RUTAS DE LA API CON RATE LIMITING ESPECÍFICO
app.use("/api/auth", authLimiter, authRoutes); // Rate limiting estricto para auth
app.use("/api/tickets", ticketCreationLimiter, ticketsRoutes); // Rate limiting para tickets
app.use("/api", commentsRoutes); // Comentarios usan rate limiting general
app.use("/api", uploadLimiter, attachmentsRoutes); // Rate limiting para uploads
app.use("/api/audit", auditRoutes); // Rutas de auditoría (solo admin)
app.use("/api/dashboard", dashboardRoutes); // Dashboards diferenciados por rol
app.use("/api/users", usersRoutes); // NUEVA RUTA DE GESTIÓN DE USUARIOS (solo admin)

// Middleware para rutas no encontradas
app.use((req, res) => {
  logger.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
    method: req.method,
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  logger.error("Error no manejado:", error);

  // No mostrar stack traces en producción
  const response = {
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Error interno del servidor",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  res.status(error.status || 500).json(response);
});

// Configurar puerto y iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Servidor iniciado en puerto ${PORT}`);
  logger.info(`Entorno: ${process.env.NODE_ENV}`);
});

// Manejo de cierre graceful
process.on("SIGTERM", () => {
  logger.info("SIGTERM recibido, cerrando servidor...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT recibido, cerrando servidor...");
  process.exit(0);
});

module.exports = app;
