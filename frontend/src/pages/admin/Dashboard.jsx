import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../../components/NotificationBell";
import "../../styles/dashboard.css";

export default function DashboardAdmin() {
  const { utilisateur, logout } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .get("/admin/utilisateurs")
      .then(({ data }) => setUtilisateurs(data))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>
          Bonjour, {utilisateur.prenom}
          <span className="role-badge">Administrateur</span>
        </h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <NotificationBell />
          <button onClick={logout}>Déconnexion</button>
        </div>
      </header>

      <div className="dashboard-content">
        <h2>Tous les utilisateurs</h2>

        {chargement && <p className="dashboard-loading">Chargement...</p>}

        {!chargement && (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Service</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id_utilisateur}>
                    <td>{u.prenom} {u.nom}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-pill ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.service?.nom_service}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
