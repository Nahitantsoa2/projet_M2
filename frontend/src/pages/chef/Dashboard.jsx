import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AppHeader from "../../components/AppHeader";
import { ClipboardCheck, CheckCircle, XCircle, Clock, FileText, Inbox } from "lucide-react";

export default function DashboardChef() {
  const { utilisateur } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);

  useEffect(() => {
    api
      .get("/chef/demandes")
      .then(({ data }) => setDemandes(data))
      .finally(() => setChargement(false));
  }, []);

  async function traiter(id, statut) {
    setActionEnCours(id);
    try {
      await api.patch(`/chef/demandes/${id}/traiter`, { statut });
      setDemandes((prev) => prev.filter((d) => d.id_demande !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionEnCours(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <AppHeader
        icon={<ClipboardCheck size={22} />}
        iconClass="from-emerald-600 to-teal-500 shadow-emerald-500/20"
        title={`Bonjour, ${utilisateur?.prenom ?? ""}`}
        titleClass="text-lg sm:text-xl"
        subtitle={
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Chef de service
          </span>
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock size={22} className="text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{demandes.length}</p>
                <p className="text-sm text-gray-500">En attente</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={22} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">—</p>
                <p className="text-sm text-gray-500">Validées aujourd'hui</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <XCircle size={22} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">—</p>
                <p className="text-sm text-gray-500">Rejetées aujourd'hui</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demandes List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText size={20} className="text-emerald-500" />
              Demandes à traiter
            </h2>
          </div>

          <div className="p-0">
            {chargement ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Chargement des demandes...</p>
                </div>
              </div>
            ) : demandes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <Inbox size={36} className="opacity-40" />
                </div>
                <p className="font-semibold text-gray-500 text-lg">Aucune demande en attente</p>
                <p className="text-sm text-gray-400 mt-1">Toutes les demandes ont été traitées</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {demandes.map((d, index) => (
                  <div
                    key={d.id_demande}
                    className="px-6 py-5 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                        {d.fonctionnaire?.prenom?.[0]}{d.fonctionnaire?.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {d.fonctionnaire?.prenom} {d.fonctionnaire?.nom}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <FileText size={13} className="text-gray-400" />
                          {d.type_demarche?.libelle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-4">
                      <button
                        onClick={() => traiter(d.id_demande, "validee")}
                        disabled={actionEnCours === d.id_demande}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={16} />
                        Valider
                      </button>
                      <button
                        onClick={() => traiter(d.id_demande, "rejetee")}
                        disabled={actionEnCours === d.id_demande}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle size={16} />
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
