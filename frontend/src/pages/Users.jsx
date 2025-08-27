import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationsContext";
import { usersService } from "../services/api";
import {
  Users as UsersIcon,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Shield,
  AlertTriangle,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

const Users = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotifications();

  // Estados principales
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados de filtros
  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
    department: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const USERS_PER_PAGE = 15;

  // Estados para modales y acciones
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Estados para el formulario de edición
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    department: "",
    employeeId: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos al montar
  useEffect(() => {
    loadUserStats();
    loadUsers();
  }, []);

  // Recargar usuarios cuando cambien filtros o página
  useEffect(() => {
    if (!loading) {
      loadUsers();
    }
  }, [filters, currentPage]);

  // Manejar clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Función para cargar estadísticas
  const loadUserStats = async () => {
    try {
      const response = await usersService.getUserStats();
      setUserStats(response.stats);
    } catch (error) {
      console.error("Error cargando stats de usuarios:", error);
    }
  };

  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setError("");

      const params = {
        ...filters,
        page: currentPage,
        limit: USERS_PER_PAGE,
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await usersService.getUsers(params);
      setUsers(response.users || []);
      setTotalUsers(response.pagination?.total || response.users?.length || 0);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setError("Error cargando la lista de usuarios");
      setUsers([]);
    } finally {
      setUsersLoading(false);
      setLoading(false);
    }
  };

  // Función para refrescar todos los datos
  const refreshData = async () => {
    setLoading(true);
    setSelectedUsers([]);
    await Promise.all([loadUserStats(), loadUsers()]);
    showSuccess("Datos de usuarios actualizados");
  };

  // Manejar cambio de filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Manejar selección de usuarios
  const handleUserSelect = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  // Seleccionar/deseleccionar todos
  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedUsers(users.map((u) => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Abrir modal de edición
  const openEditModal = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      employeeId: user.employeeId || "",
    });
    setFormErrors({});
    setShowUserModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserFormData({ name: "", email: "", department: "", employeeId: "" });
    setFormErrors({});
  };

  // Manejar actualización de usuario
  const handleUpdateUser = async () => {
    try {
      // Validar datos
      const validation = usersService.validateUserData(userFormData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      setUpdating(true);

      await usersService.updateUser(editingUser._id, userFormData);

      showSuccess(`Usuario ${userFormData.name} actualizado exitosamente`);
      closeModal();
      loadUsers();
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      showError(
        error.response?.data?.error || "Error al actualizar el usuario"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Cambiar rol rápido desde dropdown
  const handleQuickRoleChange = async (targetUser, newRole) => {
    try {
      await usersService.updateUserRole(targetUser._id, newRole);
      showSuccess(`Rol de ${targetUser.name} cambiado a ${newRole}`);
      setOpenDropdown(null);
      loadUsers();
    } catch (error) {
      console.error("Error cambiando rol:", error);
      showError(error.response?.data?.error || "Error al cambiar el rol");
    }
  };

  // Cambiar estado rápido desde dropdown
  const handleQuickStatusChange = async (targetUser, isActive) => {
    try {
      await usersService.updateUserStatus(targetUser._id, isActive);
      showSuccess(
        `Usuario ${targetUser.name} ${isActive ? "activado" : "desactivado"}`
      );
      setOpenDropdown(null);
      loadUsers();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      showError(error.response?.data?.error || "Error al cambiar el estado");
    }
  };

  // Eliminar usuario con confirmación
  const handleQuickDelete = (targetUser) => {
    setConfirmAction({
      type: "delete",
      user: targetUser,
      message: `¿Estás seguro de que quieres desactivar a ${targetUser.name}?`,
    });
    setOpenDropdown(null);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    try {
      await usersService.deleteUser(confirmAction.user._id, false); // Soft delete
      showSuccess(`Usuario ${confirmAction.user.name} desactivado`);
      setConfirmAction(null);
      loadUsers();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      showError(error.response?.data?.error || "Error al eliminar el usuario");
    }
  };

  // Operaciones masivas
  const handleBulkOperation = async (operation, value) => {
    if (selectedUsers.length === 0) {
      showError("Selecciona al menos un usuario");
      return;
    }

    try {
      setUpdating(true);
      let results;

      if (operation === "role") {
        results = await usersService.bulkUpdateRole(selectedUsers, value);
      } else if (operation === "status") {
        results = await usersService.bulkUpdateStatus(
          selectedUsers,
          value === "true"
        );
      }

      // Contar éxitos y errores
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        showSuccess(`${successful} usuarios actualizados correctamente`);
      }
      if (failed > 0) {
        showWarning(`${failed} usuarios no se pudieron actualizar`);
      }

      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      showError("Error en operación masiva");
    } finally {
      setUpdating(false);
    }
  };

  // Obtener badge de rol
  const getRoleBadge = (role) => {
    const config = {
      employee: { label: "Empleado", color: "bg-blue-100 text-blue-800" },
      agent: { label: "Agente", color: "bg-green-100 text-green-800" },
      supervisor: {
        label: "Supervisor",
        color: "bg-yellow-100 text-yellow-800",
      },
      admin: { label: "Admin", color: "bg-red-100 text-red-800" },
    };

    const { label, color } = config[role] || config.employee;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  // Calcular paginación
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  const startItem = (currentPage - 1) * USERS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * USERS_PER_PAGE, totalUsers);

  // Departamentos para filtro
  const departments = [
    "IT",
    "Contabilidad",
    "Ventas",
    "Marketing",
    "Recursos Humanos",
    "Administración",
    "Operaciones",
  ];

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

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Total Usuarios
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {userStats?.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Activos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userStats?.activeUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactivos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userStats?.inactiveUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <div className="flex items-center">
            <UserPlus className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Nuevos (7d)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userStats?.recentUsers || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Filtros de Usuarios
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={filters.search}
              onChange={(e) =>
                handleFiltersChange({ ...filters, search: e.target.value })
              }
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por rol */}
          <select
            value={filters.role}
            onChange={(e) =>
              handleFiltersChange({ ...filters, role: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los roles</option>
            <option value="employee">Empleado</option>
            <option value="agent">Agente</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Administrador</option>
          </select>

          {/* Filtro por estado */}
          <select
            value={filters.isActive}
            onChange={(e) =>
              handleFiltersChange({ ...filters, isActive: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          {/* Filtro por departamento */}
          <select
            value={filters.department}
            onChange={(e) =>
              handleFiltersChange({ ...filters, department: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los departamentos</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Ordenamiento */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-");
              handleFiltersChange({ ...filters, sortBy, sortOrder });
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt-desc">Más recientes</option>
            <option value="createdAt-asc">Más antiguos</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="role-asc">Rol A-Z</option>
          </select>
        </div>

        <div className="flex mt-4 space-x-2">
          <button
            onClick={() => {
              handleFiltersChange({
                role: "",
                isActive: "",
                department: "",
                search: "",
                sortBy: "createdAt",
                sortOrder: "desc",
              });
            }}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Acciones masivas */}
      {selectedUsers.length > 0 && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-900">
              {selectedUsers.length} usuario(s) seleccionado(s)
            </div>
            <div className="flex space-x-2">
              <select
                onChange={(e) => {
                  const [operation, value] = e.target.value.split(":");
                  if (operation && value) {
                    handleBulkOperation(operation, value);
                  }
                }}
                disabled={updating}
                className="px-3 py-1 text-sm border border-blue-300 rounded-md"
              >
                <option value="">Seleccionar acción...</option>
                <optgroup label="Cambiar rol">
                  <option value="role:employee">→ Empleado</option>
                  <option value="role:agent">→ Agente</option>
                  <option value="role:supervisor">→ Supervisor</option>
                </optgroup>
                <optgroup label="Cambiar estado">
                  <option value="status:true">→ Activar</option>
                  <option value="status:false">→ Desactivar</option>
                </optgroup>
              </select>

              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1 text-sm text-blue-600 rounded-md hover:bg-blue-100"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Usuarios ({totalUsers})
            </h2>
            <div className="flex items-center space-x-4">
              {totalUsers > 0 && (
                <span className="text-sm text-gray-500">
                  Mostrando {startItem}-{endItem} de {totalUsers}
                </span>
              )}
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="mr-2"
                />
                Seleccionar todos
              </label>
            </div>
          </div>
        </div>

        {usersLoading && (
          <div className="p-6 text-center">
            <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        )}

        {!usersLoading && users.length === 0 && (
          <div className="p-6 text-center">
            <UsersIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron usuarios
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}

        {!usersLoading && users.length > 0 && (
          <div className="divide-y divide-gray-200">
            {users
              .filter((targetUser) => targetUser._id !== user._id)
              .map((targetUser) => (
                <div key={targetUser._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {/* Checkbox de selección */}
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(targetUser._id)}
                      onChange={(e) =>
                        handleUserSelect(targetUser._id, e.target.checked)
                      }
                      className="rounded"
                    />

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                        <UsersIcon className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>

                    {/* Información del usuario */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1 space-x-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {targetUser.name}
                        </h3>
                        {getRoleBadge(targetUser.role)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            targetUser.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {targetUser.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{targetUser.email}</span>
                        <span>{targetUser.department}</span>
                        {targetUser.employeeId && (
                          <span>ID: {targetUser.employeeId}</span>
                        )}
                        <span>
                          Registrado:{" "}
                          {new Date(targetUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(targetUser)}
                        className="p-2 text-blue-600 rounded-md hover:bg-blue-50"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Menú de más acciones */}
                      <div className="relative dropdown-container">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === targetUser._id
                                ? null
                                : targetUser._id
                            )
                          }
                          className="p-2 text-gray-600 rounded-md hover:bg-gray-50"
                          title="Más acciones"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdown === targetUser._id && (
                          <div className="absolute right-0 z-10 w-48 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                            <div className="py-1">
                              {/* Cambiar rol */}
                              <div className="px-4 py-2 text-xs font-medium text-gray-500">
                                Cambiar rol a:
                              </div>
                              {targetUser.role !== "employee" && (
                                <button
                                  onClick={() =>
                                    handleQuickRoleChange(
                                      targetUser,
                                      "employee"
                                    )
                                  }
                                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  Empleado
                                </button>
                              )}
                              {targetUser.role !== "agent" && (
                                <button
                                  onClick={() =>
                                    handleQuickRoleChange(targetUser, "agent")
                                  }
                                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  Agente
                                </button>
                              )}
                              {targetUser.role !== "supervisor" && (
                                <button
                                  onClick={() =>
                                    handleQuickRoleChange(
                                      targetUser,
                                      "supervisor"
                                    )
                                  }
                                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  Supervisor
                                </button>
                              )}

                              <div className="border-t border-gray-100"></div>

                              {/* Cambiar estado */}
                              <button
                                onClick={() =>
                                  handleQuickStatusChange(
                                    targetUser,
                                    !targetUser.isActive
                                  )
                                }
                                className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                              >
                                {targetUser.isActive ? (
                                  <>Desactivar usuario</>
                                ) : (
                                  <>Activar usuario</>
                                )}
                              </button>

                              <div className="border-t border-gray-100"></div>

                              {/* Eliminar usuario */}
                              <button
                                onClick={() => handleQuickDelete(targetUser)}
                                className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                              >
                                Eliminar usuario
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Paginación */}
        {!usersLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startItem} a {endItem} de {totalUsers} resultados
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

      {/* Modal de edición de usuario */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md m-4 bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Editar Usuario: {editingUser.name}
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, email: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Departamento *
                </label>
                <select
                  value={userFormData.department}
                  onChange={(e) =>
                    setUserFormData({
                      ...userFormData,
                      department: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.department ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Seleccionar departamento</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {formErrors.department && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.department}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  ID Empleado
                </label>
                <input
                  type="text"
                  value={userFormData.employeeId}
                  onChange={(e) =>
                    setUserFormData({
                      ...userFormData,
                      employeeId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 space-x-2 border-t">
              <button
                onClick={closeModal}
                disabled={updating}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={updating}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
