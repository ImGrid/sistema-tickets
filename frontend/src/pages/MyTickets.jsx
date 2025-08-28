import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ticketsService } from "../services/api";
import TicketFilters from "../components/ticket/TicketFilters";
import {
  Plus,
  Ticket,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MyTickets = () => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalTickets, setTotalTickets] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Estado de filtros
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const ITEMS_PER_PAGE = 10;

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
      toast.error("Error cargando tus tickets");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset página al cambiar filtros
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

  // Calcular estadísticas de tickets
  const stats = {
    total: totalTickets,
    pending: tickets.filter((t) =>
      ["open", "assigned", "in_progress", "pending_user"].includes(t.status)
    ).length,
    resolved: tickets.filter((t) => ["resolved", "closed"].includes(t.status))
      .length,
    needsAttention: tickets.filter((t) => t.status === "pending_user").length,
  };

  // Calcular paginación
  const totalPages = Math.ceil(totalTickets / ITEMS_PER_PAGE);
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalTickets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Tickets</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona tus solicitudes de soporte
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/create-ticket"
            className="inline-flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Ticket
          </Link>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Ticket className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
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
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resueltos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.resolved}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
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

      {/* Filtros */}
      <TicketFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        loading={loading}
        showUserFilter={false} // Los empleados no ven filtro de asignación
      />

      {/* Lista de tickets */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Mis tickets ({totalTickets})
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
            <Ticket className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {Object.values(filters).some((f) => f && f !== "" && f !== "desc")
                ? "No se encontraron tickets"
                : "No tienes tickets"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.values(filters).some((f) => f && f !== "" && f !== "desc")
                ? "Intenta cambiar los filtros de búsqueda"
                : "Crea tu primer ticket para comenzar"}
            </p>
            <div className="mt-6">
              <Link
                to="/create-ticket"
                className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Ticket
              </Link>
            </div>
          </div>
        )}

        {/* Tickets list */}
        {!loading && !error && tickets.length > 0 && (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
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
                      <span>Categoría: {ticket.category}</span>
                      <span>
                        Creado:{" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      {ticket.assignedTo && (
                        <span>Asignado a: {ticket.assignedTo.name}</span>
                      )}
                      {ticket.updatedAt !== ticket.createdAt && (
                        <span>
                          Actualizado:{" "}
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex ml-4 space-x-2">
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Link>

                    {/* Solo mostrar editar si el ticket puede ser editado */}
                    {(ticket.status === "open" ||
                      ticket.status === "pending_user") && (
                      <Link
                        to={`/tickets/${ticket._id}/edit`}
                        className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

export default MyTickets;
