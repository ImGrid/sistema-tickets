import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext();

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay usuario autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          // Verificar que el token siga siendo válido
          const profileData = await authService.getProfile();
          setUser(profileData.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token inválido o expirado
        console.error("Error verificando autenticación:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función de login
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      // Guardar token y usuario
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true, user: response.user };
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Error al iniciar sesión",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);

      // Auto-login después del registro
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true, user: response.user };
    } catch (error) {
      console.error("Error en registro:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Error al registrarse",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    // 1. Limpiar el estado local y localStorage INMEDIATAMENTE
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. Intentar el logout en el backend (sin bloquear la UI)
    try {
      // La UI ya no depende del resultado de esta llamada (fire-and-forget)
      authService.logout();
    } catch (error) {
      // El error de backend no debería afectar la experiencia de logout del usuario.
      console.error("Error en el logout del servidor:", error);
    }
  };

  // Actualizar usuario (para cambios de perfil)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
