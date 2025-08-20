const express = require("express");
const router = express.Router();

// Importar controladores y middleware
const {
  uploadFiles,
  getAttachments,
  downloadFile,
  deleteFile,
} = require("../controllers/attachmentsController");

const { requireAuth } = require("../middleware/protect");
const { upload, handleUploadError } = require("../middleware/fileUpload");

// Todas las rutas de attachments requieren autenticación
router.use(requireAuth);

// POST /api/tickets/:ticketId/attachments - Subir archivos a un ticket
router.post(
  "/tickets/:ticketId/attachments",
  upload.array("files", 5), // Campo 'files', máximo 5 archivos
  handleUploadError,
  uploadFiles
);

// GET /api/tickets/:ticketId/attachments - Listar archivos de un ticket
router.get("/tickets/:ticketId/attachments", getAttachments);

// GET /api/attachments/:attachmentId/download - Descargar archivo específico
router.get("/attachments/:attachmentId/download", downloadFile);

// DELETE /api/attachments/:attachmentId - Eliminar archivo específico
router.delete("/attachments/:attachmentId", deleteFile);

module.exports = router;
