const express = require("express");
const router = express.Router();

// Importar controladores y middleware
const {
  getAuditLogsController,
  getSecurityStats,
} = require("../controllers/auditController");

const { requireAuth } = require("../middleware/protect");

// Todas las rutas de auditoría requieren autenticación
router.use(requireAuth);

// GET /api/audit/logs - Obtener logs de auditoría (solo admin)
router.get("/logs", getAuditLogsController);

// GET /api/audit/stats - Obtener estadísticas de seguridad (solo admin)
router.get("/stats", getSecurityStats);

module.exports = router;
