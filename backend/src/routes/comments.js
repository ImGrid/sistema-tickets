const express = require("express");
const router = express.Router();

// Importar controladores y middleware
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentsController");

const { requireAuth } = require("../middleware/protect");

// Todas las rutas de comentarios requieren autenticación
router.use(requireAuth);

// GET /api/tickets/:ticketId/comments - Obtener comentarios de un ticket
router.get("/tickets/:ticketId/comments", getComments);

// POST /api/tickets/:ticketId/comments - Crear comentario en un ticket
router.post("/tickets/:ticketId/comments", createComment);

// PUT /api/comments/:commentId - Actualizar comentario específico
router.put("/comments/:commentId", updateComment);

// DELETE /api/comments/:commentId - Eliminar comentario específico
router.delete("/comments/:commentId", deleteComment);

module.exports = router;
