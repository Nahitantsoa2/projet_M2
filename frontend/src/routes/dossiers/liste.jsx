import { useEffect, useState } from "react";
import { getDossiers, deleteDossier } from "../../services/serviceDossier";

export default function Liste() {

  const [dossiers, setDossiers] = useState([]);

  const load = async () => {
    const res = await getDossiers();
    setDossiers(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const supprimer = async (id) => {
    await deleteDossier(id);
    load();
  };

  return (
    <div className="p-6 bg-white rounded shadow">

      <h1 className="text-xl font-bold mb-4">
        Liste des dossiers
      </h1>

      <table className="w-full border">

        <thead>
          <tr className="bg-gray-100">
            <th>Numéro</th>
            <th>Objet</th>
            <th>Expéditeur</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {dossiers.map((d) => (
            <tr key={d.id} className="border-t">

              <td>{d.numero}</td>
              <td>{d.objet}</td>
              <td>{d.expediteur}</td>
              <td>{d.date_arrivee}</td>

              <td>
                <button
                  onClick={() => supprimer(d.id)}
                  className="text-red-600"
                >
                  Supprimer
                </button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}