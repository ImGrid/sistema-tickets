import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { dashboardService } from "../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboard();
        setDashboardData(response.dashboard);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setError("Error cargando los datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Manejar logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header simple */}
      <header className="bg-white shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Tickets
              </h1>
              <p className="text-sm text-gray-600">
                Dashboard -{" "}
                {user?.role === "employee"
                  ? "Empleado"
                  : user?.role === "agent"
                  ? "Agente"
                  : user?.role === "admin"
                  ? "Administrador"
                  : user?.role}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Hola, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido del dashboard */}
      <main className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Información del usuario */}
          <div className="mb-6 overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Información del Usuario
              </h3>
              <div className="max-w-xl mt-2 text-sm text-gray-500">
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p>
                      <strong>Nombre:</strong> {user?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user?.email}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Rol:</strong> {user?.role}
                    </p>
                    <p>
                      <strong>Departamento:</strong> {user?.department}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas según rol */}
          {dashboardData && (
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">
                  Estadísticas
                </h3>

                {/* Dashboard de empleado */}
                {user?.role === "employee" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <h4 className="font-medium text-blue-900">
                        Total de Tickets
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData.totalTickets || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-50">
                      <h4 className="font-medium text-yellow-900">
                        Tickets Pendientes
                      </h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        {dashboardData.pendingTickets || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                      <h4 className="font-medium text-green-900">
                        Tickets Resueltos
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {dashboardData.resolvedTickets || 0}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dashboard de agente */}
                {user?.role === "agent" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <h4 className="font-medium text-blue-900">
                        Asignados a Mí
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData.assignedTickets || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-50">
                      <h4 className="font-medium text-yellow-900">
                        Sin Asignar
                      </h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        {dashboardData.unassignedTickets || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50">
                      <h4 className="font-medium text-red-900">
                        Alta Prioridad
                      </h4>
                      <p className="text-2xl font-bold text-red-600">
                        {dashboardData.highPriorityTickets || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                      <h4 className="font-medium text-green-900">
                        Resueltos por Mí
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {dashboardData.resolvedByMe || 0}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dashboard de admin */}
                {(user?.role === "admin" || user?.role === "supervisor") && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="p-4 rounded-lg bg-blue-50">
                        <h4 className="font-medium text-blue-900">
                          Total Tickets
                        </h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {dashboardData.totalTickets || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50">
                        <h4 className="font-medium text-green-900">
                          Usuarios Activos
                        </h4>
                        <p className="text-2xl font-bold text-green-600">
                          {dashboardData.activeUsers || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50">
                        <h4 className="font-medium text-yellow-900">
                          Tickets Nuevos (7d)
                        </h4>
                        <p className="text-2xl font-bold text-yellow-600">
                          {dashboardData.recentActivity?.newTickets || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50">
                        <h4 className="font-medium text-purple-900">
                          Tickets Resueltos (7d)
                        </h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {dashboardData.recentActivity?.resolvedTickets || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Debug info (remover en producción) */}
                <div className="p-4 mt-6 rounded-lg bg-gray-50">
                  <h4 className="mb-2 font-medium text-gray-900">
                    Datos del Dashboard (Debug)
                  </h4>
                  <pre className="overflow-auto text-xs text-gray-600">
                    {JSON.stringify(dashboardData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
