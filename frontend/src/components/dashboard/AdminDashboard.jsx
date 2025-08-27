import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ticketsService } from "../../services/api";
import {
  Users,
  Ticket,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Clock,
} from "lucide-react";

const AdminDashboard = ({ data }) => {
  const [criticalTickets, setCriticalTickets] = useState([]);
  const [oldTickets, setOldTickets] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cargar datos detallados para admin
  useEffect(() => {
    const loadAdminDetails = async () => {
      try {
        setLoadingDetails(true);

        // Cargar tickets críticos sin asignar
        const criticalResponse = await ticketsService.getTickets({
          priority: "urgent,high",
          status: "open",
          limit: 5,
        });
        setCriticalTickets(criticalResponse.tickets || []);

        // Cargar tickets antiguos (más de 3 días)
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const oldResponse = await ticketsService.getTickets({
          createdBefore: threeDaysAgo.toISOString(),
          status: "open,assigned,in_progress",
          limit: 5,
        });
        setOldTickets(oldResponse.tickets || []);
      } catch (error) {
        console.error("Error cargando detalles de admin:", error);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadAdminDetails();
  }, []);

  // Obtener estadísticas de los datos del dashboard
  const stats = {
    totalTickets: data?.totalTickets || 0,
    activeUsers: data?.activeUsers || 0,
    newTicketsWeek: data?.recentActivity?.newTickets || 0,
    resolvedTicketsWeek: data?.recentActivity?.resolvedTickets || 0,
    newUsersWeek: data?.recentActivity?.newUsers || 0,
    filesUploadedWeek: data?.recentActivity?.filesUploaded || 0,
  };

  // Estadísticas por categoría
  const categoryStats = data?.ticketsByCategory || {};
  const statusStats = data?.ticketsByStatus || {};
  const priorityStats = data?.ticketsByPriority || {};
  const roleStats = data?.usersByRole || {};

  // Quick actions para admin
  const quickActions = [
    {
      label: "Gestionar Tickets",
      href: "/manage-tickets",
      icon: Ticket,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Usuarios",
      href: "/users",
      icon: Users,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Auditoría",
      href: "/audit",
      icon: Activity,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas principales del sistema */}
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
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Usuarios Activos
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.activeUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Nuevos (7d)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.newTicketsWeek}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Resueltos (7d)
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.resolvedTicketsWeek}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad del sistema */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Nuevos Usuarios (7d)
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.newUsersWeek}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Archivos (7d)</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.filesUploadedWeek}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-pink-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Comentarios (7d)
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {data?.recentActivity?.newComments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-teal-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Carga Sistema</p>
              <p className="text-xl font-semibold text-green-600">Normal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-white border rounded-lg">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Panel de Administración
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      {/* Distribuciones y estadísticas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tickets por Estado */}
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Tickets por Estado
          </h3>
          {Object.keys(statusStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(statusStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {status}
                  </span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 mr-3 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{
                          width: `${(count / stats.totalTickets) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay datos disponibles</p>
          )}
        </div>

        {/* Tickets por Categoría */}
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
            <Ticket className="w-5 h-5 mr-2 text-green-600" />
            Tickets por Categoría
          </h3>
          {Object.keys(categoryStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600 capitalize">
                    {category}
                  </span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 mr-3 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-600 rounded-full"
                        style={{
                          width: `${(count / stats.totalTickets) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay datos disponibles</p>
          )}
        </div>

        {/* Usuarios por Rol */}
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Usuarios por Rol
          </h3>
          {Object.keys(roleStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(roleStats).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {role}
                  </span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 mr-3 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-purple-600 rounded-full"
                        style={{
                          width: `${(count / stats.activeUsers) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay datos disponibles</p>
          )}
        </div>

        {/* Tickets por Prioridad */}
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Tickets por Prioridad
          </h3>
          {Object.keys(priorityStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(priorityStats).map(([priority, count]) => (
                <div
                  key={priority}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600 capitalize">
                    {priority}
                  </span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 mr-3 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          priority === "urgent"
                            ? "bg-red-600"
                            : priority === "high"
                            ? "bg-orange-600"
                            : priority === "medium"
                            ? "bg-yellow-600"
                            : "bg-gray-600"
                        }`}
                        style={{
                          width: `${(count / stats.totalTickets) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Tickets que requieren atención */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tickets Críticos Sin Asignar */}
        <div className="bg-white border rounded-lg">
          <div className="px-6 py-4 border-b">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Críticos Sin Asignar
            </h3>
          </div>
          <div className="p-6">
            {loadingDetails ? (
              <div className="py-4 text-center">
                <div className="w-6 h-6 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : criticalTickets.length === 0 ? (
              <p className="py-4 text-sm text-center text-gray-500">
                No hay tickets críticos sin asignar
              </p>
            ) : (
              <div className="space-y-3">
                {criticalTickets.slice(0, 3).map((ticket) => (
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
                        <span>Por: {ticket.createdBy?.name}</span>
                      </div>
                      <button
                        onClick={() => console.log("Ver ticket:", ticket._id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Gestionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tickets Antiguos */}
        <div className="bg-white border rounded-lg">
          <div className="px-6 py-4 border-b">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <Clock className="w-5 h-5 mr-2 text-orange-600" />
              Tickets Antiguos (+3 días)
            </h3>
          </div>
          <div className="p-6">
            {loadingDetails ? (
              <div className="py-4 text-center">
                <div className="w-6 h-6 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : oldTickets.length === 0 ? (
              <p className="py-4 text-sm text-center text-gray-500">
                No hay tickets antiguos sin resolver
              </p>
            ) : (
              <div className="space-y-3">
                {oldTickets.slice(0, 3).map((ticket) => (
                  <div
                    key={ticket._id}
                    className="p-3 border border-orange-200 rounded-lg bg-orange-50"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="px-2 py-1 text-orange-800 bg-orange-100 rounded-full">
                          {ticket.status}
                        </span>
                        <span>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {ticket.assignedTo
                            ? `Por: ${ticket.assignedTo.name}`
                            : "Sin asignar"}
                        </span>
                      </div>
                      <button
                        onClick={() => console.log("Ver ticket:", ticket._id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Revisar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Users y Agentes si están disponibles */}
      {(data?.topUsers || data?.topAgents) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {data.topUsers && (
            <div className="p-6 bg-white border rounded-lg">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Top Usuarios (por tickets)
              </h3>
              <div className="space-y-3">
                {data.topUsers.slice(0, 5).map((userStat, index) => (
                  <div
                    key={userStat._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="w-6 text-sm text-gray-500">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-gray-900">
                        {userStat.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({userStat.department})
                      </span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {userStat.ticketCount} tickets
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.topAgents && (
            <div className="p-6 bg-white border rounded-lg">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Top Agentes (por resoluciones)
              </h3>
              <div className="space-y-3">
                {data.topAgents.slice(0, 5).map((agentStat, index) => (
                  <div
                    key={agentStat._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="w-6 text-sm text-gray-500">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-gray-900">
                        {agentStat.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {agentStat.resolvedCount} resueltos
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
