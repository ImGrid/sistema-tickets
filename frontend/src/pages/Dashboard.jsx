import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { dashboardService } from "../services/api";
import EmployeeDashboard from "../components/dashboard/EmployeeDashboard";
import AgentDashboard from "../components/dashboard/AgentDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar datos del dashboard según el rol
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        // Llamar a la API específica según el rol
        switch (user?.role) {
          case "employee":
            response = await dashboardService.getEmployeeDashboard();
            break;
          case "agent":
            response = await dashboardService.getAgentDashboard();
            break;
          case "admin":
          case "supervisor":
            response = await dashboardService.getAdminDashboard();
            break;
          default:
            // Fallback al dashboard general
            response = await dashboardService.getDashboard();
        }

        setDashboardData(response.dashboard);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setError("Error cargando los datos del dashboard");

        // En caso de error, intentar cargar datos básicos
        try {
          const quickStats = await dashboardService.getQuickStats();
          setDashboardData(quickStats);
        } catch (fallbackError) {
          console.error("Error en fallback:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.role) {
      loadDashboard();
    }
  }, [user?.role]);

  // Función para recargar datos
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getDashboard();
      setDashboardData(response.dashboard);
      setError("");
    } catch (error) {
      setError("Error recargando datos");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-600">
          <h3 className="text-lg font-medium">Error</h3>
          <p>{error}</p>
        </div>
        <button
          onClick={refreshDashboard}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar dashboard según rol
  const renderDashboard = () => {
    switch (user?.role) {
      case "employee":
        return (
          <EmployeeDashboard
            data={dashboardData}
            loading={loading}
            error={error}
            onRefresh={refreshDashboard}
          />
        );
      case "agent":
        return (
          <AgentDashboard
            data={dashboardData}
            loading={loading}
            error={error}
            onRefresh={refreshDashboard}
          />
        );
      case "admin":
      case "supervisor":
        return (
          <AdminDashboard
            data={dashboardData}
            loading={loading}
            error={error}
            onRefresh={refreshDashboard}
          />
        );
      default:
        return (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Rol no reconocido
            </h3>
            <p className="text-gray-600">Rol actual: {user?.role}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Bienvenido, {user?.name} ({user?.role})
          </p>
        </div>

        {error && (
          <div className="px-3 py-1 text-sm text-red-600 rounded bg-red-50">
            {error}
          </div>
        )}

        <button
          onClick={refreshDashboard}
          disabled={loading}
          className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {/* Dashboard específico por rol */}
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
