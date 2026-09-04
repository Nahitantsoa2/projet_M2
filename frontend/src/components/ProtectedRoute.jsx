import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// rolesAutorises = tableau de rôles, ex: ["chef_service"]
// Si omis, seule la connexion est requise (peu importe le rôle)
export default function ProtectedRoute({ children, rolesAutorises }) {
  const { utilisateur } = useAuth();

  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  if (rolesAutorises && !rolesAutorises.includes(utilisateur.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
