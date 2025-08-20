const express = require("express");
const router = express.Router();

// Importar controladores y middleware
const {
  register,
  login,
  getProfile,
  logout,
} = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validation");
const { requireAuth } = require("../middleware/protect");

// Rutas públicas (no requieren autenticación)

// POST /api/auth/register - Registrar nuevo usuario
router.post("/register", validateRegister, register);

// POST /api/auth/login - Iniciar sesión
router.post("/login", validateLogin, login);

// Rutas protegidas (requieren autenticación)

// GET /api/auth/me - Obtener perfil del usuario actual
router.get("/me", requireAuth, getProfile);

// POST /api/auth/logout - Cerrar sesión
router.post("/logout", requireAuth, logout);

module.exports = router;
