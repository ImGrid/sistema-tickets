const express = require("express");
const router = express.Router();

// Importar controladores y middleware
const {
  getDashboard,
  getEmployeeDashboard,
  getAgentDashboard,
  getAdminDashboard,
  getQuickStats,
} = require("../controllers/dashboardController");

const { requireAuth } = require("../middleware/protect");

// Todas las rutas de dashboard requieren autenticación
router.use(requireAuth);

// GET /api/dashboard - Dashboard principal (automático según rol)
router.get("/", getDashboard);

// GET /api/dashboard/quick - Estadísticas rápidas
router.get("/quick", getQuickStats);

// GET /api/dashboard/employee - Dashboard específico de empleado
router.get("/employee", getEmployeeDashboard);

// GET /api/dashboard/agent - Dashboard específico de agente
router.get("/agent", getAgentDashboard);

// GET /api/dashboard/admin - Dashboard específico de admin
router.get("/admin", getAdminDashboard);

module.exports = router;
