import React, { useState } from "react";
import { AlertTriangle, X, UserX } from "lucide-react";

const UserDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading = false,
}) => {
  const [deleteType, setDeleteType] = useState("soft"); // 'soft' o 'permanent'

  if (!isOpen || !user) return null;

  const handleConfirm = () => {
    onConfirm(deleteType === "permanent");
  };

  // Manejar tecla Escape
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && !isLoading) {
      onClose();
    }
  };

  // Manejar clic en el backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      tabIndex={-1}
    >
      <div className="w-full max-w-lg m-4 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-50">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Eliminar Usuario
              </h3>
            </div>
            {!isLoading && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 rounded-md hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Información del usuario */}
          <div className="p-3 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                <UserX className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Opciones de eliminación */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              ¿Cómo quieres eliminar este usuario?
            </p>

            {/* Soft Delete Option */}
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="deleteType"
                value="soft"
                checked={deleteType === "soft"}
                onChange={(e) => setDeleteType(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-900">Desactivar</span>
                <p className="text-sm text-gray-600">
                  Se puede reactivar después. Mantiene historial.
                </p>
              </div>
            </label>

            {/* Permanent Delete Option */}
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="deleteType"
                value="permanent"
                checked={deleteType === "permanent"}
                onChange={(e) => setDeleteType(e.target.value)}
                className="text-red-600 focus:ring-red-500"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-900">
                  Eliminar definitivamente
                </span>
                <p className="text-sm text-gray-600">
                  Eliminación completa. No se puede deshacer.
                </p>
              </div>
            </label>
          </div>

          {/* Advertencia simple para eliminación permanente */}
          {deleteType === "permanent" && (
            <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <p className="text-sm text-yellow-800">
                Solo disponible si el usuario no tiene tickets activos
                asignados.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end px-6 py-4 space-x-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              deleteType === "permanent"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                Procesando...
              </span>
            ) : (
              <>Desactivar Usuario</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteModal;
