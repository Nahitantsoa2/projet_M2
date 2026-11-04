import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { filtrerAgents } from "../../utils/informations";
import AppHeader from "../../components/AppHeader";
import { Info, Search, Users } from "lucide-react";

export default function Informations() {
  const navigate = useNavigate();
  const [liste, setListe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    api
      .get("/informations")
      .then(({ data }) => setListe(data))
      .catch(() => setErreur("Impossible de charger les informations."))
      .finally(() => setChargement(false));
  }, []);

  const filtres = useMemo(() => filtrerAgents(liste, recherche), [liste, recherche]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        icon={<Info size={20} />}
        iconClass="from-blue-600 to-cyan-500 shadow-blue-500/20"
        title="Informations"
        subtitle="Liste des agents par localité"
        onBack={() => navigate("/fonctionnaire")}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Users size={16} className="text-blue-500" />
              Agents ({liste.length})
            </h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher (IM, nom, prénom, localité)"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-72"
              />
            </div>
          </div>

          {erreur ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
              {erreur}
            </div>
          ) : chargement ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
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
                    <th className="px-5 py-3 w-24">Localité</th>
                    <th className="px-5 py-3">Nom</th>
                    <th className="px-5 py-3">Prénoms</th>
                    <th className="px-5 py-3 w-32">Matricule IM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtres.map((item) => (
                    <tr key={item.id_information} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          {item.localite}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{item.nom}</td>
                      <td className="px-5 py-3 text-gray-600">{item.prenom}</td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{item.matricule}</td>
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