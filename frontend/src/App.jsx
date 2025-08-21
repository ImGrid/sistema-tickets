import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

// Importar páginas públicas
import Login from "./pages/Login";
import Register from "./pages/Register";

// Importar páginas protegidas
import Dashboard from "./pages/Dashboard";
import MyTickets from "./pages/MyTickets";
import CreateTicket from "./pages/CreateTicket";
import AllTickets from "./pages/AllTickets";
import Profile from "./pages/Profile";
import TicketDetail from "./pages/TicketDetail";
import EditTicket from "./pages/EditTicket";

// Páginas de agente
import MyAssignedTickets from "./pages/MyAssignedTickets";

// Páginas de admin
import ManageTickets from "./pages/ManageTickets";
import Users from "./pages/Users";
import Audit from "./pages/Audit";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas protegidas con layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard principal */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Rutas para empleados */}
              <Route
                path="my-tickets"
                element={
                  <ProtectedRoute allowedRoles={["employee"]}>
                    <MyTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create-ticket"
                element={
                  <ProtectedRoute allowedRoles={["employee"]}>
                    <CreateTicket />
                  </ProtectedRoute>
                }
              />

              {/* Rutas para agentes */}
              <Route
                path="my-assigned-tickets"
                element={
                  <ProtectedRoute
                    allowedRoles={["agent", "supervisor", "admin"]}
                  >
                    <MyAssignedTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="all-tickets"
                element={
                  <ProtectedRoute
                    allowedRoles={["agent", "supervisor", "admin"]}
                  >
                    <AllTickets />
                  </ProtectedRoute>
                }
              />

              {/* Rutas para admin/supervisor */}
              <Route
                path="manage-tickets"
                element={
                  <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
                    <ManageTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Audit />
                  </ProtectedRoute>
                }
              />

              {/* RUTAS AGREGADAS - Detalle y edición de tickets */}
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route
                path="tickets/:id/edit"
                element={
                  <ProtectedRoute
                    allowedRoles={["employee", "agent", "supervisor", "admin"]}
                  >
                    <EditTicket />
                  </ProtectedRoute>
                }
              />

              {/* Perfil disponible para todos */}
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
