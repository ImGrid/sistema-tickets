import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ticketsService } from "../services/api";
import TicketFilters from "../components/ticket/TicketFilters";
import {
  FileText,
  Clock,
  Users,
  Eye,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";

const AllTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalTickets, setTotalTickets] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [updating, setUpdating] = useState(null); // ID del ticket siendo actualizado

  // Estado de filtros (agentes pueden ver filtros de asignación)
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    search: "",
    assignedTo: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const ITEMS_PER_PAGE = 15;

  // Cargar tickets cuando cambien filtros o página
  useEffect(() => {
    loadTickets();
  }, [filters, currentPage]);

  // Función para cargar tickets
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        ...filters,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      // Procesar filtro especial "assignedTo"
      if (params.assignedTo === "me") {
        params.assignedTo = user._id;
      } else if (params.assignedTo === "unassigned") {
        params.assignedTo = "null"; // El backend debe manejar esto
      }

      // Limpiar parámetros vacíos
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await ticketsService.getTickets(params);
      setTickets(response.tickets || []);
      setTotalTickets(
        response.pagination?.total || response.tickets?.length || 0
      );
    } catch (error) {
      console.error("Error cargando tickets:", error);
      setError("Error cargando los tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para tomar un ticket
  const handleTakeTicket = async (ticketId) => {
    if (updating === ticketId) return;

    try {
      setUpdating(ticketId);
      // Actualizar el ticket en la lista local
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId
            ? { ...ticket, assignedTo: user, status: "assigned" }
            : ticket
        )
      );

      console.log(`Ticket ${ticketId} asignado a ${user.name}`);
    } catch (error) {
      console.error("Error tomando ticket:", error);
      alert("Error al tomar el ticket");
    } finally {
      setUpdating(null);
    }
  };

  // Función para cambiar estado rápido
  const handleQuickStatusChange = async (ticketId, newStatus) => {
    if (updating === ticketId) return;

    try {
      setUpdating(ticketId);

      // Actualizar el ticket en la lista local
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );

      console.log(`Ticket ${ticketId} actualizado a estado: ${newStatus}`);
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Error al actualizar el estado");
    } finally {
      setUpdating(null);
    }
  };

  // Manejar cambio de filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Manejar búsqueda
  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
    }));
    setCurrentPage(1);
  };

  // Manejar reset de filtros
  const handleResetFilters = () => {
    setFilters({
      status: "",
      category: "",
      priority: "",
      search: "",
      assignedTo: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setCurrentPage(1);
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { label: "Abierto", color: "bg-blue-100 text-blue-800" },
      assigned: { label: "Asignado", color: "bg-yellow-100 text-yellow-800" },
      in_progress: {
        label: "En Progreso",
        color: "bg-purple-100 text-purple-800",
      },
      pending_user: {
        label: "Pendiente",
        color: "bg-orange-100 text-orange-800",
      },
      resolved: { label: "Resuelto", color: "bg-green-100 text-green-800" },
      closed: { label: "Cerrado", color: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Obtener badge de prioridad
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { label: "Baja", color: "bg-gray-100 text-gray-800" },
      medium: { label: "Media", color: "bg-blue-100 text-blue-800" },
      high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
      urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
    };

    const config = priorityConfig[priority] || {
      label: priority,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Obtener acciones disponibles para un ticket
  const getTicketActions = (ticket) => {
    const actions = [];

    // Ver siempre disponible
    actions.push({
      label: "Ver",
      action: () => navigate(`/tickets/${ticket._id}`),
      icon: Eye,
      color: "text-blue-600 hover:text-blue-800",
    });

    // Tomar ticket si no está asignado
    if (!ticket.assignedTo && ticket.status === "open") {
      actions.push({
        label: "Tomar",
        action: () => handleTakeTicket(ticket._id),
        icon: UserCheck,
        color: "text-purple-600 hover:text-purple-800",
      });
    }

    // Cambiar estado si está asignado a mí o soy admin
    if (
      (ticket.assignedTo && ticket.assignedTo._id === user._id) ||
      user.role === "admin"
    ) {
      if (ticket.status === "assigned") {
        actions.push({
          label: "En Progreso",
          action: () => handleQuickStatusChange(ticket._id, "in_progress"),
          icon: Clock,
          color: "text-yellow-600 hover:text-yellow-800",
        });
      } else if (ticket.status === "in_progress") {
        actions.push({
          label: "Resolver",
          action: () => handleQuickStatusChange(ticket._id, "resolved"),
          icon: CheckCircle,
          color: "text-green-600 hover:text-green-800",
        });
      }
    }

    return actions;
  };

  // Calcular estadísticas
  const stats = {
    total: totalTickets,
    unassigned: tickets.filter((t) => !t.assignedTo && t.status === "open")
      .length,
    assigned: tickets.filter((t) => t.assignedTo && t.status !== "closed")
      .length,
    urgent: tickets.filter(
      (t) =>
        (t.priority === "urgent" || t.priority === "high") &&
        t.status !== "closed"
    ).length,
  };

  // Calcular paginación
  const totalPages = Math.ceil(totalTickets / ITEMS_PER_PAGE);
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalTickets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Todos los Tickets</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vista completa de tickets del sistema para agentes
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sin Asignar</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.unassigned}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Asignados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.assigned}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Urgentes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.urgent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <TicketFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        loading={loading}
        showUserFilter={true} // Agentes pueden ver filtro de asignación
      />

      {/* Lista de tickets */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Todos los tickets ({totalTickets})
            </h2>
            {totalTickets > 0 && (
              <span className="text-sm text-gray-500">
                Mostrando {startItem}-{endItem} de {totalTickets}
              </span>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 border-l-4 border-red-400 bg-red-50">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadTickets}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="p-6 text-center">
            <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Cargando tickets...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && tickets.length === 0 && (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron tickets
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta cambiar los filtros de búsqueda
            </p>
          </div>
        )}

        {/* Tickets list */}
        {!loading && !error && tickets.length > 0 && (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => {
              const actions = getTicketActions(ticket);
              const isUpdating = updating === ticket._id;

              return (
                <div key={ticket._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2 space-x-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {ticket.title}
                        </h3>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>

                      <p className="mb-2 text-sm text-gray-600 truncate">
                        {ticket.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {ticket._id.slice(-8)}</span>
                        <span>Por: {ticket.createdBy.name}</span>
                        <span>Dept: {ticket.createdBy.department}</span>
                        <span>Categoría: {ticket.category}</span>
                        <span>
                          Creado:{" "}
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        {ticket.assignedTo ? (
                          <span className="text-blue-600">
                            Asignado a: {ticket.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-orange-600">Sin asignar</span>
                        )}
                      </div>
                    </div>

                    <div className="flex ml-4 space-x-2">
                      {isUpdating ? (
                        <div className="text-sm text-gray-500">
                          <div className="inline w-4 h-4 mr-1 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                          Actualizando...
                        </div>
                      ) : (
                        actions.map((action, index) => {
                          const IconComponent = action.icon;
                          return (
                            <button
                              key={index}
                              onClick={action.action}
                              className={`inline-flex items-center px-2 py-1 text-sm ${action.color}`}
                            >
                              <IconComponent className="w-4 h-4 mr-1" />
                              {action.label}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {!loading && !error && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startItem} a {endItem} de {totalTickets} resultados
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTickets;
