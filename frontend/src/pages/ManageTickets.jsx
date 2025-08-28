import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ticketsService, dashboardService } from "../services/api";
import {
  Settings,
  BarChart3,
  Users,
  Shield,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";

const ManageTickets = () => {
  const navigate = useNavigate();

  // Estados principales
  const [dashboardStats, setDashboardStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    assignedTo: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Estado para operaciones masivas
  const [bulkOperation, setBulkOperation] = useState({
    type: "",
    value: "",
    loading: false,
  });

  // Cargar datos al montar
  useEffect(() => {
    loadDashboardData();
    loadAllTickets();
  }, []);

  // Recargar tickets cuando cambien filtros
  useEffect(() => {
    if (!loading) {
      loadAllTickets();
    }
  }, [filters]);

  // Función para cargar estadísticas del dashboard
  const loadDashboardData = async () => {
    try {
      const response = await dashboardService.getAdminDashboard();
      setDashboardStats(response.dashboard);
    } catch (error) {
      console.error("Error cargando dashboard stats:", error);
      setError("Error cargando estadísticas del dashboard");
    }
  };

  // Función para cargar todos los tickets
  const loadAllTickets = async () => {
    try {
      if (loading) setLoading(true);
      setError("");

      const params = {
        ...filters,
        limit: 100, // Cargar más tickets para admin
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await ticketsService.getTickets(params);
      setTickets(response.tickets || []);
    } catch (error) {
      console.error("Error cargando tickets:", error);
      setError("Error cargando los tickets");
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar todos los datos
  const refreshData = async () => {
    setSelectedTickets([]);
    await Promise.all([loadDashboardData(), loadAllTickets()]);
    toast.success("Datos actualizados");
  };

  // Manejar selección de tickets
  const handleTicketSelect = (ticketId, isSelected) => {
    if (isSelected) {
      setSelectedTickets([...selectedTickets, ticketId]);
    } else {
      setSelectedTickets(selectedTickets.filter((id) => id !== ticketId));
    }
  };

  // Seleccionar/deseleccionar todos
  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedTickets(tickets.map((t) => t._id));
    } else {
      setSelectedTickets([]);
    }
  };

  // Operaciones masivas
  const handleBulkOperation = async (operation, value) => {
    if (selectedTickets.length === 0) {
      toast.error("Selecciona al menos un ticket");
      return;
    }

    setBulkOperation({ type: operation, value, loading: true });
    setUpdating(true);

    let successCount = 0;
    let errorCount = 0;

    try {
      // Procesar tickets seleccionados
      for (const ticketId of selectedTickets) {
        try {
          if (operation === "assign") {
            await ticketsService.assignTicket(ticketId, value);
          } else if (operation === "status") {
            await ticketsService.updateTicketStatus(ticketId, value);
          }
          successCount++;
        } catch (error) {
          console.error(`Error en ticket ${ticketId}:`, error);
          errorCount++;
        }
      }

      // Mostrar resultados
      if (successCount > 0) {
        toast.success(`${successCount} tickets actualizados correctamente`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} tickets no se pudieron actualizar`);
      }

      // Recargar datos y limpiar selección
      await loadAllTickets();
      setSelectedTickets([]);
    } catch (error) {
      toast.error("Error en operación masiva");
    } finally {
      setBulkOperation({ type: "", value: "", loading: false });
      setUpdating(false);
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const config = {
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

    const { label, color } = config[status] || config.open;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  // Obtener badge de prioridad
  const getPriorityBadge = (priority) => {
    const config = {
      low: { label: "Baja", color: "bg-gray-100 text-gray-800" },
      medium: { label: "Media", color: "bg-blue-100 text-blue-800" },
      high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
      urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
    };

    const { label, color } = config[priority] || config.medium;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  // Estadísticas calculadas
  const stats = dashboardStats?.stats || {};
  const currentStats = {
    total: tickets.length,
    unassigned: tickets.filter((t) => !t.assignedTo && t.status === "open")
      .length,
    critical: tickets.filter(
      (t) =>
        (t.priority === "urgent" || t.priority === "high") &&
        t.status !== "closed"
    ).length,
    oldTickets: tickets.filter((t) => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return (
        new Date(t.createdAt) < threeDaysAgo &&
        !["resolved", "closed"].includes(t.status)
      );
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Tickets
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Panel de administración completa del sistema de tickets
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 border-l-4 border-red-400 bg-red-50">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Sistema</p>
              <p className="text-2xl font-semibold text-gray-900">
                {currentStats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sin Asignar</p>
              <p className="text-2xl font-semibold text-gray-900">
                {currentStats.unassigned}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Críticos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {currentStats.critical}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Antiguos (3d+)
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {currentStats.oldTickets}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtros */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="open">Abierto</option>
            <option value="assigned">Asignado</option>
            <option value="in_progress">En Progreso</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="network">Red</option>
            <option value="access">Acceso</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>

      {/* Acciones masivas */}
      {selectedTickets.length > 0 && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-900">
              {selectedTickets.length} ticket(s) seleccionado(s)
            </div>
            <div className="flex space-x-2">
              <select
                onChange={(e) => {
                  const [operation, value] = e.target.value.split(":");
                  if (operation && value) {
                    handleBulkOperation(operation, value);
                  }
                }}
                disabled={bulkOperation.loading}
                className="px-3 py-1 text-sm border border-blue-300 rounded-md"
              >
                <option value="">Seleccionar acción...</option>
                <optgroup label="Cambiar estado">
                  <option value="status:assigned">→ Asignado</option>
                  <option value="status:in_progress">→ En Progreso</option>
                  <option value="status:resolved">→ Resuelto</option>
                  <option value="status:closed">→ Cerrado</option>
                </optgroup>
                <optgroup label="Asignar">
                  <option value="assign:null">→ Sin asignar</option>
                  <option value="assign:{user._id}">→ Asignar a mí</option>
                </optgroup>
              </select>

              <button
                onClick={() => setSelectedTickets([])}
                className="px-3 py-1 text-sm text-blue-600 rounded-md hover:bg-blue-100"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de tickets */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Todos los Tickets ({tickets.length})
            </h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={
                    selectedTickets.length === tickets.length &&
                    tickets.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="mr-2"
                />
                Seleccionar todos
              </label>
            </div>
          </div>
        </div>

        {loading && (
          <div className="p-6 text-center">
            <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Cargando tickets...</p>
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className="p-6 text-center">
            <Settings className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron tickets
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta cambiar los filtros de búsqueda
            </p>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {/* Checkbox de selección */}
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket._id)}
                    onChange={(e) =>
                      handleTicketSelect(ticket._id, e.target.checked)
                    }
                    className="rounded"
                  />

                  {/* Información del ticket */}
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
                      <span>Por: {ticket.createdBy?.name || "Usuario"}</span>
                      <span>Dept: {ticket.createdBy?.department || "N/A"}</span>
                      <span>Categoría: {ticket.category}</span>
                      <span>
                        Creado:{" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      {ticket.assignedTo ? (
                        <span className="text-blue-600">
                          Asignado: {ticket.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-orange-600">Sin asignar</span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/tickets/${ticket._id}`)}
                      className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
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
  );
};

export default ManageTickets;
