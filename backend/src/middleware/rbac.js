// Control de acceso basado en roles para tickets

// Middleware para verificar si el usuario puede ver un ticket específico
const canViewTicket = async (req, res, next) => {
  try {
    const { Ticket } = require("../models");
    const ticketId = req.params.id;
    const user = req.user;

    // Buscar el ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        error: "Ticket no encontrado",
      });
    }

    // Reglas de acceso:
    // - Admin/Supervisor: pueden ver cualquier ticket
    // - Agent: puede ver tickets asignados a él + tickets sin asignar
    // - Employee: solo puede ver sus propios tickets

    if (user.role === "admin" || user.role === "supervisor") {
      // Admin y supervisor pueden ver todo
      req.ticket = ticket;
      return next();
    }

    if (user.role === "agent") {
      // Agente puede ver tickets asignados a él o sin asignar
      if (
        ticket.assignedTo &&
        ticket.assignedTo.toString() === user._id.toString()
      ) {
        req.ticket = ticket;
        return next();
      }
      if (!ticket.assignedTo) {
        req.ticket = ticket;
        return next();
      }
    }

    if (user.role === "employee") {
      // Empleado solo puede ver sus propios tickets
      if (ticket.createdBy.toString() === user._id.toString()) {
        req.ticket = ticket;
        return next();
      }
    }

    // Si no cumple ninguna regla, acceso denegado
    return res.status(403).json({
      error: "No tienes permisos para ver este ticket",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error verificando permisos",
      details: error.message,
    });
  }
};

// Middleware para verificar si el usuario puede modificar un ticket
const canModifyTicket = async (req, res, next) => {
  try {
    const { Ticket } = require("../models");
    const ticketId = req.params.id;
    const user = req.user;

    // Buscar el ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        error: "Ticket no encontrado",
      });
    }

    // Reglas de modificación:
    // - Admin/Supervisor: pueden modificar cualquier ticket
    // - Agent: puede modificar tickets asignados a él
    // - Employee: puede modificar solo sus tickets y solo si están abiertos

    if (user.role === "admin" || user.role === "supervisor") {
      req.ticket = ticket;
      return next();
    }

    if (user.role === "agent") {
      if (
        ticket.assignedTo &&
        ticket.assignedTo.toString() === user._id.toString()
      ) {
        req.ticket = ticket;
        return next();
      }
    }

    if (user.role === "employee") {
      if (
        ticket.createdBy.toString() === user._id.toString() &&
        (ticket.status === "open" || ticket.status === "pending_user")
      ) {
        req.ticket = ticket;
        return next();
      }
    }

    return res.status(403).json({
      error: "No tienes permisos para modificar este ticket",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error verificando permisos",
      details: error.message,
    });
  }
};

// Middleware para verificar si el usuario puede asignar tickets
const canAssignTickets = (req, res, next) => {
  const user = req.user;

  if (
    user.role === "admin" ||
    user.role === "supervisor" ||
    user.role === "agent"
  ) {
    return next();
  }

  return res.status(403).json({
    error: "No tienes permisos para asignar tickets",
  });
};

module.exports = {
  canViewTicket,
  canModifyTicket,
  canAssignTickets,
};
