const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");

// Middleware para verificar autenticación
const requireAuth = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token de acceso requerido",
      });
    }

    // Extraer el token
    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar el token
    const decoded = verifyToken(token);

    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "Usuario no encontrado",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: "Usuario inactivo",
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido",
      details: error.message,
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "No tienes permisos para acceder a este recurso",
        requiredRole: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
};
