import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AppHeader from "../../components/AppHeader";
import {
  Upload, FileSpreadsheet, CheckCircle2, Inbox, Loader2,
  AlertCircle, Download, Plus, Trash2, Search, Table, HelpCircle
} from "lucide-react";

const FORM_VIDE = {
  localite: "",
  chap: "",
  im: "",
  cmv: "",
};

export default function ImportSuivi() {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState([]);
  const [chargementListe, setChargementListe] = useState(true);
  const [fichier, setFichier] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState(null);

  // Saisie manuelle
  const [formManuel, setFormManuel] = useState(FORM_VIDE);
  const [enregistrementManuel, setEnregistrementManuel] = useState(false);
  const [succesManuel, setSuccesManuel] = useState(null);
  const [erreurManuel, setErreurManuel] = useState(null);

  // Recherche dans la table
  const [recherche, setRecherche] = useState("");
  const [onglet, setOnglet] = useState("fichier"); // "fichier" ou "manuel"

  const chargerDossiers = useCallback(() => {
    return api
      .get("/suivi")
      .then(({ data }) => setDossiers(data))
      .catch(() => setDossiers([]))
      .finally(() => setChargementListe(false));
  }, []);

  useEffect(() => {
    chargerDossiers();
  }, [chargerDossiers]);

  function handleChangeFichier(e) {
    const f = e.target.files?.[0] || null;
    setFichier(f);
    setResultat(null);
    setErreur(null);
  }

  async function handleSubmitFichier(e) {
    e.preventDefault();
    if (!fichier) {
      setErreur("Veuillez sélectionner un fichier Excel ou CSV.");
      return;
    }

    setEnvoi(true);
    setResultat(null);
    setErreur(null);

    const fd = new FormData();
    fd.append("fichier", fichier);

    try {
      const { data } = await api.post("/admin/suivi/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultat(data);
      setFichier(null);
      e.target.reset?.();
      chargerDossiers();
    } catch (err) {
      setErreur(
        err?.response?.data?.message || "Une erreur est survenue lors de l'import."
      );
    } finally {
      setEnvoi(false);
    }
  }

  async function handleAjoutManuel(e) {
    e.preventDefault();
    setErreurManuel(null);
    setSuccesManuel(null);

    if (!formManuel.im.trim()) {
      setErreurManuel("Le champ IM (matricule) est obligatoire.");
      return;
    }

    setEnregistrementManuel(true);
    try {
      await api.post("/admin/suivi", formManuel);
      setSuccesManuel("Dossier enregistré avec succès !");
      setFormManuel(FORM_VIDE);
      chargerDossiers();
    } catch (err) {
      setErreurManuel(
        err?.response?.data?.message || "Impossible d'ajouter ce dossier."
      );
    } finally {
      setEnregistrementManuel(false);
    }
  }

  async function supprimerDossier(id) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce dossier ?")) return;
    try {
      await api.delete(`/admin/suivi/${id}`);
      chargerDossiers();
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  }

  async function viderTout() {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer TOUS les dossiers de suivi ? Cette opération est irréversible."
      )
    ) {
      return;
    }
    try {
      await api.delete("/admin/suivi");
      chargerDossiers();
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  }

  function telechargerModele() {
    window.open(`${api.defaults.baseURL || "/api"}/admin/suivi/modele`, "_blank");
  }

  const [page, setPage] = useState(1);
  const LIGNES_PAR_PAGE = 10;

  useEffect(() => {
    setPage(1);
  }, [recherche]);

  const dossiersFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return dossiers;
    return dossiers.filter(
      (d) =>
        (d.im && String(d.im).toLowerCase().includes(q)) ||
        (d.localite && String(d.localite).toLowerCase().includes(q)) ||
        (d.chap && String(d.chap).toLowerCase().includes(q)) ||
        (d.cmv && String(d.cmv).toLowerCase().includes(q))
    );
  }, [dossiers, recherche]);

  const totalPages = Math.max(1, Math.ceil(dossiersFiltres.length / LIGNES_PAR_PAGE));
  const dossiersPage = useMemo(() => {
    const debut = (page - 1) * LIGNES_PAR_PAGE;
    return dossiersFiltres.slice(debut, debut + LIGNES_PAR_PAGE);
  }, [dossiersFiltres, page]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <AppHeader
        icon={<FileSpreadsheet size={20} />}
        iconClass="from-purple-600 to-indigo-500 shadow-purple-500/20"
        title="Import &amp; Suivi des dossiers"
        subtitle="Colonnes requises : Localiter, chap, im, cmv"
        onBack={() => navigate("/admin")}
        extra={
          <button
            onClick={telechargerModele}
            className="flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold shadow-sm transition"
            title="Télécharger un modèle Excel ou CSV"
          >
            <Download size={14} className="text-purple-600" />
            <span className="hidden sm:inline">Modèle (CSV)</span>
          </button>
        }
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Bannière explicative des colonnes */}
        <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-600 text-white rounded-xl flex-shrink-0 mt-0.5">
              <HelpCircle size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900">
                Colonnes obligatoires à remplir dans le fichier Excel / CSV :
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Le système prend désormais en charge ces 4 champs, que ce soit via importation de fichier ou via la saisie directe :
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                <div className="bg-white/80 backdrop-blur rounded-xl p-2.5 border border-purple-100 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Champ 1</span>
                  <span className="text-xs font-bold text-gray-800">Localiter / Localité</span>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-2.5 border border-purple-100 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Champ 2</span>
                  <span className="text-xs font-bold text-gray-800">chap (Chapitre)</span>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-2.5 border border-purple-100 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Champ 3</span>
                  <span className="text-xs font-bold text-gray-800">im (Matricule IM)</span>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-2.5 border border-purple-100 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Champ 4</span>
                  <span className="text-xs font-bold text-gray-800">cmv (Code Mouvement)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* État actuel & sélecteur d'onglet */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-sm">
            <button
              onClick={() => setOnglet("fichier")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                onglet === "fichier"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Upload size={14} />
              Importer un fichier Excel / CSV
            </button>
            <button
              onClick={() => setOnglet("manuel")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                onglet === "manuel"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Plus size={14} />
              Saisie manuelle d'un dossier
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 shadow-sm">
              <Inbox size={15} className="text-purple-600" />
              <span>Dossiers : <b>{dossiers.length}</b></span>
            </div>
            {dossiers.length > 0 && (
              <button
                onClick={viderTout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition"
                title="Supprimer tous les dossiers de suivi"
              >
                <Trash2 size={13} />
                Tout supprimer
              </button>
            )}
          </div>
        </div>

        {/* Section 1 : Import Fichier */}
        {onglet === "fichier" && (
          <form
            onSubmit={handleSubmitFichier}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-purple-500" />
                <h2 className="text-base font-bold text-gray-800">
                  Fichier Excel ou CSV (Localiter, chap, im, cmv)
                </h2>
              </div>
              <button
                type="button"
                onClick={telechargerModele}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <Download size={13} />
                Télécharger le modèle
              </button>
            </div>

            <div className="p-6">
              <label
                htmlFor="fichier"
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl px-6 py-10 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all"
              >
                <FileSpreadsheet size={38} className="text-purple-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {fichier ? fichier.name : "Sélectionner un fichier Excel (.xlsx, .xls) ou .csv"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Colonnes attendues : <b>Localiter</b> (A), <b>chap</b> (B), <b>im</b> (C), <b>cmv</b> (D)
                  </p>
                </div>
              </label>
              <input
                id="fichier"
                type="file"
                accept=".xlsx,.xls,.csv,.tsv,.txt"
                onChange={handleChangeFichier}
                className="sr-only"
              />

              {erreur && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {erreur}
                </div>
              )}

              {resultat && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-2">
                    <CheckCircle2 size={16} />
                    Importation réussie !
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white rounded-xl p-3 shadow-xs">
                      <p className="text-lg font-bold text-emerald-600">{resultat.ajoutes}</p>
                      <p className="text-[11px] text-gray-400">Ajoutés</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-xs">
                      <p className="text-lg font-bold text-gray-500">{resultat.ignores}</p>
                      <p className="text-[11px] text-gray-400">Déjà présents (doublons)</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-xs">
                      <p className="text-lg font-bold text-gray-500">{resultat.invalides}</p>
                      <p className="text-[11px] text-gray-400">Sans IM</p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-600 mt-3">{resultat.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={envoi || !fichier}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {envoi ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Importation en cours...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Importer les dossiers
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Section 2 : Saisie manuelle */}
        {onglet === "manuel" && (
          <form
            onSubmit={handleAjoutManuel}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Plus size={18} className="text-purple-500" />
              <h2 className="text-base font-bold text-gray-800">
                Saisie manuelle d'un dossier
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Localiter (Localité)
                </label>
                <input
                  type="text"
                  placeholder="Ex : 304 ou Antananarivo"
                  value={formManuel.localite}
                  onChange={(e) => setFormManuel({ ...formManuel, localite: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  chap (Chapitre)
                </label>
                <input
                  type="text"
                  placeholder="Ex : 01 ou 12"
                  value={formManuel.chap}
                  onChange={(e) => setFormManuel({ ...formManuel, chap: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  im (Matricule IM) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : 494089"
                  value={formManuel.im}
                  onChange={(e) => setFormManuel({ ...formManuel, im: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  cmv (Code Mouvement)
                </label>
                <input
                  type="text"
                  placeholder="Ex : 13 ou 02"
                  value={formManuel.cmv}
                  onChange={(e) => setFormManuel({ ...formManuel, cmv: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            {erreurManuel && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                {erreurManuel}
              </div>
            )}

            {succesManuel && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700">
                {succesManuel}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={enregistrementManuel}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-sm"
              >
                {enregistrementManuel ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Ajouter ce dossier
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Section 3 : Tableau des dossiers enregistrés */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Table size={18} className="text-purple-500" />
              Liste des dossiers enregistrés ({dossiersFiltres.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher (IM, Localité, chap, cmv)..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>
          </div>

          {chargementListe ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-purple-600" />
              <p className="text-xs text-gray-400">Chargement de la liste...</p>
            </div>
          ) : dossiersFiltres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Inbox size={40} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">Aucun dossier trouvé</p>
              <p className="text-xs mt-1">Importez un fichier Excel ou ajoutez un dossier manuellement ci-dessus.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-semibold">
                    <th className="px-6 py-3">Localiter</th>
                    <th className="px-6 py-3">Chapitre (chap)</th>
                    <th className="px-6 py-3 font-bold text-gray-700">Matricule (im)</th>
                    <th className="px-6 py-3">CMV</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dossiersPage.map((d) => (
                    <tr key={d.id} className="hover:bg-purple-50/20 transition">
                      <td className="px-6 py-3.5 font-medium text-gray-700">
                        {d.localite ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-100">
                            {d.localite}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">
                        {d.chap || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-gray-900">
                        {d.im}
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">
                        {d.cmv ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                            CMV {d.cmv}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => supprimerDossier(d.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer ce dossier"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
              <span>
                Affichage de {(page - 1) * LIGNES_PAR_PAGE + 1} à{" "}
                {Math.min(page * LIGNES_PAR_PAGE, dossiersFiltres.length)} sur{" "}
                {dossiersFiltres.length} dossiers
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Précédent
                </button>
                <span className="font-semibold text-gray-700 px-1">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
