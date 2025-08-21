import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";

const NotificationsContext = createContext();

// Hook para usar las notificaciones
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications debe ser usado dentro de NotificationsProvider"
    );
  }
  return context;
};

// Componente individual de notificación
const NotificationItem = ({ notification, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconColors = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  const IconComponent = icons[notification.type];

  return (
    <div
      className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border ${
        colors[notification.type]
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent
              className={`h-6 w-6 ${iconColors[notification.type]}`}
            />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {notification.title && (
              <p className="text-sm font-medium">{notification.title}</p>
            )}
            <p className={`text-sm ${notification.title ? "mt-1" : ""}`}>
              {notification.message}
            </p>
          </div>
          <div className="flex flex-shrink-0 ml-4">
            <button
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => onRemove(notification.id)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Container de notificaciones
const NotificationsContainer = ({ notifications, removeNotification }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end">
      <div className="flex flex-col items-center w-full space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="transition-all duration-300 ease-in-out transform"
            style={{
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            <NotificationItem
              notification={notification}
              onRemove={removeNotification}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Provider principal
export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Función para agregar notificación
  const addNotification = useCallback(
    ({
      type = "info",
      title,
      message,
      duration = 5000,
      persistent = false,
    }) => {
      const id = Date.now() + Math.random();
      const notification = {
        id,
        type,
        title,
        message,
        timestamp: new Date(),
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto-remover después del duration (si no es persistent)
      if (!persistent && duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    []
  );

  // Función para remover notificación
  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  // Función para limpiar todas las notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Funciones de conveniencia
  const showSuccess = useCallback(
    (message, title = null, options = {}) => {
      return addNotification({
        type: "success",
        title,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const showError = useCallback(
    (message, title = null, options = {}) => {
      return addNotification({
        type: "error",
        title,
        message,
        duration: 7000, // Errores duran más tiempo
        ...options,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message, title = null, options = {}) => {
      return addNotification({
        type: "warning",
        title,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message, title = null, options = {}) => {
      return addNotification({
        type: "info",
        title,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationsContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
