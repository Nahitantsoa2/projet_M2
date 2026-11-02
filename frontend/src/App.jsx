import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

import { ThemeProvider } from "./context/ThemeProvider";

// Chargement différé : chaque page n'est téléchargée qu'à la première visite
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const DashboardFonctionnaire = lazy(() => import("./pages/fonctionnaire/Dashboard"));
const DashboardChef = lazy(() => import("./pages/chef/Dashboard"));
const DashboardAdmin = lazy(() => import("./pages/admin/Dashboard"));
const Statistiques = lazy(() => import("./pages/admin/Statistiques"));
const ReclamationsAdmin = lazy(() => import("./pages/admin/Reclamations"));
const ImportSuivi = lazy(() => import("./pages/admin/ImportSuivi"));
const ChatIA = lazy(() => import("./pages/fonctionnaire/ChatIA"));
const ReclamationsFonctionnaire = lazy(() => import("./pages/fonctionnaire/Reclamations"));
const SuiviDossiers = lazy(() => import("./pages/fonctionnaire/Suivi"));
const NouvelleDemande = lazy(() => import("./pages/fonctionnaire/NouvelleDemande"));
const Informations = lazy(() => import("./pages/fonctionnaire/Informations"));
const AdminInformations = lazy(() => import("./pages/admin/Informations"));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Chargement...</p>
                </div>
              </div>
            }
          >
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
            path="/fonctionnaire/reclamations"
            element={
              <ProtectedRoute rolesAutorises={["fonctionnaire"]}>
                <ReclamationsFonctionnaire />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fonctionnaire/suivi"
            element={
              <ProtectedRoute rolesAutorises={["fonctionnaire"]}>
                <SuiviDossiers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fonctionnaire/nouvelle-demande"
            element={
              <ProtectedRoute rolesAutorises={["fonctionnaire"]}>
                <NouvelleDemande />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fonctionnaire/informations"
            element={
              <ProtectedRoute rolesAutorises={["fonctionnaire"]}>
                <Informations />
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

          <Route
            path="/admin/statistiques"
            element={
              <ProtectedRoute rolesAutorises={["administrateur"]}>
                <Statistiques />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reclamations"
            element={
              <ProtectedRoute rolesAutorises={["administrateur"]}>
                <ReclamationsAdmin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/import-suivi"
            element={
              <ProtectedRoute rolesAutorises={["administrateur"]}>
                <ImportSuivi />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/informations"
            element={
              <ProtectedRoute rolesAutorises={["administrateur"]}>
                <AdminInformations />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
