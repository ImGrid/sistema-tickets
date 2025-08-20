const { Comment, Ticket } = require("../models");
const logger = require("../utils/logger");

// Obtener comentarios de un ticket
const getComments = async (req, res) => {
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

    // Verificar permisos para ver el ticket (mismo logic que en rbac)
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
        error: "No tienes permisos para ver los comentarios de este ticket",
      });
    }

    // Obtener comentarios
    const comments = await Comment.find({ ticketId })
      .populate("userId", "name email role")
      .sort({ createdAt: 1 }); // Orden cronológico

    // Filtrar comentarios internos si el usuario es empleado
    const filteredComments =
      user.role === "employee"
        ? comments.filter((comment) => !comment.isInternal)
        : comments;

    res.json({
      comments: filteredComments,
    });
  } catch (error) {
    logger.error("Error obteniendo comentarios:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Crear nuevo comentario
const createComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content, isInternal } = req.body;
    const user = req.user;

    // Validar contenido
    if (!content || !content.trim()) {
      return res.status(400).json({
        error: "El contenido del comentario es obligatorio",
      });
    }

    // Verificar que el ticket existe y el usuario puede accederlo
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        error: "Ticket no encontrado",
      });
    }

    // Verificar permisos para comentar en el ticket
    let canComment = false;

    if (user.role === "admin" || user.role === "supervisor") {
      canComment = true;
    } else if (user.role === "agent") {
      canComment =
        (ticket.assignedTo &&
          ticket.assignedTo.toString() === user._id.toString()) ||
        !ticket.assignedTo;
    } else if (user.role === "employee") {
      canComment = ticket.createdBy.toString() === user._id.toString();
    }

    if (!canComment) {
      return res.status(403).json({
        error: "No tienes permisos para comentar en este ticket",
      });
    }

    // Determinar tipo de comentario
    let commentType = "user";
    if (
      user.role === "agent" ||
      user.role === "supervisor" ||
      user.role === "admin"
    ) {
      commentType = "agent";
    }

    // Solo agentes+ pueden hacer comentarios internos
    const isInternalComment =
      isInternal &&
      (user.role === "agent" ||
        user.role === "supervisor" ||
        user.role === "admin");

    // Crear comentario
    const newComment = new Comment({
      ticketId,
      userId: user._id,
      content: content.trim(),
      type: commentType,
      isInternal: isInternalComment || false,
    });

    const savedComment = await newComment.save();

    // Populate para respuesta
    const populatedComment = await Comment.findById(savedComment._id).populate(
      "userId",
      "name email role"
    );

    // Actualizar timestamp del ticket
    ticket.updatedAt = new Date();
    await ticket.save();

    logger.info("Comentario creado", {
      commentId: savedComment._id,
      ticketId,
      userId: user._id,
      type: commentType,
      isInternal: isInternalComment,
    });

    res.status(201).json({
      message: "Comentario creado exitosamente",
      comment: populatedComment,
    });
  } catch (error) {
    logger.error("Error creando comentario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Actualizar comentario
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const user = req.user;

    // Validar contenido
    if (!content || !content.trim()) {
      return res.status(400).json({
        error: "El contenido del comentario es obligatorio",
      });
    }

    // Buscar comentario
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        error: "Comentario no encontrado",
      });
    }

    // Verificar permisos para editar
    // Solo el autor del comentario o admin pueden editar
    if (
      comment.userId.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "No tienes permisos para editar este comentario",
      });
    }

    // Actualizar comentario
    comment.content = content.trim();
    comment.editedAt = new Date();

    const updatedComment = await comment.save();

    // Populate para respuesta
    const populatedComment = await Comment.findById(
      updatedComment._id
    ).populate("userId", "name email role");

    logger.info("Comentario actualizado", {
      commentId,
      userId: user._id,
    });

    res.json({
      message: "Comentario actualizado exitosamente",
      comment: populatedComment,
    });
  } catch (error) {
    logger.error("Error actualizando comentario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Eliminar comentario
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = req.user;

    // Buscar comentario
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        error: "Comentario no encontrado",
      });
    }

    // Verificar permisos para eliminar
    // Solo el autor del comentario o admin pueden eliminar
    if (
      comment.userId.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "No tienes permisos para eliminar este comentario",
      });
    }

    // Eliminar comentario
    await Comment.findByIdAndDelete(commentId);

    logger.info("Comentario eliminado", {
      commentId,
      userId: user._id,
    });

    res.json({
      message: "Comentario eliminado exitosamente",
    });
  } catch (error) {
    logger.error("Error eliminando comentario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
