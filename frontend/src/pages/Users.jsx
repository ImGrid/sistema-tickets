import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Users as UsersIcon, UserPlus, UserCheck, UserX } from "lucide-react";

const Users = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Administrar usuarios y roles del sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Agregar Usuario
          </button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Total Usuarios
              </p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Activos</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactivos</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <UserPlus className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Nuevos (7d)</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Roles Distribution */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Distribución por Rol
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Empleados:</span>
              <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                -- usuarios
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Agentes:</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                -- usuarios
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Supervisores:</span>
              <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                -- usuarios
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Administradores:</span>
              <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                -- usuarios
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Actividad Reciente
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Últimos Logins:</span>
              <span className="font-medium">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Usuarios Más Activos:</span>
              <span className="font-medium">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Cambios de Rol:</span>
              <span className="font-medium">-- pendiente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="py-12 text-center">
          <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Gestión de Usuarios
          </h3>
          <p className="mb-4 text-gray-600">
            Esta página será implementada en la <strong>Fase 7</strong>
          </p>
          <div className="max-w-md p-4 mx-auto border border-orange-200 rounded-lg bg-orange-50">
            <h4 className="mb-2 text-sm font-medium text-orange-900">
              Funcionalidades Planeadas:
            </h4>
            <ul className="space-y-1 text-sm text-left text-orange-800">
              <li>• Lista completa de usuarios</li>
              <li>• Búsqueda y filtros avanzados</li>
              <li>• Gestión de roles y permisos</li>
              <li>• Activar/desactivar usuarios</li>
              <li>• Historial de actividad</li>
              <li>• Importación masiva</li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Usuario actual: <strong>{user?.name}</strong> ({user?.role})
          </p>
        </div>
      </div>
    </div>
  );
};

export default Users;
