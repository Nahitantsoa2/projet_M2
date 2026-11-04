import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AppHeader from "../../components/AppHeader";
import {
  Inbox, Send, Reply, AlertCircle, CheckCircle2,
  MessageSquare, X, Clock, User, Search, Building2
} from "lucide-react";

const STATUS_STYLES = {
  ouverte:  { card: 'border-amber-200',      sub: 'bg-amber-50 text-amber-700 border-amber-200',      label: 'Ouv.' },
  en_cours: { card: 'border-blue-200',       sub: 'bg-blue-50 text-blue-700 border-blue-200',          label: 'En crs' },
  repondue: { card: 'border-emerald-200',    sub: 'bg-emerald-50 text-emerald-700 border-emerald-200',  label: 'Rép.' },
  cloturee: { card: 'border-gray-200',       sub: 'bg-gray-100 text-gray-600 border-gray-200',         label: 'Clôt.' },
};

const FILTRES = [
  { cle: 'tous', label: 'Tous' },
  { cle: 'ouverte', label: 'Ouvertes' },
  { cle: 'en_cours', label: 'En cours' },
  { cle: 'repondue', label: 'Répondues' },
  { cle: 'cloturee', label: 'Clôturées' },
];

export default function ReclamationsAdmin() {
  const navigate = useNavigate();
  const [reclamations, setReclamations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [cible, setCible] = useState(null); // réclamation en cours de réponse
  const [reponse, setReponse] = useState("");
  const [statut, setStatut] = useState("repondue");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  function charger() {
    setChargement(true);
    api.get("/admin/reclamations")
      .then(({ data }) => setReclamations(data))
      .catch((err) => setErreur(err.response?.data?.message || "Erreur de chargement."))
      .finally(() => setChargement(false));
  }

  const stats = {
    total: reclamations.length,
    ouvertes: reclamations.filter((r) => r.statut === "ouverte").length,
    repondues: reclamations.filter((r) => r.statut === "repondue").length,
    cloturees: reclamations.filter((r) => r.statut === "cloturee").length,
  };

  const filtrees = reclamations.filter((r) => {
    const okFiltre = filtre === "tous" || r.statut === filtre;
    const terme = recherche.trim().toLowerCase();
    const okRecherche = !terme ||
      r.objet.toLowerCase().includes(terme) ||
      r.description.toLowerCase().includes(terme) ||
      (r.fonctionnaire?.nom || "").toLowerCase().includes(terme) ||
      (r.fonctionnaire?.prenom || "").toLowerCase().includes(terme);
    return okFiltre && okRecherche;
  });

  function ouvrirReponse(r) {
    setCible(r);
    setReponse("");
    setStatut(r.statut === "ouverte" || r.statut === "repondue" ? "repondue" : "cloturee");
  }

  async function envoyerReponse(e) {
    e.preventDefault();
    if (!cible) return;
    setEnvoi(true);
    try {
      await api.patch(`/admin/reclamations/${cible.id_reclamation}/repondre`, {
        reponse,
        statut,
      });
      setCible(null);
      setReponse("");
      charger();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <AppHeader
        icon={<MessageSquare size={20} />}
        iconClass="from-violet-600 to-fuchsia-500 shadow-violet-500/20"
        title="Messages & Réclamations"
        subtitle="Gérez les demandes des fonctionnaires"
        onBack={() => navigate("/admin")}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, icon: Inbox, color: "text-blue-600 bg-blue-50" },
            { label: "Ouvertes", value: stats.ouvertes, icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
            { label: "Répondues", value: stats.repondues, icon: Reply, color: "text-emerald-600 bg-emerald-50" },
            { label: "Clôturées", value: stats.cloturees, icon: CheckCircle2, color: "text-gray-600 bg-gray-100" },
          ].map((k, i) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.color}`}>
                <k.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 leading-none">{k.value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-1">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Barre outils */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 flex-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <Search size={16} className="text-gray-400" />
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher (objet, messsage, fonctionnaire...)"
                className="bg-transparent flex-1 text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              {FILTRES.map((f) => (
                <button
                  key={f.cle}
                  onClick={() => setFiltre(f.cle)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    filtre === f.cle
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Inbox size={18} className="text-gray-500" />
              Liste des messages ({filtrees.length})
            </h2>
          </div>

          {chargement ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : erreur ? (
            <div className="flex flex-col items-center justify-center py-16 text-red-400">
              <AlertCircle size={36} className="mb-3 opacity-60" />
              <p className="font-semibold text-red-500">{erreur}</p>
            </div>
          ) : filtrees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Inbox size={36} className="opacity-40" />
              </div>
              <p className="font-semibold text-gray-500">Aucun message</p>
              <p className="text-sm text-gray-400 mt-1">Aucune réclamation ne correspond aux critères</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtrees.map((r) => {
                const st = STATUS_STYLES[r.statut] || STATUS_STYLES.ouverte;
                const enAttente = r.statut === "ouverte" || r.statut === "en_cours";
                return (
                  <div key={r.id_reclamation} className={`px-6 py-5 border-l-4 hover:bg-gray-50/50 transition-colors ${st.card}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${st.sub}`}>
                            {st.label}
                          </span>
                          <h3 className="font-bold text-gray-900">{r.objet}</h3>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {r.fonctionnaire?.prenom} {r.fonctionnaire?.nom}
                          </span>
                          {r.fonctionnaire?.service && (
                            <span className="flex items-center gap-1">
                              <Building2 size={12} />
                              {r.fonctionnaire.service}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {r.date_creation}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => ouvrirReponse(r)}
                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          enAttente
                            ? "text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-none"
                        }`}
                      >
                        <Reply size={14} />
                        {enAttente ? "Répondre" : "Répondre à nouveau"}
                      </button>
                    </div>

                    {/* Fil de discussion */}
                    <div className="mt-3 space-y-2">
                      {(r.messages || []).map((m) => {
                        const admin = m.auteur?.role !== "fonctionnaire";
                        return (
                          <div key={m.id_message} className={`flex ${admin ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 border ${
                              admin
                                ? "bg-violet-50 border-violet-100 rounded-br-sm"
                                : "bg-gray-50 border-gray-100 rounded-bl-sm"
                            }`}>
                              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1 ${
                                admin ? "text-violet-600" : "text-gray-500"
                              }`}>
                                <MessageSquare size={12} />
                                {admin
                                  ? "Administration"
                                  : `${m.auteur?.prenom || ""} ${m.auteur?.nom || ""}`.trim() || "Fonctionnaire"}
                                {m.date_envoi && (
                                  <span className="font-medium normal-case tracking-normal text-gray-400">· {m.date_envoi}</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{m.contenu}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal réponse */}
      {cible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={() => setCible(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900">Répondre au message</h3>
                <p className="text-xs text-gray-500">
                  De {cible.fonctionnaire?.prenom} {cible.fonctionnaire?.nom} · {cible.objet}
                </p>
              </div>
              <button onClick={() => setCible(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={envoyerReponse} className="p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 max-h-52 overflow-y-auto space-y-2">
                {(cible.messages || []).map((m) => {
                  const admin = m.auteur?.role !== "fonctionnaire";
                  return (
                    <div
                      key={m.id_message}
                      className={`text-sm rounded-lg px-3 py-2 ${
                        admin ? "bg-violet-50 ml-6" : "bg-white border border-gray-100 mr-6"
                      }`}
                    >
                      <p className={`text-[11px] font-bold uppercase tracking-wide mb-0.5 ${
                        admin ? "text-violet-600" : "text-gray-500"
                      }`}>
                        {admin
                          ? "Administration"
                          : `${m.auteur?.prenom || ""} ${m.auteur?.nom || ""}`.trim() || "Fonctionnaire"}
                        {m.date_envoi && <span className="font-medium normal-case ml-1 text-gray-400">· {m.date_envoi}</span>}
                      </p>
                      <p className="whitespace-pre-wrap text-gray-700">{m.contenu}</p>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Votre réponse *
                </label>
                <textarea
                  value={reponse}
                  onChange={(e) => setReponse(e.target.value)}
                  required
                  rows={4}
                  placeholder="Rédigez votre réponse..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Statut après réponse
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatut("repondue")}
                    className={`flex-1 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      statut === "repondue"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Répondue
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatut("cloturee")}
                    className={`flex-1 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      statut === "cloturee"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Clôturée
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCible(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoi}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  <Send size={15} />
                  {envoi ? "Envoi..." : "Envoyer la réponse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}