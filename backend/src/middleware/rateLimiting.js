const rateLimit = require("express-rate-limit");

// Rate limiting general para toda la API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP cada 15 minutos
  message: {
    error: "Demasiadas solicitudes, intenta de nuevo en 15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos de login por IP cada 15 minutos
  message: {
    error: "Demasiados intentos de login, intenta de nuevo en 15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
});

// Rate limiting para upload de archivos
const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // 10 uploads por IP cada 5 minutos
  message: {
    error: "Demasiados uploads, intenta de nuevo en 5 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para creación de tickets
const ticketCreationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // 20 tickets por IP cada 10 minutos
  message: {
    error: "Demasiados tickets creados, intenta de nuevo en 10 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  ticketCreationLimiter,
};
