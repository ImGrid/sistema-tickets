import axios from "axios";

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró, limpiar localStorage y redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Obtener perfil actual
  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Continuar con logout local aunque falle el backend
      console.error("Error en logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};

// Servicios de tickets expandidos
export const ticketsService = {
  // Obtener lista de tickets con filtros avanzados
  getTickets: async (params = {}) => {
    // Construir query params
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append("status", params.status);
    if (params.category) queryParams.append("category", params.category);
    if (params.priority) queryParams.append("priority", params.priority);
    if (params.search) queryParams.append("search", params.search);
    if (params.assignedTo) queryParams.append("assignedTo", params.assignedTo);
    if (params.createdBy) queryParams.append("createdBy", params.createdBy);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await api.get(`/tickets?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener ticket específico por ID
  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Crear nuevo ticket
  createTicket: async (ticketData) => {
    // Validar datos antes de enviar
    if (!ticketData.title || !ticketData.description || !ticketData.category) {
      throw new Error("Título, descripción y categoría son obligatorios");
    }

    const response = await api.post("/tickets", {
      title: ticketData.title.trim(),
      description: ticketData.description.trim(),
      category: ticketData.category,
      priority: ticketData.priority || "medium",
      tags: ticketData.tags || [],
    });
    return response.data;
  },

  // Actualizar ticket existente
  updateTicket: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  // Actualizar solo el estado del ticket
  updateTicketStatus: async (id, status) => {
    const response = await api.put(`/tickets/${id}`, { status });
    return response.data;
  },

  // Asignar ticket a un agente
  assignTicket: async (id, assignedTo) => {
    const response = await api.put(`/tickets/${id}/assign`, {
      assignedTo: assignedTo || null,
    });
    return response.data;
  },

  // Eliminar ticket (solo admin)
  deleteTicket: async (id) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  },

  // Obtener estadísticas de tickets
  getTicketStats: async () => {
    try {
      const response = await api.get("/tickets/stats");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo stats de tickets:", error);
      return { stats: {} };
    }
  },

  // Búsqueda de tickets
  searchTickets: async (searchTerm) => {
    const response = await api.get(`/tickets`, {
      params: { search: searchTerm },
    });
    return response.data;
  },

  // Obtener tickets por filtros específicos
  getTicketsByFilter: async (filterType, filterValue) => {
    const params = {};
    params[filterType] = filterValue;
    return await this.getTickets(params);
  },

  // Validar datos de ticket
  validateTicketData: (ticketData) => {
    const errors = {};

    if (!ticketData.title || ticketData.title.trim().length < 3) {
      errors.title = "El título debe tener al menos 3 caracteres";
    }

    if (!ticketData.description || ticketData.description.trim().length < 10) {
      errors.description = "La descripción debe tener al menos 10 caracteres";
    }

    if (!ticketData.category) {
      errors.category = "La categoría es obligatoria";
    }

    const validCategories = [
      "hardware",
      "software",
      "network",
      "access",
      "other",
    ];
    if (ticketData.category && !validCategories.includes(ticketData.category)) {
      errors.category = "Categoría no válida";
    }

    const validPriorities = ["low", "medium", "high", "urgent"];
    if (ticketData.priority && !validPriorities.includes(ticketData.priority)) {
      errors.priority = "Prioridad no válida";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

// Servicios de dashboard expandidos
export const dashboardService = {
  // Dashboard automático según rol
  getDashboard: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },

  // Quick stats
  getQuickStats: async () => {
    const response = await api.get("/dashboard/quick");
    return response.data;
  },

  // Dashboard específico de empleado
  getEmployeeDashboard: async () => {
    const response = await api.get("/dashboard/employee");
    return response.data;
  },

  // Dashboard específico de agente
  getAgentDashboard: async () => {
    const response = await api.get("/dashboard/agent");
    return response.data;
  },

  // Dashboard específico de admin
  getAdminDashboard: async () => {
    const response = await api.get("/dashboard/admin");
    return response.data;
  },
};

// Servicios de comentarios (para fases futuras)
export const commentsService = {
  // Obtener comentarios de un ticket
  getComments: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Crear comentario
  createComment: async (ticketId, content, isInternal = false) => {
    const response = await api.post(`/tickets/${ticketId}/comments`, {
      content,
      isInternal,
    });
    return response.data;
  },

  // Actualizar comentario
  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  // Eliminar comentario
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

// Servicios de archivos adjuntos (para fases futuras)
export const attachmentsService = {
  // Subir archivos
  uploadFiles: async (ticketId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(
      `/tickets/${ticketId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Obtener archivos de un ticket
  getAttachments: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/attachments`);
    return response.data;
  },

  // Descargar archivo
  downloadFile: async (attachmentId) => {
    const response = await api.get(`/attachments/${attachmentId}/download`, {
      responseType: "blob",
    });
    return response;
  },

  // Eliminar archivo
  deleteFile: async (attachmentId) => {
    const response = await api.delete(`/attachments/${attachmentId}`);
    return response.data;
  },
};
// Servicios de auditoría
export const auditService = {
  // Obtener logs de auditoría con filtros
  getAuditLogs: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.userId) queryParams.append("userId", params.userId);
    if (params.action) queryParams.append("action", params.action);
    if (params.resource) queryParams.append("resource", params.resource);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);

    const response = await api.get(`/audit/logs?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener estadísticas de seguridad
  getSecurityStats: async () => {
    const response = await api.get("/audit/stats");
    return response.data;
  },

  // Exportar logs (funcionalidad futura)
  exportLogs: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.format) queryParams.append("format", params.format);

    const response = await api.get(`/audit/export?${queryParams.toString()}`, {
      responseType: "blob",
    });
    return response;
  },
};
// Servicios de gestión de usuarios
export const usersService = {
  // Obtener lista de usuarios con filtros
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.role) queryParams.append("role", params.role);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params.department) queryParams.append("department", params.department);
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await api.get(`/users?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener usuario específico por ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Actualizar datos básicos del usuario
  updateUser: async (id, userData) => {
    // Validar datos antes de enviar
    if (userData.email && !isValidEmail(userData.email)) {
      throw new Error("Email inválido");
    }

    if (userData.name && userData.name.trim().length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }

    const response = await api.put(`/users/${id}`, {
      name: userData.name?.trim(),
      email: userData.email?.trim().toLowerCase(),
      department: userData.department?.trim(),
      employeeId: userData.employeeId?.trim() || null,
    });
    return response.data;
  },

  // Cambiar rol de usuario
  updateUserRole: async (id, role) => {
    const validRoles = ["employee", "agent", "supervisor", "admin"];
    if (!validRoles.includes(role)) {
      throw new Error(`Rol inválido. Roles válidos: ${validRoles.join(", ")}`);
    }

    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  // Activar/desactivar usuario
  updateUserStatus: async (id, isActive) => {
    if (typeof isActive !== "boolean") {
      throw new Error("El estado debe ser true o false");
    }

    const response = await api.put(`/users/${id}/status`, { isActive });
    return response.data;
  },

  // Eliminar usuario
  deleteUser: async (id, permanent = false) => {
    const response = await api.delete(`/users/${id}`, {
      data: { permanent },
    });
    return response.data;
  },

  // Obtener estadísticas de usuarios
  getUserStats: async () => {
    const response = await api.get("/users/stats");
    return response.data;
  },

  // Búsqueda de usuarios
  searchUsers: async (searchTerm) => {
    const response = await api.get("/users", {
      params: { search: searchTerm, limit: 50 },
    });
    return response.data;
  },

  // Obtener usuarios por rol específico
  getUsersByRole: async (role) => {
    const response = await api.get("/users", {
      params: { role, limit: 100 },
    });
    return response.data;
  },

  // Obtener usuarios activos
  getActiveUsers: async () => {
    const response = await api.get("/users", {
      params: { isActive: true, limit: 100 },
    });
    return response.data;
  },

  // Operaciones masivas para usuarios
  bulkUpdateRole: async (userIds, role) => {
    const promises = userIds.map((id) => usersService.updateUserRole(id, role));
    return await Promise.allSettled(promises);
  },

  bulkUpdateStatus: async (userIds, isActive) => {
    const promises = userIds.map((id) =>
      usersService.updateUserStatus(id, isActive)
    );
    return await Promise.allSettled(promises);
  },

  // Validaciones del lado cliente
  validateUserData: (userData) => {
    const errors = {};

    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (userData.name && userData.name.length > 50) {
      errors.name = "El nombre no puede tener más de 50 caracteres";
    }

    if (!userData.email || !isValidEmail(userData.email)) {
      errors.email = "Email inválido";
    }

    if (!userData.department || userData.department.trim().length < 2) {
      errors.department = "El departamento es obligatorio";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

// Función helper para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
export default api;
