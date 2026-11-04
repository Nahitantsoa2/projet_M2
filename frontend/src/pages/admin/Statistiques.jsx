import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AppHeader from "../../components/AppHeader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
  LineChart, Line,
} from "recharts";
import {
  TrendingUp, TrendingDown, FileText, Users, Clock,
  CheckCircle, AlertTriangle, BarChart3, Activity, Layers
} from "lucide-react";
import { STATUTS, COULEURS_STATUT } from "../../constants/statuts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-bold text-gray-500 dark:text-surface-400 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold" style={{ color: d.payload.color }}>
        {d.name}: {d.value}
      </p>
    </div>
  );
}

export default function Statistiques() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .get("/admin/statistiques")
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-900 flex flex-col">
      {/* Navbar */}
      <AppHeader
        maxWidth="max-w-[1400px]"
        icon={<BarChart3 size={20} />}
        iconClass="from-indigo-500 to-purple-600 shadow-indigo-500/20"
        title="Tableau de bord analytique"
        subtitle="Statistiques et tendances"
        onBack={() => navigate("/admin")}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {chargement ? (
          <div className="flex justify-center items-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Chargement des statistiques...</p>
            </div>
          </div>
        ) : !stats ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <AlertTriangle size={48} className="mb-4 opacity-40" />
            <p className="font-semibold text-lg">Impossible de charger les statistiques</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard
                icon={<FileText size={20} />}
                label="Total demandes"
                value={stats.resume.total_demandes}
                color="blue"
              />
              <KPICard
                icon={<Activity size={20} />}
                label="Ce mois"
                value={stats.resume.demandes_ce_mois}
                evolution={stats.resume.evolution_mois}
                color="violet"
              />
              <KPICard
                icon={<CheckCircle size={20} />}
                label="Taux de validation"
                value={`${stats.resume.taux_validation}%`}
                color="emerald"
              />
              <KPICard
                icon={<Clock size={20} />}
                label="Temps moyen"
                value={stats.resume.temps_moyen_jours ? `${stats.resume.temps_moyen_jours}j` : '—'}
                suffix=""
                color="amber"
              />
            </div>

            {/* Charts Row 1 — Monthly + Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Area Chart — Demandes Mensuelles */}
              <div className="lg:col-span-2 bg-white dark:bg-surface-800 rounded-2xl border border-gray-100 dark:border-surface-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <TrendingUp size={18} className="text-indigo-500" />
                      Évolution mensuelle
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">12 derniers mois</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.demandes_mensuelles}>
                    <defs>
                      <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradValidee" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradRejetee" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="mois"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#gradTotal)"
                      dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                      activeDot={{ r: 5, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="validee"
                      name="Validées"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#gradValidee)"
                      dot={{ r: 2, fill: '#10b981', strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rejetee"
                      name="Rejetées"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#gradRejetee)"
                      dot={{ r: 2, fill: '#ef4444', strokeWidth: 0 }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart — Répartition par statut */}
              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-gray-100 dark:border-surface-700 shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Layers size={18} className="text-purple-500" />
                    Par statut
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Répartition globale</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.par_statut}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {stats.par_statut.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {stats.par_statut.map((s) => (
                    <div key={s.statut} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                        <span className="text-xs font-medium text-gray-600 dark:text-surface-300">
                          {STATUTS[s.statut] || s.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-800 dark:text-white">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Row 2 — By Type + Weekly */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Bar Chart — Par type de démarche */}
              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-gray-100 dark:border-surface-700 shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-500" />
                    Par type de démarche
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Nombre de demandes par type</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.par_type} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="type"
                      width={160}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="total"
                      name="Demandes"
                      fill="#6366f1"
                      radius={[0, 8, 8, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart — Évolution hebdomadaire */}
              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-gray-100 dark:border-surface-700 shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500" />
                    Tendance hebdomadaire
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">8 dernières semaines</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.evolution_hebdo}>
                    <defs>
                      <linearGradient id="gradWeekLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="semaine"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Demandes"
                      stroke="url(#gradWeekLine)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 3 — By Service + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Bar Chart — Par service */}
              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-gray-100 dark:border-surface-700 shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Users size={18} className="text-amber-500" />
                    Par service
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Répartition des demandes</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.par_service}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="service"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="total"
                      name="Demandes"
                      radius={[8, 8, 0, 0]}
                      barSize={36}
                    >
                      {stats.par_service.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? '#6366f1' : '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Activity List */}
              <div className="bg-white dark:bg-surface-800 rounded-2xl border border-gray-100 dark:border-surface-700 shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Clock size={18} className="text-gray-500" />
                    Activité récente
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">10 dernières demandes</p>
                </div>
                <div className="space-y-1 max-h-[320px] overflow-y-auto">
                  {stats.activite_recente.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {a.fonctionnaire?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                            {a.type}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-surface-400 truncate">
                            {a.fonctionnaire} · {a.date}
                          </p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        COULEURS_STATUT[a.statut] || 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {STATUTS[a.statut] || a.statut}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KPICard({ icon, label, value, evolution, color, suffix }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',  icon: 'text-blue-600 dark:text-blue-400',  ring: 'ring-blue-100 dark:ring-blue-800' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-100 dark:ring-violet-800' },
    emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-800' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'text-amber-600 dark:text-amber-400',  ring: 'ring-amber-100 dark:ring-amber-800' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl border border-gray-100 dark:border-surface-700 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ring-1 ${c.ring}`}>
          <span className={c.icon}>{icon}</span>
        </div>
        {evolution !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${evolution >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {evolution >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(evolution)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        {value}{suffix}
      </p>
      <p className="text-xs text-gray-500 dark:text-surface-400 mt-0.5 font-medium">
        {label}
      </p>
    </div>
  );
}
