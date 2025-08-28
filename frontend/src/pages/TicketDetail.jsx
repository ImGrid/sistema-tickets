import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ticketsService } from "../services/api";
import CommentsSection from "../components/ticket/CommentsSection";
import AttachmentsSection from "../components/ticket/AttachmentsSection";
import {
  ArrowLeft,
  Edit,
  Clock,
  User,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  UserCheck,
  Settings,
  Paperclip,
} from "lucide-react";

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar refresh de secciones

  // Cargar ticket al montar el componente
  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  // Función para cargar ticket
  const loadTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await ticketsService.getTicket(id);
      setTicket(response.ticket);
    } catch (error) {
      console.error("Error cargando ticket:", error);

      if (error.response?.status === 404) {
        setError("Ticket no encontrado");
      } else if (error.response?.status === 403) {
        setError("No tienes permisos para ver este ticket");
      } else {
        setError("Error cargando el ticket");
      }

      toast.error("Error cargando el ticket");
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar todo el ticket
  const refreshTicket = () => {
    loadTicket();
    setRefreshKey((prev) => prev + 1); // Forzar refresh de secciones
  };

  // Función para actualizar estado del ticket
  const updateTicketStatus = async (newStatus) => {
    if (!ticket || updating) return;

    try {
      setUpdating(true);

      const response = await ticketsService.updateTicketStatus(
        ticket._id,
        newStatus
      );
      setTicket(response.ticket);

      toast.success(`Ticket actualizado a estado: ${newStatus}`);
    } catch (error) {
      console.error("Error actualizando estado:", error);
      toast.error("Error al actualizar el estado del ticket");
    } finally {
      setUpdating(false);
    }
  };

  // Función para tomar ticket (solo agentes)
  const takeTicket = async () => {
    if (!ticket || updating) return;

    try {
      setUpdating(true);

      const response = await ticketsService.assignTicket(ticket._id, user._id);
      setTicket(response.ticket);

      toast.success(`Ticket asignado exitosamente a ${user.name}`);
    } catch (error) {
      console.error("Error tomando ticket:", error);
      toast.error("Error al tomar el ticket");
    } finally {
      setUpdating(false);
    }
  };

  // Obtener acciones disponibles según rol y estado
  const getAvailableActions = () => {
    if (!ticket) return [];

    const actions = [];

    // Acciones para empleados
    if (user.role === "employee" && ticket.createdBy._id === user._id) {
      if (ticket.status === "open" || ticket.status === "pending_user") {
        actions.push({
          label: "Editar",
          action: () => navigate(`/tickets/${ticket._id}/edit`),
          icon: Edit,
          color: "bg-blue-600 hover:bg-blue-700",
        });
      }

      if (ticket.status === "resolved") {
        actions.push({
          label: "Marcar como Cerrado",
          action: () => updateTicketStatus("closed"),
          icon: CheckCircle,
          color: "bg-green-600 hover:bg-green-700",
        });
      }
    }

    // Acciones para agentes
    if (
      user.role === "agent" ||
      user.role === "supervisor" ||
      user.role === "admin"
    ) {
      // Tomar ticket si no está asignado
      if (!ticket.assignedTo && ticket.status === "open") {
        actions.push({
          label: "Tomar Ticket",
          action: takeTicket,
          icon: UserCheck,
          color: "bg-purple-600 hover:bg-purple-700",
        });
      }

      // Cambiar estado si está asignado a mí o soy admin
      if (
        (ticket.assignedTo && ticket.assignedTo._id === user._id) ||
        user.role === "admin"
      ) {
        if (ticket.status === "assigned") {
          actions.push({
            label: "Marcar En Progreso",
            action: () => updateTicketStatus("in_progress"),
            icon: Clock,
            color: "bg-yellow-600 hover:bg-yellow-700",
          });
        }

        if (ticket.status === "in_progress") {
          actions.push({
            label: "Marcar como Resuelto",
            action: () => updateTicketStatus("resolved"),
            icon: CheckCircle,
            color: "bg-green-600 hover:bg-green-700",
          });
        }

        if (ticket.status === "resolved") {
          actions.push({
            label: "Cerrar Ticket",
            action: () => updateTicketStatus("closed"),
            icon: CheckCircle,
            color: "bg-gray-600 hover:bg-gray-700",
          });
        }
      }
    }

    return actions;
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: {
        label: "Abierto",
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
      },
      assigned: {
        label: "Asignado",
        color: "bg-yellow-100 text-yellow-800",
        icon: UserCheck,
      },
      in_progress: {
        label: "En Progreso",
        color: "bg-purple-100 text-purple-800",
        icon: Clock,
      },
      pending_user: {
        label: "Pendiente Usuario",
        color: "bg-orange-100 text-orange-800",
        icon: AlertCircle,
      },
      resolved: {
        label: "Resuelto",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      closed: {
        label: "Cerrado",
        color: "bg-gray-100 text-gray-800",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
    };

    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <IconComponent className="w-4 h-4 mr-1" />
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
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-600">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Error</h3>
          <p>{error}</p>
        </div>
        <div className="space-x-3">
          <button
            onClick={loadTicket}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
          <button
            onClick={() => navigate("/my-tickets")}
            className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
          >
            Volver a Mis Tickets
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Ticket #{ticket._id.slice(-8)}
            </h1>
            <p className="text-sm text-gray-600">{ticket.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refreshTicket}
            disabled={updating}
            className="p-2 text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${updating ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Información principal del ticket */}
      <div className="bg-white rounded-lg shadow">
        {/* Header del ticket */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
            </div>

            {/* Acciones disponibles */}
            {availableActions.length > 0 && (
              <div className="flex space-x-2">
                {availableActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      disabled={updating}
                      className={`inline-flex items-center px-3 py-2 text-sm text-white rounded-md ${action.color} disabled:opacity-50`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Contenido del ticket */}
        <div className="px-6 py-6">
          {/* Título */}
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              {ticket.title}
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Metadatos */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Información del Ticket
              </h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">ID:</span>
                  <span className="ml-2 font-mono text-sm text-gray-900">
                    {ticket._id}
                  </span>
                </div>

                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Categoría:</span>
                  <span className="ml-2 text-sm text-gray-900 capitalize">
                    {ticket.category}
                  </span>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Creado:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Última actualización:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </span>
                </div>

                {ticket.resolvedAt && (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    <span className="text-sm text-gray-600">Resuelto:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(ticket.resolvedAt).toLocaleString()}
                    </span>
                  </div>
                )}

                {ticket.closedAt && (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">Cerrado:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(ticket.closedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Información de personas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Personas Involucradas
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      Creado por
                    </span>
                  </div>
                  <div className="ml-6 text-sm text-gray-600">
                    <p>{ticket.createdBy.name}</p>
                    <p>{ticket.createdBy.email}</p>
                    <p>{ticket.createdBy.department}</p>
                  </div>
                </div>

                {ticket.assignedTo ? (
                  <div className="p-3 rounded-lg bg-blue-50">
                    <div className="flex items-center mb-2">
                      <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Asignado a
                      </span>
                    </div>
                    <div className="ml-6 text-sm text-gray-600">
                      <p>{ticket.assignedTo.name}</p>
                      <p>{ticket.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Sin asignar
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags si existen */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <h3 className="mb-3 text-lg font-medium text-gray-900">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {ticket.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs text-gray-800 bg-gray-100 rounded-full"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NUEVA SECCIÓN: Archivos Adjuntos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="flex items-center text-lg font-medium text-gray-900">
            <Paperclip className="w-5 h-5 mr-2 text-gray-600" />
            Archivos Adjuntos
          </h3>
        </div>
        <div className="p-6">
          <AttachmentsSection
            key={refreshKey} // Forzar refresh cuando cambie
            ticketId={ticket._id}
            ticketStatus={ticket.status}
          />
        </div>
      </div>

      {/* Sistema de comentarios */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Conversación y Actividad
          </h3>
        </div>
        <div className="p-6">
          <CommentsSection
            key={refreshKey} // Forzar refresh cuando cambie
            ticketId={ticket._id}
            ticketStatus={ticket.status}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
