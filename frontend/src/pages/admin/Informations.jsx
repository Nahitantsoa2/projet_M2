import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { filtrerAgents } from "../../utils/informations";
import AppHeader from "../../components/AppHeader";
import { Info, Plus, Pencil, Search, Save, X, Users } from "lucide-react";

const FORM_VIDE = { matricule: "", nom: "", prenom: "", localite: "" };

export default function GestionInformations() {
  const navigate = useNavigate();
  const [liste, setListe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [form, setForm] = useState(FORM_VIDE);
  const [editingId, setEditingId] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState("");
  const formRef = useRef(null);

  const charger = useCallback(() => {
    return api
      .get("/informations")
      .then(({ data }) => setListe(data))
      .catch(() => setErreur("Impossible de charger les informations."))
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const localites = useMemo(
    () => [...new Set(liste.map((i) => i.localite))].sort((a, b) => String(a).localeCompare(String(b))),
    [liste]
  );

  const filtres = useMemo(() => filtrerAgents(liste, recherche), [liste, recherche]);

  const champ =
    "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white";

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur(null);
    setEnregistrement(true);
    try {
      if (editingId) {
        await api.patch(`/admin/informations/${editingId}`, form);
      } else {
        await api.post("/admin/informations", form);
      }
      setForm(FORM_VIDE);
      setEditingId(null);
      charger();
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.errors
        ? Object.values(data.errors).flat().join(" ")
        : data?.message || "Une erreur est survenue. Veuillez réessayer.";
      setErreur(msg);
    } finally {
      setEnregistrement(false);
    }
  };

  const editer = (item) => {
    setEditingId(item.id_information);
    setForm({
      matricule: item.matricule,
      nom: item.nom,
      prenom: item.prenom || "",
      localite: item.localite,
    });
    setErreur(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const annuler = () => {
    setEditingId(null);
    setForm(FORM_VIDE);
    setErreur(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        icon={<Info size={20} />}
        iconClass="from-purple-600 to-indigo-600 shadow-purple-500/20"
        title="Gestion des informations"
        subtitle="Liste des agents par localité"
        onBack={() => navigate("/admin")}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulaire */}
        <section
          ref={formRef}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6"
        >
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
            {editingId ? <Pencil size={16} className="text-purple-500" /> : <Plus size={16} className="text-purple-500" />}
            {editingId ? "Modifier une information" : "Ajouter une information"}
          </h2>

          <form onSubmit={soumettre} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Matricule IM</label>
              <input
                type="text"
                className={champ}
                value={form.matricule}
                onChange={(e) => setForm({ ...form, matricule: e.target.value })}
                placeholder="Ex : 509700"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nom</label>
              <input
                type="text"
                className={champ}
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom de famille"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Prénoms</label>
              <input
                type="text"
                className={champ}
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                placeholder="Prénoms"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Localité</label>
              <input
                type="text"
                list="localites"
                className={champ}
                value={form.localite}
                onChange={(e) => setForm({ ...form, localite: e.target.value })}
                placeholder="Ex : 304"
                required
              />
              <datalist id="localites">
                {localites.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>

            {erreur && (
              <div className="sm:col-span-2 lg:col-span-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
                {erreur}
              </div>
            )}

            <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-2">
              <button
                type="submit"
                disabled={enregistrement}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
              >
                <Save size={16} />
                {enregistrement ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={annuler}
                  className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 transition-all"
                >
                  <X size={16} />
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Liste */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Users size={16} className="text-purple-500" />
              Agents ({liste.length})
            </h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher (IM, nom, prénom, localité)"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-72"
              />
            </div>
          </div>

          {chargement ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Chargement...</p>
            </div>
          ) : filtres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Aucun agent trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3 w-32">Matricule IM</th>
                    <th className="px-5 py-3">Nom</th>
                    <th className="px-5 py-3">Prénoms</th>
                    <th className="px-5 py-3 w-24">Localité</th>
                    <th className="px-5 py-3 w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtres.map((item) => (
                    <tr
                      key={item.id_information}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        editingId === item.id_information ? "bg-purple-50/50" : ""
                      }`}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{item.matricule}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{item.nom}</td>
                      <td className="px-5 py-3 text-gray-600">{item.prenom}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          {item.localite}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => editer(item)}
                            title="Modifier"
                            className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
