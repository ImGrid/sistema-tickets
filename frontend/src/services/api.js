import axios from "axios";

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
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

// Servicios de tickets (básico para empezar)
export const ticketsService = {
  // Obtener lista de tickets
  getTickets: async (params = {}) => {
    const response = await api.get("/tickets", { params });
    return response.data;
  },

  // Obtener ticket específico
  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
};

// Servicios de dashboard
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
};

export default api;
