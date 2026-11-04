import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AppHeader from "../../components/AppHeader";
import {
  Upload, FileSpreadsheet, CheckCircle2, Inbox, Loader2, Shield, AlertCircle
} from "lucide-react";

export default function ImportSuivi() {
  const navigate = useNavigate();
  const [fichier, setFichier] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [totalActuel, setTotalActuel] = useState(null);

  useEffect(() => {
    api
      .get("/suivi", { params: { im: "" } })
      .then(({ data }) => setTotalActuel(data.length))
      .catch(() => setTotalActuel(null));
  }, []);

  function handleChange(e) {
    const f = e.target.files?.[0] || null;
    setFichier(f);
    setResultat(null);
    setErreur(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fichier) {
      setErreur("Veuillez sélectionner un fichier.");
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
      setTotalActuel(data.total);
      setFichier(null);
      e.target.reset?.();
    } catch (err) {
      setErreur(
        err?.response?.data?.message || "Une erreur est survenue lors de l'import."
      );
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <AppHeader
        icon={<FileSpreadsheet size={20} />}
        iconClass="from-purple-600 to-indigo-500 shadow-purple-500/20"
        title="Import des dossiers de suivi"
        subtitle="Mise à jour hebdomadaire des données"
        onBack={() => navigate("/admin")}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* État actuel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Inbox size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Dossiers enregistrés</p>
              <p className="text-xl font-bold text-gray-900">
                {totalActuel === null ? "—" : totalActuel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Shield size={14} className="text-purple-500" />
            Réservé à l'administrateur
          </div>
        </div>

        {/* Formulaire d'import */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in"
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Upload size={18} className="text-purple-500" />
            <h2 className="text-base font-bold text-gray-800">Importer un fichier</h2>
          </div>

          <div className="p-6">
            <label
              htmlFor="fichier"
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl px-6 py-10 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all"
            >
              <FileSpreadsheet size={36} className="text-purple-400" />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {fichier ? fichier.name : "Choisir un fichier Excel (.xlsx)"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Formats acceptés : .xlsx, .xls, .csv, .tsv — une ligne par dossier.
                </p>
              </div>
            </label>
            <input
              id="fichier"
              type="file"
              accept=".xlsx,.xls,.csv,.tsv,.txt"
              onChange={handleChange}
              className="sr-only"
            />

            {erreur && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erreur}
              </div>
            )}

            {resultat && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-2">
                  <CheckCircle2 size={16} />
                  Import réussi
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-xl p-3">
                    <p className="text-lg font-bold text-emerald-600">{resultat.ajoutes}</p>
                    <p className="text-[11px] text-gray-400">Ajoutés</p>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <p className="text-lg font-bold text-gray-500">{resultat.ignores}</p>
                    <p className="text-[11px] text-gray-400">Déjà présents</p>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <p className="text-lg font-bold text-gray-500">{resultat.invalides}</p>
                    <p className="text-[11px] text-gray-400">Sans IM</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-3">{resultat.message}</p>
                {resultat.notifies > 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                    <AlertCircle size={13} />
                    {resultat.notifies} fonctionnaire(s) averti(s) par email (dossier rejeté).
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={envoi || !fichier}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {envoi ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Import en cours...
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

        <p className="text-xs text-gray-400 mt-4 text-center">
          Les lignes déjà présentes ne sont pas dupliquées : seules les nouvelles sont ajoutées.
        </p>
      </main>
    </div>
  );
}