import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ticketsService } from "../services/api";
import { ArrowLeft, Save, X, AlertCircle } from "lucide-react";

const EditTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    tags: "",
  });

  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // Opciones de categorías
  const categories = [
    { value: "hardware", label: "Hardware" },
    { value: "software", label: "Software" },
    { value: "network", label: "Red/Conectividad" },
    { value: "access", label: "Accesos/Permisos" },
    { value: "other", label: "Otro" },
  ];

  // Opciones de prioridad
  const priorities = [
    { value: "low", label: "Baja" },
    { value: "medium", label: "Media" },
    { value: "high", label: "Alta" },
    { value: "urgent", label: "Urgente" },
  ];

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

      const response = await ticketsService.getTicket(id);
      const ticketData = response.ticket;

      setTicket(ticketData);

      // Preparar datos del formulario
      const formDataToSet = {
        title: ticketData.title || "",
        description: ticketData.description || "",
        category: ticketData.category || "",
        priority: ticketData.priority || "",
        tags: ticketData.tags ? ticketData.tags.join(", ") : "",
      };

      setFormData(formDataToSet);
      setOriginalData(formDataToSet);
    } catch (error) {
      console.error("Error cargando ticket:", error);

      if (error.response?.status === 404) {
        setSubmitError("Ticket no encontrado");
      } else if (error.response?.status === 403) {
        setSubmitError("No tienes permisos para editar este ticket");
      } else {
        setSubmitError("Error cargando el ticket");
      }

      toast.error("Error cargando el ticket");
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario puede editar el ticket
  const canEdit = () => {
    if (!ticket) return false;

    // Empleados solo pueden editar sus propios tickets en estado abierto o pendiente
    if (user.role === "employee") {
      return (
        ticket.createdBy._id === user._id &&
        (ticket.status === "open" || ticket.status === "pending_user")
      );
    }

    // Agentes y superiores pueden editar tickets asignados a ellos
    if (user.role === "agent") {
      return ticket.assignedTo && ticket.assignedTo._id === user._id;
    }

    // Admin y supervisor pueden editar cualquier ticket
    return user.role === "admin" || user.role === "supervisor";
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error específico
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (submitError) setSubmitError("");
  };

  // Validar formulario
  const validateForm = () => {
    const validation = ticketsService.validateTicketData(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  // Verificar si hay cambios
  const hasChanges = () => {
    if (!originalData) return false;

    return Object.keys(formData).some(
      (key) => formData[key] !== originalData[key]
    );
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit()) {
      setSubmitError("No tienes permisos para editar este ticket");
      return;
    }

    if (!hasChanges()) {
      setSubmitError("No hay cambios para guardar");
      return;
    }

    // Validar antes de enviar
    if (!validateForm()) {
      setSubmitError("Por favor corrige los errores antes de continuar");
      return;
    }

    setSaving(true);
    setSubmitError("");

    try {
      // Preparar datos para envío
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      // Actualizar ticket
      const response = await ticketsService.updateTicket(
        ticket._id,
        updateData
      );

      // Mostrar mensaje de éxito con toast
      toast.success("Ticket actualizado exitosamente");

      // Navegar de vuelta al detalle del ticket
      navigate(`/tickets/${ticket._id}`);
    } catch (error) {
      console.error("Error actualizando ticket:", error);

      if (error.response?.data?.error) {
        setSubmitError(error.response.data.error);
        toast.error(error.response.data.error);
      } else if (error.response?.data?.details) {
        // Errores de validación del backend
        const backendErrors = {};
        error.response.data.details.forEach((detail) => {
          backendErrors[detail.field] = detail.message;
        });
        setErrors(backendErrors);
        setSubmitError("Por favor corrige los errores marcados");
        toast.error("Por favor corrige los errores marcados");
      } else {
        setSubmitError("Error al actualizar el ticket. Intenta de nuevo.");
        toast.error("Error al actualizar el ticket. Intenta de nuevo.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    if (hasChanges()) {
      if (
        confirm(
          "¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados."
        )
      ) {
        navigate(`/tickets/${id}`);
      }
    } else {
      navigate(`/tickets/${id}`);
    }
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
  if (submitError && !ticket) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-600">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Error</h3>
          <p>{submitError}</p>
        </div>
        <button
          onClick={() => navigate("/my-tickets")}
          className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
        >
          Volver a Mis Tickets
        </button>
      </div>
    );
  }

  if (!ticket || !canEdit()) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-600">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Sin permisos</h3>
          <p>No tienes permisos para editar este ticket</p>
        </div>
        <button
          onClick={() => navigate(`/tickets/${id}`)}
          className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
        >
          Ver Ticket
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/tickets/${id}`)}
          className="p-2 text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Ticket #{ticket._id.slice(-8)}
          </h1>
          <p className="text-sm text-gray-600">
            Modifica la información del ticket
          </p>
        </div>
      </div>

      {/* Información del ticket */}
      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center space-x-4 text-sm">
          <span className="font-medium">Estado actual:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              ticket.status === "open"
                ? "bg-blue-100 text-blue-800"
                : ticket.status === "assigned"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {ticket.status}
          </span>
          <span className="font-medium">Creado:</span>
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {submitError && (
            <div className="p-4 border-l-4 border-red-400 bg-red-50">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Título */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Título del Ticket *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              placeholder="Describe brevemente el problema"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Categoría y Prioridad */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Categoría */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Categoría *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Prioridad */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700"
              >
                Prioridad
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción Detallada *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              placeholder="Describe el problema en detalle"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Caracteres: {formData.description.length}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700"
            >
              Tags (Opcional)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Separar con comas: impresora, oficina, problema recurrente"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separa los tags con comas
            </p>
          </div>

          {/* Indicador de cambios */}
          {hasChanges() && (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <p className="text-sm text-yellow-800">
                Tienes cambios sin guardar
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end pt-6 space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="inline w-4 h-4 mr-2" />
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || !hasChanges()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicket;
