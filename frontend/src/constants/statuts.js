export const STATUTS = {
  soumise: "Soumise",
  en_cours: "En cours",
  validee: "Validée",
  rejetee: "Rejetée",
  complement_demande: "Complément",
};

export const STATUTS_EN_COURS = ["soumise", "en_cours", "complement_demande"];

export const COULEURS_STATUT = {
  soumise: "bg-blue-50 text-blue-700 border-blue-200",
  en_cours: "bg-amber-50 text-amber-700 border-amber-200",
  validee: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejetee: "bg-red-50 text-red-700 border-red-200",
  complement_demande: "bg-violet-50 text-violet-700 border-violet-200",
};

export const libelleStatut = (statut) => STATUTS[statut] || statut;
