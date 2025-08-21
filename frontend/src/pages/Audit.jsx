import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Eye, AlertTriangle, Activity } from "lucide-react";

const Audit = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Auditoría y Seguridad
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Logs de auditoría y monitoreo de seguridad del sistema
        </p>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Estado Sistema
              </p>
              <p className="text-lg font-semibold text-green-600">Seguro</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Logs (24h)</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Alertas</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Actividad</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Recent Security Events */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Eventos de Seguridad
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Intentos de Login:</span>
              <span className="font-medium">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Accesos Exitosos:</span>
              <span className="font-medium text-green-600">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Accesos Fallidos:</span>
              <span className="font-medium text-red-600">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>IPs Bloqueadas:</span>
              <span className="font-medium text-orange-600">-- pendiente</span>
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Actividad del Sistema
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Tickets Creados (24h):</span>
              <span className="font-medium">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Comentarios (24h):</span>
              <span className="font-medium">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Archivos Subidos (24h):</span>
              <span className="font-medium">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Cambios de Estado:</span>
              <span className="font-medium">-- pendiente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Controls */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Controles de Auditoría
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button className="p-4 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50">
            <Eye className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Ver Logs Detallados
            </span>
          </button>
          <button className="p-4 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50">
            <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Reporte de Seguridad
            </span>
          </button>
          <button className="p-4 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-500 hover:bg-purple-50">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Exportar Auditoría
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="py-12 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Sistema de Auditoría
          </h3>
          <p className="mb-4 text-gray-600">
            Esta página será implementada en la <strong>Fase 7</strong>
          </p>
          <div className="max-w-md p-4 mx-auto border border-red-200 rounded-lg bg-red-50">
            <h4 className="mb-2 text-sm font-medium text-red-900">
              Funcionalidades Planeadas:
            </h4>
            <ul className="space-y-1 text-sm text-left text-red-800">
              <li>• Logs detallados de todas las acciones</li>
              <li>• Monitoreo de seguridad en tiempo real</li>
              <li>• Reportes de auditoría automatizados</li>
              <li>• Alertas de actividad sospechosa</li>
              <li>• Exportación de logs</li>
              <li>• Dashboard de métricas de seguridad</li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Usuario actual: <strong>{user?.name}</strong> ({user?.role})
            <br />
            <span className="text-xs">
              Solo administradores pueden acceder a auditoría
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Audit;
