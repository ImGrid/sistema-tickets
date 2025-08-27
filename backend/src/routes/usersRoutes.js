const express = require("express");
const router = express.Router();

// Importar controladores
const {
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserStats,
} = require("../controllers/usersController");

// Importar middleware de protección y roles
const { requireAuth } = require("../middleware/protect");
const { requireRole } = require("../middleware/protect");

// Todas las rutas de usuarios requieren autenticación
router.use(requireAuth);

// GET /api/users - Listar usuarios con filtros (admin y supervisor)
router.get("/", requireRole(["admin", "supervisor"]), getUsers);

// GET /api/users/stats - Obtener estadísticas de usuarios (solo admin)
router.get("/stats", requireRole(["admin"]), getUserStats);

// GET /api/users/:id - Obtener usuario específico por ID (solo admin)
router.get("/:id", requireRole(["admin"]), getUserById);

// PUT /api/users/:id - Actualizar datos básicos del usuario (solo admin)
router.put("/:id", requireRole(["admin"]), updateUser);

// PUT /api/users/:id/role - Cambiar rol del usuario (solo admin)
router.put("/:id/role", requireRole(["admin"]), updateUserRole);

// PUT /api/users/:id/status - Activar/desactivar usuario (solo admin)
router.put("/:id/status", requireRole(["admin"]), updateUserStatus);

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete("/:id", requireRole(["admin"]), deleteUser);

module.exports = router;
