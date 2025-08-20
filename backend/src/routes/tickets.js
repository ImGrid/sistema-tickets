const express = require("express");
const router = express.Router();

// Importar controladores y middleware
const {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  assignTicket,
} = require("../controllers/ticketsController");

const { requireAuth } = require("../middleware/protect"); // Renombrado
const {
  canViewTicket,
  canModifyTicket,
  canAssignTickets,
} = require("../middleware/rbac");

// Todas las rutas de tickets requieren autenticación
router.use(requireAuth);

// GET /api/tickets - Listar tickets según rol
router.get("/", getTickets);

// POST /api/tickets - Crear nuevo ticket
router.post("/", createTicket);

// GET /api/tickets/:id - Ver ticket específico (con validación de permisos)
router.get("/:id", canViewTicket, getTicketById);

// PUT /api/tickets/:id - Actualizar ticket (con validación de permisos)
router.put("/:id", canModifyTicket, updateTicket);

// PUT /api/tickets/:id/assign - Asignar/reasignar ticket (solo agentes+)
router.put("/:id/assign", canAssignTickets, assignTicket);

module.exports = router;
