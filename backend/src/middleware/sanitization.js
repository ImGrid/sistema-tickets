// Función simple para limpiar strings de caracteres peligrosos
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  return str
    .trim() // Quitar espacios
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remover <script>
    .replace(/<[^>]*>?/gm, "") // Remover tags HTML
    .replace(/javascript:/gi, "") // Remover javascript:
    .replace(/on\w+\s*=/gi, "") // Remover eventos onclick, onload, etc
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
};

// Función para sanitizar objetos recursivamente
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

// Middleware para sanitizar el body de las requests
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Middleware para sanitizar query params
const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }
  next();
};

// Middleware combinado
const sanitizeAll = (req, res, next) => {
  // Sanitizar body
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  // Sanitizar query params
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }

  next();
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeBody,
  sanitizeQuery,
  sanitizeAll,
};
