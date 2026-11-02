import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AppHeader from "../../components/AppHeader";
import { libelleRole, COULEURS_ROLE } from "../../constants/roles";
import { Users, Shield, Search, Mail, Briefcase, BarChart3, FileSpreadsheet, Info, Trash2 } from "lucide-react";

export default function DashboardAdmin() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreRole, setFiltreRole] = useState("");
  const [suppressionId, setSuppressionId] = useState(null);

  const chargerUtilisateurs = useCallback(
    () => api.get("/admin/utilisateurs").then(({ data }) => setUtilisateurs(data)),
    []
  );

  useEffect(() => {
    chargerUtilisateurs().finally(() => setChargement(false));
  }, [chargerUtilisateurs]);

  const supprimerUtilisateur = async (u) => {
    if (
      !window.confirm(
        `Supprimer l'utilisateur ${u.prenom} ${u.nom} ?\n\nSes demandes, réclamations et messages associés seront aussi supprimés. Cette action est irréversible.`
      )
    )
      return;
    setSuppressionId(u.id_utilisateur);
    try {
      await api.delete(`/admin/utilisateurs/${u.id_utilisateur}`);
      await chargerUtilisateurs();
    } catch (err) {
      alert(err.response?.data?.message || "Impossible de supprimer cet utilisateur.");
    } finally {
      setSuppressionId(null);
    }
  };

  const rolesDisponibles = [...new Set(utilisateurs.map(u => u.role).filter(Boolean))];

  const utilisateursFiltres = utilisateurs.filter((u) => {
    const correspondRecherche =
      u.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      u.prenom?.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email?.toLowerCase().includes(recherche.toLowerCase());
    const correspondRole = filtreRole ? u.role === filtreRole : true;
    return correspondRecherche && correspondRole;
  });

  const stats = {
    total: utilisateurs.length,
    fonctionnaires: utilisateurs.filter(u => u.role === 'fonctionnaire').length,
    chefs: utilisateurs.filter(u => u.role === 'chef_service').length,
    admins: utilisateurs.filter(u => u.role === 'administrateur').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <AppHeader
        icon={<Shield size={22} />}
        iconClass="from-purple-600 to-indigo-600 shadow-purple-500/20"
        title={`Bonjour, ${utilisateur?.prenom ?? ""}`}
        titleClass="text-lg sm:text-xl"
        subtitle={
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
            Administrateur
          </span>
        }
        extra={
          <>
            <button
              onClick={() => navigate("/admin/reclamations")}
              className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 px-2.5 sm:px-4 py-2 rounded-xl transition-all font-semibold text-sm border border-gray-200"
            >
              <Mail size={18} />
              <span className="hidden sm:inline">Messages</span>
            </button>
            <button
              onClick={() => navigate("/admin/import-suivi")}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 sm:px-4 py-2 rounded-xl transition-all font-semibold text-sm border border-emerald-200"
            >
              <FileSpreadsheet size={18} />
              <span className="hidden sm:inline">Import suivi</span>
            </button>
            <button
              onClick={() => navigate("/admin/informations")}
              className="flex items-center gap-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 px-2.5 sm:px-4 py-2 rounded-xl transition-all font-semibold text-sm border border-cyan-200"
            >
              <Info size={18} />
              <span className="hidden sm:inline">Informations</span>
            </button>
            <button
              onClick={() => navigate("/admin/statistiques")}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 sm:px-4 py-2 rounded-xl transition-all font-semibold text-sm border border-indigo-200"
            >
              <BarChart3 size={18} />
              <span className="hidden sm:inline">Statistiques</span>
            </button>
          </>
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-0.5">Utilisateurs</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Briefcase size={20} className="text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Actifs</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.fonctionnaires}</p>
            <p className="text-sm text-gray-500 mt-0.5">Fonctionnaires</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Shield size={20} className="text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Encadrement</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.chefs}</p>
            <p className="text-sm text-gray-500 mt-0.5">Chefs de service</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Shield size={20} className="text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Admin</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
            <p className="text-sm text-gray-500 mt-0.5">Administrateurs</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} className="text-purple-500" />
              Tous les utilisateurs
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-56"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-200 rounded-xl text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                value={filtreRole}
                onChange={(e) => setFiltreRole(e.target.value)}
              >
                <option value="">Tous les rôles</option>
                {rolesDisponibles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {chargement ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Chargement...</p>
                </div>
              </div>
            ) : utilisateursFiltres.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Users size={48} className="mb-3 opacity-40" />
                <p className="font-medium">Aucun utilisateur trouvé</p>
                <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {utilisateursFiltres.map((u) => (
                    <tr key={u.id_utilisateur} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {u.prenom?.[0]}{u.nom?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {u.prenom} {u.nom}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          COULEURS_ROLE[u.role] || 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {libelleRole(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {u.service?.nom_service || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {utilisateur?.id_utilisateur !== u.id_utilisateur && (
                          <button
                            onClick={() => supprimerUtilisateur(u)}
                            disabled={suppressionId === u.id_utilisateur}
                            title="Supprimer"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
