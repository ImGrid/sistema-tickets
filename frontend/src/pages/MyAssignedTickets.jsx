import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserCheck, AlertCircle, CheckCircle, Clock } from "lucide-react";

const MyAssignedTickets = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Mis Tickets Asignados
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Tickets que tienes asignados para resolver como agente
        </p>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Asignados</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En Progreso</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Urgentes</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resueltos</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="py-12 text-center">
          <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Mis Tickets Asignados
          </h3>
          <p className="mb-4 text-gray-600">
            Esta página será implementada en la <strong>Fase 4</strong>
          </p>
          <div className="max-w-md p-4 mx-auto border border-green-200 rounded-lg bg-green-50">
            <h4 className="mb-2 text-sm font-medium text-green-900">
              Funcionalidades Planeadas:
            </h4>
            <ul className="space-y-1 text-sm text-left text-green-800">
              <li>• Lista de tickets asignados a mí</li>
              <li>• Cambio rápido de estado</li>
              <li>• Priorización automática</li>
              <li>• Tiempo de resolución SLA</li>
              <li>• Comentarios y actualizaciones</li>
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

export default MyAssignedTickets;
