import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Settings, BarChart3, Users, Shield } from "lucide-react";
import { ticketsService,  } from "../services/api";

const ManageTickets = () => {
  const { user } = useAuth();
  const [totalTickets, setTotalTickets] = useState("--");

  useEffect(() => {
    const fetchTotalTickets = async () => {
      try {
        // Trae todos los tickets (sin paginación) y cuenta el total
        const data = await ticketsService.getTickets({ limit: 1 });
        setTotalTickets(data.total || data.tickets?.length || 0);
      } catch (error) {
        setTotalTickets("--");
      }
    };
    fetchTotalTickets();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Tickets</h1>
        <p className="mt-1 text-sm text-gray-600">
          Panel de administración completa del sistema de tickets
        </p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Sistema</p>
              <p className="text-2xl font-semibold text-gray-900">{totalTickets}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Agentes Activos
              </p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Críticos</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Configuración</p>
              <p className="text-xl font-semibold text-gray-900">OK</p>
            </div>
          </div>
        </div>
      </div>

      {/* Management Tools Preview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Tickets Overview */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Gestión de Tickets
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Tickets Abiertos:</span>
              <span className="font-medium">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Tickets sin Asignar:</span>
              <span className="font-medium text-yellow-600">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>SLA Comprometidos:</span>
              <span className="font-medium text-red-600">-- pendiente</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Salud del Sistema
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Tiempo Promedio Resolución:</span>
              <span className="font-medium">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Satisfacción Usuario:</span>
              <span className="font-medium text-green-600">-- pendiente</span>
            </div>
            <div className="flex justify-between">
              <span>Carga de Trabajo:</span>
              <span className="font-medium">-- pendiente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="py-12 text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Panel de Gestión Administrativa
          </h3>
          <p className="mb-4 text-gray-600">
            Esta página será implementada en la <strong>Fase 4</strong>
          </p>
          <div className="max-w-md p-4 mx-auto border border-purple-200 rounded-lg bg-purple-50">
            <h4 className="mb-2 text-sm font-medium text-purple-900">
              Funcionalidades Planeadas:
            </h4>
            <ul className="space-y-1 text-sm text-left text-purple-800">
              <li>• Dashboard ejecutivo completo</li>
              <li>• Gestión masiva de tickets</li>
              <li>• Reasignación automática</li>
              <li>• Reportes y métricas avanzadas</li>
              <li>• Configuración de SLAs</li>
              <li>• Alertas automáticas</li>
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

export default ManageTickets;
