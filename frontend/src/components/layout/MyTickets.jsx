import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ticketsService } from "../services/api";
import { Plus, Ticket, Clock, CheckCircle } from "lucide-react";

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar mis tickets
  useEffect(() => {
    const loadMyTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketsService.getTickets();
        setTickets(response.tickets || []);
      } catch (error) {
        console.error("Error cargando tickets:", error);
        setError("Error cargando los tickets");
      } finally {
        setLoading(false);
      }
    };

    loadMyTickets();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Cargando mis tickets...</p>
        </div>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Ticket className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.length}
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
                {
                  tickets.filter((t) =>
                    [
                      "open",
                      "assigned",
                      "in_progress",
                      "pending_user",
                    ].includes(t.status)
                  ).length
                }
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
                {
                  tickets.filter((t) =>
                    ["resolved", "closed"].includes(t.status)
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de tickets */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Todos mis tickets ({tickets.length})
          </h2>
        </div>

        {error && (
          <div className="p-4 border-l-4 border-red-400 bg-red-50">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="p-6 text-center">
            <Ticket className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No tienes tickets
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Crea tu primer ticket para comenzar.
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
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {ticket.title}
                      </h3>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      {ticket.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span>Categoría: {ticket.category}</span>
                      <span>
                        Creado:{" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      {ticket.assignedTo && (
                        <span>Asignado a: {ticket.assignedTo.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => {
                        // TODO: Navegar a detalle del ticket
                        console.log("Ver ticket:", ticket._id);
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Ver detalle
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

export default MyTickets;
