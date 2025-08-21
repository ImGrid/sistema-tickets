import React, { useState } from "react";
import { Search, Filter, X, RefreshCw } from "lucide-react";

const TicketFilters = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  loading = false,
  showUserFilter = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [isExpanded, setIsExpanded] = useState(false);

  // Opciones de filtros
  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "open", label: "Abierto" },
    { value: "assigned", label: "Asignado" },
    { value: "in_progress", label: "En Progreso" },
    { value: "pending_user", label: "Pendiente Usuario" },
    { value: "resolved", label: "Resuelto" },
    { value: "closed", label: "Cerrado" },
  ];

  const categoryOptions = [
    { value: "", label: "Todas las categorías" },
    { value: "hardware", label: "Hardware" },
    { value: "software", label: "Software" },
    { value: "network", label: "Red/Conectividad" },
    { value: "access", label: "Accesos/Permisos" },
    { value: "other", label: "Otro" },
  ];

  const priorityOptions = [
    { value: "", label: "Todas las prioridades" },
    { value: "low", label: "Baja" },
    { value: "medium", label: "Media" },
    { value: "high", label: "Alta" },
    { value: "urgent", label: "Urgente" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Fecha de Creación" },
    { value: "updatedAt", label: "Última Actualización" },
    { value: "priority", label: "Prioridad" },
    { value: "status", label: "Estado" },
    { value: "title", label: "Título" },
  ];

  const sortOrderOptions = [
    { value: "desc", label: "Descendente" },
    { value: "asc", label: "Ascendente" },
  ];

  // Manejar cambio de filtros
  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };
    onFiltersChange(newFilters);
  };

  // Manejar búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  // Manejar reset
  const handleReset = () => {
    setSearchTerm("");
    onReset();
  };

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && value !== "" && value !== "desc"
  ).length;

  return (
    <div className="p-4 space-y-4 bg-white border rounded-lg">
      {/* Búsqueda */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, descripción o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Toggle filtros avanzados */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <Filter className="w-4 h-4 mr-1" />
          Filtros Avanzados
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleReset}
            className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200 md:grid-cols-2 lg:grid-cols-3">
          {/* Estado */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              value={filters.category || ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Prioridad
            </label>
            <select
              value={filters.priority || ""}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Ordenar por
            </label>
            <select
              value={filters.sortBy || "createdAt"}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Orden */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Orden
            </label>
            <select
              value={filters.sortOrder || "desc"}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOrderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de usuario (solo para agentes/admin) */}
          {showUserFilter && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Asignado a
              </label>
              <select
                value={filters.assignedTo || ""}
                onChange={(e) =>
                  handleFilterChange("assignedTo", e.target.value)
                }
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="me">Asignados a mí</option>
                <option value="unassigned">Sin asignar</option>
                {/* TODO: Agregar lista de agentes dinámicamente */}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Resumen de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === "" || value === "desc") return null;

              // Obtener label legible
              let label = key;
              let displayValue = value;

              if (key === "status") {
                const option = statusOptions.find((opt) => opt.value === value);
                label = "Estado";
                displayValue = option?.label || value;
              } else if (key === "category") {
                const option = categoryOptions.find(
                  (opt) => opt.value === value
                );
                label = "Categoría";
                displayValue = option?.label || value;
              } else if (key === "priority") {
                const option = priorityOptions.find(
                  (opt) => opt.value === value
                );
                label = "Prioridad";
                displayValue = option?.label || value;
              } else if (key === "search") {
                label = "Búsqueda";
                displayValue = `"${value}"`;
              } else if (key === "sortBy") {
                const option = sortOptions.find((opt) => opt.value === value);
                label = "Ordenar";
                displayValue = option?.label || value;
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full"
                >
                  {label}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, "")}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketFilters;
