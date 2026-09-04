import { useState } from "react";
import api from "../../services/api";

export default function NouvelleDemandeIA({ onCreee }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post("/demandes/ia", { message });
      setSuccess(response.data.resume);
      setMessage("");
      if (onCreee) {
        onCreee(response.data.demande);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite lors de la soumission de la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h3>Assistant IA</h3>
      <p>Décrivez votre demande en langage naturel, et notre assistant se chargera de la créer pour vous.</p>
      
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: "1rem" }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Je veux créer une demande de pension, mon matricule est le 1234..."
            style={{ width: "100%", minHeight: "100px", padding: "0.5rem" }}
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || !message.trim()}>
          {loading ? "Génération en cours..." : "Soumettre via l'IA"}
        </button>
      </form>
    </div>
  );
}
