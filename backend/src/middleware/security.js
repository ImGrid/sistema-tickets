const helmet = require("helmet");

// Configuración de helmet personalizada
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Deshabilitado para compatibilidad

  // Configuraciones adicionales
  frameguard: { action: "deny" }, // Prevenir iframe embedding
  noSniff: true, // Prevenir MIME type sniffing
  xssFilter: true, // Activar filtro XSS del navegador
  referrerPolicy: { policy: "same-origin" },
});

// Middleware para agregar headers de seguridad adicionales
const additionalSecurityHeaders = (req, res, next) => {
  // Prevenir caching de respuestas sensibles
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Headers adicionales de seguridad
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevenir información del servidor
  res.removeHeader("X-Powered-By");

  next();
};

// Middleware para validar Content-Type en requests con body
const validateContentType = (req, res, next) => {
  // Solo validar para métodos que pueden tener body
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.get("Content-Type");

    // Permitir JSON y form-data (para uploads)
    if (
      contentType &&
      !contentType.includes("application/json") &&
      !contentType.includes("multipart/form-data")
    ) {
      return res.status(400).json({
        error: "Content-Type no válido",
        allowed: ["application/json", "multipart/form-data"],
      });
    }
  }

  next();
};

// Middleware para prevenir ataques de timing
const preventTimingAttacks = (req, res, next) => {
  // Agregar un pequeño delay aleatorio para prevenir timing attacks
  const delay = Math.floor(Math.random() * 10) + 5; // 5-15ms

  setTimeout(() => {
    next();
  }, delay);
};

// Middleware para log de requests sospechosos
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection attempts
    /javascript:/i, // XSS attempts
    /eval\s*\(/i, // Code execution attempts
  ];

  const url = req.originalUrl;
  const body = JSON.stringify(req.body || {});
  const query = JSON.stringify(req.query || {});

  const isSuspicious = suspiciousPatterns.some(
    (pattern) => pattern.test(url) || pattern.test(body) || pattern.test(query)
  );

  if (isSuspicious) {
    const logger = require("../utils/logger");
    logger.warn("Suspicious request detected", {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      body: req.body,
      query: req.query,
    });
  }

  next();
};

// Configurar CORS de forma segura
const corsConfig = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // En desarrollo, permitir localhost
    if (
      process.env.NODE_ENV === "development" &&
      (origin.includes("localhost") || origin.includes("127.0.0.1"))
    ) {
      return callback(null, true);
    }

    // En producción, verificar whitelist
    const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",");
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("No permitido por CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = {
  helmetConfig,
  additionalSecurityHeaders,
  validateContentType,
  preventTimingAttacks,
  logSuspiciousActivity,
  corsConfig,
};
