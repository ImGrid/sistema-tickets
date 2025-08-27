const { User, Ticket, Comment } = require("../models");
const logger = require("../utils/logger");
const { logUserAction } = require("../services/auditService");

// Listar todos los usuarios con filtros
const getUsers = async (req, res) => {
  try {
    const user = req.user;

    // Solo admin y supervisor pueden ver la lista de usuarios
    if (!["admin", "supervisor"].includes(user.role)) {
      return res.status(403).json({
        error: "No tienes permisos para acceder a la gestión de usuarios",
      });
    }

    const {
      role,
      isActive,
      department,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Construir filtros
    const filters = {};

    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === "true";
    if (department) filters.department = { $regex: department, $options: "i" };

    // Búsqueda por nombre o email
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener usuarios
    const users = await User.find(filters)
      .select("-password") // Excluir contraseña
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total para paginación
    const total = await User.countDocuments(filters);

    // Log de acceso a usuarios
    await logUserAction(req, "USERS_ACCESSED", {
      filters,
      resultCount: users.length,
    });

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error("Error obteniendo usuarios:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Obtener usuario específico por ID
const getUserById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Solo admin puede ver detalles específicos de usuarios
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Solo administradores pueden ver detalles de usuarios",
      });
    }

    // Buscar usuario
    const targetUser = await User.findById(id).select("-password");
    if (!targetUser) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // Obtener estadísticas adicionales del usuario
    const userStats = await Promise.all([
      Ticket.countDocuments({ createdBy: id }),
      Ticket.countDocuments({ assignedTo: id }),
      Comment.countDocuments({ userId: id }),
    ]);

    const userWithStats = {
      ...targetUser.toObject(),
      stats: {
        ticketsCreated: userStats[0],
        ticketsAssigned: userStats[1],
        commentsCount: userStats[2],
      },
    };

    await logUserAction(req, "USER_DETAILS_ACCESSED", {
      targetUserId: id,
    });

    res.json({
      user: userWithStats,
    });
  } catch (error) {
    logger.error("Error obteniendo usuario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Actualizar datos básicos del usuario
const updateUser = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { name, email, department, employeeId } = req.body;

    // Solo admin puede actualizar otros usuarios
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Solo administradores pueden actualizar usuarios",
      });
    }

    // Buscar usuario
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // Validar email único (si se está cambiando)
    if (email && email !== targetUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          error: "El email ya está en uso por otro usuario",
        });
      }
    }

    // Validar employeeId único (si se está cambiando)
    if (employeeId && employeeId !== targetUser.employeeId) {
      const existingEmployee = await User.findOne({
        employeeId,
        _id: { $ne: id },
      });
      if (existingEmployee) {
        return res.status(400).json({
          error: "El ID de empleado ya está en uso",
        });
      }
    }

    // Preparar datos de actualización
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (department) updateData.department = department.trim();
    if (employeeId !== undefined)
      updateData.employeeId = employeeId?.trim() || undefined;

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    await logUserAction(req, "USER_UPDATED", {
      targetUserId: id,
      changes: updateData,
    });

    logger.info("Usuario actualizado", {
      adminId: user._id,
      targetUserId: id,
      changes: updateData,
    });

    res.json({
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Error actualizando usuario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Cambiar rol de usuario
const updateUserRole = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { role } = req.body;

    // Solo admin puede cambiar roles
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Solo administradores pueden cambiar roles de usuario",
      });
    }

    // Validar rol
    const validRoles = ["employee", "agent", "supervisor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "Rol inválido",
        validRoles,
      });
    }

    // Buscar usuario
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // No permitir cambiar el propio rol
    if (targetUser._id.toString() === user._id.toString()) {
      return res.status(400).json({
        error: "No puedes cambiar tu propio rol",
      });
    }

    // Guardar rol anterior para log
    const previousRole = targetUser.role;

    // Actualizar rol
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    await logUserAction(req, "USER_ROLE_CHANGED", {
      targetUserId: id,
      previousRole,
      newRole: role,
    });

    logger.info("Rol de usuario cambiado", {
      adminId: user._id,
      targetUserId: id,
      previousRole,
      newRole: role,
    });

    res.json({
      message: `Rol cambiado exitosamente de ${previousRole} a ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Error cambiando rol:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Activar/desactivar usuario
const updateUserStatus = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { isActive } = req.body;

    // Solo admin puede cambiar el estado
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Solo administradores pueden cambiar el estado de usuarios",
      });
    }

    // Validar isActive
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        error: "El estado debe ser true o false",
      });
    }

    // Buscar usuario
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // No permitir desactivar el propio usuario
    if (targetUser._id.toString() === user._id.toString()) {
      return res.status(400).json({
        error: "No puedes cambiar el estado de tu propia cuenta",
      });
    }

    // Actualizar estado
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password");

    await logUserAction(req, "USER_STATUS_CHANGED", {
      targetUserId: id,
      newStatus: isActive ? "active" : "inactive",
    });

    logger.info("Estado de usuario cambiado", {
      adminId: user._id,
      targetUserId: id,
      isActive,
    });

    res.json({
      message: `Usuario ${isActive ? "activado" : "desactivado"} exitosamente`,
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Error cambiando estado:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Eliminar usuario (soft delete o hard delete)
const deleteUser = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { permanent = false } = req.body;

    // Solo admin puede eliminar usuarios
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Solo administradores pueden eliminar usuarios",
      });
    }

    // Buscar usuario
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // No permitir eliminar el propio usuario
    if (targetUser._id.toString() === user._id.toString()) {
      return res.status(400).json({
        error: "No puedes eliminar tu propia cuenta",
      });
    }

    // Verificar si el usuario tiene tickets asignados activos
    const activeTickets = await Ticket.countDocuments({
      assignedTo: id,
      status: { $in: ["open", "assigned", "in_progress"] },
    });

    if (activeTickets > 0 && permanent) {
      return res.status(400).json({
        error: `El usuario tiene ${activeTickets} tickets activos asignados. Reasígnalos antes de eliminar.`,
      });
    }

    if (permanent) {
      // Eliminación permanente (solo si no tiene tickets activos)
      await User.findByIdAndDelete(id);

      await logUserAction(req, "USER_DELETED_PERMANENT", {
        targetUserId: id,
        targetUserEmail: targetUser.email,
      });

      res.json({
        message: "Usuario eliminado permanentemente",
      });
    } else {
      // Soft delete (desactivar usuario)
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      ).select("-password");

      await logUserAction(req, "USER_DELETED_SOFT", {
        targetUserId: id,
      });

      res.json({
        message: "Usuario desactivado exitosamente",
        user: updatedUser,
      });
    }

    logger.info("Usuario eliminado", {
      adminId: user._id,
      targetUserId: id,
      permanent,
    });
  } catch (error) {
    logger.error("Error eliminando usuario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Obtener estadísticas de usuarios
const getUserStats = async (req, res) => {
  try {
    const user = req.user;

    // Solo admin puede ver estadísticas
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Solo administradores pueden ver estadísticas de usuarios",
      });
    }

    // Estadísticas básicas
    const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
    ]);

    // Usuarios por rol
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Usuarios por departamento
    const usersByDepartment = await User.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    // Usuarios recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Usuarios más activos (por tickets creados)
    const mostActiveUsers = await Ticket.aggregate([
      { $group: { _id: "$createdBy", ticketCount: { $sum: 1 } } },
      { $sort: { ticketCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          ticketCount: 1,
          name: "$user.name",
          email: "$user.email",
          department: "$user.department",
        },
      },
    ]);

    await logUserAction(req, "USER_STATS_ACCESSED", {});

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        usersByDepartment: usersByDepartment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        mostActiveUsers,
      },
    });
  } catch (error) {
    logger.error("Error obteniendo estadísticas de usuarios:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserStats,
};
