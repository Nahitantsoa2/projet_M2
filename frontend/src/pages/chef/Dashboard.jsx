import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../../components/NotificationBell";
import "../../styles/dashboard.css";

export default function DashboardChef() {
  const { utilisateur, logout } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .get("/chef/demandes")
      .then(({ data }) => setDemandes(data))
      .finally(() => setChargement(false));
  }, []);

  async function traiter(id, statut) {
    await api.patch(`/chef/demandes/${id}/traiter`, { statut });
    setDemandes((prev) => prev.filter((d) => d.id_demande !== id));
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>
          Bonjour, {utilisateur.prenom}
          <span className="role-badge">Chef de service</span>
        </h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <NotificationBell />
          <button onClick={logout}>Déconnexion</button>
        </div>
      </header>

      <div className="dashboard-content">
        <h2>Demandes à traiter</h2>

        {chargement && <p className="dashboard-loading">Chargement...</p>}

        {!chargement && demandes.length === 0 && (
          <div className="dashboard-empty">Aucune demande en attente.</div>
        )}

        <ul className="card-list">
          {demandes.map((d) => (
            <li key={d.id_demande} className="card-item">
              <div>
                <div className="card-title">
                  {d.fonctionnaire?.prenom} {d.fonctionnaire?.nom}
                </div>
                <div className="card-subtitle">{d.type_demarche?.libelle}</div>
              </div>
              <div className="card-actions">
                <button
                  className="btn btn-valider"
                  onClick={() => traiter(d.id_demande, "validee")}
                >
                  Valider
                </button>
                <button
                  className="btn btn-rejeter"
                  onClick={() => traiter(d.id_demande, "rejetee")}
                >
                  Rejeter
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
