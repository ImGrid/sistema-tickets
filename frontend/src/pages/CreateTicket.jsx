import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ticketsService } from "../services/api";
import { Plus, AlertCircle, Save, X } from "lucide-react";

const CreateTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    tags: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { value: "low", label: "Baja", color: "text-gray-600" },
    { value: "medium", label: "Media", color: "text-blue-600" },
    { value: "high", label: "Alta", color: "text-orange-600" },
    { value: "urgent", label: "Urgente", color: "text-red-600" },
  ];

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const validation = ticketsService.validateTicketData(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar antes de enviar
    if (!validateForm()) {
      toast.error("Por favor corrige los errores antes de continuar");
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para envío
      const ticketData = {
        ...formData,
        // Convertir tags de string a array
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      // Crear ticket
      await ticketsService.createTicket(ticketData);

      toast.success("Ticket creado exitosamente");

      // Redirigir a la lista de tickets
      navigate("/my-tickets");

    } catch (error) {
      console.error("Error creando ticket:", error);

      // Manejar errores específicos del backend
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.details) {
        // Errores de validación del backend
        const backendErrors = {};
        error.response.data.details.forEach((detail) => {
          backendErrors[detail.field] = detail.message;
        });
        setErrors(backendErrors);
        toast.error("Por favor corrige los errores marcados");
      } else {
        toast.error("Error al crear el ticket. Intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    navigate("/my-tickets");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Ticket</h1>
        <p className="mt-1 text-sm text-gray-600">
          Reporta un problema o solicita soporte técnico
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Categoría y Prioridad en la misma fila */}
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
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              placeholder="Describe el problema en detalle, incluyendo pasos para reproducirlo si aplica"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Caracteres: {formData.description.length}
            </p>
          </div>

          {/* Tags opcionales */}
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
              Separa los tags con comas para facilitar la búsqueda
            </p>
          </div>

          {/* Información del usuario */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Información del Solicitante
            </h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
              <div>
                <span className="font-medium">Nombre:</span> {user?.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user?.email}
              </div>
              <div>
                <span className="font-medium">Departamento:</span>{" "}
                {user?.department}
              </div>
              <div>
                <span className="font-medium">Rol:</span> {user?.role}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end pt-6 space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="inline w-4 h-4 mr-2" />
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
