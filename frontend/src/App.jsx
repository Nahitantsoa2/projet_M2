import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardFonctionnaire from "./pages/fonctionnaire/Dashboard";
import DashboardChef from "./pages/chef/Dashboard";
import DashboardAdmin from "./pages/admin/Dashboard";

import ChatIA from "./pages/fonctionnaire/ChatIA";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/fonctionnaire"
            element={
              <ProtectedRoute rolesAutorises={["fonctionnaire"]}>
                <DashboardFonctionnaire />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fonctionnaire/chat-ia"
            element={
              <ProtectedRoute rolesAutorises={["fonctionnaire"]}>
                <ChatIA />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chef"
            element={
              <ProtectedRoute rolesAutorises={["chef_service"]}>
                <DashboardChef />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute rolesAutorises={["administrateur"]}>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
