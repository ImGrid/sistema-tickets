import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, Bell, LogOut, User } from "lucide-react";

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo and title */}
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                  <span className="text-sm font-bold text-white">ST</span>
                </div>
              </div>
              <div className="hidden ml-3 sm:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  Sistema de Tickets
                </h1>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100">
              <Bell className="w-5 h-5" />
            </button>

            {/* User menu */}
            <div className="relative flex items-center space-x-3">
              {/* User info */}
              <div className="hidden text-right md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name}
                </div>
                <div className="text-sm text-gray-500">
                  {user?.role === "employee"
                    ? "Empleado"
                    : user?.role === "agent"
                    ? "Agente"
                    : user?.role === "admin"
                    ? "Administrador"
                    : user?.role === "supervisor"
                    ? "Supervisor"
                    : user?.role}
                </div>
              </div>

              {/* Avatar */}
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
                <User className="w-5 h-5 text-gray-600" />
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 rounded-md hover:text-red-600 hover:bg-gray-100"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
