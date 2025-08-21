import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ticketsService } from "../../services/api";
import { Plus, Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react";

const EmployeeDashboard = ({ data, loading, error, onRefresh }) => {
  const { user } = useAuth();
  const [recentTickets, setRecentTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Cargar tickets recientes
  useEffect(() => {
    const loadRecentTickets = async () => {
      try {
        setLoadingTickets(true);
        const response = await ticketsService.getTickets({ limit: 5 });
        setRecentTickets(response.tickets || []);
      } catch (error) {
        console.error("Error cargando tickets recientes:", error);
      } finally {
        setLoadingTickets(false);
      }
    };

    loadRecentTickets();
  }, []);

  // Obtener estadísticas de los datos del dashboard
  const stats = {
    totalTickets: data?.totalTickets || 0,
    pendingTickets: data?.pendingTickets || 0,
    resolvedTickets: data?.resolvedTickets || 0,
    needsAttention: data?.needsAttention || 0,
  };

  // Quick actions para empleados
  const quickActions = [
    {
      label: "Crear Ticket",
      href: "/create-ticket",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Mis Tickets",
      href: "/my-tickets",
      icon: Ticket,
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <Ticket className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pendingTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resueltos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.resolvedTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Necesitan Atención
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.needsAttention}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-white border rounded-lg">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.href}
                className={`inline-flex items-center justify-center px-4 py-2 text-white rounded-md ${action.color}`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tickets Recientes */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Mis Tickets Recientes
            </h3>
            <Link
              to="/my-tickets"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Ver todos
            </Link>
          </div>
        </div>

        <div className="p-6">
          {loadingTickets ? (
            <div className="py-4 text-center">
              <div className="w-6 h-6 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando tickets...</p>
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="py-8 text-center">
              <Ticket className="w-12 h-12 mx-auto text-gray-400" />
              <h4 className="mt-2 text-sm font-medium text-gray-900">
                No tienes tickets
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Crea tu primer ticket para comenzar
              </p>
              <Link
                to="/create-ticket"
                className="inline-flex items-center px-3 py-2 mt-3 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Ticket
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          ticket.status === "open"
                            ? "bg-blue-100 text-blue-800"
                            : ticket.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {ticket.status}
                      </span>
                      <span>{ticket.category}</span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      console.log("Ver ticket:", ticket._id);
                      // TODO: Navegar a detalle del ticket
                    }}
                    className="ml-3 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Información adicional si hay datos del backend */}
      {data && (
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Estadísticas Detalladas
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.avgResolutionTimeHours && (
              <div>
                <p className="text-sm text-gray-500">
                  Tiempo Promedio Resolución
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {Math.round(data.avgResolutionTimeHours)} horas
                </p>
              </div>
            )}
            {data.recentComments && (
              <div>
                <p className="text-sm text-gray-500">Comentarios Recientes</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.recentComments}
                </p>
              </div>
            )}
            {data.filesUploaded && (
              <div>
                <p className="text-sm text-gray-500">Archivos Subidos</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.filesUploaded}
                </p>
              </div>
            )}
            {data.ticketsByStatus && (
              <div>
                <p className="text-sm text-gray-500">Por Estado</p>
                <div className="mt-1 text-xs text-gray-600">
                  {Object.entries(data.ticketsByStatus).map(
                    ([status, count]) => (
                      <span key={status} className="mr-3">
                        {status}: {count}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
