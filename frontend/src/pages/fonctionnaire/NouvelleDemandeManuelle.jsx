import { useEffect, useState } from "react";
import api from "../../services/api";

export default function NouvelleDemandeManuelle({ onCreee }) {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    id_type_demarche: "",
    nom: "",
    prenom: "",
    cin: "",
    matricule: "",
    adresse: "",
    telephone: "",
    motif: "",
    corps: "",
    grade: "",
    fonction: "",
    localite: "",
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
      await api.post("/demandes", {
        id_type_demarche: form.id_type_demarche,
        details: {
          ...(form.nom && { nom: form.nom }),
          ...(form.prenom && { prenom: form.prenom }),
          ...(form.cin && { cin: form.cin }),
          ...(form.matricule && { matricule: form.matricule }),
          ...(form.adresse && { adresse: form.adresse }),
          ...(form.telephone && { telephone: form.telephone }),
          ...(form.corps && { corps: form.corps }),
          ...(form.grade && { grade: form.grade }),
          ...(form.fonction && { fonction: form.fonction }),
          ...(form.localite && { localite: form.localite }),
          ...(form.motif && { motif: form.motif }),
        },
      });
      setSucces(true);
      setForm({ id_type_demarche: "", nom: "", prenom: "", cin: "", matricule: "", adresse: "", telephone: "", motif: "", corps: "", grade: "", fonction: "", localite: "" });
      onCreee?.();
    } catch (err) {
      setErreur(
        err.response?.data?.message || "Impossible de créer la demande."
      );
    } finally {
      setEnvoi(false);
    }
  }

  function handlePrintModel() {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Modèle de Demande</title>
          <style>
            body { font-family: "Times New Roman", Times, serif; padding: 2rem; line-height: 1.6; }
            .header-info { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2rem; width: 50%; }
            .destinataire { margin-left: auto; width: 50%; text-align: center; font-weight: bold; margin-bottom: 3rem; }
            .content { margin-top: 2rem; text-align: justify; }
            .signature { margin-top: 4rem; margin-left: auto; width: 40%; text-align: center; }
            .dots { border-bottom: 1px dotted #000; display: inline-block; flex-grow: 1; min-height: 1.2rem; }
            .row { display: flex; align-items: baseline; gap: 0.5rem; }
            .val { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <div class="row"><span>Anarana :</span><span class="${form.nom ? 'val' : 'dots'}" style="width: 100%;">${form.nom || ''}</span></div>
            <div class="row"><span>Fanampiny :</span><span class="${form.prenom ? 'val' : 'dots'}" style="width: 100%;">${form.prenom || ''}</span></div>
            <div class="row"><span>CIN :</span><span class="${form.cin ? 'val' : 'dots'}" style="width: 100%;">${form.cin || ''}</span></div>
            <div class="row"><span>IM :</span><span class="${form.matricule ? 'val' : 'dots'}" style="width: 100%;">${form.matricule || ''}</span></div>
            <div class="row"><span>Adiresy :</span><span class="${form.adresse ? 'val' : 'dots'}" style="width: 100%;">${form.adresse || ''}</span></div>
            <div class="row"><span>Tel :</span><span class="${form.telephone ? 'val' : 'dots'}" style="width: 100%;">${form.telephone || ''}</span></div>
          </div>

          <div class="destinataire">
            <p>Ho an'</p>
            <p>ANDRIAMATOA LEHIBEN'I SAMPAN-DRAHARAHA MISAHANA NY KARAMAN'NY MPIASAM-PANJAKANA SY NY FISOTROAN-DRONONO AMORON'I MANIA</p>
          </div>

          <div class="content">
            <p><strong>Antony:</strong> Fangatahana <span class="dots" style="width: 80%;"></span></p>
            <br/>
            <p style="text-indent: 3rem;">
              Voninahitra ho ahy voalaza anarana eto ambony ny mangataka ny hamoram-po re mba hanome ahy ny vonjy amin'ny tahafatesana ho an'ny vady: noho ny nahafatesan'ny vadiko <span class="dots" style="width: 30%;"></span> PENSION N° <span class="dots" style="width: 30%;"></span>
            </p>
            <p>Indro ny entiko manamarina izany :</p>
            <ul>
              <li><span class="dots" style="width: 80%;"></span></li>
              <li><span class="dots" style="width: 80%;"></span></li>
              <li><span class="dots" style="width: 80%;"></span></li>
              <li><span class="dots" style="width: 80%;"></span></li>
            </ul>
            
            <p style="margin-top: 2rem;">Koa, Andriamatoa lehibe ny haja ambony atolotra anao.</p>
          </div>

          <div class="signature">
            <p>Sonia</p>
            <p style="margin-top: 3rem;">Anarana sy fanampiny</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // printWindow.close();
    }, 250);
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
        <input
          name="nom" placeholder="Nom (Anarana)"
          value={form.nom} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
        <input
          name="prenom" placeholder="Prénom (Fanampiny)"
          value={form.prenom} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
        <input
          name="cin" placeholder="CIN"
          value={form.cin} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
        <input
          name="matricule" placeholder="IM (Matricule)"
          value={form.matricule} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
        <input
          name="adresse" placeholder="Adresse (Adiresy)"
          value={form.adresse} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
        <input
          name="telephone" placeholder="Téléphone (Tel)"
          value={form.telephone} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
        <input
          name="corps" placeholder="Corps (optionnel)"
          value={form.corps} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
        <input
          name="grade" placeholder="Grade (optionnel)"
          value={form.grade} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
        <input
          name="fonction" placeholder="Fonction (optionnel)"
          value={form.fonction} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
        <input
          name="localite" placeholder="Localité / En service à (optionnel)"
          value={form.localite} onChange={handleChange}
          style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6" }}
        />
      </div>

      <textarea
        name="motif" placeholder="Motif / précisions (optionnel)" rows={2}
        value={form.motif} onChange={handleChange}
        style={{ padding: "0.55rem", borderRadius: "8px", border: "1px solid #dcdfe6", fontFamily: "inherit" }}
      />

      {erreur && <p style={{ color: "#c0392b", fontSize: "0.85rem" }}>{erreur}</p>}
      {succes && <p style={{ color: "#1e8f5f", fontSize: "0.85rem" }}>✅ Demande créée.</p>}

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button className="btn btn-valider" type="submit" disabled={envoi} style={{ alignSelf: "flex-start" }}>
          {envoi ? "Envoi..." : "Soumettre la demande"}
        </button>
        <button type="button" onClick={handlePrintModel} className="btn" style={{ background: "#e0e6ed", color: "#333", border: "1px solid #c0c6cc" }}>
          🖨️ Imprimer la demande
        </button>
      </div>
    </form>
  );
}
