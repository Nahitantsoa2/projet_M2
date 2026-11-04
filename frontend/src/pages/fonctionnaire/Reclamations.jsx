import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AppHeader from "../../components/AppHeader";
import {
  MessageSquare, Inbox, Send, AlertCircle, FileText,
  Lock, Loader2, SquarePen, ArrowLeft, Building2, Trash2, X
} from "lucide-react";

const STATUS_STYLES = {
  ouverte:  { bg: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   label: 'Ouverte' },
  en_cours: { bg: 'bg-blue-50 text-blue-700 border-blue-200',          dot: 'bg-blue-500',    label: 'En cours' },
  repondue: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Répondue' },
  cloturee: { bg: 'bg-gray-100 text-gray-600 border-gray-200',         dot: 'bg-gray-400',    label: 'Clôturée' },
};

export default function ReclamationsFonctionnaire() {
  const navigate = useNavigate();
  const [reclamations, setReclamations] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [activeId, setActiveId] = useState(null);
  const [vueMobile, setVueMobile] = useState("liste");
  const [nouveau, setNouveau] = useState(false);

  const [form, setForm] = useState({ objet: "", description: "", id_demande: "" });
  const [envoiNouveau, setEnvoiNouveau] = useState(false);
  const [formErreur, setFormErreur] = useState(null);

  const [reponses, setReponses] = useState({});
  const [envoiId, setEnvoiId] = useState(null);
  const [erreurFil, setErreurFil] = useState(null);
  const [supprCible, setSupprCible] = useState(null);
  const [supprEnvoi, setSupprEnvoi] = useState(false);

  const finRef = useRef(null);

  const active = reclamations.find((r) => r.id_reclamation === activeId) || null;
  const nbMessages = active?.messages?.length ?? 0;

  useEffect(() => {
    charger();
    api.get("/demandes/mes-demandes").then(({ data }) => setDemandes(data)).catch(() => setDemandes([]));
  }, []);

  useEffect(() => {
    if (!nouveau && active && finRef.current) {
      finRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [activeId, nbMessages, nouveau, active]);

  async function charger() {
    setChargement(true);
    try {
      const { data } = await api.get("/reclamations/mes-reclamations");
      setReclamations(data);
      setActiveId((prev) =>
        prev && data.some((d) => d.id_reclamation === prev) ? prev : data[0]?.id_reclamation ?? null
      );
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur de chargement.");
    } finally {
      setChargement(false);
    }
  }

  function ouvrirConversation(id) {
    setNouveau(false);
    setActiveId(id);
    setVueMobile("conversation");
  }

  function ouvrirNouveau() {
    setNouveau(true);
    setForm({ objet: "", description: "", id_demande: "" });
    setFormErreur(null);
    setVueMobile("conversation");
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormErreur(null);
  }

  async function envoyerNouveau(e) {
    e.preventDefault();
    setEnvoiNouveau(true);
    setFormErreur(null);
    try {
      const { data } = await api.post("/reclamations", {
        objet: form.objet,
        description: form.description,
        id_demande: form.id_demande || null,
      });
      setForm({ objet: "", description: "", id_demande: "" });
      await charger();
      setActiveId(data.id_reclamation);
      setNouveau(false);
      setVueMobile("conversation");
    } catch (err) {
      setFormErreur(err.response?.data?.message || "Impossible d'envoyer votre message.");
    } finally {
      setEnvoiNouveau(false);
    }
  }

  async function envoyerReponse(id) {
    const contenu = (reponses[id] || "").trim();
    if (!contenu) return;
    setEnvoiId(id);
    setErreurFil(null);
    try {
      await api.post(`/reclamations/${id}/messages`, { contenu });
      setReponses((prev) => ({ ...prev, [id]: "" }));
      await charger();
    } catch (err) {
      setErreurFil({ id, message: err.response?.data?.message || "Impossible d'envoyer votre message." });
    } finally {
      setEnvoiId(null);
    }
  }

  async function supprimerMessage(m, mode) {
    setSupprCible(null);
    setSupprEnvoi(true);
    try {
      await api.delete(`/reclamations/${activeId}/messages/${m.id_message}`, { data: { mode } });
      await charger();
    } catch (err) {
      setErreurFil({ id: activeId, message: err.response?.data?.message || "Impossible de supprimer le message." });
    } finally {
      setSupprEnvoi(false);
    }
  }

  function dernierMessage(r) {
    const msgs = r.messages || [];
    const last = msgs[msgs.length - 1];
    if (!last) return r.description;
    const prefixe = last.auteur?.role === "fonctionnaire" ? "Vous : " : "";
    return `${prefixe}${last.contenu}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        icon={<MessageSquare size={20} />}
        iconClass="from-blue-600 to-cyan-500 shadow-blue-500/20"
        title="Messages & Réclamations"
        subtitle="Discutez avec l'administration"
        onBack={() => navigate("/fonctionnaire")}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex">
        <div className="w-full flex overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm h-[calc(100vh-9rem)] sm:h-[calc(100vh-7.5rem)] min-h-[520px]">

          {/* Liste des conversations */}
          <aside className={`w-full sm:w-80 lg:w-96 flex-shrink-0 flex-col border-r border-gray-100 ${vueMobile === "conversation" ? "hidden sm:flex" : "flex"}`}>
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Inbox size={18} className="text-gray-500" />
                Messages
                <span className="text-xs font-medium text-gray-400">({reclamations.length})</span>
              </h2>
              <button
                type="button"
                onClick={ouvrirNouveau}
                title="Envoyer un message"
                className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm transition-all"
              >
                <SquarePen size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chargement ? (
                <div className="flex justify-center items-center py-16">
                  <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : erreur ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-red-400">
                  <AlertCircle size={32} className="mb-3 opacity-60" />
                  <p className="font-semibold text-red-500 text-sm">{erreur}</p>
                </div>
              ) : reclamations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-gray-400">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Inbox size={28} className="opacity-40" />
                  </div>
                  <p className="font-semibold text-gray-500 text-sm">Aucun message</p>
                  <p className="text-xs mt-1">Utilisez le bouton + pour contacter l'administration</p>
                </div>
              ) : (
                reclamations.map((r) => {
                  const st = STATUS_STYLES[r.statut] || STATUS_STYLES.ouverte;
                  const actif = activeId === r.id_reclamation && !nouveau;
                  return (
                    <button
                      key={r.id_reclamation}
                      type="button"
                      onClick={() => ouvrirConversation(r.id_reclamation)}
                      className={`w-full text-left px-4 py-3.5 flex gap-3 border-b border-gray-50 transition-colors ${
                        actif ? "bg-blue-50/70" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-600 to-slate-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Building2 size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-gray-900 truncate">{r.objet}</span>
                          <span className="text-[11px] text-gray-400 flex-shrink-0">{r.date_creation?.split(" ")[0]}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{dernierMessage(r)}</p>
                        <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Panneau conversation / nouveau message */}
          <section className={`flex-1 flex-col min-w-0 ${vueMobile === "conversation" ? "flex" : "hidden sm:flex"}`}>
            {nouveau ? (
              <form onSubmit={envoyerNouveau} className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setNouveau(false); setVueMobile(active ? "conversation" : "liste"); }}
                    className="p-2 -ml-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                    title="Retour"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h2 className="font-bold text-sm text-gray-900">Envoyer un message</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-500 text-white flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Administration</p>
                      <p className="text-xs text-gray-400">SRSP · Service administratif</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Objet *</label>
                    <input
                      name="objet"
                      value={form.objet}
                      onChange={handleChange}
                      required
                      maxLength={200}
                      placeholder="Ex: Problème de solde, rectification..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Demande concernée (optionnel)
                    </label>
                    <select
                      name="id_demande"
                      value={form.id_demande}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    >
                      <option value="">— Aucune —</option>
                      {demandes.map((d) => (
                        <option key={d.id_demande} value={d.id_demande}>
                          #{d.id_demande} · {d.type_demarche?.libelle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message *</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Écrivez votre message..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {formErreur && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2.5 rounded-xl text-sm font-medium border border-red-200">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      {formErreur}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 p-3 sm:p-4">
                  <button
                    type="submit"
                    disabled={envoiNouveau}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {envoiNouveau ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {envoiNouveau ? "Envoi en cours..." : "Envoyer"}
                  </button>
                </div>
              </form>
            ) : active ? (
              <>
                {/* En-tête conversation */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setVueMobile("liste")}
                    className="sm:hidden p-2 -ml-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                    title="Retour"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-500 text-white flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 truncate">{active.objet}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold border ${(STATUS_STYLES[active.statut] || STATUS_STYLES.ouverte).bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${(STATUS_STYLES[active.statut] || STATUS_STYLES.ouverte).dot}`} />
                        {(STATUS_STYLES[active.statut] || STATUS_STYLES.ouverte).label}
                      </span>
                      {active.demande?.id_demande && (
                        <span className="flex items-center gap-1">
                          <FileText size={11} /> Demande #{active.demande.id_demande}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fil de messages */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2.5 bg-gray-50/50">
                  {(active.messages || []).map((m) => {
                    const moi = m.auteur?.role === "fonctionnaire";
                    const boutonSuppr = (
                      <button
                        type="button"
                        onClick={() => setSupprCible({ ...m, moi })}
                        title="Supprimer"
                        className="flex-shrink-0 p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    );
                    return (
                      <div key={m.id_message} className={`group flex items-center gap-1.5 ${moi ? "justify-end" : "justify-start"}`}>
                        {moi && boutonSuppr}
                        <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl shadow-sm ${
                          moi
                            ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.contenu}</p>
                          <p className={`text-[10px] mt-1 text-right ${moi ? "text-blue-100/90" : "text-gray-400"}`}>
                            {m.date_envoi}
                          </p>
                        </div>
                        {!moi && boutonSuppr}
                      </div>
                    );
                  })}
                  <div ref={finRef} />
                </div>

                {/* Zone de saisie */}
                <div className="border-t border-gray-100 bg-white px-3 sm:px-4 py-3">
                  {active.statut === "cloturee" ? (
                    <p className="text-xs text-gray-400 italic flex items-center justify-center gap-1.5">
                      <Lock size={12} /> Cette réclamation est clôturée.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-end gap-2">
                        <textarea
                          rows={1}
                          value={reponses[activeId] || ""}
                          onChange={(e) => {
                            setReponses((prev) => ({ ...prev, [activeId]: e.target.value }));
                            setErreurFil(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              envoyerReponse(activeId);
                            }
                          }}
                          placeholder="Votre message..."
                          className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-gray-100 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => envoyerReponse(activeId)}
                          disabled={envoiId === activeId || !(reponses[activeId] || "").trim()}
                          title="Envoyer"
                          className="w-11 h-11 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white flex items-center justify-center shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {envoiId === activeId ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                      </div>
                      {erreurFil?.id === activeId && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {erreurFil.message}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <MessageSquare size={36} className="opacity-40" />
                </div>
                <p className="font-semibold text-gray-500">Aucune conversation</p>
                <p className="text-sm mt-1 text-center">Sélectionnez un message ou démarrez une nouvelle discussion</p>
                <button
                  type="button"
                  onClick={ouvrirNouveau}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  <SquarePen size={16} /> Envoyer un message
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal suppression de message */}
      {supprCible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
          onClick={() => !supprEnvoi && setSupprCible(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3 bg-gray-50/50">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm">Supprimer le message</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">« {supprCible.contenu} »</p>
              </div>
              <button
                type="button"
                onClick={() => setSupprCible(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2">
              <button
                type="button"
                disabled={supprEnvoi}
                onClick={() => supprimerMessage(supprCible, "moi")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition-all disabled:opacity-50"
              >
                <span className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={16} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-800">Supprimer pour moi</span>
                  <span className="block text-xs text-gray-400">Masqué uniquement pour vous</span>
                </span>
              </button>

              {supprCible.moi && (
                <button
                  type="button"
                  disabled={supprEnvoi}
                  onClick={() => supprimerMessage(supprCible, "tous")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 hover:bg-red-50 text-left transition-all disabled:opacity-50"
                >
                  <span className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={16} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-red-600">Supprimer pour tout le monde</span>
                    <span className="block text-xs text-red-400">Retiré de la conversation pour tous</span>
                  </span>
                </button>
              )}
            </div>

            <div className="px-4 pb-4">
              <button
                type="button"
                disabled={supprEnvoi}
                onClick={() => setSupprCible(null)}
                className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
