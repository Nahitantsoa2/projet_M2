import { useEffect, useState } from "react";
import api from "../../services/api";
import { CheckCircle } from "lucide-react";

export default function CreationDemande({ onCreee }) {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    id_type_demarche: "",
    nom: "",
    matricule: "",
    motif: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    api
      .get("/types-demarche")
      .then(({ data }) => setTypes(data))
      .catch(() => setTypes([]));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur(null);
    setSucces(false);
    setEnvoi(true);

    try {
      const { data } = await api.post("/demandes", {
        id_type_demarche: form.id_type_demarche,
        details: {
          ...(form.nom && { nom: form.nom }),
          ...(form.matricule && { matricule: form.matricule }),
          ...(form.motif && { motif: form.motif }),
        },
      });
      setSucces(true);
      setForm({ id_type_demarche: "", nom: "", matricule: "", motif: "" });
      onCreee?.(data);
    } catch (err) {
      setErreur(
        err.response?.data?.message || "Impossible de créer la demande."
      );
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.65rem" }}>
      <div className="card-title">Créer une demande — formulaire manuel</div>

      <select name="id_type_demarche" value={form.id_type_demarche} onChange={handleChange} required
        style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}>
        <option value="">-- Choisir le type de démarche --</option>
        {types.map((t) => (
          <option key={t.id_type_demarche} value={t.id_type_demarche}>
            {t.libelle}
          </option>
        ))}
      </select>

      <input
        name="nom" placeholder="Nom complet (optionnel)"
        value={form.nom} onChange={handleChange}
        style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
      />
      <input
        name="matricule" placeholder="Matricule (optionnel)"
        value={form.matricule} onChange={handleChange}
        style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
      />
      <textarea
        name="motif" placeholder="Motif / précisions (optionnel)" rows={2}
        value={form.motif} onChange={handleChange}
        style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6", fontFamily: "inherit" }}
      />

      {erreur && <p style={{ color: "#c0392b", fontSize: "0.85rem" }}>{erreur}</p>}
      {succes && <p style={{ color: "#1e8f5f", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={16} /> Demande créée.</p>}

      <button className="btn btn-valider" type="submit" disabled={envoi} style={{ alignSelf: "flex-start" }}>
        {envoi ? "Envoi..." : "Soumettre la demande"}
      </button>
    </form>
  );
}
