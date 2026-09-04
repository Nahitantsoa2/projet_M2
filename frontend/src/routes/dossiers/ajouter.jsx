import { useState } from "react";
import { createDossier } from "../../services/serviceDossier";

export default function Ajouter() {

  const [form, setForm] = useState({
    numero: "",
    date_arrivee: "",
    expediteur: "",
    objet: "",
    beneficiaire: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createDossier(form);

    alert("Dossier enregistré avec succès !");

    setForm({
      numero: "",
      date_arrivee: "",
      expediteur: "",
      objet: "",
      beneficiaire: ""
    });
  };

  return (
    <div className="p-6 bg-white rounded shadow">

      <h1 className="text-xl font-bold mb-4">
        Enregistrer un dossier
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-3">

        <input
          name="numero"
          placeholder="Numéro dossier"
          value={form.numero}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          type="date"
          name="date_arrivee"
          value={form.date_arrivee}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="expediteur"
          placeholder="Expéditeur"
          value={form.expediteur}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="objet"
          placeholder="Objet"
          value={form.objet}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="beneficiaire"
          placeholder="Bénéficiaire"
          value={form.beneficiaire}
          onChange={handleChange}
          className="border p-2"
        />

        <button className="bg-blue-600 text-white p-2">
          Enregistrer
        </button>

      </form>

    </div>
  );
}