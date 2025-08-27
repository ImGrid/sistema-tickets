import React, { useState, useEffect } from "react";
import { useNotifications } from "../contexts/NotificationsContext";
import { auditService } from "../services/api";
import {
  Shield,
  Eye,
  AlertTriangle,
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Audit = () => {
  const { showSuccess, showError } = useNotifications();

  // Estados principales
  const [securityStats, setSecurityStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const LOGS_PER_PAGE = 20;

  // Estados de filtros
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    resource: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  // Estado para exportación
  const [exporting, setExporting] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    loadSecurityStats();
    loadAuditLogs();
  }, []);

  // Recargar logs cuando cambien filtros o página
  useEffect(() => {
    if (!loading) {
      loadAuditLogs();
    }
  }, [filters, currentPage]);

  // Función para cargar estadísticas de seguridad
  const loadSecurityStats = async () => {
    try {
      const response = await auditService.getSecurityStats();
      setSecurityStats(response.stats);
    } catch (error) {
      console.error("Error cargando security stats:", error);
      setError("Error cargando estadísticas de seguridad");
    }
  };

  // Función para cargar logs de auditoría
  const loadAuditLogs = async () => {
    try {
      setLogsLoading(true);
      setError("");

      const params = {
        ...filters,
        page: currentPage,
        limit: LOGS_PER_PAGE,
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await auditService.getAuditLogs(params);
      setAuditLogs(response.logs || []);
      setTotalLogs(response.pagination?.total || response.logs?.length || 0);
    } catch (error) {
      console.error("Error cargando audit logs:", error);
      setError("Error cargando logs de auditoría");
      setAuditLogs([]);
    } finally {
      setLogsLoading(false);
      setLoading(false);
    }
  };

  // Función para refrescar todos los datos
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([loadSecurityStats(), loadAuditLogs()]);
    showSuccess("Datos de auditoría actualizados");
  };

  // Manejar cambio de filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset página al cambiar filtros
  };

  // Manejar exportación de logs
  const handleExportLogs = async () => {
    try {
      setExporting(true);

      const exportParams = {
        ...filters,
        format: "csv",
      };

      const response = await auditService.exportLogs(exportParams);

      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `audit_logs_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showSuccess("Logs exportados exitosamente");
    } catch (error) {
      console.error("Error exportando logs:", error);
      showError("Error al exportar los logs");
    } finally {
      setExporting(false);
    }
  };

  // Obtener icono según tipo de acción
  const getActionIcon = (action) => {
    if (action.includes("LOGIN")) return User;
    if (action.includes("TICKET")) return FileText;
    if (action.includes("USER")) return User;
    if (action.includes("COMMENT")) return Eye;
    return Activity;
  };

  // Obtener color según tipo de acción
  const getActionColor = (action) => {
    if (action.includes("FAILED") || action.includes("ERROR"))
      return "text-red-600";
    if (action.includes("LOGIN")) return "text-blue-600";
    if (action.includes("CREATE")) return "text-green-600";
    if (action.includes("UPDATE")) return "text-yellow-600";
    if (action.includes("DELETE")) return "text-red-600";
    return "text-gray-600";
  };

  // Calcular paginación
  const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);
  const startItem = (currentPage - 1) * LOGS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * LOGS_PER_PAGE, totalLogs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Auditoría y Seguridad
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Logs de auditoría y monitoreo de seguridad del sistema
          </p>
        </div>
        <div className="flex mt-4 space-x-2 sm:mt-0">
          <button
            onClick={handleExportLogs}
            disabled={exporting || auditLogs.length === 0}
            className="inline-flex items-center px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Download
              className={`w-4 h-4 mr-2 ${exporting ? "animate-pulse" : ""}`}
            />
            {exporting ? "Exportando..." : "Exportar"}
          </button>
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

      {/* Estadísticas de seguridad */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Logs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {securityStats?.totalLogs || "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Logs (7d)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {securityStats?.recentLogs || "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Intentos Login
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {securityStats?.loginAttempts || "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Errores</p>
              <p className="text-2xl font-semibold text-gray-900">
                {securityStats?.failedActions || "--"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Actions */}
      {securityStats?.topActions && securityStats.topActions.length > 0 && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Top Acciones (7 días)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {securityStats.topActions.slice(0, 8).map((action, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <span className="text-sm text-gray-900">{action._id}</span>
                <span className="text-sm font-medium text-blue-600">
                  {action.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros de búsqueda */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Filtros de Auditoría
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Búsqueda general */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) =>
                handleFiltersChange({ ...filters, search: e.target.value })
              }
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por acción */}
          <select
            value={filters.action}
            onChange={(e) =>
              handleFiltersChange({ ...filters, action: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las acciones</option>
            <option value="USER_LOGIN">Login</option>
            <option value="USER_LOGIN_FAILED">Login Fallido</option>
            <option value="TICKET_CREATED">Ticket Creado</option>
            <option value="TICKET_UPDATED">Ticket Actualizado</option>
            <option value="USER_CREATED">Usuario Creado</option>
          </select>

          {/* Filtro por recurso */}
          <select
            value={filters.resource}
            onChange={(e) =>
              handleFiltersChange({ ...filters, resource: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los recursos</option>
            <option value="user">Usuario</option>
            <option value="ticket">Ticket</option>
            <option value="comment">Comentario</option>
            <option value="attachment">Archivo</option>
            <option value="system">Sistema</option>
          </select>

          {/* Fecha inicio */}
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              handleFiltersChange({ ...filters, startDate: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Fecha fin */}
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              handleFiltersChange({ ...filters, endDate: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex mt-4 space-x-2">
          <button
            onClick={() => {
              handleFiltersChange({
                userId: "",
                action: "",
                resource: "",
                startDate: "",
                endDate: "",
                search: "",
              });
            }}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Logs de auditoría */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Logs de Auditoría ({totalLogs})
            </h2>
            {totalLogs > 0 && (
              <span className="text-sm text-gray-500">
                Mostrando {startItem}-{endItem} de {totalLogs}
              </span>
            )}
          </div>
        </div>

        {logsLoading && (
          <div className="p-6 text-center">
            <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Cargando logs...</p>
          </div>
        )}

        {!logsLoading && auditLogs.length === 0 && (
          <div className="p-6 text-center">
            <Eye className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron logs
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}

        {!logsLoading && auditLogs.length > 0 && (
          <div className="divide-y divide-gray-200">
            {auditLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              const actionColor = getActionColor(log.action);

              return (
                <div key={log._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 ${actionColor}`}>
                      <ActionIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {log.action}
                        </h3>
                        <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
                          {log.resource}
                        </span>
                      </div>

                      <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {log.userId?.name || "Sistema"}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="p-2 mt-2 text-xs text-gray-600 rounded bg-gray-50">
                          <strong>Detalles:</strong>{" "}
                          {JSON.stringify(log.details, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {!logsLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startItem} a {endItem} de {totalLogs} resultados
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
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
                        onClick={() => setCurrentPage(pageNum)}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
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

export default Audit;
