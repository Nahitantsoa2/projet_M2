import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bot, FileText, CheckCircle, Clock, XCircle, Eye, X, Filter, Search, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import NotificationBell from "../../components/NotificationBell";
import NouvelleDemandeIA from "./NouvelleDemandeIA";
import NouvelleDemandeManuelle from "./NouvelleDemandeManuelle";
import "../../styles/dashboard.css";

export default function DashboardFonctionnaire() {
  const { utilisateur, logout } = useAuth();
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [mode, setMode] = useState("ia"); // "ia" | "manuel"
  const [demandeSelectionnee, setDemandeSelectionnee] = useState(null);

  // Filtrage et Tri
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreType, setFiltreType] = useState("");
  const [triDate, setTriDate] = useState("recent"); // "recent" | "ancien"
  const [recherche, setRecherche] = useState("");

  // Pagination
  const [pageCourante, setPageCourante] = useState(1);
  const elementsParPage = 5;

  useEffect(() => {
    chargerDemandes();
  }, []);

  function chargerDemandes() {
    setChargement(true);
    api
      .get("/demandes/mes-demandes")
      .then(({ data }) => setDemandes(data))
      .finally(() => setChargement(false));
  }

  function ajouterDemandeInstantanement(nouvelleDemande) {
    if (!nouvelleDemande) {
      chargerDemandes();
      return;
    }
    setDemandes((precedentes) => [nouvelleDemande, ...precedentes]);
  }

  // Déduire les types uniques pour le filtre
  const typesDisponibles = [...new Set(demandes.map(d => d.type_demarche?.libelle).filter(Boolean))];
  const statutsDisponibles = [...new Set(demandes.map(d => d.statut).filter(Boolean))];

  // Appliquer les filtres et le tri
  let demandesFiltrees = demandes.filter((d) => {
    const correspondStatut = filtreStatut ? d.statut === filtreStatut : true;
    const correspondType = filtreType ? d.type_demarche?.libelle === filtreType : true;
    const correspondRecherche = d.type_demarche?.libelle?.toLowerCase().includes(recherche.toLowerCase()) || d.statut?.toLowerCase().includes(recherche.toLowerCase());
    return correspondStatut && correspondType && correspondRecherche;
  });

  // Appliquer le tri
  demandesFiltrees = demandesFiltrees.sort((a, b) => {
    const dateA = new Date(a.date_soumission).getTime();
    const dateB = new Date(b.date_soumission).getTime();
    return triDate === "recent" ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const indexDernierElement = pageCourante * elementsParPage;
  const indexPremierElement = indexDernierElement - elementsParPage;
  const demandesAffichees = demandesFiltrees.slice(indexPremierElement, indexDernierElement);
  const totalPages = Math.ceil(demandesFiltrees.length / elementsParPage);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>
          Bonjour, {utilisateur.prenom}
          <span className="role-badge">Fonctionnaire</span>
        </h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <NotificationBell />
          <button 
            className="btn btn-primary" 
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            onClick={() => navigate("/fonctionnaire/chat-ia")}
          >
            <MessageSquare size={18} /> Discuter avec l'IA
          </button>
          <button onClick={logout}>Déconnexion</button>
        </div>
      </header>

      <div className="dashboard-content">
        <h2>Nouvelle demande</h2>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <button
            onClick={() => setMode("ia")}
            className="btn"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: mode === "ia" ? "#1e2761" : "#e5e7eb", color: mode === "ia" ? "#fff" : "#374151" }}
          >
            <Bot size={18} /> Assistant IA
          </button>
          <button
            onClick={() => setMode("manuel")}
            className="btn"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: mode === "manuel" ? "#1e2761" : "#e5e7eb", color: mode === "manuel" ? "#fff" : "#374151" }}
          >
            <FileText size={18} /> Formulaire manuel
          </button>
        </div>

        {mode === "ia" ? (
          <NouvelleDemandeIA onCreee={ajouterDemandeInstantanement} />
        ) : (
          <NouvelleDemandeManuelle onCreee={ajouterDemandeInstantanement} />
        )}

        <div style={{ marginTop: "2.5rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ margin: 0 }}>Mes démarches</h2>
          
          {/* Section Filtres */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={recherche}
                onChange={(e) => { setRecherche(e.target.value); setPageCourante(1); }}
                style={{ paddingLeft: "32px", paddingRight: "12px", paddingTop: "6px", paddingBottom: "6px", borderRadius: "6px", border: "1px solid #d1d5db" }}
              />
            </div>

            <select 
              value={filtreStatut} 
              onChange={(e) => { setFiltreStatut(e.target.value); setPageCourante(1); }}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
            >
              <option value="">Tous les statuts</option>
              {statutsDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={filtreType} 
              onChange={(e) => { setFiltreType(e.target.value); setPageCourante(1); }}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
            >
              <option value="">Tous les types</option>
              {typesDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select 
              value={triDate} 
              onChange={(e) => setTriDate(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
            >
              <option value="recent">Plus récentes d'abord</option>
              <option value="ancien">Plus anciennes d'abord</option>
            </select>
          </div>
        </div>

        {chargement && <p className="dashboard-loading">Chargement...</p>}

        {!chargement && demandes.length === 0 && (
          <div className="dashboard-empty">
            Vous n'avez soumis aucune démarche pour le moment.
          </div>
        )}
        
        {!chargement && demandes.length > 0 && demandesFiltrees.length === 0 && (
          <div className="dashboard-empty">
            Aucune démarche ne correspond à vos filtres.
          </div>
        )}

        <ul className="card-list">
          {demandesAffichees.map((d) => (
            <li key={d.id_demande} className="card-item">
              <div>
                <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={18} style={{ color: "#1e2761" }} />
                  {d.type_demarche?.libelle}
                </div>
                <div className="card-subtitle">
                  Soumise le {new Date(d.date_soumission).toLocaleDateString("fr-FR")}
                  {d.details && Object.keys(d.details).length > 0 && (
                    <> — {Object.entries(d.details).map(([k, v]) => `${k}: ${v}`).join(", ")}</>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className={`badge-statut ${d.statut.toLowerCase()}`} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  {d.statut === 'Approuvée' || d.statut === 'validee' ? <CheckCircle size={14} /> : 
                   d.statut === 'Rejetée' || d.statut === 'rejetee' ? <XCircle size={14} /> : 
                   <Clock size={14} />}
                  {d.statut}
                </span>
                <button 
                  className="btn-icon" 
                  title="Voir les détails"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
                  onClick={() => setDemandeSelectionnee(d)}
                >
                  <Eye size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Contrôles de pagination */}
        {!chargement && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1.5rem" }}>
            <button 
              onClick={() => setPageCourante(p => Math.max(1, p - 1))}
              disabled={pageCourante === 1}
              style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #d1d5db", background: pageCourante === 1 ? "#f3f4f6" : "#fff", cursor: pageCourante === 1 ? "not-allowed" : "pointer" }}
            >
              <ChevronLeft size={16} /> Précédent
            </button>
            <span style={{ fontSize: "0.9rem", color: "#4b5563" }}>
              Page {pageCourante} sur {totalPages}
            </span>
            <button 
              onClick={() => setPageCourante(p => Math.min(totalPages, p + 1))}
              disabled={pageCourante === totalPages}
              style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #d1d5db", background: pageCourante === totalPages ? "#f3f4f6" : "#fff", cursor: pageCourante === totalPages ? "not-allowed" : "pointer" }}
            >
              Suivant <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {demandeSelectionnee && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff", padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "600px",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0 }}>Détails de la demande</h2>
              <button 
                onClick={() => setDemandeSelectionnee(null)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={24} />
              </button>
            </div>
            
            <p><strong>Type:</strong> {demandeSelectionnee.type_demarche?.libelle}</p>
            <p><strong>Statut:</strong> {demandeSelectionnee.statut}</p>
            <p><strong>Date:</strong> {new Date(demandeSelectionnee.date_soumission).toLocaleDateString("fr-FR")}</p>
            
            {demandeSelectionnee.details && Object.keys(demandeSelectionnee.details).length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h3>Informations</h3>
                <ul>
                  {Object.entries(demandeSelectionnee.details).map(([k, v]) => (
                    <li key={k}><strong>{k}:</strong> {v}</li>
                  ))}
                </ul>
              </div>
            )}

            {demandeSelectionnee.documents && demandeSelectionnee.documents.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h3>Documents joints</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                  {demandeSelectionnee.documents.map((doc, index) => (
                    <div key={doc.id_document || index} style={{ border: "1px solid #e5e7eb", padding: "0.5rem", borderRadius: "4px" }}>
                      {doc.chemin_fichier?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <img 
                          src={`http://localhost:8000/storage/${doc.chemin_fichier}`} 
                          alt="Document" 
                          style={{ width: "100%", height: "auto", display: "block" }} 
                        />
                      ) : (
                        <a href={`http://localhost:8000/storage/${doc.chemin_fichier}`} target="_blank" rel="noreferrer" style={{ color: "#1e2761", textDecoration: "underline" }}>
                          Voir le document {doc.nom_fichier || index + 1}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {demandeSelectionnee.historique && demandeSelectionnee.historique.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h3>Historique des statuts</h3>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {demandeSelectionnee.historique.map((h, i) => (
                    <li key={h.id_historique || i} style={{ marginBottom: "0.5rem", padding: "0.5rem", background: "#f9fafb", borderRadius: "4px", borderLeft: "4px solid #1e2761" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>
                          <strong>{h.ancien_statut ? `${h.ancien_statut} ➔ ` : 'Création : '}</strong>
                          <span style={{ color: "#1e2761", fontWeight: "bold" }}>{h.nouveau_statut}</span>
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {new Date(h.date_changement).toLocaleString("fr-FR")}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
