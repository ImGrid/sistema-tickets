const { Attachment, Ticket } = require("../models");
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");

// Subir archivos a un ticket
const uploadFiles = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const user = req.user;
    const files = req.files;

    // Verificar que se subieron archivos
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: "No se enviaron archivos",
      });
    }

    // Verificar que el ticket existe y el usuario puede accederlo
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      // Eliminar archivos subidos si el ticket no existe
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return res.status(404).json({
        error: "Ticket no encontrado",
      });
    }

    // Verificar permisos para subir archivos al ticket
    let canUpload = false;

    if (user.role === "admin" || user.role === "supervisor") {
      canUpload = true;
    } else if (user.role === "agent") {
      canUpload =
        (ticket.assignedTo &&
          ticket.assignedTo.toString() === user._id.toString()) ||
        !ticket.assignedTo;
    } else if (user.role === "employee") {
      canUpload = ticket.createdBy.toString() === user._id.toString();
    }

    if (!canUpload) {
      // Eliminar archivos subidos si no tiene permisos
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return res.status(403).json({
        error: "No tienes permisos para subir archivos a este ticket",
      });
    }

    // Crear registros de attachments en la base de datos
    const attachments = [];

    for (const file of files) {
      try {
        const attachment = new Attachment({
          ticketId,
          uploadedBy: user._id,
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          mimeType: file.mimetype,
          fileSize: file.size,
          isValid: true,
        });

        const savedAttachment = await attachment.save();
        attachments.push(savedAttachment);
      } catch (error) {
        // Si hay error guardando en BD, eliminar el archivo
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw error;
      }
    }

    // Populate para respuesta
    const populatedAttachments = await Attachment.find({
      _id: { $in: attachments.map((a) => a._id) },
    }).populate("uploadedBy", "name email");

    // Actualizar timestamp del ticket
    ticket.updatedAt = new Date();
    await ticket.save();

    logger.info("Archivos subidos", {
      ticketId,
      userId: user._id,
      fileCount: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
    });

    res.status(201).json({
      message: `${files.length} archivo(s) subido(s) exitosamente`,
      attachments: populatedAttachments,
    });
  } catch (error) {
    // Limpiar archivos en caso de error
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    logger.error("Error subiendo archivos:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Obtener lista de archivos de un ticket
const getAttachments = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const user = req.user;

    // Verificar que el ticket existe y el usuario puede accederlo
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        error: "Ticket no encontrado",
      });
    }

    // Verificar permisos (mismo logic que en comentarios)
    let canAccess = false;

    if (user.role === "admin" || user.role === "supervisor") {
      canAccess = true;
    } else if (user.role === "agent") {
      canAccess =
        (ticket.assignedTo &&
          ticket.assignedTo.toString() === user._id.toString()) ||
        !ticket.assignedTo;
    } else if (user.role === "employee") {
      canAccess = ticket.createdBy.toString() === user._id.toString();
    }

    if (!canAccess) {
      return res.status(403).json({
        error: "No tienes permisos para ver los archivos de este ticket",
      });
    }

    // Obtener attachments
    const attachments = await Attachment.find({ ticketId })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      attachments,
    });
  } catch (error) {
    logger.error("Error obteniendo archivos:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Descargar archivo específico
const downloadFile = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const user = req.user;

    // Buscar attachment
    const attachment = await Attachment.findById(attachmentId).populate(
      "ticketId"
    );
    if (!attachment) {
      return res.status(404).json({
        error: "Archivo no encontrado",
      });
    }

    const ticket = attachment.ticketId;

    // Verificar permisos para acceder al ticket
    let canAccess = false;

    if (user.role === "admin" || user.role === "supervisor") {
      canAccess = true;
    } else if (user.role === "agent") {
      canAccess =
        (ticket.assignedTo &&
          ticket.assignedTo.toString() === user._id.toString()) ||
        !ticket.assignedTo;
    } else if (user.role === "employee") {
      canAccess = ticket.createdBy.toString() === user._id.toString();
    }

    if (!canAccess) {
      return res.status(403).json({
        error: "No tienes permisos para descargar este archivo",
      });
    }

    // Verificar que el archivo existe en el sistema de archivos
    if (!fs.existsSync(attachment.filePath)) {
      return res.status(404).json({
        error: "Archivo no encontrado en el servidor",
      });
    }

    // Configurar headers para descarga
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.originalName}"`
    );
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader("Content-Length", attachment.fileSize);

    // Enviar archivo
    res.sendFile(path.resolve(attachment.filePath));

    logger.info("Archivo descargado", {
      attachmentId,
      ticketId: ticket._id,
      userId: user._id,
      fileName: attachment.originalName,
    });
  } catch (error) {
    logger.error("Error descargando archivo:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Eliminar archivo
const deleteFile = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const user = req.user;

    // Buscar attachment
    const attachment = await Attachment.findById(attachmentId).populate(
      "ticketId"
    );
    if (!attachment) {
      return res.status(404).json({
        error: "Archivo no encontrado",
      });
    }

    // Verificar permisos para eliminar
    // Solo quien subió el archivo o admin pueden eliminarlo
    if (
      attachment.uploadedBy.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "No tienes permisos para eliminar este archivo",
      });
    }

    // Eliminar archivo del sistema de archivos
    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    // Eliminar registro de la base de datos
    await Attachment.findByIdAndDelete(attachmentId);

    logger.info("Archivo eliminado", {
      attachmentId,
      ticketId: attachment.ticketId._id,
      userId: user._id,
      fileName: attachment.originalName,
    });

    res.json({
      message: "Archivo eliminado exitosamente",
    });
  } catch (error) {
    logger.error("Error eliminando archivo:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  uploadFiles,
  getAttachments,
  downloadFile,
  deleteFile,
};
