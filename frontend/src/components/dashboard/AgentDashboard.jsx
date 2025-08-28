import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { ticketsService } from "../../services/api";
import {
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  TrendingUp,
} from "lucide-react";

const AgentDashboard = ({ data, onRefresh }) => {
  const { user } = useAuth();
  const [urgentTickets, setUrgentTickets] = useState([]);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Cargar tickets urgentes y disponibles
  useEffect(() => {
    const loadAgentTickets = async () => {
      try {
        setLoadingTickets(true);

        // Cargar tickets urgentes asignados a mí
        const urgentResponse = await ticketsService.getTickets({
          priority: "urgent,high",
          limit: 5,
        });
        setUrgentTickets(urgentResponse.tickets || []);

        // Cargar tickets disponibles (sin asignar)
        const availableResponse = await ticketsService.getTickets({
          status: "open",
          limit: 5,
        });
        setAvailableTickets(availableResponse.tickets || []);
      } catch (error) {
        console.error("Error cargando tickets para agente:", error);
      } finally {
        setLoadingTickets(false);
      }
    };

    loadAgentTickets();
  }, []);

  // Obtener estadísticas de los datos del dashboard
  const stats = {
    assignedTickets: data?.assignedTickets || 0,
    unassignedTickets: data?.unassignedTickets || 0,
    highPriorityTickets: data?.highPriorityTickets || 0,
    resolvedByMe: data?.resolvedByMe || 0,
    weeklyWorkload: data?.weeklyWorkload || 0,
    weeklyComments: data?.weeklyComments || 0,
  };

  // Función para tomar un ticket disponible
  const handleTakeTicket = async (ticketId) => {
    try {
      await ticketsService.assignTicket(ticketId, user._id);
      // Recargar tickets disponibles
      const availableResponse = await ticketsService.getTickets({
        status: "open",
        limit: 5,
      });
      setAvailableTickets(availableResponse.tickets || []);
      // Refrescar dashboard
      onRefresh();
    } catch (error) {
      console.error("Error asignando ticket:", error);
      toast.error("Error al tomar el ticket");
    }
  };

  // Quick actions para agentes
  const quickActions = [
    {
      label: "Mis Asignados",
      href: "/my-assigned-tickets",
      icon: UserCheck,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Todos los Tickets",
      href: "/all-tickets",
      icon: FileText,
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Asignados a Mí
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.assignedTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sin Asignar</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.unassignedTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Alta Prioridad
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.highPriorityTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Resueltos por Mí
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.resolvedByMe}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Carga Semanal</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.weeklyWorkload} tickets
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Comentarios (7d)
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.weeklyComments}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Tiempo Promedio
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {data?.avgResponseTimeHours
                  ? `${Math.round(data.avgResponseTimeHours)}h`
                  : "--"}
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

      {/* Tickets que necesitan atención */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tickets Urgentes */}
        <div className="bg-white border rounded-lg">
          <div className="px-6 py-4 border-b">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Tickets Urgentes
            </h3>
          </div>
          <div className="p-6">
            {loadingTickets ? (
              <div className="py-4 text-center">
                <div className="w-6 h-6 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando...</p>
              </div>
            ) : urgentTickets.length === 0 ? (
              <p className="py-4 text-sm text-center text-gray-500">
                No hay tickets urgentes en este momento
              </p>
            ) : (
              <div className="space-y-3">
                {urgentTickets.slice(0, 3).map((ticket) => (
                  <div
                    key={ticket._id}
                    className="p-3 border border-red-200 rounded-lg bg-red-50"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="px-2 py-1 text-red-800 bg-red-100 rounded-full">
                          {ticket.priority}
                        </span>
                        <span>{ticket.category}</span>
                      </div>
                      <button
                        onClick={() => console.log("Ver ticket:", ticket._id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tickets Disponibles */}
        <div className="bg-white border rounded-lg">
          <div className="px-6 py-4 border-b">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Tickets Disponibles
            </h3>
          </div>
          <div className="p-6">
            {loadingTickets ? (
              <div className="py-4 text-center">
                <div className="w-6 h-6 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando...</p>
              </div>
            ) : availableTickets.length === 0 ? (
              <p className="py-4 text-sm text-center text-gray-500">
                No hay tickets disponibles para asignar
              </p>
            ) : (
              <div className="space-y-3">
                {availableTickets.slice(0, 3).map((ticket) => (
                  <div
                    key={ticket._id}
                    className="p-3 border border-yellow-200 rounded-lg bg-yellow-50"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="px-2 py-1 text-yellow-800 bg-yellow-100 rounded-full">
                          {ticket.priority}
                        </span>
                        <span>{ticket.category}</span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleTakeTicket(ticket._id)}
                          className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Tomar
                        </button>
                        <button
                          onClick={() => console.log("Ver ticket:", ticket._id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas por estado si están disponibles */}
      {data?.myTicketsByStatus && (
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Mis Tickets por Estado
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(data.myTicketsByStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500 capitalize">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
