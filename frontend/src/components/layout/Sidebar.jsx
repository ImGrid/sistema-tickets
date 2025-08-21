import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Home,
  Ticket,
  Plus,
  User,
  Users,
  Shield,
  FileText,
  X,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Configuración de menús por rol
  const getMenuItems = (role) => {
    const baseItems = [];

    // Dashboard para todos los roles
    baseItems.push({
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    });

    // Menú específico por rol
    if (role === "employee") {
      baseItems.push(
        {
          name: "Mis Tickets",
          href: "/my-tickets",
          icon: Ticket,
        },
        {
          name: "Crear Ticket",
          href: "/create-ticket",
          icon: Plus,
        }
      );
    } else if (role === "agent") {
      baseItems.push(
        {
          name: "Tickets Asignados",
          href: "/my-assigned-tickets",
          icon: Ticket,
        },
        {
          name: "Todos los Tickets",
          href: "/all-tickets",
          icon: FileText,
        }
      );
    } else if (role === "admin" || role === "supervisor") {
      baseItems.push(
        {
          name: "Gestión de Tickets",
          href: "/manage-tickets",
          icon: FileText,
        },
        {
          name: "Usuarios",
          href: "/users",
          icon: Users,
        },
        {
          name: "Auditoría",
          href: "/audit",
          icon: Shield,
        }
      );
    }

    // Mi perfil para todos
    baseItems.push({
      name: "Mi Perfil",
      href: "/profile",
      icon: User,
    });

    return baseItems;
  };

  const menuItems = getMenuItems(user?.role);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar en mobile */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <span className="text-lg font-semibold text-gray-900">Menú</span>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Información del usuario en sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                <span className="text-sm font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.role === "employee"
                    ? "Empleado"
                    : user?.role === "agent"
                    ? "Agente"
                    : user?.role === "admin"
                    ? "Administrador"
                    : user?.role === "supervisor"
                    ? "Supervisor"
                    : user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose} // Cerrar sidebar en mobile al navegar
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-blue-700" : "text-gray-500"
                    }`}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-center text-gray-500">
              <p>Sistema de Tickets v1.0</p>
              <p>{user?.department}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
