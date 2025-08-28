import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import ChangePassword from "../components/user/ChangePassword";
import {
  User,
  Mail,
  Briefcase,
  Shield,
  Edit,
  Save,
  X,
  Lock,
} from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
    });
  };

  const handleSave = async () => {
    // Validaciones básicas
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("El email es obligatorio");
      return;
    }

    if (!formData.department) {
      toast.error("El departamento es obligatorio");
      return;
    }

    setIsUpdating(true);

    try {
      // TODO: Implementar actualización de perfil en el backend
      // Por ahora simulamos la actualización
      console.log("Actualizando perfil:", formData);

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualizar usuario en el contexto
      const updatedUser = {
        ...user,
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department,
      };

      updateUser(updatedUser);
      setIsEditing(false);
      toast.success("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      employee: { label: "Empleado", color: "bg-blue-100 text-blue-800" },
      agent: { label: "Agente", color: "bg-green-100 text-green-800" },
      supervisor: {
        label: "Supervisor",
        color: "bg-yellow-100 text-yellow-800",
      },
      admin: { label: "Administrador", color: "bg-red-100 text-red-800" },
    };

    const config = roleConfig[role] || {
      label: role,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <Shield className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const departmentOptions = [
    "IT",
    "Contabilidad",
    "Ventas",
    "Marketing",
    "Recursos Humanos",
    "Administración",
    "Operaciones",
    "Otro",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona tu información personal y configuración
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        {/* Header Section */}
        <div className="px-6 py-8 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full">
              <User className="w-10 h-10 text-gray-600" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <div className="mt-2">{getRoleBadge(user?.role)}</div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="px-6 py-6">
          <h3 className="mb-6 text-lg font-medium text-gray-900">
            Información Personal
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Nombre */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <User className="inline w-4 h-4 mr-1" />
                Nombre Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu nombre completo"
                />
              ) : (
                <p className="px-3 py-2 text-sm text-gray-900 rounded-md bg-gray-50">
                  {user?.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Corporativo
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@empresa.com"
                />
              ) : (
                <p className="px-3 py-2 text-sm text-gray-900 rounded-md bg-gray-50">
                  {user?.email}
                </p>
              )}
            </div>

            {/* Departamento */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <Briefcase className="inline w-4 h-4 mr-1" />
                Departamento
              </label>
              {isEditing ? (
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="px-3 py-2 text-sm text-gray-900 rounded-md bg-gray-50">
                  {user?.department}
                </p>
              )}
            </div>

            {/* Rol (Solo lectura) */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <Shield className="inline w-4 h-4 mr-1" />
                Rol en el Sistema
              </label>
              <p className="px-3 py-2 text-sm text-gray-900 rounded-md bg-gray-50">
                {user?.role === "employee"
                  ? "Empleado"
                  : user?.role === "agent"
                  ? "Agente de Soporte"
                  : user?.role === "supervisor"
                  ? "Supervisor"
                  : user?.role === "admin"
                  ? "Administrador"
                  : user?.role}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                El rol solo puede ser cambiado por un administrador
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Configuración de Cuenta
        </h3>

        <div className="space-y-4">
          {/* Cambiar Contraseña */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="flex items-center font-medium text-gray-900">
                <Lock className="w-4 h-4 mr-2 text-gray-600" />
                Cambiar Contraseña
              </h4>
              <p className="text-sm text-gray-600">
                Actualiza tu contraseña de acceso al sistema
              </p>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 text-blue-600 transition-colors border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Cambiar
            </button>
          </div>
        </div>
      </div>
      {/* Modal de cambio de contraseña */}
      {showChangePassword && (
        <ChangePassword onCancel={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

export default Profile;
