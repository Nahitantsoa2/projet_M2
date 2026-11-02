import { useEffect, useState } from "react";
import api from "../../services/api";
import { ChevronDown, Printer, AlertCircle, CheckCircle2 } from "lucide-react";

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
      .then(({ data }) => {
        const typesGeres = [1, 2, 3, 6, 7];
        setTypes(data.filter(t => typesGeres.includes(t.id_type_demarche)));
      })
      .catch(() => setTypes([]));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur(null);
    setSucces(false);
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
      const typeChoisi = types.find(t => t.id_type_demarche == form.id_type_demarche);
      const dataPourImpression = { ...form };
      const piecesPourImpression = getPiecesForType(form.id_type_demarche);
      setForm({ id_type_demarche: "", nom: "", prenom: "", cin: "", matricule: "", adresse: "", telephone: "", motif: "", corps: "", grade: "", fonction: "", localite: "" });
      onCreee?.();
      handlePrintModel(dataPourImpression, typeChoisi, piecesPourImpression);
    } catch (err) {
      setErreur(
        err.response?.data?.message || "Impossible de créer la demande."
      );
    } finally {
      setEnvoi(false);
    }
  }

  function getPiecesForType(typeId) {
    switch (typeId) {
      case "1": return [
        "Demande (2 ex)", "Acte de décès (2 ex)", "Acte de notoriété (2 ex)",
        "Acte de naissance des enfants mineurs (2 ex)", "Acte de naissance tutrice ou tuteur (2 ex)",
        "Ordonnance de tutelle (2 ex)", "Certificat de vie de l'orphelin(s) (2 ex)",
        "Photocopie CIN certifiée tutrice ou tuteur (2 ex)", "Bulletin de pensions (2 ex)",
        "Photocopie carte pensions (2 ex)"
      ];
      case "2": return [
        "Demande (2 ex)", "Copie d'acte de naissance de l'enfant (2 ex)",
        "Certificat de vie et d'entretien (2 ex)", "Certificat de scolarité pour les enfants de plus de 6 ans (2 ex)",
        "Photocopie CIN (2 ex)", "Bulletin de solde (2 ex)"
      ];
      case "3": return [
        "Demande (2 ex)", "Photocopie CIN certifiée (2 ex)",
        "Bulletin de solde ou avis de crédit récent (2 ex)", "Attestation de présence au corps (2 ex)"
      ];
      case "6": return [
        "Avis d'Émission d'Ordre de Recette",
        "Ordre de Recette",
        "État de décompte de la part individuelle (4%) (5%)",
        "État de décompte de la part patronale (16%) (19%)"
      ];
      case "7": return [
        "Formulaire de demande manuscrite",
        "Arrêté d'Intégration ou de nomination (*)",
        "Arrêté de Titularisation (*)",
        "Relevé de Service bien détaillé et signé par le Responsable du Personnel",
        "Photocopie de l'Avis de Crédit ou du Bon de Caisse",
        "Photocopie de la CIN",
        "ECD : Première décision d'engagement (*)",
        "ECD : Dernière décision d'engagement (*)",
        "ECD : Certificat de non interruption de service",
        "ECD : État de transfert des cotisations antérieurement versées à la CNaPS",
        "ELD : Première décision d'engagement (*)",
        "ELD : Dernière décision de majoration de salaire (*)",
        "EFA : Premier contrat de travail (*)",
        "EFA : Dernier contrat de travail (*)",
        "EFA : Avenant s'il y a reclassement",
        "EFA : Attestation de prise de service",
        "Services privés : Certificat de travail",
        "Services privés : Transfert de cotisations CNaPS",
        "Services privés : Engagement de payer la part individuelle de 4% et la part patronale de 16%",
        "Budget autonome (EFA/ELD) : Relevé de cotisations CPR 3% (visé par le Trésor ou la Perception)",
        "Veuf/veuves/orphelins : Acte de décès",
        "Veuf/veuves/orphelins : Acte de mariage (veuf/veuve)",
        "Veuf/veuves/orphelins : Acte de tutelle (orphelins mineurs)",
        "(*) Photocopie certifiée"
      ];
      default: return ["Pièce justificative 1", "Pièce justificative 2", "Pièce justificative 3"];
    }
  }

  function handlePrintModel(data, type, pieces) {
    if (!type) return;
    const typeId = String(type.id_type_demarche);
    const estValidation = typeId === "7";
    const estDuplicata = typeId === "6";
    const libelleClean = type.libelle ? type.libelle.replace(/^Demande\s+(de\s+|d['']\s*)/i, '') : '';
    const piecesHTML = pieces.map(p => `<li>${p}</li>`).join('');

    // Bloc destinataire commun
    const destinataire = estValidation
      ? `<p>À</p><p>Madame LE CHEF DE SERVICE<br/>DE LA VALIDATION DES SERVICES PRÉCAIRES<br/>- ANTANANARIVO -</p>`
      : estDuplicata
      ? `<p>À</p><p>Madame LE CHEF DE SERVICE<br/>DE LA VALIDATION DES SERVICES PRÉCAIRES<br/>- ANTANANARIVO -</p>`
      : `<p>Ho an'</p><p>ANDRIAMATOA LEHIBEN'I SAMPAN DRAHARAHA MISAHANA NY KARAMAN'NY MPIASAM-PANJAKANA SY NY FISOTROAN-DRONONO AMORON'I MANIA</p>`;

    // Corps du texte selon le type
    let corps;
    if (estValidation) {
      corps = `
        <p><strong>Objet : Demande de Validation</strong></p>
        <p>Madame Le Chef de Service,</p>
        <p style="text-indent: 3rem;">J'ai l'honneur de solliciter votre haute bienveillance de bien vouloir valider les services auxiliaires que j'ai effectués au sein du :</p>
        <p style="text-indent: 3rem;">......................................................................................................................</p>
        <p>et ce pour compter du ......................................... au .........................................................</p>
        <p style="text-indent: 3rem;">Je m'engage à payer les retenues rétroactives de cette validation (4% + 16% si privé).</p>
        <p style="text-indent: 3rem;">Dans l'attente d'une suite favorable de votre part, veuillez agréer Madame, l'expression de ma haute considération.</p>`;
    } else if (estDuplicata) {
      corps = `
        <p><strong>Objet : Demande de Duplicata</strong></p>
        <p>Madame Le Chef de Service,</p>
        <p style="text-indent: 3rem;">J'ai l'honneur de vous demander de bien vouloir accorder ma demande de duplicata pour les pièces cochées ci-après :</p>
        <ul>${piecesHTML}</ul>
        <p style="text-indent: 3rem;">Veuillez agréer Madame le Chef de Service, mes salutations les meilleures.</p>`;
    } else {
      corps = `
        <p><strong>Antony:</strong> Fangatahana ${libelleClean}</p>
        <p style="text-indent: 3rem;">Voninahitra ho ahy voalaza anarana eto ambony ny mangataka aminao ny fangatahana mahakasika ny : ${libelleClean}</p>
        <p>Indro ny entiko manamarina izany :</p>
        <ul>${piecesHTML}</ul>
        <p style="margin-top: 2rem;">Koa, Andriamatoa lehibe ny haja ambony atolotra anao.</p>`;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(`
      <html>
        <head>
          <title>Modèle de Demande</title>
          <style>
            body { font-family: "Times New Roman", Times, serif; padding: 2rem; line-height: 1.6; }
            .header-info { display: flex; flex-direction: column; gap: 0.2rem; margin-bottom: 2rem; width: 60%; }
            .destinataire { margin-left: auto; width: 60%; text-align: center; font-weight: bold; margin-bottom: 3rem; }
            .content { margin-top: 2rem; text-align: justify; }
            .signature { margin-top: 4rem; margin-left: auto; width: 40%; text-align: center; }
            .dots { border-bottom: 1px dotted #000; flex-grow: 1; min-height: 1.2rem; }
            .row { display: flex; align-items: baseline; gap: 0.5rem; }
            .label { white-space: nowrap; }
            .val { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <div class="row"><span class="label">Nom :</span><span class="${data.nom ? 'val' : 'dots'}">${data.nom || ''}</span></div>
            <div class="row"><span class="label">Prénom(s) :</span><span class="${data.prenom ? 'val' : 'dots'}">${data.prenom || ''}</span></div>
            <div class="row"><span class="label">IM :</span><span class="${data.matricule ? 'val' : 'dots'}">${data.matricule || ''}</span></div>
            <div class="row"><span class="label">Corps :</span><span class="${data.corps ? 'val' : 'dots'}">${data.corps || ''}</span></div>
            <div class="row"><span class="label">Grade :</span><span class="${data.grade ? 'val' : 'dots'}">${data.grade || ''}</span></div>
            <div class="row"><span class="label">Fonction :</span><span class="${data.fonction ? 'val' : 'dots'}">${data.fonction || ''}</span></div>
            <div class="row"><span class="label">En service — Localité :</span><span class="${data.localite ? 'val' : 'dots'}">${data.localite || ''}</span></div>
            <div class="row"><span class="label">N° Téléphone :</span><span class="${data.telephone ? 'val' : 'dots'}">${data.telephone || ''}</span></div>
            <div class="row"><span class="label">Antananarivo, le :</span><span class="dots"></span></div>
          </div>
          <div class="destinataire">${destinataire}</div>
          <div class="content">${corps}</div>
          <div class="signature">
            <p>L'intéressé(e)</p>
            <p style="margin-top: 3rem;">Nom &amp; Prénom(s)</p>
          </div>
        </body>
      </html>
    `);
    iframe.contentWindow.document.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 1000);
    }, 100);
  }

  function getFieldsForType(typeId) {
    if (!typeId) return [];
    const baseFields = ["nom", "prenom", "cin", "matricule", "adresse", "telephone"];
    switch (typeId) {
      case "1": return [...baseFields, "corps", "grade", "motif"];
      case "2": case "3": return [...baseFields, "fonction", "localite"];
      case "6": case "7": return [...baseFields, "corps", "grade", "fonction", "localite"];
      case "8": return [...baseFields, "corps", "grade", "fonction", "localite"];
      default: return [...baseFields, "corps", "grade", "fonction", "localite", "motif"];
    }
  }

  const activeFields = getFieldsForType(form.id_type_demarche);

  const fieldLabels = {
    nom: "Nom (Anarana)", prenom: "Prénom (Fanampiny)", cin: "CIN",
    matricule: "IM (Matricule)", adresse: "Adresse (Adiresy)", telephone: "Téléphone",
    corps: "Corps", grade: "Grade", fonction: "Fonction",
    localite: "Localité", motif: "Motif / précisions"
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Type de démarche
        </label>
        <div className="relative">
          <select
            name="id_type_demarche"
            value={form.id_type_demarche}
            onChange={handleChange}
            required
            className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-all"
          >
            <option value="">-- Choisir le type --</option>
            {types.map((t) => (
              <option key={t.id_type_demarche} value={t.id_type_demarche}>
                {t.libelle}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {form.id_type_demarche && (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeFields.filter(f => f !== "motif").map((fieldName) => (
              <div key={fieldName}>
                <label className="block text-xs font-semibold text-gray-500 mb-1 capitalize">
                  {fieldLabels[fieldName]}
                </label>
                <input
                  name={fieldName}
                  placeholder={fieldLabels[fieldName]}
                  value={form[fieldName]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                />
              </div>
            ))}
          </div>

          {activeFields.includes("motif") && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {fieldLabels.motif}
              </label>
              <textarea
                name="motif"
                placeholder="Décrivez votre motif..."
                rows={2}
                value={form.motif}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none font-inherit"
              />
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {erreur && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2.5 rounded-xl text-sm font-medium border border-red-200 animate-fade-in">
          <AlertCircle size={16} className="flex-shrink-0" />
          {erreur}
        </div>
      )}
      {succes && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-2.5 rounded-xl text-sm font-medium border border-emerald-200 animate-fade-in">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          Demande créée avec succès.
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={envoi || !form.id_type_demarche}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {envoi ? (
            "Création..."
          ) : (
            <>
              <Printer size={16} />
              Créer la demande
            </>
          )}
        </button>
      </div>
    </form>
  );
}
