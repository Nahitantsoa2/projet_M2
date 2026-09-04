import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { getDossiers } from "../../services/serviceDossier";

export default function Dashboard() {
  const [dossiers, setDossiers] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getDossiers();
      setDossiers(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // STATISTIQUES SIMPLIFIÉES
  const stats = [
    { title: "Total", value: dossiers.length, color: "#2563eb" },
    { title: "En cours", value: dossiers.filter(d => d.statut === "En cours").length, color: "#f59e0b" },
    { title: "Traités", value: dossiers.filter(d => d.statut === "Traité").length, color: "#16a34a" },
    { title: "Archivés", value: dossiers.filter(d => d.statut === "Archivé").length, color: "#9333ea" },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* CARTES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* TABLE SIMPLE */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-bold mb-3">Derniers dossiers</h2>

        <table className="w-full text-sm">
          <tbody>
            {dossiers.slice(0, 5).map((d) => (
              <tr key={d.id} className="border-b">
                <td className="p-2">{d.numero}</td>
                <td className="p-2">{d.objet}</td>
                <td className="p-2">{d.date_arrivee}</td>
                <td className="p-2">{d.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}