import { useState, useMemo, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  FolderOpen, Eye, ChevronDown, ChevronUp, Clock,
  Search, Info, Inbox, AlertCircle
} from "lucide-react";

// --- Données réelles : servies par l'API /api/suivi (import Excel hebdomadaire
// effectué côté administrateur). Le suivi est en lecture seule.

const ETAT_STYLES = {
  "Terminer": { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Terminé" },
  "En cours": { bg: "bg-violet-50 text-violet-700 border-violet-200",    dot: "bg-violet-500",  label: "En cours" },
};

const TYPE_STYLES = {
  "Solde":    "bg-sky-50 text-sky-700 border-sky-200",
  "Visa":     "bg-amber-50 text-amber-700 border-amber-200",
  "Pensions": "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const DETAILS_LABELS = {
  ref_be: "Réf BE arrivé",
  ref_dossier: "Réf dossier",
  im: "IM / N° pension",
  nom_prenom: "Nom & Prénom",
  ministere: "Ministère usager",
  motif_instance: "Motif d'instance",
  detail_motif_instance: "Détail motif",
  date_leve_motif: "Date levé motif",
  info_leve_motif: "Information levé motif",
  sort_traitement: "Sort traitement",
  motif_rejet: "Motif de rejet",
  detail_motif_rejet: "Détail rejet",
  ref_operation: "Référence opération",
  traitement_augure: "Traitement sur AUGURE",
  date_traitement: "Date traitement",
  nature_dossier: "Nature dossier",
  detail_nature_dossier: "Détail nature",
};

const VALEURS_VIDES = new Set(["", "-----", "-", "N/A"]);

const FILTRES_ETAT = ["Tous", "En cours", "Terminer"];
const FILTRES_TYPE = ["Solde", "Visa", "Pensions"];

export default function SuiviContenu() {
  const { utilisateur } = useAuth();
  const [filtreEtat, setFiltreEtat] = useState("Tous");
  const [filtreType, setFiltreType] = useState("Tous");
  const [recherche, setRecherche] = useState("");
  const [ouverts, setOuverts] = useState(() => new Set());
  const [mesDossiers, setMesDossiers] = useState([]);
  const [chargementSuivi, setChargementSuivi] = useState(true);

  const matricule = utilisateur?.matricule?.trim() || "";

  // Charge les dossiers de l'agent connecté depuis l'API
  useEffect(() => {
    if (!matricule) return undefined;

    let annule = false;

    api
      .get("/suivi", { params: { im: matricule } })
      .then(({ data }) => {
        if (!annule) setMesDossiers(data);
      })
      .catch(() => {
        if (!annule) setMesDossiers([]);
      })
      .finally(() => {
        if (!annule) setChargementSuivi(false);
      });

    return () => {
      annule = true;
    };
  }, [matricule]);

  const doses = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return mesDossiers.filter((d) => {
      const okEtat = filtreEtat === "Tous" || d.etat_dossier === filtreEtat;
      const okType = filtreType === "Tous" || d.type_dossier === filtreType;
      const okTexte =
        !q ||
        String(d.ref_dossier).toLowerCase().includes(q) ||
        String(d.nature_dossier).toLowerCase().includes(q) ||
        String(d.nom_prenom).toLowerCase().includes(q) ||
        String(d.im).toLowerCase().includes(q);
      return okEtat && okType && okTexte;
    });
  }, [mesDossiers, filtreEtat, filtreType, recherche]);

  function basculer(index) {
    setOuverts((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(index)) suivant.delete(index);
      else suivant.add(index);
      return suivant;
    });
  }

  const totalParEtat = {
    "En cours": mesDossiers.filter((d) => d.etat_dossier === "En cours").length,
    Terminer: mesDossiers.filter((d) => d.etat_dossier === "Terminer").length,
  };

  return (
    <>
      {/* Bandeau : mode consultation */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5 mb-6 animate-fade-in">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 leading-relaxed">
          <span className="font-bold">Mode consultation uniquement</span> — vous ne pouvez pas modifier ou
          envoyer un dossier ici. Pour toute correction, utilisez{" "}
          <span className="font-bold">Messages &amp; Réclamations</span>.
        </p>
      </div>

      {!matricule ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertCircle size={36} className="text-amber-500" />
          </div>
          <p className="font-semibold text-gray-600">Aucun matricule (IM) associé à votre compte</p>
          <p className="text-sm text-gray-400 mt-1 text-center max-w-md">
            Contactez l'administrateur pour que votre IM soit renseigné afin d'afficher vos dossiers.
          </p>
        </div>
      ) : (
        <>
          {/* Compteurs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total", valeur: mesDossiers.length, cls: "text-blue-600 bg-blue-50" },
              { label: "En cours", valeur: totalParEtat["En cours"], cls: "text-violet-600 bg-violet-50" },
              { label: "Terminé", valeur: totalParEtat.Terminer, cls: "text-emerald-600 bg-emerald-50" },
              { label: "IM", valeur: matricule, cls: "text-gray-600 bg-gray-100 text-xs" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{c.label}</span>
                <span className={`min-w-9 h-9 px-2 rounded-xl flex items-center justify-center font-bold ${c.cls}`}>{c.valeur}</span>
              </div>
            ))}
          </div>

          {/* Filtres + recherche */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {FILTRES_ETAT.map((f) => {
                  const actif =
                    f === "Tous"
                      ? filtreEtat === "Tous" && filtreType === "Tous"
                      : filtreEtat === f;
                  return (
                    <button
                      key={f}
                      onClick={() => {
                        setFiltreEtat(f);
                        if (f === "Tous") setFiltreType("Tous");
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        actif
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {f === "Terminer" ? "Terminé" : f}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {FILTRES_TYPE.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltreType(f)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      filtreType === f
                        ? "bg-gray-800 text-white shadow-sm"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full lg:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="N° dossier, nature, nom..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Liste des dossiers */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Inbox size={18} className="text-gray-500" />
                Mes dossiers
                <span className="text-sm font-medium text-gray-400 ml-1">({doses.length})</span>
              </h2>
            </div>

            {chargementSuivi ? (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                        <p className="font-semibold text-gray-500">Chargement de vos dossiers...</p>
                      </div>
                    ) : doses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <Inbox size={36} className="opacity-40" />
                </div>
                <p className="font-semibold text-gray-500">Aucun dossier trouvé</p>
                <p className="text-sm text-gray-400 mt-1">Ajustez les filtres ou la recherche</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {doses.map((d, index) => {
                  const st = ETAT_STYLES[d.etat_dossier] || ETAT_STYLES["En cours"];
                  const typeCls = TYPE_STYLES[d.type_dossier] || "bg-gray-50 text-gray-600 border-gray-200";
                  const ouvert = ouverts.has(index);
                  return (
                    <div key={`${d.ref_dossier}-${d.im}-${index}`} className="px-6 py-4 hover:bg-gray-50/40 transition-colors">
                      <button
                        onClick={() => basculer(index)}
                        className="w-full flex items-center justify-between gap-4 text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${st.bg}`}>
                            <FolderOpen size={18} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm truncate">
                              #{d.ref_dossier} · {d.nature_dossier}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {d.date_reception}
                              </span>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${typeCls}`}>
                                {d.type_dossier}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${st.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                          <span className="text-gray-400">
                            {ouvert ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </span>
                        </div>
                      </button>

                      {ouvert && (
                        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/60 p-5 animate-fade-in">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wide mb-3">
                            <Eye size={13} />
                            Détails du dossier
                          </div>
                          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                            {Object.entries(DETAILS_LABELS).map(([cle, label]) => {
                              const val = d[cle];
                              if (!val || VALEURS_VIDES.has(String(val).trim())) return null;
                              return (
                                <div key={cle} className="flex items-start gap-2">
                                  <span className="text-xs font-semibold text-gray-400 w-28 sm:w-36 flex-shrink-0 pt-0.5">{label}</span>
                                  <span className="text-sm font-medium text-gray-800 break-words">{val}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
