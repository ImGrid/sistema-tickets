const { Ticket, User } = require("../models");
const logger = require("../utils/logger");

// Listar tickets según el rol del usuario
const getTickets = async (req, res) => {
  try {
    const user = req.user;
    const {
      status,
      category,
      priority,
      page = 1,
      limit = 20,
      assignedTo,
    } = req.query;

    // Construir filtros base
    let filters = {};

    // NUEVA LÓGICA: Respetar parámetro assignedTo específico
    if (assignedTo !== undefined) {
      // Si se especifica assignedTo, usarlo directamente
      if (assignedTo === "null" || assignedTo === null) {
        // Tickets sin asignar
        filters.assignedTo = null;
      } else if (assignedTo === "me") {
        // Mis tickets asignados
        filters.assignedTo = user._id;
      } else if (assignedTo) {
        // Usuario específico
        filters.assignedTo = assignedTo;
      }
    } else {
      // Si NO se especifica assignedTo, aplicar lógica por rol (comportamiento anterior)
      if (user.role === "employee") {
        // Empleados solo ven sus tickets
        filters.createdBy = user._id;
      } else if (user.role === "agent") {
        // Agentes ven tickets asignados a ellos + sin asignar (solo cuando no se especifica assignedTo)
        filters.$or = [{ assignedTo: user._id }, { assignedTo: null }];
      }
      // Admin y supervisor ven todos (sin filtros adicionales)
    }

    // Filtros opcionales
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (priority) filters.priority = priority;

    // Paginación
    const skip = (page - 1) * limit;

    // Buscar tickets con populate
    const tickets = await Ticket.find(filters)
      .populate("createdBy", "name email department")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total para paginación
    const total = await Ticket.countDocuments(filters);

    logger.info("Tickets listados", {
      userId: user._id,
      role: user.role,
      total,
      filters,
      assignedToParam: assignedTo, // Log para debugging
    });

    res.json({
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error listando tickets:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Crear nuevo ticket
const createTicket = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, category, priority } = req.body;

    // Validaciones básicas
    if (!title || !description || !category) {
      return res.status(400).json({
        error: "Título, descripción y categoría son obligatorios",
      });
    }

    // Crear ticket
    const newTicket = new Ticket({
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || "medium",
      createdBy: user._id,
    });

    const savedTicket = await newTicket.save();

    // Populate para respuesta completa
    const populatedTicket = await Ticket.findById(savedTicket._id).populate(
      "createdBy",
      "name email department"
    );

    logger.info("Ticket creado", {
      ticketId: savedTicket._id,
      userId: user._id,
      category,
      priority,
    });

    res.status(201).json({
      message: "Ticket creado exitosamente",
      ticket: populatedTicket,
    });
  } catch (error) {
    logger.error("Error creando ticket:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Obtener ticket específico
const getTicketById = async (req, res) => {
  try {
    // El ticket ya está disponible en req.ticket por el middleware canViewTicket
    const ticket = await Ticket.findById(req.ticket._id)
      .populate("createdBy", "name email department")
      .populate("assignedTo", "name email");

    res.json({
      ticket,
    });
  } catch (error) {
    logger.error("Error obteniendo ticket:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Actualizar ticket
const updateTicket = async (req, res) => {
  try {
    const user = req.user;
    const ticket = req.ticket; // Del middleware canModifyTicket
    const { title, description, status, priority } = req.body;

    // Construir objeto de actualización
    const updateData = {};

    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (priority) updateData.priority = priority;

    // Control de cambio de status según rol
    if (status) {
      if (user.role === "employee") {
        // Empleados solo pueden cambiar a pending_user si necesitan agregar info
        if (status === "pending_user") {
          updateData.status = status;
        }
      } else if (
        user.role === "agent" ||
        user.role === "admin" ||
        user.role === "supervisor"
      ) {
        // Agentes y superiores pueden cambiar cualquier status
        updateData.status = status;

        // Si se marca como resuelto, agregar timestamp
        if (status === "resolved" && ticket.status !== "resolved") {
          updateData.resolvedAt = new Date();
        }

        // Si se marca como cerrado, agregar timestamp
        if (status === "closed" && ticket.status !== "closed") {
          updateData.closedAt = new Date();
        }
      }
    }

    updateData.updatedAt = new Date();

    // Actualizar ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      updateData,
      { new: true }
    )
      .populate("createdBy", "name email department")
      .populate("assignedTo", "name email");

    logger.info("Ticket actualizado", {
      ticketId: ticket._id,
      userId: user._id,
      changes: updateData,
    });

    res.json({
      message: "Ticket actualizado exitosamente",
      ticket: updatedTicket,
    });
  } catch (error) {
    logger.error("Error actualizando ticket:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Asignar ticket a un agente
const assignTicket = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params; // Cambiado de ticketId a id
    const { assignedTo } = req.body;

    // Buscar ticket
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        error: "Ticket no encontrado",
      });
    }

    // Validar que el usuario asignado sea agente o superior
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          error: "Usuario asignado no encontrado",
        });
      }

      if (!["agent", "supervisor", "admin"].includes(assignedUser.role)) {
        return res.status(400).json({
          error:
            "Solo se puede asignar a agentes, supervisores o administradores",
        });
      }
    }

    // Actualizar asignación
    const updateData = {
      assignedTo: assignedTo || null,
      status: assignedTo ? "assigned" : "open",
      updatedAt: new Date(),
    };

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id, // Cambiado de ticketId a id
      updateData,
      { new: true }
    )
      .populate("createdBy", "name email department")
      .populate("assignedTo", "name email");

    logger.info("Ticket asignado", {
      ticketId: id, // Cambiado de ticketId a id para el log
      assignedBy: user._id,
      assignedTo: assignedTo || "sin asignar",
    });

    res.json({
      message: assignedTo
        ? "Ticket asignado exitosamente"
        : "Asignación removida exitosamente",
      ticket: updatedTicket,
    });
  } catch (error) {
    logger.error("Error asignando ticket:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  assignTicket,
};
